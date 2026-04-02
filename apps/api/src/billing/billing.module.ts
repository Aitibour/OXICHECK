import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { BillingService } from './billing.service';
import { InvoiceService } from './invoice.service';
import { TierManagementService } from './tier-management.service';
import { BillingController } from './billing.controller';
import { STRIPE_PROVIDER } from './billing.constants';

@Module({
  imports: [ConfigModule],
  controllers: [BillingController],
  providers: [
    {
      provide: STRIPE_PROVIDER,
      useFactory: (configService: ConfigService) => {
        const secretKey = configService.get<string>('stripe.secretKey') || 'sk_test_placeholder';
        return new Stripe(secretKey, {
          apiVersion: '2024-12-18.acacia' as any,
          typescript: true,
        });
      },
      inject: [ConfigService],
    },
    BillingService,
    InvoiceService,
    TierManagementService,
  ],
  exports: [BillingService, InvoiceService, TierManagementService],
})
export class BillingModule {}
