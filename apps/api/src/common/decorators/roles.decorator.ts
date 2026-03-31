import { SetMetadata } from '@nestjs/common';
import { Role } from '@hotelcheckin/shared';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles are allowed to access a route.
 * Usage: @Roles(Role.PLATFORM_ADMIN, Role.PROPERTY_OWNER)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
