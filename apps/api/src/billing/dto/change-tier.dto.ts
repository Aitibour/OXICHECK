import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BillingTier } from '@hotelcheckin/database';

export class ChangeTierDto {
  @ApiProperty({ description: 'New billing tier', enum: BillingTier })
  @IsEnum(BillingTier)
  @IsNotEmpty()
  newTier: BillingTier;
}
