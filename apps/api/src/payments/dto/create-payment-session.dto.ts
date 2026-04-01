import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsUrl,
  IsOptional,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentSessionDto {
  @ApiProperty({ description: 'Reservation ID to associate this payment with' })
  @IsString()
  @IsNotEmpty()
  reservationId: string;

  @ApiProperty({ description: 'Amount in cents (e.g. 15000 = $150.00)' })
  @IsInt()
  @IsPositive()
  amountInCents: number;

  @ApiPropertyOptional({ description: 'ISO currency code', default: 'CAD' })
  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency: string = 'CAD';

  @ApiProperty({ description: 'URL to redirect the guest after payment completes' })
  @IsUrl()
  @IsNotEmpty()
  returnUrl: string;
}
