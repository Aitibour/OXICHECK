import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsUUID,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@hotelcheckin/shared';

export class RegisterDto {
  @ApiProperty({ example: 'user@hotel.ca' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecureP@ss1' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Jane' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  lastName: string;

  @ApiProperty({ enum: Role, example: Role.FRONT_DESK_AGENT })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: 'uuid-of-organization' })
  @IsUUID()
  organizationId: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['uuid-of-property-1'],
    description: 'Property IDs the user should have access to',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  propertyIds?: string[];
}
