/**
 * Authenticated API client for the hotel staff dashboard.
 * All requests include a JWT bearer token stored in localStorage.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardStats {
  date: string;
  totalArrivals: number;
  preCheckCompleted: number;
  preCheckPartial: number;
  preCheckNotStarted: number;
  checkedIn: number;
  weeklyTimeline: Array<{
    date: string;
    total: number;
    completed: number;
    checkedIn: number;
  }>;
}

export interface GuestSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  locale: string;
}

export interface UpsellSelection {
  id: string;
  status: string;
  upsellOffer: {
    id: string;
    title: string;
    priceInCents: number;
    currency: string;
    category: string;
  };
}

export interface Payment {
  id: string;
  status: string;
  type: string;
  amountInCents: number;
  currency: string;
  createdAt: string;
}

export interface PreCheckSubmission {
  id: string;
  completedAt?: string;
  stepsCompleted?: string[];
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  adultsCount?: number;
  childrenCount?: number;
  specialRequests?: string;
  arrivalTime?: string;
  consentRecords?: Array<{
    id: string;
    consentType: string;
    granted: boolean;
    grantedAt: string;
  }>;
}

export interface ReservationSummary {
  id: string;
  propertyId: string;
  guestId: string;
  confirmationNumber?: string;
  checkInDate: string;
  checkOutDate: string;
  roomType?: string;
  roomNumber?: string;
  nightsCount: number;
  adultsCount: number;
  childrenCount: number;
  status: string;
  preCheckStatus: string;
  preCheckCompletedAt?: string;
  guest: GuestSummary;
  preCheckSubmission?: {
    id: string;
    completedAt?: string;
    stepsCompleted?: string[];
  };
}

export interface ReservationDetail extends ReservationSummary {
  property: {
    id: string;
    name: string;
    city: string;
    province: string;
  };
  preCheckSubmission?: PreCheckSubmission;
  upsellSelections: UpsellSelection[];
  payments: Payment[];
}

export interface PaginatedArrivals {
  data: ReservationSummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ArrivalsParams {
  dateFrom?: string;
  dateTo?: string;
  preCheckStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    organizationId: string;
  };
}

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class DashboardApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'DashboardApiError';
  }
}

// ---------------------------------------------------------------------------
// Token management
// ---------------------------------------------------------------------------

const TOKEN_KEY = 'hc_staff_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

async function authorizedRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const url = `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    clearAuthToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard/login';
    }
    throw new DashboardApiError('Session expired. Please log in again.', 401, 'UNAUTHORIZED');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new DashboardApiError(
      body.message || `HTTP ${response.status}`,
      response.status,
      body.code,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new DashboardApiError(
      body.message || 'Invalid email or password',
      response.status,
      body.code,
    );
  }

  const data: LoginResponse = await response.json();
  setAuthToken(data.accessToken);
  return data;
}

export function logout(): void {
  clearAuthToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/dashboard/login';
  }
}

// ---------------------------------------------------------------------------
// Reservations
// ---------------------------------------------------------------------------

export async function getArrivals(
  propertyId: string,
  params: ArrivalsParams = {},
): Promise<PaginatedArrivals> {
  const searchParams = new URLSearchParams({ propertyId });

  if (params.dateFrom) searchParams.set('dateFrom', params.dateFrom);
  if (params.dateTo) searchParams.set('dateTo', params.dateTo);
  if (params.preCheckStatus) searchParams.set('preCheckStatus', params.preCheckStatus);
  if (params.search) searchParams.set('search', params.search);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  return authorizedRequest<PaginatedArrivals>(
    `/reservations?${searchParams.toString()}`,
  );
}

export async function getReservation(id: string): Promise<ReservationDetail> {
  return authorizedRequest<ReservationDetail>(`/reservations/${id}`);
}

export async function updateReservation(
  id: string,
  data: { roomNumber?: string; notes?: string; status?: string },
): Promise<ReservationDetail> {
  return authorizedRequest<ReservationDetail>(`/reservations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function manualCheckIn(
  id: string,
  notes?: string,
): Promise<ReservationDetail> {
  return authorizedRequest<ReservationDetail>(`/reservations/${id}/checkin`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
}

export async function getPreCheckSubmission(
  reservationId: string,
): Promise<PreCheckSubmission> {
  return authorizedRequest<PreCheckSubmission>(
    `/reservations/${reservationId}/precheck`,
  );
}

export async function getDashboardStats(
  propertyId: string,
  date?: string,
): Promise<DashboardStats> {
  const params = date ? `?date=${date}` : '';
  return authorizedRequest<DashboardStats>(
    `/reservations/stats/${propertyId}${params}`,
  );
}
