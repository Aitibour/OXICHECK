import { IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DeliveryStatsQueryDto {
  @ApiPropertyOptional({ description: 'Start date for stats range (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ description: 'End date for stats range (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  to?: string;
}
