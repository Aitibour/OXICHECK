import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Security headers middleware.
 * Applied globally in main.ts via app.use() so every response carries
 * the hardened header set required for PCI-DSS / OWASP compliance.
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(_req: Request, res: Response, next: NextFunction): void {
    // Prevent MIME-type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Block the site from being embedded in iframes (clickjacking protection)
    res.setHeader('X-Frame-Options', 'DENY');

    // Legacy XSS filter — still honoured by some older browsers
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Force HTTPS for 1 year, including subdomains
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );

    // Restrict resource loading to same origin by default
    res.setHeader('Content-Security-Policy', "default-src 'self'");

    // Send only origin on cross-origin requests (no full URL)
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Opt-out of FLoC / Topics API
    res.setHeader('Permissions-Policy', 'interest-cohort=()');

    next();
  }
}
