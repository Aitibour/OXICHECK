import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsQueryDto {
  @ApiProperty({ description: 'ISO date string for range start (inclusive)', example: '2026-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'ISO date string for range end (inclusive)', example: '2026-03-31' })
  @IsDateString()
  endDate: string;
}
