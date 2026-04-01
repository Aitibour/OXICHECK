import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@hotelcheckin/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied');
    }

    // Check if user's role is in the allowed roles
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'You do not have the required role to access this resource',
      );
    }

    // PLATFORM_ADMIN bypasses property-level checks
    if (user.role === Role.PLATFORM_ADMIN) {
      return true;
    }

    // If the route has a propertyId param, verify user has access to that property
    const propertyId = request.params?.propertyId;
    if (propertyId) {
      const access = await this.prisma.userPropertyAccess.findUnique({
        where: {
          userId_propertyId: {
            userId: user.id,
            propertyId,
          },
        },
      });

      if (!access) {
        throw new ForbiddenException(
          'You do not have access to this property',
        );
      }
    }

    return true;
  }
}
