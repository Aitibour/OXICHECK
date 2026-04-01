import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Organization ID to create Stripe customer for' })
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({ description: 'Billing email for the Stripe customer' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Organization name for the Stripe customer' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
