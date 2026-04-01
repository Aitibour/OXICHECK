import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BillingTier } from '@hotelcheckin/database';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Organization ID to create subscription for' })
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({ description: 'Billing tier', enum: BillingTier })
  @IsEnum(BillingTier)
  @IsNotEmpty()
  tier: BillingTier;
}
