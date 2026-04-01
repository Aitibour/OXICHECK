import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTemplateDto {
  @ApiPropertyOptional({ description: 'Email subject in English' })
  @IsString()
  @IsOptional()
  subjectEn?: string;

  @ApiPropertyOptional({ description: 'Email subject in French' })
  @IsString()
  @IsOptional()
  subjectFr?: string;

  @ApiPropertyOptional({ description: 'Template body in English (HTML for email, plain text for SMS)' })
  @IsString()
  @IsOptional()
  bodyEn?: string;

  @ApiPropertyOptional({ description: 'Template body in French (HTML for email, plain text for SMS)' })
  @IsString()
  @IsOptional()
  bodyFr?: string;

  @ApiPropertyOptional({ description: 'Whether the template is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
