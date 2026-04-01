import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RefundPaymentDto {
  @ApiPropertyOptional({
    description:
      'Amount in cents to refund. Omit for a full refund. (e.g. 5000 = $50.00)',
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  amountInCents?: number;
}
