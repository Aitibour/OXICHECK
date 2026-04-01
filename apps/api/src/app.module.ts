import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
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
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
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
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
