import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    organizationId: string;
    name: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    timezone?: string;
    defaultLocale?: string;
    roomCount: number;
  }) {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return this.prisma.property.create({
      data: { ...data, slug },
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    await this.findById(id);
    return this.prisma.property.update({ where: { id }, data });
  }

  async findByOrganization(orgId: string) {
    return this.prisma.property.findMany({
      where: { organizationId: orgId },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { organization: { select: { id: true, name: true } } },
    });
    if (!property) throw new NotFoundException(`Property ${id} not found`);

    // Mask PMS API key for security
    if (property.pmsApiKey) {
      const key = property.pmsApiKey;
      (property as Record<string, unknown>).pmsApiKey =
        key.length > 8 ? key.slice(0, 4) + '****' + key.slice(-4) : '****';
    }
    return property;
  }

  async updatePmsConfig(id: string, data: { pmsVendor?: string; pmsApiKey?: string; pmsPropertyId?: string }) {
    await this.findById(id);
    return this.prisma.property.update({ where: { id }, data });
  }
}
