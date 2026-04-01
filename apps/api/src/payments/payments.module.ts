import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { STRIPE_PROVIDER } from '../billing/billing.constants';

/**
 * PaymentsModule — hotel-level payment processing.
 *
 * Design decisions:
 *  - Hotel is the merchant of record, NOT this platform.
 *  - Stripe Hosted Checkout pages are used so card data never touches our servers.
 *  - Pre-authorization (capture_method=manual) is supported for incidentals / holds.
 *  - Payment status is tracked independently from booking/reservation status.
 *  - Stripe connected accounts (future) will be referenced per-property.
 */
@Module({
  imports: [ConfigModule],
  controllers: [PaymentsController],
  providers: [
    {
      provide: STRIPE_PROVIDER,
      useFactory: (configService: ConfigService) => {
        const secretKey = configService.get<string>('stripe.secretKey');
        return new Stripe(secretKey ?? '', {
          apiVersion: '2024-12-18.acacia',
          typescript: true,
        });
      },
      inject: [ConfigService],
    },
    PaymentsService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
