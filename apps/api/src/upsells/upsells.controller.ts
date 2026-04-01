import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UpsellsService } from './upsells.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { SelectOfferDto } from './dto/select-offer.dto';
import { RecordImpressionDto } from './dto/record-impression.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@hotelcheckin/shared';

@ApiTags('upsells')
@Controller('v1/upsells')
export class UpsellsController {
  constructor(private readonly upsellsService: UpsellsService) {}

  // =========================================================================
  // Offers
  // =========================================================================

  @Post('offers')
  @UseGuards(RolesGuard)
  @Roles(Role.PLATFORM_ADMIN, Role.PROPERTY_OWNER, Role.GENERAL_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new upsell offer' })
  createOffer(@Body() dto: CreateOfferDto) {
    return this.upsellsService.createOffer(dto);
  }

  @Get('offers/:propertyId')
  @UseGuards(RolesGuard)
  @Roles(
    Role.PLATFORM_ADMIN,
    Role.PROPERTY_OWNER,
    Role.GENERAL_MANAGER,
    Role.FRONT_DESK_SUPERVISOR,
    Role.FRONT_DESK_AGENT,
    Role.REVENUE_MANAGER,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active upsell offers for a property' })
  @ApiParam({ name: 'propertyId', type: String })
  getOffers(@Param('propertyId') propertyId: string) {
    return this.upsellsService.getOffers(propertyId);
  }

  @Get('offers/detail/:id')
  @UseGuards(RolesGuard)
  @Roles(
    Role.PLATFORM_ADMIN,
    Role.PROPERTY_OWNER,
    Role.GENERAL_MANAGER,
    Role.FRONT_DESK_SUPERVISOR,
    Role.FRONT_DESK_AGENT,
    Role.REVENUE_MANAGER,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single offer with its rules' })
  @ApiParam({ name: 'id', type: String })
  getOfferById(@Param('id') id: string) {
    return this.upsellsService.getOfferById(id);
  }

  @Patch('offers/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.PLATFORM_ADMIN, Role.PROPERTY_OWNER, Role.GENERAL_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an upsell offer' })
  @ApiParam({ name: 'id', type: String })
  updateOffer(@Param('id') id: string, @Body() dto: UpdateOfferDto) {
    return this.upsellsService.updateOffer(id, dto);
  }

  @Delete('offers/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.PLATFORM_ADMIN, Role.PROPERTY_OWNER, Role.GENERAL_MANAGER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete an upsell offer (sets isActive=false)' })
  @ApiParam({ name: 'id', type: String })
  deleteOffer(@Param('id') id: string) {
    return this.upsellsService.deleteOffer(id);
  }

  // =========================================================================
  // Rules
  // =========================================================================

  @Post('offers/:offerId/rules')
  @UseGuards(RolesGuard)
  @Roles(Role.PLATFORM_ADMIN, Role.PROPERTY_OWNER, Role.GENERAL_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a targeting rule to an offer' })
  @ApiParam({ name: 'offerId', type: String })
  createRule(@Param('offerId') offerId: string, @Body() dto: CreateRuleDto) {
    return this.upsellsService.createRule(offerId, dto);
  }

  @Patch('rules/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.PLATFORM_ADMIN, Role.PROPERTY_OWNER, Role.GENERAL_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a targeting rule' })
  @ApiParam({ name: 'id', type: String })
  updateRule(@Param('id') id: string, @Body() dto: UpdateRuleDto) {
    return this.upsellsService.updateRule(id, dto);
  }

  @Delete('rules/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.PLATFORM_ADMIN, Role.PROPERTY_OWNER, Role.GENERAL_MANAGER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a targeting rule' })
  @ApiParam({ name: 'id', type: String })
  deleteRule(@Param('id') id: string) {
    return this.upsellsService.deleteRule(id);
  }

  // =========================================================================
  // Guest-facing — eligible offers
  // =========================================================================

  @Get('eligible/:reservationId')
  @ApiOperation({
    summary: 'Get eligible upsell offers for a reservation (guest-facing, token auth)',
  })
  @ApiParam({ name: 'reservationId', type: String })
  @ApiQuery({ name: 'token', required: false, description: 'Guest pre-check token' })
  getEligibleOffers(@Param('reservationId') reservationId: string) {
    return this.upsellsService.getOffersForReservation(reservationId);
  }

  // =========================================================================
  // Guest Selection
  // =========================================================================

  @Post('select')
  @ApiOperation({ summary: 'Guest selects an upsell offer' })
  selectOffer(@Body() dto: SelectOfferDto) {
    return this.upsellsService.selectOffer(dto);
  }

  @Delete('select/:selectionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a guest upsell selection' })
  @ApiParam({ name: 'selectionId', type: String })
  removeSelection(@Param('selectionId') selectionId: string) {
    return this.upsellsService.removeSelection(selectionId);
  }

  @Get('selections/:reservationId')
  @ApiOperation({ summary: 'Get all selections for a reservation' })
  @ApiParam({ name: 'reservationId', type: String })
  getSelections(@Param('reservationId') reservationId: string) {
    return this.upsellsService.getSelections(reservationId);
  }

  // =========================================================================
  // Impressions
  // =========================================================================

  @Post('impressions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record that a guest viewed an upsell offer' })
  recordImpression(@Body() dto: RecordImpressionDto) {
    return this.upsellsService.recordImpression(dto);
  }

  // =========================================================================
  // Analytics
  // =========================================================================

  @Get('analytics/:propertyId')
  @UseGuards(RolesGuard)
  @Roles(
    Role.PLATFORM_ADMIN,
    Role.PROPERTY_OWNER,
    Role.GENERAL_MANAGER,
    Role.REVENUE_MANAGER,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get upsell analytics for a property' })
  @ApiParam({ name: 'propertyId', type: String })
  getAnalytics(
    @Param('propertyId') propertyId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.upsellsService.getOfferAnalytics(propertyId, query);
  }
}
