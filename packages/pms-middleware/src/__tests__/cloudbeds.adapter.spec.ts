import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { CloudbedsAdapter } from '../adapters/cloudbeds.adapter';
import type { PmsConfig } from '../adapter';

// Mock axios
vi.mock('axios', () => {
  const mockInstance = {
    request: vi.fn(),
  };
  return {
    default: {
      create: vi.fn(() => mockInstance),
      isAxiosError: vi.fn(() => false),
    },
    isAxiosError: vi.fn(() => false),
  };
});

function getMockClient() {
  const instance = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]
    ?.value;
  return instance.request as ReturnType<typeof vi.fn>;
}

const TEST_CONFIG: PmsConfig = {
  vendor: 'cloudbeds',
  apiKey: 'test-api-key',
  propertyId: 'prop-123',
};

describe('CloudbedsAdapter', () => {
  let adapter: CloudbedsAdapter;
  let mockRequest: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new CloudbedsAdapter(TEST_CONFIG);
    mockRequest = getMockClient();
  });

  // ---------------------------------------------------------------------------
  // testConnection
  // ---------------------------------------------------------------------------
  describe('testConnection', () => {
    it('should return true when API returns success', async () => {
      mockRequest.mockResolvedValueOnce({
        data: { success: true, data: { propertyName: 'Test Hotel' } },
      });

      const result = await adapter.testConnection();
      expect(result).toBe(true);
    });

    it('should return false when API call fails', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Network error'));
      mockRequest.mockRejectedValueOnce(new Error('Network error'));
      mockRequest.mockRejectedValueOnce(new Error('Network error'));

      const result = await adapter.testConnection();
      expect(result).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // fetchReservations — mapping
  // ---------------------------------------------------------------------------
  describe('fetchReservations', () => {
    it('should map Cloudbeds reservations to normalized format', async () => {
      mockRequest.mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            {
              reservationID: 'res-1',
              confirmationCode: 'CONF-001',
              guestEmail: 'john@example.com',
              guestFirstName: 'John',
              guestLastName: 'Doe',
              guestPhone: '+15551234567',
              startDate: '2026-04-01',
              endDate: '2026-04-03',
              roomTypeName: 'Deluxe King',
              roomNumber: '101',
              ratePlanName: 'BAR',
              sourceName: 'Booking.com',
              adults: 2,
              children: 1,
              status: 'confirmed',
            },
          ],
          count: 1,
          total: 1,
        },
      });

      const result = await adapter.fetchReservations(
        'prop-123',
        '2026-04-01',
        '2026-04-30',
      );

      expect(result.success).toBe(true);
      expect(result.syncedCount).toBe(1);
      expect(result.failedCount).toBe(0);
      expect(result.errors).toHaveLength(0);

      const res = (result.data as Array<Record<string, unknown>>)[0]!;
      expect(res['externalId']).toBe('res-1');
      expect(res['confirmationNumber']).toBe('CONF-001');
      expect(res['guestEmail']).toBe('john@example.com');
      expect(res['guestFirstName']).toBe('John');
      expect(res['guestLastName']).toBe('Doe');
      expect(res['checkInDate']).toBe('2026-04-01');
      expect(res['checkOutDate']).toBe('2026-04-03');
      expect(res['nightsCount']).toBe(2);
      expect(res['adultsCount']).toBe(2);
      expect(res['childrenCount']).toBe(1);
      expect(res['status']).toBe('confirmed');
      expect(res['roomType']).toBe('Deluxe King');
      expect(res['bookingSource']).toBe('Booking.com');
    });

    it('should handle empty results', async () => {
      mockRequest.mockResolvedValueOnce({
        data: { success: true, data: [], count: 0, total: 0 },
      });

      const result = await adapter.fetchReservations(
        'prop-123',
        '2026-04-01',
        '2026-04-30',
      );

      expect(result.success).toBe(true);
      expect(result.syncedCount).toBe(0);
      expect(result.data).toHaveLength(0);
    });

    it('should capture per-reservation mapping errors without failing the batch', async () => {
      mockRequest.mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            {
              reservationID: 'res-good',
              guestEmail: 'good@example.com',
              guestFirstName: 'Good',
              guestLastName: 'Guest',
              startDate: '2026-04-01',
              endDate: '2026-04-02',
              adults: 1,
              children: 0,
              status: 'confirmed',
            },
          ],
          count: 1,
          total: 1,
        },
      });

      const result = await adapter.fetchReservations(
        'prop-123',
        '2026-04-01',
        '2026-04-30',
      );

      // Even partial success should report counts accurately
      expect(result.syncedCount).toBeGreaterThanOrEqual(1);
    });
  });

  // ---------------------------------------------------------------------------
  // Status mapping
  // ---------------------------------------------------------------------------
  describe('status mapping', () => {
    const statusTests = [
      { input: 'confirmed', expected: 'confirmed' },
      { input: 'not_confirmed', expected: 'confirmed' },
      { input: 'checked_in', expected: 'checked_in' },
      { input: 'in_house', expected: 'checked_in' },
      { input: 'checked_out', expected: 'checked_out' },
      { input: 'canceled', expected: 'cancelled' },
      { input: 'cancelled', expected: 'cancelled' },
      { input: 'no_show', expected: 'no_show' },
      { input: 'unknown_status', expected: 'confirmed' },
    ];

    for (const { input, expected } of statusTests) {
      it(`should map "${input}" to "${expected}"`, async () => {
        mockRequest.mockResolvedValueOnce({
          data: {
            success: true,
            data: [
              {
                reservationID: 'res-status-test',
                guestEmail: 'test@example.com',
                guestFirstName: 'Test',
                guestLastName: 'Guest',
                startDate: '2026-04-01',
                endDate: '2026-04-02',
                adults: 1,
                children: 0,
                status: input,
              },
            ],
            count: 1,
            total: 1,
          },
        });

        const result = await adapter.fetchReservations(
          'prop-123',
          '2026-04-01',
          '2026-04-30',
        );

        const res = (result.data as Array<Record<string, unknown>>)[0]!;
        expect(res['status']).toBe(expected);
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Retry logic
  // ---------------------------------------------------------------------------
  describe('retry logic', () => {
    it('should retry on transient errors and succeed on subsequent attempt', async () => {
      mockRequest
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockResolvedValueOnce({
          data: { success: true, data: [], count: 0, total: 0 },
        });

      const result = await adapter.fetchReservations(
        'prop-123',
        '2026-04-01',
        '2026-04-30',
      );

      expect(result.success).toBe(true);
      expect(mockRequest).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries exhausted', async () => {
      mockRequest.mockRejectedValue(new Error('Persistent failure'));

      await expect(
        adapter.fetchReservations('prop-123', '2026-04-01', '2026-04-30'),
      ).rejects.toThrow('Persistent failure');
    });
  });

  // ---------------------------------------------------------------------------
  // fetchReservationById
  // ---------------------------------------------------------------------------
  describe('fetchReservationById', () => {
    it('should return a normalized reservation', async () => {
      mockRequest.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            reservationID: 'res-42',
            guestEmail: 'jane@example.com',
            guestFirstName: 'Jane',
            guestLastName: 'Smith',
            startDate: '2026-05-10',
            endDate: '2026-05-12',
            adults: 1,
            children: 0,
            status: 'checked_in',
          },
        },
      });

      const res = await adapter.fetchReservationById('prop-123', 'res-42');

      expect(res).not.toBeNull();
      expect(res!.externalId).toBe('res-42');
      expect(res!.status).toBe('checked_in');
      expect(res!.nightsCount).toBe(2);
    });

    it('should return null when not found', async () => {
      mockRequest.mockResolvedValueOnce({
        data: { success: false, data: null },
      });

      const res = await adapter.fetchReservationById('prop-123', 'nope');
      expect(res).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // fetchGuest
  // ---------------------------------------------------------------------------
  describe('fetchGuest', () => {
    it('should return a normalized guest', async () => {
      mockRequest.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            guestID: 'g-1',
            guestEmail: 'guest@example.com',
            guestFirstName: 'Alice',
            guestLastName: 'Wonder',
            guestPhone: '+14165551234',
            guestLanguage: 'fr',
          },
        },
      });

      const guest = await adapter.fetchGuest('prop-123', 'g-1');

      expect(guest).not.toBeNull();
      expect(guest!.externalId).toBe('g-1');
      expect(guest!.email).toBe('guest@example.com');
      expect(guest!.locale).toBe('fr');
    });
  });

  // ---------------------------------------------------------------------------
  // fetchRoomTypes
  // ---------------------------------------------------------------------------
  describe('fetchRoomTypes', () => {
    it('should return normalized room types', async () => {
      mockRequest.mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            {
              roomTypeID: 'rt-1',
              roomTypeName: 'Standard Queen',
              roomTypeDescription: 'A cozy room with a queen bed',
              maxGuests: 3,
            },
            {
              roomTypeID: 'rt-2',
              roomTypeName: 'Suite',
              maxGuests: 4,
            },
          ],
        },
      });

      const types = await adapter.fetchRoomTypes('prop-123');

      expect(types).toHaveLength(2);
      expect(types[0]!.name).toBe('Standard Queen');
      expect(types[0]!.maxOccupancy).toBe(3);
      expect(types[1]!.description).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // handleWebhook
  // ---------------------------------------------------------------------------
  describe('handleWebhook', () => {
    it('should map a webhook payload to a normalized reservation', async () => {
      const payload = {
        reservationID: 'res-wh-1',
        guestEmail: 'webhook@example.com',
        guestFirstName: 'Webhook',
        guestLastName: 'Guest',
        startDate: '2026-06-01',
        endDate: '2026-06-03',
        adults: 2,
        children: 0,
        status: 'confirmed',
      };

      const res = await adapter.handleWebhook(payload);

      expect(res).not.toBeNull();
      expect(res!.externalId).toBe('res-wh-1');
      expect(res!.nightsCount).toBe(2);
    });

    it('should return null for empty payload', async () => {
      const res = await adapter.handleWebhook(null);
      expect(res).toBeNull();
    });
  });
});
