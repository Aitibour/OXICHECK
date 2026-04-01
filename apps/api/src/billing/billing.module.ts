import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { STRIPE_PROVIDER } from './billing.constants';

@Module({
  imports: [ConfigModule],
  controllers: [BillingController],
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
    BillingService,
  ],
  exports: [BillingService],
})
export class BillingModule {}
