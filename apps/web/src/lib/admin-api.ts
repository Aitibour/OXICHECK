const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_URL}/api/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/dashboard/login';
    }
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

// Organizations
export function getOrganizations(params: { search?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  return adminFetch<{ data: unknown[]; total: number }>(`organizations?${qs}`);
}

export function getOrganization(id: string) {
  return adminFetch<unknown>(`organizations/${id}`);
}

export function createOrganization(data: { name: string; slug?: string }) {
  return adminFetch<unknown>('organizations', { method: 'POST', body: JSON.stringify(data) });
}

export function updateOrganization(id: string, data: Record<string, unknown>) {
  return adminFetch<unknown>(`organizations/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deactivateOrganization(id: string) {
  return adminFetch<unknown>(`organizations/${id}`, { method: 'DELETE' });
}

// System
export function getSystemStats() {
  return adminFetch<unknown>('organizations/stats');
}

export function getSystemHealth() {
  return adminFetch<{
    pmsSyncHealth: { successRate: number; totalSyncs: number; recentErrors: Array<{ propertyId: string; errorMessage: string; syncedAt: string }> };
    emailDelivery: { deliveryRate: number; sent24h: number; failed24h: number };
  }>('reports/property/system-health');
}

// Properties
export function getProperties(orgId: string) {
  return adminFetch<unknown[]>(`properties/org/${orgId}`);
}

export function createProperty(data: Record<string, unknown>) {
  return adminFetch<unknown>('properties', { method: 'POST', body: JSON.stringify(data) });
}

export function updateProperty(id: string, data: Record<string, unknown>) {
  return adminFetch<unknown>(`properties/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function updatePmsConfig(id: string, data: { pmsVendor?: string; pmsApiKey?: string; pmsPropertyId?: string }) {
  return adminFetch<unknown>(`properties/${id}/pms`, { method: 'PATCH', body: JSON.stringify(data) });
}
