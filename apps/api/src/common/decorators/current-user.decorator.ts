import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User } from '@hotelcheckin/shared';

/**
 * Extract the current authenticated user from the request object.
 * Usage: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User | undefined;

    if (data) {
      return user?.[data];
    }

    return user;
  },
);
