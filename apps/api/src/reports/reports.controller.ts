import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Role } from '@hotelcheckin/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * GET /api/v1/reports/benchmarks
   * Public endpoint — returns static industry KPI benchmarks.
   */
  @Get('benchmarks')
  @ApiOperation({
    summary: 'Get industry benchmark KPIs',
    description: 'Returns static benchmark ranges for all tracked KPIs. No authentication required.',
  })
  getBenchmarks() {
    return this.reportsService.getBenchmarks();
  }

  /**
   * GET /api/v1/reports/property/:propertyId
   * Full property KPI dashboard.
   */
  @Get('property/:propertyId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.PLATFORM_ADMIN,
    Role.PROPERTY_OWNER,
    Role.GENERAL_MANAGER,
    Role.FRONT_DESK_SUPERVISOR,
  )
  @ApiOperation({ summary: 'Get property KPI dashboard' })
  @ApiParam({ name: 'propertyId', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  getPropertyDashboard(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Query() query: ReportQueryDto,
  ) {
    return this.reportsService.getPropertyDashboard(propertyId, query);
  }

  /**
   * GET /api/v1/reports/portfolio/:organizationId
   * Portfolio-level KPI dashboard aggregated across all properties.
   */
  @Get('portfolio/:organizationId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PLATFORM_ADMIN, Role.PROPERTY_OWNER)
  @ApiOperation({ summary: 'Get portfolio KPI dashboard across all properties' })
  @ApiParam({ name: 'organizationId', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  getPortfolioDashboard(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Query() query: ReportQueryDto,
  ) {
    return this.reportsService.getPortfolioDashboard(organizationId, query);
  }

  /**
   * GET /api/v1/reports/precheck-funnel/:propertyId
   * Pre-check step-by-step funnel with drop-off rates.
   */
  @Get('precheck-funnel/:propertyId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PLATFORM_ADMIN, Role.PROPERTY_OWNER, Role.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Get pre-check funnel with step-by-step drop-off analysis' })
  @ApiParam({ name: 'propertyId', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getPreCheckFunnel(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Query() query: ReportQueryDto,
  ) {
    return this.reportsService.getPreCheckFunnel(propertyId, query);
  }

  /**
   * GET /api/v1/reports/upsells/:propertyId
   * Per-offer upsell performance broken down by category.
   */
  @Get('upsells/:propertyId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PLATFORM_ADMIN, Role.PROPERTY_OWNER, Role.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Get upsell report grouped by offer and category' })
  @ApiParam({ name: 'propertyId', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getUpsellReport(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Query() query: ReportQueryDto,
  ) {
    return this.reportsService.getUpsellReport(propertyId, query);
  }

  /**
   * GET /api/v1/reports/communications/:propertyId
   * Per-template email and SMS performance report.
   */
  @Get('communications/:propertyId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PLATFORM_ADMIN, Role.PROPERTY_OWNER, Role.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Get communications report by channel and template type' })
  @ApiParam({ name: 'propertyId', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getCommunicationReport(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Query() query: ReportQueryDto,
  ) {
    return this.reportsService.getCommunicationReport(propertyId, query);
  }

  /**
   * GET /api/v1/reports/pms-sync/:propertyId
   * PMS sync health report with daily breakdown and error log.
   */
  @Get('pms-sync/:propertyId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PLATFORM_ADMIN, Role.PROPERTY_OWNER, Role.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Get PMS sync health report with daily breakdown' })
  @ApiParam({ name: 'propertyId', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getPmsSyncReport(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Query() query: ReportQueryDto,
  ) {
    return this.reportsService.getPmsSyncReport(propertyId, query);
  }

  /**
   * GET /api/v1/reports/audit/:organizationId
   * Paginated audit log for an organization with optional filters.
   */
  @Get('audit/:organizationId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PLATFORM_ADMIN, Role.PROPERTY_OWNER)
  @ApiOperation({ summary: 'Get audit log for an organization' })
  @ApiParam({ name: 'organizationId', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action keyword' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'resource', required: false, description: 'Filter by resource name' })
  getAuditReport(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Query() query: ReportQueryDto,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('resource') resource?: string,
  ) {
    return this.reportsService.getAuditReport(organizationId, query, {
      action,
      userId,
      resource,
    });
  }
}
