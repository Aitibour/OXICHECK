import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrgQueryDto } from './dto/org-query.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrganizationDto) {
    const slug = dto.slug ?? this.slugify(dto.name);

    const existing = await this.prisma.organization.findUnique({ where: { slug } });
    if (existing) throw new ConflictException(`Organization with slug "${slug}" already exists`);

    return this.prisma.organization.create({
      data: { name: dto.name, slug },
    });
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findById(id);
    return this.prisma.organization.update({ where: { id }, data: dto });
  }

  async findAll(query: OrgQueryDto) {
    const { search, billingTier, isActive, page = 1, limit = 20 } = query;

    const where: Record<string, unknown> = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (billingTier) where.billingTier = billingTier;
    if (isActive !== undefined) where.isActive = isActive;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.organization.findMany({
        where,
        include: { _count: { select: { properties: true } }, subscription: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        properties: { select: { id: true, name: true, city: true, province: true, isActive: true } },
        subscription: true,
        _count: { select: { properties: true } },
      },
    });
    if (!org) throw new NotFoundException(`Organization ${id} not found`);
    return org;
  }

  async deactivate(id: string) {
    await this.findById(id);
    return this.prisma.organization.update({ where: { id }, data: { isActive: false } });
  }

  async getSystemStats() {
    const [totalOrgs, totalProperties, totalReservations, totalPreChecks, subscriptionsByTier] =
      await this.prisma.$transaction([
        this.prisma.organization.count(),
        this.prisma.property.count(),
        this.prisma.reservation.count(),
        this.prisma.preCheckSubmission.count({ where: { completedAt: { not: null } } }),
        this.prisma.subscription.groupBy({ by: ['tier'], where: { status: 'ACTIVE' }, orderBy: { tier: 'asc' }, _count: { _all: true } }),
      ]);

    return {
      totalOrgs,
      totalProperties,
      totalReservations,
      totalPreChecks,
      activeSubscriptions: subscriptionsByTier.reduce((sum, t) => {
        const count = typeof t._count === 'object' && t._count !== null ? (t._count as any)._all ?? 0 : 0;
        return sum + count;
      }, 0),
      subscriptionsByTier: subscriptionsByTier.map((t) => {
        const count = typeof t._count === 'object' && t._count !== null ? (t._count as any)._all ?? 0 : 0;
        return { tier: t.tier, count };
      }),
    };
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
