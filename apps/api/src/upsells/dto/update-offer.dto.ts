import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateOfferDto } from './create-offer.dto';

export class UpdateOfferDto extends PartialType(OmitType(CreateOfferDto, ['propertyId'] as const)) {}
