import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { Role } from '@hotelcheckin/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CommunicationsService } from './communications.service';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { SendCommunicationDto } from './dto/send-communication.dto';
import { DeliveryStatsQueryDto } from './dto/delivery-stats-query.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Communications')
@Controller('api/v1/communications')
export class CommunicationsController {
  constructor(
    private readonly communicationsService: CommunicationsService,
  ) {}

  // ---------------------------------------------------------------------------
  // Templates
  // ---------------------------------------------------------------------------

  @Get('templates/:propertyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all communication templates for a property' })
  @ApiResponse({ status: 200, description: 'List of templates' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTemplates(@Param('propertyId') propertyId: string) {
    return this.communicationsService.getTemplates(propertyId);
  }

  @Put('templates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.PLATFORM_ADMIN,
    Role.PROPERTY_OWNER,
    Role.GENERAL_MANAGER,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a communication template (GM+ only)' })
  @ApiResponse({ status: 200, description: 'Template updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.communicationsService.updateTemplate(id, dto);
  }

  // ---------------------------------------------------------------------------
  // Send
  // ---------------------------------------------------------------------------

  @Post('send/precheck-invite/:reservationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send pre-check-in invitation for a reservation' })
  @ApiResponse({ status: 200, description: 'Invitation sent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  sendPreCheckInvite(
    @Param('reservationId') reservationId: string,
    @Body() dto: SendCommunicationDto,
  ) {
    return this.communicationsService.sendPreCheckInvite(
      reservationId,
      dto.channel,
      dto.locale,
    );
  }

  @Post('send/reminder/:reservationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send reminder for a reservation' })
  @ApiResponse({ status: 200, description: 'Reminder sent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  sendReminder(
    @Param('reservationId') reservationId: string,
    @Body() dto: SendCommunicationDto,
  ) {
    return this.communicationsService.sendReminder(
      reservationId,
      dto.channel,
      dto.locale,
    );
  }

  // ---------------------------------------------------------------------------
  // Stats & Logs
  // ---------------------------------------------------------------------------

  @Get('stats/:propertyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get delivery statistics for a property' })
  @ApiResponse({ status: 200, description: 'Delivery statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getDeliveryStats(
    @Param('propertyId') propertyId: string,
    @Query() query: DeliveryStatsQueryDto,
  ) {
    return this.communicationsService.getDeliveryStats(propertyId, {
      from: query.from,
      to: query.to,
    });
  }

  @Get('logs/:propertyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get communication logs for a property (paginated)' })
  @ApiResponse({ status: 200, description: 'Communication logs' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getLogs(
    @Param('propertyId') propertyId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.communicationsService.getLogs(
      propertyId,
      pagination.page,
      pagination.limit,
    );
  }

  // ---------------------------------------------------------------------------
  // ESP Webhooks (public — no auth required, verified by signature in production)
  // ---------------------------------------------------------------------------

  @Post('webhook/sendgrid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'SendGrid event webhook (public)' })
  handleSendGridWebhook(@Body() body: any[]) {
    return this.communicationsService.handleSendGridWebhook(body);
  }

  @Post('webhook/twilio')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Twilio status callback webhook (public)' })
  handleTwilioWebhook(@Body() body: any) {
    return this.communicationsService.handleTwilioWebhook(body);
  }
}
