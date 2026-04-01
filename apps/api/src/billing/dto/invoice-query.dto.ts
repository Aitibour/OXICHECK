import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class InvoiceQueryDto {
  @ApiPropertyOptional({
    description: 'Maximum number of invoices to return (Stripe pagination)',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Stripe invoice ID cursor for forward pagination (starting_after)',
  })
  @IsString()
  @IsOptional()
  startingAfter?: string;
}
