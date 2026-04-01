import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@hotelcheckin/shared';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-v4'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@hotel.ca',
    passwordHash: 'hashed-password',
    firstName: 'Test',
    lastName: 'User',
    role: Role.FRONT_DESK_AGENT,
    organizationId: 'org-1',
    isActive: true,
    mfaEnabled: false,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      reservation: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    jwtService = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
      verify: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn((key: string, defaultValue?: string) => {
              const config: Record<string, string> = {
                'jwt.secret': 'test-secret',
                'jwt.expiresIn': '15m',
                'jwt.refreshExpiresIn': '7d',
              };
              return config[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return tokens and user on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await service.login('test@hotel.ca', 'password123');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should throw UnauthorizedException on invalid email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login('bad@hotel.ca', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        service.login('test@hotel.ca', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(
        service.login('test@hotel.ca', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create a user with hashed password', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('bcrypt-hashed');

      const { passwordHash: _, ...userWithoutPassword } = mockUser;
      prisma.user.create.mockResolvedValue(userWithoutPassword);

      const result = await service.register({
        email: 'new@hotel.ca',
        password: 'SecureP@ss1',
        firstName: 'New',
        lastName: 'User',
        role: Role.FRONT_DESK_AGENT,
        organizationId: 'org-1',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('SecureP@ss1', 12);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@hotel.ca',
          password: 'SecureP@ss1',
          firstName: 'Test',
          lastName: 'User',
          role: Role.FRONT_DESK_AGENT,
          organizationId: 'org-1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('changePassword', () => {
    it('should change password when old password is correct', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);
      (bcrypt.hash as any).mockResolvedValue('new-hashed');
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await service.changePassword(
        'user-1',
        'old-password',
        'new-password',
      );

      expect(result).toEqual({ message: 'Password changed successfully' });
      expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 12);
    });

    it('should throw BadRequestException when old password is wrong', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        service.changePassword('user-1', 'wrong', 'new-password'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword('nonexistent', 'old', 'new'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateGuestToken', () => {
    it('should generate a token and set expiry to checkInDate + 24h', async () => {
      const checkInDate = new Date('2026-04-15');
      const reservation = {
        id: 'res-1',
        checkInDate,
        preCheckToken: 'mock-uuid-v4',
        preCheckTokenExpiresAt: new Date(
          checkInDate.getTime() + 24 * 60 * 60 * 1000,
        ),
      };

      prisma.reservation.findUnique.mockResolvedValue(reservation);
      prisma.reservation.update.mockResolvedValue(reservation);

      const result = await service.generateGuestToken('res-1');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('expiresAt');
      expect(prisma.reservation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'res-1' },
          data: expect.objectContaining({
            preCheckToken: 'mock-uuid-v4',
          }),
        }),
      );
    });

    it('should throw NotFoundException if reservation does not exist', async () => {
      prisma.reservation.findUnique.mockResolvedValue(null);

      await expect(
        service.generateGuestToken('nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateGuestToken', () => {
    it('should return reservation with guest data for valid token', async () => {
      const reservation = {
        id: 'res-1',
        preCheckToken: 'valid-token',
        preCheckTokenExpiresAt: new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ),
        guest: { id: 'guest-1', firstName: 'John', lastName: 'Doe' },
        property: { id: 'prop-1', name: 'Test Hotel' },
      };

      prisma.reservation.findUnique.mockResolvedValue(reservation);

      const result = await service.validateGuestToken('valid-token');

      expect(result).toEqual(reservation);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      prisma.reservation.findUnique.mockResolvedValue(null);

      await expect(
        service.validateGuestToken('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const reservation = {
        id: 'res-1',
        preCheckToken: 'expired-token',
        preCheckTokenExpiresAt: new Date(Date.now() - 1000),
      };

      prisma.reservation.findUnique.mockResolvedValue(reservation);

      await expect(
        service.validateGuestToken('expired-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should return new token pair for valid refresh token', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user-1',
        email: 'test@hotel.ca',
        role: Role.FRONT_DESK_AGENT,
        organizationId: 'org-1',
      });
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.refreshToken('valid-refresh');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.refreshToken('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
