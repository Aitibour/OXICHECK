/**
 * API client for communicating with the HotelCheckIn backend (localhost:3001).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TokenValidationResponse {
  valid: boolean;
  reservationId?: string;
  propertyId?: string;
  guestId?: string;
  expiresAt?: string;
  reason?: string;
}

export interface PropertyBranding {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  propertyName: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ReservationData {
  id: string;
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    locale: string;
  };
  property: {
    id: string;
    name: string;
    branding: PropertyBranding;
  };
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  adults: number;
  children: number;
  specialRequests?: string;
  arrivalTime?: string;
  preCheckStatus: string;
  preCheckData?: PreCheckFormData;
}

export interface UpsellOfferData {
  id: string;
  category: string;
  title: string;
  description: string;
  priceInCents: number;
  currency: string;
  imageUrl?: string;
}

export interface PreCheckFormData {
  profile?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    preferredLocale: string;
  };
  stayDetails?: {
    adults: number;
    children: number;
    specialRequests?: string;
    arrivalTime?: string;
  };
  policies?: {
    cancellationAccepted: boolean;
    houseRulesAccepted: boolean;
    privacyAccepted: boolean;
    dataConsentAccepted: boolean;
    marketingOptIn: boolean;
  };
  selectedUpsellIds?: string[];
  idUploaded?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retries = 2,
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new ApiError(
          body.message || `HTTP ${response.status}`,
          response.status,
          body.code,
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (attempt === retries) {
        throw new ApiError('Network error. Please check your connection.', 0, 'NETWORK_ERROR');
      }
      // Wait before retry — exponential backoff
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }

  throw new ApiError('Unexpected error', 0);
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

/** Validate a guest token — returns validity and associated IDs */
export async function validateToken(token: string): Promise<TokenValidationResponse> {
  return request<TokenValidationResponse>('/auth/guest-token/validate', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

/** Fetch the full reservation data (guest, property branding, stay info) */
export async function getReservation(token: string): Promise<ReservationData> {
  return request<ReservationData>(`/precheckin/${token}/reservation`);
}

/** Fetch available upsell offers for a property */
export async function getUpsellOffers(
  propertyId: string,
  token: string,
): Promise<UpsellOfferData[]> {
  return request<UpsellOfferData[]>(`/precheckin/${token}/upsells?propertyId=${propertyId}`);
}

/** Save partial pre-check progress (auto-save on step change) */
export async function savePreCheckProgress(
  token: string,
  data: Partial<PreCheckFormData>,
): Promise<void> {
  return request<void>(`/precheckin/${token}/progress`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/** Submit the completed pre-check-in */
export async function submitPreCheck(
  token: string,
  data: PreCheckFormData,
): Promise<{ success: boolean; message: string }> {
  return request(`/precheckin/${token}/submit`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Upload a guest ID document */
export async function uploadId(
  token: string,
  file: File,
): Promise<{ success: boolean; fileId: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_BASE}/precheckin/${token}/id-upload`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    // No Content-Type header — browser sets multipart boundary automatically
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.message || 'Upload failed', response.status, body.code);
  }

  return response.json();
}

export { ApiError };
