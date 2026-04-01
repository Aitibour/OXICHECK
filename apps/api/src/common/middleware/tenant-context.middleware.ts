import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: string;
  email: string;
  organizationId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TenantRequest extends Request {
  organizationId?: string;
  tenantId?: string; // alias for organizationId
}

/**
 * Multi-tenant middleware that extracts organizationId from the JWT token
 * and attaches it to the request context for downstream tenant isolation.
 *
 * All DB queries in controllers/services can reference req.organizationId
 * (or the user object's organizationId) to scope data to the correct tenant.
 */
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: TenantRequest, _res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token — allow the request to pass through; guards will
      // enforce auth where required. Public routes (e.g. /checkin/*)
      // must not require a tenant context.
      return next();
    }

    const token = authHeader.slice(7); // strip "Bearer "

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);

      if (!payload.organizationId) {
        throw new UnauthorizedException('Token missing organizationId claim');
      }

      // Attach tenant context to the request so every downstream handler
      // and Prisma service can scope queries without re-decoding the token.
      req.organizationId = payload.organizationId;
      req.tenantId = payload.organizationId; // convenience alias
    } catch {
      // Invalid / expired token — do not set organizationId.
      // Auth guards further down the chain will reject protected routes.
    }

    next();
  }
}
