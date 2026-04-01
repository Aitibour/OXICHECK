import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class GuestTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token =
      request.query?.token ||
      request.headers['x-guest-token'];

    if (!token) {
      throw new UnauthorizedException('Guest token is required');
    }

    const reservation = await this.authService.validateGuestToken(token);
    request.reservation = reservation;
    return true;
  }
}
