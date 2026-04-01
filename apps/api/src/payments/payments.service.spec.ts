import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentsService } from './payments.service';
import { PaymentGateway, PaymentStatus, PaymentType } from '@hotelcheckin/database';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// ─── Prisma Mock ──────────────────────────────────────────────────────────────

const mockPrisma = {
  reservation: {
    findUnique: vi.fn(),
  },
  payment: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    aggregate: vi.fn(),
  },
};

vi.mock('@hotelcheckin/database', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hotelcheckin/database')>();
  return {
    ...actual,
    prisma: mockPrisma,
  };
});

// ─── Stripe Mock ──────────────────────────────────────────────────────────────

const mockStripe = {
  checkout: {
    sessions: {
      create: vi.fn(),
    },
  },
  paymentIntents: {
    create: vi.fn(),
    capture: vi.fn(),
    retrieve: vi.fn(),
  },
  refunds: {
    create: vi.fn(),
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
};

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const reservationFixture = {
  id: 'res-1',
  propertyId: 'prop-1',
  property: { id: 'prop-1', name: 'Hotel Test' },
};

const paymentFixture = {
  id: 'pay-1',
  reservationId: 'res-1',
  propertyId: 'prop-1',
  amountInCents: 15000,
  currency: 'CAD',
  gateway: PaymentGateway.STRIPE,
  gatewayPaymentId: 'pi_test_123',
  status: PaymentStatus.AUTHORIZED,
  type: PaymentType.PRE_AUTH,
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PaymentsService(mockStripe as any);
  });

  // ─── createPaymentSession ────────────────────────────────────────────

  describe('createPaymentSession', () => {
    it('should create a Stripe Checkout Session and persist a PENDING payment', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(reservationFixture);
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_abc',
        url: 'https://checkout.stripe.com/pay/cs_test_abc',
      });
      mockPrisma.payment.create.mockResolvedValue({
        ...paymentFixture,
        id: 'pay-session-1',
        gatewayPaymentId: 'cs_test_abc',
        status: PaymentStatus.PENDING,
        type: PaymentType.CHARGE,
      });

      const result = await service.createPaymentSession(
        'res-1',
        15000,
        'CAD',
        'https://hotel.ca/checkin/return',
      );

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'payment',
          line_items: expect.arrayContaining([
            expect.objectContaining({
              price_data: expect.objectContaining({
                currency: 'cad',
                unit_amount: 15000,
              }),
            }),
          ]),
          metadata: { reservationId: 'res-1', propertyId: 'prop-1' },
        }),
      );
      expect(mockPrisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PaymentStatus.PENDING,
            type: PaymentType.CHARGE,
            gateway: PaymentGateway.STRIPE,
            gatewayPaymentId: 'cs_test_abc',
          }),
        }),
      );
      expect(result.sessionUrl).toBe('https://checkout.stripe.com/pay/cs_test_abc');
      expect(result.paymentId).toBe('pay-session-1');
    });

    it('should throw NotFoundException when reservation does not exist', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(null);

      await expect(
        service.createPaymentSession('non-existent', 15000, 'CAD', 'https://hotel.ca/return'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── createPreAuthorization ──────────────────────────────────────────

  describe('createPreAuthorization', () => {
    it('should create a PaymentIntent with capture_method=manual and persist AUTHORIZED record', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(reservationFixture);
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_preauth_123',
        client_secret: 'pi_preauth_123_secret',
      });
      mockPrisma.payment.create.mockResolvedValue({
        ...paymentFixture,
        id: 'pay-2',
        gatewayPaymentId: 'pi_preauth_123',
        status: PaymentStatus.AUTHORIZED,
        type: PaymentType.PRE_AUTH,
      });

      const result = await service.createPreAuthorization('res-1', 20000, 'CAD');

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 20000,
          currency: 'cad',
          capture_method: 'manual',
        }),
      );
      expect(mockPrisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PaymentStatus.AUTHORIZED,
            type: PaymentType.PRE_AUTH,
          }),
        }),
      );
      expect(result.clientSecret).toBe('pi_preauth_123_secret');
      expect(result.paymentId).toBe('pay-2');
    });

    it('should throw NotFoundException when reservation does not exist', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(null);

      await expect(
        service.createPreAuthorization('bad-res', 20000, 'CAD'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── capturePayment ──────────────────────────────────────────────────

  describe('capturePayment', () => {
    it('should capture an AUTHORIZED payment and update status to CAPTURED', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(paymentFixture);
      mockStripe.paymentIntents.capture.mockResolvedValue({ status: 'succeeded' });
      mockPrisma.payment.update.mockResolvedValue({
        ...paymentFixture,
        status: PaymentStatus.CAPTURED,
      });

      const result = await service.capturePayment('pay-1');

      expect(mockStripe.paymentIntents.capture).toHaveBeenCalledWith('pi_test_123');
      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'pay-1' },
        data: { status: PaymentStatus.CAPTURED },
      });
      expect(result.status).toBe(PaymentStatus.CAPTURED);
    });

    it('should throw NotFoundException when payment does not exist', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null);

      await expect(service.capturePayment('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when payment is not AUTHORIZED', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        ...paymentFixture,
        status: PaymentStatus.CAPTURED,
      });

      await expect(service.capturePayment('pay-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ─── refundPayment ───────────────────────────────────────────────────

  describe('refundPayment', () => {
    const capturedPayment = {
      ...paymentFixture,
      status: PaymentStatus.CAPTURED,
      type: PaymentType.CHARGE,
    };

    it('should issue a full refund and create a REFUNDED record', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(capturedPayment);
      mockStripe.paymentIntents.retrieve.mockResolvedValue({ id: 'pi_test_123' });
      mockStripe.refunds.create.mockResolvedValue({ id: 're_test_abc' });
      mockPrisma.payment.update.mockResolvedValue({ ...capturedPayment, status: PaymentStatus.REFUNDED });
      mockPrisma.payment.create.mockResolvedValue({
        id: 'pay-refund-1',
        reservationId: 'res-1',
        propertyId: 'prop-1',
        amountInCents: 15000,
        currency: 'CAD',
        gateway: PaymentGateway.STRIPE,
        gatewayPaymentId: 're_test_abc',
        status: PaymentStatus.REFUNDED,
        type: PaymentType.REFUND,
      });

      const result = await service.refundPayment('pay-1');

      expect(mockStripe.refunds.create).toHaveBeenCalledWith(
        expect.objectContaining({ payment_intent: 'pi_test_123', amount: 15000 }),
      );
      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: PaymentStatus.REFUNDED },
        }),
      );
      expect(result.type).toBe(PaymentType.REFUND);
      expect(result.gatewayPaymentId).toBe('re_test_abc');
    });

    it('should issue a partial refund without marking original as REFUNDED', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(capturedPayment);
      mockStripe.paymentIntents.retrieve.mockResolvedValue({ id: 'pi_test_123' });
      mockStripe.refunds.create.mockResolvedValue({ id: 're_partial_abc' });
      mockPrisma.payment.create.mockResolvedValue({
        id: 'pay-partial-refund-1',
        amountInCents: 5000,
        type: PaymentType.REFUND,
        status: PaymentStatus.REFUNDED,
        gatewayPaymentId: 're_partial_abc',
      });

      const result = await service.refundPayment('pay-1', 5000);

      expect(mockStripe.refunds.create).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 5000 }),
      );
      // Original payment should NOT be marked REFUNDED for partial refund
      expect(mockPrisma.payment.update).not.toHaveBeenCalled();
      expect(result.amountInCents).toBe(5000);
    });

    it('should throw BadRequestException when refund amount exceeds payment amount', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(capturedPayment);

      await expect(service.refundPayment('pay-1', 99999)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when payment is not CAPTURED', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        ...capturedPayment,
        status: PaymentStatus.PENDING,
      });

      await expect(service.refundPayment('pay-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ─── handleStripePaymentWebhook ──────────────────────────────────────

  describe('handleStripePaymentWebhook', () => {
    it('should mark payment CAPTURED on checkout.session.completed', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_abc',
            payment_intent: 'pi_from_session',
          },
        },
      } as Stripe.Event;

      mockPrisma.payment.findFirst.mockResolvedValue({
        ...paymentFixture,
        gatewayPaymentId: 'cs_test_abc',
        status: PaymentStatus.PENDING,
      });
      mockPrisma.payment.update.mockResolvedValue({});

      await service.handleStripePaymentWebhook(event);

      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: PaymentStatus.CAPTURED }),
        }),
      );
    });

    it('should mark payment FAILED on payment_intent.payment_failed', async () => {
      const event = {
        type: 'payment_intent.payment_failed',
        data: {
          object: { id: 'pi_test_123' },
        },
      } as Stripe.Event;

      mockPrisma.payment.findFirst.mockResolvedValue({
        ...paymentFixture,
        status: PaymentStatus.PENDING,
      });
      mockPrisma.payment.update.mockResolvedValue({});

      await service.handleStripePaymentWebhook(event);

      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: PaymentStatus.FAILED },
        }),
      );
    });

    it('should mark payment REFUNDED on charge.refunded when fully refunded', async () => {
      const event = {
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_test_abc',
            payment_intent: 'pi_test_123',
            amount: 15000,
            amount_refunded: 15000,
          },
        },
      } as Stripe.Event;

      mockPrisma.payment.findFirst.mockResolvedValue({
        ...paymentFixture,
        status: PaymentStatus.CAPTURED,
      });
      mockPrisma.payment.update.mockResolvedValue({});

      await service.handleStripePaymentWebhook(event);

      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: PaymentStatus.REFUNDED },
        }),
      );
    });

    it('should not update status on charge.refunded for partial refunds', async () => {
      const event = {
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_test_abc',
            payment_intent: 'pi_test_123',
            amount: 15000,
            amount_refunded: 5000, // partial
          },
        },
      } as Stripe.Event;

      mockPrisma.payment.findFirst.mockResolvedValue({
        ...paymentFixture,
        status: PaymentStatus.CAPTURED,
      });

      await service.handleStripePaymentWebhook(event);

      expect(mockPrisma.payment.update).not.toHaveBeenCalled();
    });

    it('should silently skip unknown webhook event types', async () => {
      const event = {
        type: 'unknown.event',
        data: { object: {} },
      } as Stripe.Event;

      // Should not throw
      await expect(service.handleStripePaymentWebhook(event)).resolves.toBeUndefined();
      expect(mockPrisma.payment.update).not.toHaveBeenCalled();
    });
  });
});
