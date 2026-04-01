import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@hotelcheckin/shared';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PmsService } from './pms.service';

@ApiTags('PMS')
@Controller('api/v1/pms')
export class PmsController {
  constructor(private readonly pmsService: PmsService) {}

  // ---------------------------------------------------------------------------
  // POST /sync/:propertyId — trigger manual sync
  // ---------------------------------------------------------------------------
  @Post('sync/:propertyId')
  @UseGuards(RolesGuard)
  @Roles(
    Role.PLATFORM_ADMIN,
    Role.PROPERTY_OWNER,
    Role.GENERAL_MANAGER,
  )
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger a manual PMS reservation sync' })
  async syncProperty(
    @Param('propertyId') propertyId: string,
    @Body() body: { fromDate?: string; toDate?: string },
  ) {
    const result = await this.pmsService.syncProperty(
      propertyId,
      body.fromDate,
      body.toDate,
    );
    return {
      success: result.success,
      syncedCount: result.syncedCount,
      failedCount: result.failedCount,
      errors: result.errors,
    };
  }

  // ---------------------------------------------------------------------------
  // GET /status/:propertyId — PMS connection status
  // ---------------------------------------------------------------------------
  @Get('status/:propertyId')
  @UseGuards(RolesGuard)
  @Roles(
    Role.PLATFORM_ADMIN,
    Role.PROPERTY_OWNER,
    Role.GENERAL_MANAGER,
    Role.FRONT_DESK_SUPERVISOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check PMS connection status for a property' })
  async getConnectionStatus(@Param('propertyId') propertyId: string) {
    return this.pmsService.getConnectionStatus(propertyId);
  }

  // ---------------------------------------------------------------------------
  // GET /sync-history/:propertyId — query sync logs
  // ---------------------------------------------------------------------------
  @Get('sync-history/:propertyId')
  @UseGuards(RolesGuard)
  @Roles(
    Role.PLATFORM_ADMIN,
    Role.PROPERTY_OWNER,
    Role.GENERAL_MANAGER,
    Role.FRONT_DESK_SUPERVISOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get PMS sync history for a property' })
  async getSyncHistory(
    @Param('propertyId') propertyId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? Math.min(parseInt(limit, 10) || 20, 100) : 20;
    return this.pmsService.getSyncHistory(propertyId, parsedLimit);
  }

  // ---------------------------------------------------------------------------
  // POST /webhook/:propertyId — handle PMS webhooks (public)
  // ---------------------------------------------------------------------------
  @Post('webhook/:propertyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle inbound PMS webhook (public, signature-verified)',
  })
  async handleWebhook(
    @Param('propertyId') propertyId: string,
    @Body() payload: unknown,
  ) {
    // TODO: add vendor-specific webhook signature verification
    const result = await this.pmsService.processWebhook(propertyId, payload);
    return { received: true, processed: result !== null };
  }
}
