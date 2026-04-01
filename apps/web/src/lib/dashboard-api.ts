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

export interface UpsellOffer {
  id: string;
  propertyId: string;
  category: string;
  titleEn: string;
  titleFr: string;
  descriptionEn?: string;
  descriptionFr?: string;
  priceInCents: number;
  currency: string;
  isActive: boolean;
  sortOrder?: number;
  rulesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpsellRule {
  id: string;
  offerId: string;
  attribute: string;
  operator: string;
  value: string | string[] | number;
  logicGroup?: number;
}

export interface UpsellOfferBreakdown {
  offerId: string;
  offerTitle: string;
  impressions: number;
  selections: number;
  revenueCents?: number;
}

export interface UpsellAnalytics {
  propertyId: string;
  impressions: number;
  selections: number;
  totalRevenueCents?: number;
  offerBreakdown?: UpsellOfferBreakdown[];
}

export interface CommunicationTemplate {
  id: string;
  propertyId: string;
  type: string;
  channel: string;
  subjectEn?: string;
  subjectFr?: string;
  bodyEn: string;
  bodyFr: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryStats {
  sent?: number;
  delivered?: number;
  opened?: number;
  clicked?: number;
  bounced?: number;
  openRate?: number;
}

export interface PaymentSummary {
  totalCollectedCents?: number;
  totalPendingCents?: number;
  totalRefundedCents?: number;
  failed?: number;
}

export interface DateRangeParams {
  from: string;
  to: string;
  offerId?: string;
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

// ---------------------------------------------------------------------------
// Upsell Offers
// ---------------------------------------------------------------------------

export async function getUpsellOffers(propertyId: string): Promise<UpsellOffer[]> {
  return authorizedRequest<UpsellOffer[]>(`/upsells?propertyId=${propertyId}`);
}

export async function getUpsellOffer(id: string): Promise<UpsellOffer> {
  return authorizedRequest<UpsellOffer>(`/upsells/${id}`);
}

export async function createUpsellOffer(
  data: Partial<UpsellOffer>,
): Promise<UpsellOffer> {
  return authorizedRequest<UpsellOffer>('/upsells', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUpsellOffer(
  id: string,
  data: Partial<UpsellOffer>,
): Promise<UpsellOffer> {
  return authorizedRequest<UpsellOffer>(`/upsells/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteUpsellOffer(id: string): Promise<void> {
  return authorizedRequest<void>(`/upsells/${id}`, { method: 'DELETE' });
}

// ---------------------------------------------------------------------------
// Upsell Rules
// ---------------------------------------------------------------------------

export async function getUpsellRules(offerId: string): Promise<UpsellRule[]> {
  return authorizedRequest<UpsellRule[]>(`/upsells/${offerId}/rules`);
}

export async function createUpsellRule(
  offerId: string,
  data: Partial<UpsellRule>,
): Promise<UpsellRule> {
  return authorizedRequest<UpsellRule>(`/upsells/${offerId}/rules`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUpsellRule(
  id: string,
  data: Partial<UpsellRule>,
): Promise<UpsellRule> {
  return authorizedRequest<UpsellRule>(`/upsells/rules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteUpsellRule(id: string): Promise<void> {
  return authorizedRequest<void>(`/upsells/rules/${id}`, { method: 'DELETE' });
}

// ---------------------------------------------------------------------------
// Upsell Analytics
// ---------------------------------------------------------------------------

export async function getUpsellAnalytics(
  propertyId: string,
  dateRange: DateRangeParams,
): Promise<UpsellAnalytics> {
  const q = new URLSearchParams({ propertyId, from: dateRange.from, to: dateRange.to });
  if (dateRange.offerId) q.set('offerId', dateRange.offerId);
  return authorizedRequest<UpsellAnalytics>(`/upsells/analytics?${q.toString()}`);
}

// ---------------------------------------------------------------------------
// Communication Templates
// ---------------------------------------------------------------------------

export async function getTemplates(propertyId: string): Promise<CommunicationTemplate[]> {
  return authorizedRequest<CommunicationTemplate[]>(
    `/communications/templates?propertyId=${propertyId}`,
  );
}

export async function getTemplate(id: string): Promise<CommunicationTemplate> {
  return authorizedRequest<CommunicationTemplate>(`/communications/templates/${id}`);
}

export async function updateTemplate(
  id: string,
  data: Partial<CommunicationTemplate>,
): Promise<CommunicationTemplate> {
  return authorizedRequest<CommunicationTemplate>(`/communications/templates/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Delivery Stats & Communication Logs
// ---------------------------------------------------------------------------

export async function getDeliveryStats(
  propertyId: string,
  dateRange: DateRangeParams,
): Promise<DeliveryStats> {
  const q = new URLSearchParams({ propertyId, from: dateRange.from, to: dateRange.to });
  return authorizedRequest<DeliveryStats>(`/communications/stats?${q.toString()}`);
}

export async function getCommunicationLogs(
  propertyId: string,
  params: { page?: number; limit?: number; templateType?: string } = {},
) {
  const q = new URLSearchParams({ propertyId });
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.templateType) q.set('templateType', params.templateType);
  return authorizedRequest<{ data: unknown[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
    `/communications/logs?${q.toString()}`,
  );
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export async function getPaymentSummary(
  propertyId: string,
  dateRange: DateRangeParams,
): Promise<PaymentSummary> {
  const q = new URLSearchParams({ propertyId, from: dateRange.from, to: dateRange.to });
  return authorizedRequest<PaymentSummary>(`/payments/summary?${q.toString()}`);
}
