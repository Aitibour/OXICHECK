import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import configuration from './config/configuration';
import { validate } from './config/validation';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { PropertiesModule } from './properties/properties.module';
import { ReservationsModule } from './reservations/reservations.module';
import { GuestsModule } from './guests/guests.module';
import { PrecheckinModule } from './precheckin/precheckin.module';
import { UpsellsModule } from './upsells/upsells.module';
import { BillingModule } from './billing/billing.module';
import { CommunicationsModule } from './communications/communications.module';
import { PmsModule } from './pms/pms.module';
import { PaymentsModule } from './payments/payments.module';
import { ReportsModule } from './reports/reports.module';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware';
import { throttlerConfig } from './common/middleware/rate-limit.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),

    // Rate limiting — applies globally via ThrottlerGuard registered below.
    // Individual controllers/routes can override with @Throttle() decorator.
    ThrottlerModule.forRoot(throttlerConfig),

    PrismaModule,
    HealthModule,
    AuthModule,
    OrganizationsModule,
    PropertiesModule,
    ReservationsModule,
    GuestsModule,
    PrecheckinModule,
    UpsellsModule,
    BillingModule,
    CommunicationsModule,
    PmsModule,
    PaymentsModule,
    ReportsModule,
  ],
  providers: [
    // Apply rate-limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Audit log every mutating request
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Attach tenant context middleware to all routes except the health check
    // and the public pre-check-in flow.  The middleware is a no-op when no
    // Authorization header is present, so it is safe to apply broadly.
    consumer
      .apply(TenantContextMiddleware)
      .exclude(
        { path: 'api/health', method: RequestMethod.GET },
        { path: 'api/checkin/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
