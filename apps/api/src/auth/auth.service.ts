import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto';
import type { JwtPayload } from './strategies/jwt.strategy';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        organizationId: dto.organizationId,
        ...(dto.propertyIds && dto.propertyIds.length > 0
          ? {
              propertyAccess: {
                create: dto.propertyIds.map((propertyId) => ({
                  propertyId,
                })),
              },
            }
          : {}),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        isActive: true,
        mfaEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.updateLastLogin(user.id);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>(
        'jwt.refreshExpiresIn',
        '7d',
      ),
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      };

      const accessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>(
          'jwt.refreshExpiresIn',
          '7d',
        ),
      });

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async generateGuestToken(reservationId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const token = uuidv4();
    const checkInDate = new Date(reservation.checkInDate);
    const expiresAt = new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000);

    const updated = await this.prisma.reservation.update({
      where: { id: reservationId },
      data: {
        preCheckToken: token,
        preCheckTokenExpiresAt: expiresAt,
      },
    });

    return {
      token: updated.preCheckToken,
      expiresAt: updated.preCheckTokenExpiresAt,
    };
  }

  async validateGuestToken(token: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { preCheckToken: token },
      include: {
        guest: true,
        property: {
          select: {
            id: true,
            name: true,
            timezone: true,
            defaultLocale: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new UnauthorizedException('Invalid guest token');
    }

    if (
      reservation.preCheckTokenExpiresAt &&
      new Date() > new Date(reservation.preCheckTokenExpiresAt)
    ) {
      throw new UnauthorizedException('Guest token has expired');
    }

    return reservation;
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      user.passwordHash,
    );

    if (!isOldPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { message: 'Password changed successfully' };
  }

  async updateLastLogin(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}
