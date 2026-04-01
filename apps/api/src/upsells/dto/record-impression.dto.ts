import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecordImpressionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  offerId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reservationId: string;
}
