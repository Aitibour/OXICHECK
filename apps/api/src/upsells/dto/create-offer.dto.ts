import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  IsArray,
  Min,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UpsellCategory } from '@hotelcheckin/shared';
import { CreateRuleDto } from './create-rule.dto';

export class CreateOfferDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ enum: UpsellCategory })
  @IsEnum(UpsellCategory)
  category: UpsellCategory;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleFr?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionFr?: string;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  priceInCents: number;

  @ApiPropertyOptional({ default: 'CAD' })
  @IsOptional()
  @IsString()
  currency?: string = 'CAD';

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ type: [CreateRuleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRuleDto)
  rules?: CreateRuleDto[];
}
