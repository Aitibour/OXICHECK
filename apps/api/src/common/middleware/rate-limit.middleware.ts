/**
 * Rate-limiting configuration for HotelCheckIn API.
 *
 * Uses @nestjs/throttler.  Import ThrottlerModule.forRoot() in AppModule,
 * then use the named throttler configurations below per route group.
 *
 * Tiers
 * ─────────────────────────────────────────────────────────────────────────────
 *  global    — 100 req / 60 s per IP  (default for all routes)
 *  auth      — 10  req / 60 s per IP  (login, register, password-reset)
 *  webhook   — 500 req / 60 s per IP  (PMS / Stripe webhook ingestion)
 */

import { ThrottlerModuleOptions } from '@nestjs/throttler';

/** Default global throttler options — import into ThrottlerModule.forRoot() */
export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'global',
      ttl: 60_000, // milliseconds
      limit: 100,
    },
    {
      name: 'auth',
      ttl: 60_000,
      limit: 10,
    },
    {
      name: 'webhook',
      ttl: 60_000,
      limit: 500,
    },
  ],
};

/**
 * Convenience decorator overrides.
 *
 * Usage on a controller or handler:
 *   @Throttle({ auth: { ttl: 60_000, limit: 10 } })
 */
export const AUTH_THROTTLE = { auth: { ttl: 60_000, limit: 10 } };
export const WEBHOOK_THROTTLE = { webhook: { ttl: 60_000, limit: 500 } };
export const GLOBAL_THROTTLE = { global: { ttl: 60_000, limit: 100 } };
