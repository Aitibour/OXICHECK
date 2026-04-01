import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import Stripe from 'stripe';
import {
  prisma,
  PaymentGateway,
  PaymentStatus,
  PaymentType,
} from '@hotelcheckin/database';
import { STRIPE_PROVIDER } from '../billing/billing.constants';
import { PaymentQueryDto } from './dto/payment-query.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(@Inject(STRIPE_PROVIDER) private readonly stripe: Stripe) {}

  // ─── Session / Hosted Checkout ────────────────────────────────────────────

  /**
   * Create a Stripe Checkout Session (hosted page) for a reservation.
   * Card data never touches our servers — the guest is redirected to Stripe.
   * The hotel is the merchant of record via its connected account.
   * Returns the session URL and persists a PENDING Payment record.
   */
  async createPaymentSession(
    reservationId: string,
    amountInCents: number,
    currency: string,
    returnUrl: string,
  ): Promise<{ sessionUrl: string; paymentId: string }> {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { property: true },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ${reservationId} not found`);
    }

    // Build checkout session params.
    // If the property has a Stripe connected account configured (future field),
    // we would pass stripe_account here. For now we use the platform account
    // and note this in metadata.
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Hotel Stay — ${reservation.property.name}`,
              metadata: { reservationId, propertyId: reservation.propertyId },
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${returnUrl}?status=cancelled`,
      metadata: {
        reservationId,
        propertyId: reservation.propertyId,
      },
    };

    const session = await this.stripe.checkout.sessions.create(sessionParams);

    const payment = await prisma.payment.create({
      data: {
        reservationId,
        propertyId: reservation.propertyId,
        amountInCents,
        currency: currency.toUpperCase(),
        gateway: PaymentGateway.STRIPE,
        gatewayPaymentId: session.id,
        status: PaymentStatus.PENDING,
        type: PaymentType.CHARGE,
      },
    });

    this.logger.log(
      `Created Stripe Checkout Session ${session.id} for reservation ${reservationId}`,
    );

    return { sessionUrl: session.url!, paymentId: payment.id };
  }

  // ─── Pre-Authorization ────────────────────────────────────────────────────

  /**
   * Create a Stripe PaymentIntent with capture_method=manual (pre-authorization).
   * The guest's card is held but not charged until capturePayment() is called.
   * Persists the Payment record with status AUTHORIZED.
   */
  async createPreAuthorization(
    reservationId: string,
    amountInCents: number,
    currency: string,
  ): Promise<{ clientSecret: string | null; paymentId: string }> {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ${reservationId} not found`);
    }

    const intent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      capture_method: 'manual',
      metadata: {
        reservationId,
        propertyId: reservation.propertyId,
        type: PaymentType.PRE_AUTH,
      },
    });

    const payment = await prisma.payment.create({
      data: {
        reservationId,
        propertyId: reservation.propertyId,
        amountInCents,
        currency: currency.toUpperCase(),
        gateway: PaymentGateway.STRIPE,
        gatewayPaymentId: intent.id,
        status: PaymentStatus.AUTHORIZED,
        type: PaymentType.PRE_AUTH,
      },
    });

    this.logger.log(
      `Created pre-auth PaymentIntent ${intent.id} for reservation ${reservationId}`,
    );

    return { clientSecret: intent.client_secret, paymentId: payment.id };
  }

  // ─── Capture ──────────────────────────────────────────────────────────────

  /**
   * Capture a previously authorized payment.
   * Updates the Payment record status to CAPTURED.
   */
  async capturePayment(paymentId: string) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.AUTHORIZED) {
      throw new BadRequestException(
        `Payment ${paymentId} is not in AUTHORIZED state (current: ${payment.status})`,
      );
    }

    if (!payment.gatewayPaymentId) {
      throw new BadRequestException(`Payment ${paymentId} has no gateway payment ID`);
    }

    await this.stripe.paymentIntents.capture(payment.gatewayPaymentId);

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.CAPTURED },
    });

    this.logger.log(`Captured payment ${paymentId} (intent: ${payment.gatewayPaymentId})`);

    return updated;
  }

  // ─── Refund ───────────────────────────────────────────────────────────────

  /**
   * Issue a full or partial refund for a captured payment.
   * Saves a new REFUNDED Payment record linked to the same reservation.
   */
  async refundPayment(paymentId: string, amountInCents?: number) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.CAPTURED) {
      throw new BadRequestException(
        `Payment ${paymentId} cannot be refunded (current status: ${payment.status})`,
      );
    }

    if (!payment.gatewayPaymentId) {
      throw new BadRequestException(`Payment ${paymentId} has no gateway payment ID`);
    }

    const refundAmount = amountInCents ?? payment.amountInCents;

    if (refundAmount > payment.amountInCents) {
      throw new BadRequestException(
        `Refund amount (${refundAmount}) exceeds original payment amount (${payment.amountInCents})`,
      );
    }

    // Retrieve the PaymentIntent to get the charge ID
    const intent = await this.stripe.paymentIntents.retrieve(
      payment.gatewayPaymentId,
    );

    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: intent.id,
      amount: refundAmount,
    };

    const stripeRefund = await this.stripe.refunds.create(refundParams);

    // Mark the original payment as REFUNDED if fully refunded
    if (refundAmount >= payment.amountInCents) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.REFUNDED },
      });
    }

    // Save a separate REFUND record for auditing
    const refundRecord = await prisma.payment.create({
      data: {
        reservationId: payment.reservationId,
        propertyId: payment.propertyId,
        amountInCents: refundAmount,
        currency: payment.currency,
        gateway: PaymentGateway.STRIPE,
        gatewayPaymentId: stripeRefund.id,
        status: PaymentStatus.REFUNDED,
        type: PaymentType.REFUND,
      },
    });

    this.logger.log(
      `Issued ${refundAmount === payment.amountInCents ? 'full' : 'partial'} refund ` +
        `for payment ${paymentId} — Stripe refund: ${stripeRefund.id}`,
    );

    return refundRecord;
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  /**
   * List all Payment records for a given reservation.
   */
  async getPaymentsByReservation(reservationId: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ${reservationId} not found`);
    }

    return prisma.payment.findMany({
      where: { reservationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * List Payment records for a property with optional date range and status filters.
   */
  async getPaymentsByProperty(propertyId: string, query: PaymentQueryDto) {
    const { startDate, endDate, status, gateway, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { propertyId };

    if (status) where.status = status;
    if (gateway) where.gateway = gateway;

    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Summary ──────────────────────────────────────────────────────────────

  /**
   * Aggregate payment totals for a property within a date range.
   * Returned amounts are in cents.
   */
  async getPaymentSummary(
    propertyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalCollected: number;
    totalPending: number;
    totalFailed: number;
    totalRefunded: number;
    transactionCount: number;
  }> {
    const dateFilter = { gte: startDate, lte: endDate };

    const [collected, pending, failed, refunded, transactionCount] =
      await Promise.all([
        prisma.payment.aggregate({
          where: { propertyId, status: PaymentStatus.CAPTURED, createdAt: dateFilter, type: { not: PaymentType.REFUND } },
          _sum: { amountInCents: true },
        }),
        prisma.payment.aggregate({
          where: { propertyId, status: PaymentStatus.PENDING, createdAt: dateFilter },
          _sum: { amountInCents: true },
        }),
        prisma.payment.aggregate({
          where: { propertyId, status: PaymentStatus.FAILED, createdAt: dateFilter },
          _sum: { amountInCents: true },
        }),
        prisma.payment.aggregate({
          where: { propertyId, status: PaymentStatus.REFUNDED, createdAt: dateFilter },
          _sum: { amountInCents: true },
        }),
        prisma.payment.count({
          where: { propertyId, createdAt: dateFilter, type: { not: PaymentType.REFUND } },
        }),
      ]);

    return {
      totalCollected: collected._sum.amountInCents ?? 0,
      totalPending: pending._sum.amountInCents ?? 0,
      totalFailed: failed._sum.amountInCents ?? 0,
      totalRefunded: refunded._sum.amountInCents ?? 0,
      transactionCount,
    };
  }

  // ─── Webhook ──────────────────────────────────────────────────────────────

  /**
   * Process Stripe payment webhook events.
   * Handles: checkout.session.completed, payment_intent.succeeded,
   *          payment_intent.payment_failed, charge.refunded.
   */
  async handleStripePaymentWebhook(event: Stripe.Event): Promise<void> {
    this.logger.log(`Processing payment webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.onCheckoutSessionCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await this.onPaymentIntentSucceeded(intent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await this.onPaymentIntentFailed(intent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await this.onChargeRefunded(charge);
        break;
      }

      default:
        this.logger.debug(`Unhandled payment webhook type: ${event.type}`);
    }
  }

  // ─── Private Webhook Handlers ─────────────────────────────────────────────

  private async onCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const payment = await prisma.payment.findFirst({
      where: { gatewayPaymentId: session.id },
    });

    if (!payment) {
      this.logger.warn(
        `No local payment found for Checkout Session ${session.id}`,
      );
      return;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.CAPTURED,
        // Store the PaymentIntent ID alongside for future refunds
        gatewayPaymentId: session.payment_intent as string ?? session.id,
      },
    });

    this.logger.log(
      `Checkout Session ${session.id} completed — payment ${payment.id} marked CAPTURED`,
    );
  }

  private async onPaymentIntentSucceeded(
    intent: Stripe.PaymentIntent,
  ): Promise<void> {
    const payment = await prisma.payment.findFirst({
      where: { gatewayPaymentId: intent.id },
    });

    if (!payment) {
      this.logger.debug(
        `No local payment found for PaymentIntent ${intent.id} (may be handled by session webhook)`,
      );
      return;
    }

    // Only update if not already captured (e.g. via checkout.session.completed)
    if (payment.status !== PaymentStatus.CAPTURED) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.CAPTURED },
      });

      this.logger.log(`PaymentIntent ${intent.id} succeeded — payment ${payment.id} CAPTURED`);
    }
  }

  private async onPaymentIntentFailed(
    intent: Stripe.PaymentIntent,
  ): Promise<void> {
    const payment = await prisma.payment.findFirst({
      where: { gatewayPaymentId: intent.id },
    });

    if (!payment) {
      this.logger.warn(`No local payment found for failed PaymentIntent ${intent.id}`);
      return;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });

    this.logger.warn(
      `PaymentIntent ${intent.id} failed — payment ${payment.id} marked FAILED`,
    );
  }

  private async onChargeRefunded(charge: Stripe.Charge): Promise<void> {
    if (!charge.payment_intent) return;

    const payment = await prisma.payment.findFirst({
      where: { gatewayPaymentId: charge.payment_intent as string },
    });

    if (!payment) {
      this.logger.warn(
        `No local payment found for refunded charge ${charge.id} (intent: ${charge.payment_intent})`,
      );
      return;
    }

    // Only update if a full refund occurred (amount_refunded equals amount)
    if (charge.amount_refunded >= charge.amount) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.REFUNDED },
      });

      this.logger.log(
        `Charge ${charge.id} fully refunded — payment ${payment.id} marked REFUNDED`,
      );
    } else {
      this.logger.log(
        `Partial refund on charge ${charge.id} — payment ${payment.id} status unchanged`,
      );
    }
  }
}
