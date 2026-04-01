import { IsString, IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UpsellRuleOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
}

export class CreateRuleDto {
  @ApiProperty({
    description: 'Reservation attribute to evaluate (e.g. dayOfWeek, nightsCount)',
  })
  @IsString()
  @IsNotEmpty()
  attribute: string;

  @ApiProperty({ enum: UpsellRuleOperator })
  @IsEnum(UpsellRuleOperator)
  operator: UpsellRuleOperator;

  @ApiProperty({ description: 'Value to compare against; use comma-separated values for IN/NOT_IN' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ description: 'Rules in same logicGroup are AND-ed; different groups are OR-ed', default: 0 })
  @IsInt()
  logicGroup: number;
}
