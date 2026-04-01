import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReportQueryDto {
  @ApiPropertyOptional({
    description: 'Start date in ISO 8601 format (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date in ISO 8601 format (YYYY-MM-DD)',
    example: '2026-03-31',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Optional property ID filter (used in portfolio queries)',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  propertyId?: string;
}
