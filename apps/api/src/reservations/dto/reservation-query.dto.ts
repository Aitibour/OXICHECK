import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PreCheckStatus } from '@hotelcheckin/shared';

export class ReservationQueryDto extends PaginationDto {
  @ApiProperty({ description: 'Property UUID to filter reservations' })
  @IsUUID()
  propertyId: string;

  @ApiPropertyOptional({ description: 'Filter by check-in date from (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by check-in date to (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @ApiPropertyOptional({ enum: PreCheckStatus, description: 'Filter by pre-check status' })
  @IsEnum(PreCheckStatus)
  @IsOptional()
  preCheckStatus?: PreCheckStatus;

  @ApiPropertyOptional({ description: 'Search by guest name or email' })
  @IsString()
  @IsOptional()
  search?: string;
}
