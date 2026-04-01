import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@hotelcheckin/shared';
import { PropertiesService } from './properties.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Properties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly service: PropertiesService) {}

  @Post()
  @Roles(Role.PROPERTY_OWNER, Role.PLATFORM_ADMIN)
  create(@Body() dto: { organizationId: string; name: string; address: string; city: string; province: string; postalCode: string; timezone?: string; defaultLocale?: string; roomCount: number }) {
    return this.service.create(dto);
  }

  @Get('org/:orgId')
  @Roles(Role.PROPERTY_OWNER, Role.GENERAL_MANAGER, Role.PLATFORM_ADMIN)
  findByOrganization(@Param('orgId') orgId: string) {
    return this.service.findByOrganization(orgId);
  }

  @Get(':id')
  @Roles(Role.GENERAL_MANAGER, Role.PROPERTY_OWNER, Role.PLATFORM_ADMIN)
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Roles(Role.PROPERTY_OWNER, Role.PLATFORM_ADMIN)
  update(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    return this.service.update(id, dto);
  }

  @Patch(':id/pms')
  @Roles(Role.PROPERTY_OWNER, Role.PLATFORM_ADMIN)
  updatePmsConfig(@Param('id') id: string, @Body() dto: { pmsVendor?: string; pmsApiKey?: string; pmsPropertyId?: string }) {
    return this.service.updatePmsConfig(id, dto);
  }
}
