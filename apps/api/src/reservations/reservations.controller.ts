import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@hotelcheckin/shared';
import { ReservationsService } from './reservations.service';
import { ReservationQueryDto } from './dto/reservation-query.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ManualCheckinDto } from './dto/manual-checkin.dto';
import type { User } from '@hotelcheckin/shared';

@ApiTags('reservations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /**
   * GET /reservations/stats/:propertyId
   * Dashboard stats for a property on a given date.
   * Must be defined before /:id to avoid route collision.
   */
  @Get('stats/:propertyId')
  @Roles(
    Role.PLATFORM_ADMIN,
    Role.PROPERTY_OWNER,
    Role.GENERAL_MANAGER,
    Role.FRONT_DESK_SUPERVISOR,
    Role.FRONT_DESK_AGENT,
  )
  @ApiOperation({ summary: 'Get dashboard statistics for a property' })
  @ApiParam({ name: 'propertyId', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'date', required: false, description: 'Date in YYYY-MM-DD format, defaults to today' })
  getDashboardStats(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Query('date') date?: string,
  ) {
    return this.reservationsService.getDashboardStats(propertyId, date);
  }

  /**
   * GET /reservations
   * List reservations with filters and pagination.
   */
  @Get()
  @Roles(
    Role.PLATFORM_ADMIN,
    Role.PROPERTY_OWNER,
    Role.GENERAL_MANAGER,
    Role.FRONT_DESK_SUPERVISOR,
    Role.FRONT_DESK_AGENT,
  )
  @ApiOperation({ summary: 'List reservations for a property' })
  getArrivals(@Query() query: ReservationQueryDto) {
    return this.reservationsService.getUpcomingArrivals(query);
  }

  /**
   * GET /reservations/:id
   * Get a single reservation with full detail.
   */
  @Get(':id')
  @Roles(
    Role.PLATFORM_ADMIN,
    Role.PROPERTY_OWNER,
    Role.GENERAL_MANAGER,
    Role.FRONT_DESK_SUPERVISOR,
    Role.FRONT_DESK_AGENT,
  )
  @ApiOperation({ summary: 'Get a single reservation by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  getReservation(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.getReservationById(id);
  }

  /**
   * PATCH /reservations/:id
   * Update room assignment, notes, or status.
   */
  @Patch(':id')
  @Roles(
    Role.PLATFORM_ADMIN,
    Role.PROPERTY_OWNER,
    Role.GENERAL_MANAGER,
    Role.FRONT_DESK_SUPERVISOR,
  )
  @ApiOperation({ summary: 'Update reservation (room, notes, status)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  updateReservation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReservationDto,
  ) {
    return this.reservationsService.updateReservation(id, dto);
  }

  /**
   * POST /reservations/:id/checkin
   * Manually check in a guest.
   */
  @Post(':id/checkin')
  @Roles(
    Role.PLATFORM_ADMIN,
    Role.PROPERTY_OWNER,
    Role.GENERAL_MANAGER,
    Role.FRONT_DESK_SUPERVISOR,
    Role.FRONT_DESK_AGENT,
  )
  @ApiOperation({ summary: 'Manual check-in for a reservation' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  manualCheckIn(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ManualCheckinDto,
    @CurrentUser() user: User,
  ) {
    return this.reservationsService.manualCheckIn(id, user.id, dto);
  }

  /**
   * GET /reservations/:id/precheck
   * Fetch the pre-check submission for a reservation.
   */
  @Get(':id/precheck')
  @Roles(
    Role.PLATFORM_ADMIN,
    Role.PROPERTY_OWNER,
    Role.GENERAL_MANAGER,
    Role.FRONT_DESK_SUPERVISOR,
    Role.FRONT_DESK_AGENT,
  )
  @ApiOperation({ summary: 'Get pre-check submission for a reservation' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  getPreCheck(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.getPreCheckSubmission(id);
  }
}
