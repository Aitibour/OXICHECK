import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsOptional,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePreAuthDto {
  @ApiProperty({ description: 'Reservation ID to associate this pre-authorization with' })
  @IsString()
  @IsNotEmpty()
  reservationId: string;

  @ApiProperty({ description: 'Amount in cents to pre-authorize (e.g. 20000 = $200.00)' })
  @IsInt()
  @IsPositive()
  amountInCents: number;

  @ApiPropertyOptional({ description: 'ISO currency code', default: 'CAD' })
  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency: string = 'CAD';
}
