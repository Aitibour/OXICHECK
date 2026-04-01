import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Channel selection for outgoing communications.
 * BOTH (default) sends via both EMAIL and SMS when configured.
 */
export enum SendChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  BOTH = 'BOTH',
}

export class SendCommunicationDto {
  @ApiPropertyOptional({
    enum: SendChannel,
    default: SendChannel.BOTH,
    description: 'Channel to send through: EMAIL, SMS, or BOTH (default).',
  })
  @IsEnum(SendChannel)
  @IsOptional()
  channel?: SendChannel;

  @ApiPropertyOptional({
    description: 'Locale override (en or fr). Defaults to the guest\'s stored locale.',
    example: 'fr',
  })
  @IsString()
  @IsOptional()
  locale?: string;
}
