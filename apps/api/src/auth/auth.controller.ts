import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Role } from '@hotelcheckin/shared';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ChangePasswordDto,
  ValidateGuestTokenDto,
} from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PLATFORM_ADMIN, Role.PROPERTY_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new user (admin/owner only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (invalidate refresh token)' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout() {
    // In a production system, we would add the refresh token to a blacklist
    // or delete it from a stored token table. For now, return success.
    return { message: 'Logout successful' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@CurrentUser() user: any) {
    return user;
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed' })
  @ApiResponse({ status: 400, description: 'Current password incorrect' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      userId,
      dto.oldPassword,
      dto.newPassword,
    );
  }

  @Post('guest-token/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a guest pre-check-in token' })
  @ApiResponse({ status: 200, description: 'Token valid, returns reservation' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async validateGuestToken(@Body() dto: ValidateGuestTokenDto) {
    return this.authService.validateGuestToken(dto.token);
  }
}
