import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
  generateCaslFooter,
  generateCaslFooterHtml,
  generateCaslFooterPlainText,
  CaslFooterOptions,
} from './casl-footer';
import { UpdateTemplateDto } from './dto/update-template.dto';

// SendGrid and Twilio are imported dynamically to avoid hard failures
// when credentials are not configured.
import * as sgMail from '@sendgrid/mail';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  plainText?: string;
  /** propertyId for usage tracking / future multi-sender support */
  propertyId?: string;
}

export interface SendSmsOptions {
  to: string;
  body: string;
  /** propertyId for usage tracking / future multi-sender support */
  propertyId?: string;
}

export interface TemplateVariables {
  guestFirstName?: string;
  guestLastName?: string;
  hotelName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  roomType?: string;
  confirmationNumber?: string;
  preCheckUrl?: string;
  [key: string]: string | undefined;
}

@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger(CommunicationsService.name);
  private twilioClient: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    // Initialise SendGrid
    const sendgridApiKey = this.config.get<string>('sendgrid.apiKey');
    if (sendgridApiKey) {
      (sgMail as any).default ? (sgMail as any).default.setApiKey(sendgridApiKey) : sgMail.setApiKey(sendgridApiKey);
    }

    // Initialise Twilio (lazy — only if credentials are present)
    const twilioSid = this.config.get<string>('twilio.accountSid');
    const twilioToken = this.config.get<string>('twilio.authToken');
    if (twilioSid && twilioToken) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Twilio = require('twilio');
        this.twilioClient = new Twilio(twilioSid, twilioToken);
      } catch {
        this.logger.warn('Twilio SDK not available — SMS sending disabled');
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Template management
  // ---------------------------------------------------------------------------

  async getTemplates(propertyId: string) {
    return this.prisma.communicationTemplate.findMany({
      where: { propertyId },
      orderBy: [{ type: 'asc' }, { channel: 'asc' }],
    });
  }

  async updateTemplate(id: string, data: UpdateTemplateDto) {
    const existing = await this.prisma.communicationTemplate.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Template ${id} not found`);
    }

    return this.prisma.communicationTemplate.update({
      where: { id },
      data,
    });
  }

  // ---------------------------------------------------------------------------
  // Template rendering
  // ---------------------------------------------------------------------------

  renderTemplate(
    template: string,
    variables: TemplateVariables,
    _locale?: string,
  ): string {
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
      if (value !== undefined) {
        rendered = rendered.replace(
          new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
          value,
        );
      }
    }
    return rendered;
  }

  // ---------------------------------------------------------------------------
  // Sending — email
  // ---------------------------------------------------------------------------

  async sendEmail(options: SendEmailOptions): Promise<{ messageId?: string }> {
    const fromEmail = this.config.get<string>('sendgrid.fromEmail');

    try {
      const sendFn = (sgMail as any).default ? (sgMail as any).default.send.bind((sgMail as any).default) : sgMail.send.bind(sgMail);
      const [response] = await sendFn({
        to: options.to,
        from: fromEmail!,
        subject: options.subject,
        html: options.html,
        text: options.plainText,
      });

      this.logger.log(`Email sent to ${options.to} — status ${response.statusCode}`);
      return { messageId: response.headers?.['x-message-id'] as string };
    } catch (error: any) {
      this.logger.error(`Email send failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Sending — SMS
  // ---------------------------------------------------------------------------

  async sendSms(options: SendSmsOptions): Promise<{ sid?: string }> {
    if (!this.twilioClient) {
      this.logger.warn('Twilio not configured — skipping SMS');
      return {};
    }

    const fromNumber = this.config.get<string>('twilio.fromNumber');

    try {
      const message = await this.twilioClient.messages.create({
        to: options.to,
        from: fromNumber,
        body: options.body,
      });

      this.logger.log(`SMS sent to ${options.to} — SID ${message.sid}`);
      return { sid: message.sid };
    } catch (error: any) {
      this.logger.error(`SMS send failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // High-level send methods
  // ---------------------------------------------------------------------------

  async sendPreCheckInvite(
    reservationId: string,
    channelOverride?: string,
    localeOverride?: string,
  ) {
    return this.sendByType(
      reservationId,
      'PRE_CHECK_INVITE',
      channelOverride,
      localeOverride,
    );
  }

  async sendReminder(
    reservationId: string,
    channelOverride?: string,
    localeOverride?: string,
  ) {
    return this.sendByType(
      reservationId,
      'REMINDER',
      channelOverride,
      localeOverride,
    );
  }

  async sendConfirmation(
    reservationId: string,
    channelOverride?: string,
    localeOverride?: string,
  ) {
    return this.sendByType(
      reservationId,
      'CONFIRMATION',
      channelOverride,
      localeOverride,
    );
  }

  private async sendByType(
    reservationId: string,
    type: string,
    channelOverride?: string,
    localeOverride?: string,
  ) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        guest: true,
        property: { include: { organization: true } },
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ${reservationId} not found`);
    }

    const locale = localeOverride || reservation.guest.locale || 'en';
    const frontendUrl = this.config.get<string>('app.frontendUrl');

    const variables: TemplateVariables = {
      guestFirstName: reservation.guest.firstName,
      guestLastName: reservation.guest.lastName,
      hotelName: reservation.property.name,
      checkInDate: reservation.checkInDate.toISOString().split('T')[0],
      checkOutDate: reservation.checkOutDate.toISOString().split('T')[0],
      roomType: reservation.roomType || '',
      confirmationNumber: reservation.confirmationNumber || '',
      preCheckUrl: `${frontendUrl}/pre-checkin/${reservation.preCheckToken}`,
    };

    const caslOptions: CaslFooterOptions = {
      hotelName: reservation.property.name,
      address: `${reservation.property.address}, ${reservation.property.city}, ${reservation.property.province} ${reservation.property.postalCode}`,
      unsubscribeUrl: `${frontendUrl}/unsubscribe/${reservation.guest.id}`,
    };

    const results: any[] = [];
    const channels =
      channelOverride === 'EMAIL'
        ? ['EMAIL']
        : channelOverride === 'SMS'
          ? ['SMS']
          : ['EMAIL', 'SMS']; // default covers BOTH and undefined

    for (const channel of channels) {
      const template = await this.prisma.communicationTemplate.findFirst({
        where: {
          propertyId: reservation.propertyId,
          type: type as any,
          channel: channel as any,
          isActive: true,
        },
      });

      if (!template) {
        this.logger.warn(
          `No active ${type}/${channel} template for property ${reservation.propertyId}`,
        );
        continue;
      }

      // Create log entry
      const log = await this.prisma.communicationLog.create({
        data: {
          reservationId,
          templateId: template.id,
          channel: channel as any,
          recipientEmail:
            channel === 'EMAIL' ? reservation.guest.email : undefined,
          recipientPhone:
            channel === 'SMS' ? reservation.guest.phone || undefined : undefined,
          status: 'QUEUED',
        },
      });

      try {
        if (channel === 'EMAIL') {
          const bodyRaw =
            locale === 'fr' ? template.bodyFr : template.bodyEn;
          const subjectRaw =
            locale === 'fr'
              ? template.subjectFr || template.subjectEn || ''
              : template.subjectEn || '';

          const body = this.renderTemplate(bodyRaw, variables, locale);
          const subject = this.renderTemplate(subjectRaw, variables, locale);
          const caslHtml = generateCaslFooterHtml(caslOptions);
          const caslPlain = generateCaslFooterPlainText(caslOptions);

          const fullHtml = `${body}\n${caslHtml}`;
          const result = await this.sendEmail({
            to: reservation.guest.email,
            subject,
            html: fullHtml,
            plainText: caslPlain,
            propertyId: reservation.propertyId,
          });

          await this.prisma.communicationLog.update({
            where: { id: log.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
              metadata: { messageId: result.messageId },
            },
          });

          results.push({ channel, logId: log.id, status: 'SENT' });
        } else if (channel === 'SMS') {
          if (!reservation.guest.phone) {
            await this.prisma.communicationLog.update({
              where: { id: log.id },
              data: { status: 'FAILED', metadata: { error: 'No phone number' } },
            });
            results.push({
              channel,
              logId: log.id,
              status: 'FAILED',
              error: 'No phone number',
            });
            continue;
          }

          const bodyRaw =
            locale === 'fr' ? template.bodyFr : template.bodyEn;
          const body = this.renderTemplate(bodyRaw, variables, locale);
          const caslPlain = generateCaslFooterPlainText(caslOptions);
          const fullBody = `${body}\n\n${caslPlain}`;

          const result = await this.sendSms({
            to: reservation.guest.phone,
            body: fullBody,
            propertyId: reservation.propertyId,
          });

          await this.prisma.communicationLog.update({
            where: { id: log.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
              metadata: { sid: result.sid },
            },
          });

          results.push({ channel, logId: log.id, status: 'SENT' });
        }
      } catch (error: any) {
        await this.prisma.communicationLog.update({
          where: { id: log.id },
          data: {
            status: 'FAILED',
            metadata: { error: error.message },
          },
        });
        results.push({
          channel,
          logId: log.id,
          status: 'FAILED',
          error: error.message,
        });
      }
    }

    return { reservationId, type, results };
  }

  // ---------------------------------------------------------------------------
  // Delivery stats
  // ---------------------------------------------------------------------------

  async getDeliveryStats(
    propertyId: string,
    dateRange?: { from?: string; to?: string },
  ) {
    const from = dateRange?.from
      ? new Date(dateRange.from)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = dateRange?.to ? new Date(dateRange.to) : new Date();

    const logs = await this.prisma.communicationLog.findMany({
      where: {
        reservation: { propertyId },
        createdAt: { gte: from, lte: to },
      },
      select: { channel: true, status: true },
    });

    const stats = {
      total: logs.length,
      byChannel: { EMAIL: { total: 0 } as Record<string, number>, SMS: { total: 0 } as Record<string, number> },
      byStatus: {} as Record<string, number>,
    };

    for (const log of logs) {
      // By channel
      const ch = stats.byChannel[log.channel] ?? { total: 0 };
      ch.total = (ch.total ?? 0) + 1;
      ch[log.status] = (ch[log.status] || 0) + 1;
      stats.byChannel[log.channel] = ch;

      // By status
      stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
    }

    return { propertyId, from, to, ...stats };
  }

  // ---------------------------------------------------------------------------
  // Communication logs
  // ---------------------------------------------------------------------------

  async getLogs(
    propertyId: string,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.communicationLog.findMany({
        where: { reservation: { propertyId } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { template: { select: { type: true, channel: true } } },
      }),
      this.prisma.communicationLog.count({
        where: { reservation: { propertyId } },
      }),
    ]);

    return { items, total, page, limit };
  }

  // ---------------------------------------------------------------------------
  // Webhooks — ESP status updates
  // ---------------------------------------------------------------------------

  async handleSendGridWebhook(events: any[]) {
    for (const event of events) {
      const messageId = event.sg_message_id?.split('.')[0];
      if (!messageId) continue;

      const statusMap: Record<string, string> = {
        delivered: 'DELIVERED',
        open: 'OPENED',
        click: 'CLICKED',
        bounce: 'BOUNCED',
        dropped: 'FAILED',
      };

      const newStatus = statusMap[event.event];
      if (!newStatus) continue;

      // Find log by metadata messageId
      const log = await this.prisma.communicationLog.findFirst({
        where: {
          metadata: { path: ['messageId'], equals: messageId },
        },
      });

      if (log) {
        const updateData: any = { status: newStatus };
        if (newStatus === 'DELIVERED') updateData.deliveredAt = new Date();
        if (newStatus === 'OPENED') updateData.openedAt = new Date();

        await this.prisma.communicationLog.update({
          where: { id: log.id },
          data: updateData,
        });
      }
    }
  }

  async handleTwilioWebhook(body: any) {
    const sid = body.MessageSid || body.SmsSid;
    if (!sid) return;

    const statusMap: Record<string, string> = {
      delivered: 'DELIVERED',
      undelivered: 'FAILED',
      failed: 'FAILED',
      sent: 'SENT',
    };

    const newStatus = statusMap[body.MessageStatus];
    if (!newStatus) return;

    const log = await this.prisma.communicationLog.findFirst({
      where: {
        metadata: { path: ['sid'], equals: sid },
      },
    });

    if (log) {
      const updateData: any = { status: newStatus };
      if (newStatus === 'DELIVERED') updateData.deliveredAt = new Date();

      await this.prisma.communicationLog.update({
        where: { id: log.id },
        data: updateData,
      });
    }
  }
}
