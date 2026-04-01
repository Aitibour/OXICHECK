import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CommunicationsService } from './communications.service';
import {
  generateCaslFooterHtml,
  generateCaslFooterPlainText,
} from './casl-footer';
import { PrismaService } from '../prisma/prisma.service';

// ---------------------------------------------------------------------------
// Mock SendGrid
// ---------------------------------------------------------------------------
vi.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn().mockResolvedValue([
      { statusCode: 202, headers: { 'x-message-id': 'mock-msg-id' } },
    ]),
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const mockPrismaService = {
  communicationTemplate: {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  communicationLog: {
    create: vi.fn().mockResolvedValue({ id: 'log-1' }),
    update: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    findFirst: vi.fn(),
  },
  reservation: {
    findUnique: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
  },
};

const mockConfigService = {
  get: vi.fn((key: string) => {
    const map: Record<string, string> = {
      'sendgrid.apiKey': 'SG.test',
      'sendgrid.fromEmail': 'test@hotel.ca',
      'twilio.accountSid': '',
      'twilio.authToken': '',
      'twilio.fromNumber': '+15551234567',
      'app.frontendUrl': 'https://app.hotelcheckin.ca',
    };
    return map[key];
  }),
};

describe('CommunicationsService', () => {
  let service: CommunicationsService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunicationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CommunicationsService>(CommunicationsService);
  });

  // -------------------------------------------------------------------------
  // Template rendering
  // -------------------------------------------------------------------------

  it('should render template variables', () => {
    const template = 'Hello {{guestFirstName}} {{guestLastName}}!';
    const result = service.renderTemplate(template, {
      guestFirstName: 'Jean',
      guestLastName: 'Dupont',
    });
    expect(result).toBe('Hello Jean Dupont!');
  });

  it('should render multiple occurrences of the same variable', () => {
    const template = '{{hotelName}} welcomes you to {{hotelName}}';
    const result = service.renderTemplate(template, {
      hotelName: 'Le Château',
    });
    expect(result).toBe('Le Château welcomes you to Le Château');
  });

  it('should leave unmatched placeholders unchanged', () => {
    const template = 'Hello {{guestFirstName}}, room {{roomNumber}}';
    const result = service.renderTemplate(template, {
      guestFirstName: 'Alice',
    });
    expect(result).toBe('Hello Alice, room {{roomNumber}}');
  });

  // -------------------------------------------------------------------------
  // CASL footer
  // -------------------------------------------------------------------------

  it('should generate HTML CASL footer with all required elements', () => {
    const footer = generateCaslFooterHtml({
      hotelName: 'Test Hotel',
      address: '123 Main St, Toronto, ON M5V 1A1',
      unsubscribeUrl: 'https://app.hotelcheckin.ca/unsubscribe/abc',
    });

    expect(footer).toContain('Test Hotel');
    expect(footer).toContain('123 Main St, Toronto, ON M5V 1A1');
    expect(footer).toContain('unsubscribe');
    expect(footer).toContain('désabonner');
    expect(footer).toContain('https://app.hotelcheckin.ca/unsubscribe/abc');
  });

  it('should generate plain-text CASL footer with bilingual content', () => {
    const footer = generateCaslFooterPlainText({
      hotelName: 'Test Hotel',
      address: '123 Main St, Toronto, ON M5V 1A1',
      unsubscribeUrl: 'https://app.hotelcheckin.ca/unsubscribe/abc',
    });

    expect(footer).toContain('Test Hotel');
    expect(footer).toContain('unsubscribe');
    expect(footer).toContain('désabonner');
  });

  // -------------------------------------------------------------------------
  // Email sending (mocked)
  // -------------------------------------------------------------------------

  it('should send email via SendGrid and return messageId', async () => {
    const sgMail = await import('@sendgrid/mail');
    const result = await service.sendEmail({
      to: 'guest@example.com',
      subject: 'Test',
      html: '<p>Hello</p>',
    });

    expect(sgMail.default.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'guest@example.com',
        subject: 'Test',
        html: '<p>Hello</p>',
      }),
    );
    expect(result.messageId).toBe('mock-msg-id');
  });

  // -------------------------------------------------------------------------
  // SMS sending (no Twilio configured — graceful skip)
  // -------------------------------------------------------------------------

  it('should skip SMS when Twilio is not configured', async () => {
    const result = await service.sendSms({
      to: '+15559876543',
      body: 'Hello',
    });

    expect(result).toEqual({});
  });

  // -------------------------------------------------------------------------
  // Template management
  // -------------------------------------------------------------------------

  it('should call prisma to list templates for a property', async () => {
    await service.getTemplates('prop-1');
    expect(mockPrismaService.communicationTemplate.findMany).toHaveBeenCalledWith({
      where: { propertyId: 'prop-1' },
      orderBy: [{ type: 'asc' }, { channel: 'asc' }],
    });
  });

  it('should throw NotFoundException when updating non-existent template', async () => {
    mockPrismaService.communicationTemplate.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.updateTemplate('bad-id', { bodyEn: 'new' }),
    ).rejects.toThrow('Template bad-id not found');
  });

  // -------------------------------------------------------------------------
  // Delivery stats
  // -------------------------------------------------------------------------

  it('should calculate delivery stats correctly', async () => {
    mockPrismaService.communicationLog.findMany.mockResolvedValueOnce([
      { channel: 'EMAIL', status: 'DELIVERED' },
      { channel: 'EMAIL', status: 'OPENED' },
      { channel: 'SMS', status: 'DELIVERED' },
      { channel: 'EMAIL', status: 'BOUNCED' },
    ]);

    const stats = await service.getDeliveryStats('prop-1');

    expect(stats.total).toBe(4);
    expect(stats.byChannel.EMAIL.total).toBe(3);
    expect(stats.byChannel.SMS.total).toBe(1);
    expect(stats.byStatus.DELIVERED).toBe(2);
    expect(stats.byStatus.OPENED).toBe(1);
    expect(stats.byStatus.BOUNCED).toBe(1);
  });

  // -------------------------------------------------------------------------
  // High-level send (sendPreCheckInvite)
  // -------------------------------------------------------------------------

  it('should send pre-check invite for a reservation with email template', async () => {
    mockPrismaService.reservation.findUnique.mockResolvedValueOnce({
      id: 'res-1',
      propertyId: 'prop-1',
      preCheckToken: 'token-abc',
      checkInDate: new Date('2026-04-02'),
      checkOutDate: new Date('2026-04-05'),
      roomType: 'Deluxe King',
      confirmationNumber: 'CONF-123',
      guest: {
        id: 'guest-1',
        firstName: 'Marie',
        lastName: 'Tremblay',
        email: 'marie@example.com',
        phone: null,
        locale: 'fr',
      },
      property: {
        name: 'Auberge du Lac',
        address: '100 Rue Principale',
        city: 'Montréal',
        province: 'QC',
        postalCode: 'H2X 1Y6',
        organization: { name: 'Org' },
      },
    });

    mockPrismaService.communicationTemplate.findFirst
      .mockResolvedValueOnce({
        id: 'tpl-email',
        type: 'PRE_CHECK_INVITE',
        channel: 'EMAIL',
        subjectEn: 'Pre-check at {{hotelName}}',
        subjectFr: 'Pré-enregistrement au {{hotelName}}',
        bodyEn: '<p>Hi {{guestFirstName}}</p>',
        bodyFr: '<p>Bonjour {{guestFirstName}}</p>',
      })
      // SMS template not found — skip
      .mockResolvedValueOnce(null);

    mockPrismaService.communicationLog.create.mockResolvedValueOnce({
      id: 'log-email',
    });

    const result = await service.sendPreCheckInvite('res-1');

    expect(result.reservationId).toBe('res-1');
    expect(result.type).toBe('PRE_CHECK_INVITE');
    expect(result.results).toHaveLength(1);
    expect(result.results[0].channel).toBe('EMAIL');
    expect(result.results[0].status).toBe('SENT');
  });
});
