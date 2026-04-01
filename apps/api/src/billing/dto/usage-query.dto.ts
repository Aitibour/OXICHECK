import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UsageQueryDto {
  @ApiProperty({ description: 'Period start date (ISO 8601)' })
  @IsDateString()
  @IsNotEmpty()
  periodStart: string;

  @ApiProperty({ description: 'Period end date (ISO 8601)' })
  @IsDateString()
  @IsNotEmpty()
  periodEnd: string;

  @ApiPropertyOptional({ description: 'Filter by property ID' })
  @IsUUID()
  @IsOptional()
  propertyId?: string;
}
