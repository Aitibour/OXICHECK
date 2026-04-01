import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * API Key guard for external integrations (PMS webhooks, partner APIs, etc.).
 *
 * Validates the X-API-Key request header against the configured set of
 * trusted keys.  Multiple keys are supported (comma-separated in config)
 * so that key rotation can happen without downtime.
 *
 * Usage — protect a controller or individual handler:
 *   @UseGuards(ApiKeyGuard)
 *   @Post('webhook/pms')
 *   handlePmsWebhook() { ... }
 *
 * Config  (environment variable):
 *   API_KEYS=key1,key2,key3
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);
  private readonly validKeys: Set<string>;

  constructor(private readonly configService: ConfigService) {
    const raw = this.configService.get<string>('API_KEYS', '');
    this.validKeys = new Set(
      raw
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
    );
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const apiKey = req.headers['x-api-key'];

    if (typeof apiKey !== 'string' || !apiKey) {
      this.logger.warn({
        event: 'api_key_missing',
        ip: req.ip,
        url: req.url,
        timestamp: new Date().toISOString(),
      });
      throw new UnauthorizedException('Missing X-API-Key header');
    }

    if (!this.validKeys.has(apiKey)) {
      this.logger.warn(
        JSON.stringify({
          event: 'api_key_invalid',
          // Never log the full key — show only the first 4 chars for debugging
          keyHint: apiKey.length > 4 ? apiKey.slice(0, 4) + '****' : '****',
          ip: req.ip,
          url: req.url,
          timestamp: new Date().toISOString(),
        }),
      );
      throw new UnauthorizedException('Invalid API key');
    }

    // Log successful API key usage for audit trail
    this.logger.log(
      JSON.stringify({
        event: 'api_key_used',
        keyHint: apiKey.length > 4 ? apiKey.slice(0, 4) + '****' : '****',
        ip: req.ip,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
      }),
    );

    return true;
  }
}
