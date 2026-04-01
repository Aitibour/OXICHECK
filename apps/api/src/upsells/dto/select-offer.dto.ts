import { IsString, IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SelectOfferDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reservationId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  offerId: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number = 1;
}
