import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateGuestTokenDto {
  @ApiProperty({ description: 'Guest pre-check-in token (UUID)' })
  @IsString()
  token: string;
}
