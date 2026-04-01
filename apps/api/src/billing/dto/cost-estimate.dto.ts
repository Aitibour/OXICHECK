import { IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BillingTier } from '@hotelcheckin/database';

export class CostEstimateDto {
  @ApiProperty({
    description: 'Billing tier to estimate cost for',
    enum: BillingTier,
  })
  @IsEnum(BillingTier)
  tier: BillingTier;

  @ApiProperty({
    description: 'Projected monthly check-in usage (number of pre-checks completed)',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  projectedMonthlyUsage: number;
}
