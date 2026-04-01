import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ManualCheckinDto {
  @ApiPropertyOptional({ description: 'Optional staff notes recorded at check-in' })
  @IsString()
  @IsOptional()
  notes?: string;
}
