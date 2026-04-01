'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getUpsellOffers,
  updateUpsellOffer,
  deleteUpsellOffer,
  getAuthToken,
  DashboardApiError,
  type UpsellOffer,
} from '@/lib/dashboard-api';

const CATEGORY_ICONS: Record<string, string> = {
  ROOM_UPGRADE: '🏨',
  EARLY_CHECKIN: '⏰',
  LATE_CHECKOUT: '🌙',
  FOOD_BEVERAGE: '🍽',
  SPA_WELLNESS: '💆',
  PARKING: '🚗',
  TRANSPORTATION: '🚌',
  EXPERIENCE: '🎭',
  OTHER: '📦',
};

const CATEGORY_LABELS: Record<string, string> = {
  ROOM_UPGRADE: 'Room Upgrade',
  EARLY_CHECKIN: 'Early Check-in',
  LATE_CHECKOUT: 'Late Check-out',
  FOOD_BEVERAGE: 'Food & Beverage',
  SPA_WELLNESS: 'Spa & Wellness',
  PARKING: 'Parking',
  TRANSPORTATION: 'Transportation',
  EXPERIENCE: 'Experience',
  OTHER: 'Other',
};

function parsePropertyId(token: string): string | null {
  try {
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return p.propertyId ?? p.defaultPropertyId ?? null;
  } catch {
    return null;
  }
}

const FALLBACK_PROPERTY_ID = process.env.NEXT_PUBLIC_DEFAULT_PROPERTY_ID ?? '';

export default function UpsellsPage() {
  const [offers, setOffers] = useState<UpsellOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    const pid = token ? parsePropertyId(token) : null;
    setPropertyId(pid ?? FALLBACK_PROPERTY_ID);
  }, []);

  async function loadOffers() {
    if (!propertyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUpsellOffers(propertyId);
      setOffers(data);
    } catch (err) {
      setError(err instanceof DashboardApiError ? err.message : 'Could not load upsell offers.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  async function handleToggleActive(offer: UpsellOffer) {
    setTogglingId(offer.id);
    try {
      const updated = await updateUpsellOffer(offer.id, { isActive: !offer.isActive });
      setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      setError(err instanceof DashboardApiError ? err.message : 'Toggle failed.');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this offer? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteUpsellOffer(id);
      setOffers((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      setError(err instanceof DashboardApiError ? err.message : 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Upsell Offers</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Manage upgrade and add-on offers shown during pre-check-in
          </p>
        </div>
        <Link
          href="/dashboard/upsells/new"
          className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          + Add Offer
        </Link>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-[var(--color-text-muted)]">
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Loading offers…</span>
            </div>
          </div>
        ) : offers.length === 0 ? (
          <div className="py-16 text-center text-[var(--color-text-muted)]">
            <p className="text-4xl mb-3">⭐</p>
            <p className="text-sm font-medium">No upsell offers yet</p>
            <p className="text-xs mt-1">Click "Add Offer" to create your first offer</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-gray-50">
                  {['Category', 'Title (EN)', 'Title (FR)', 'Price (CAD)', 'Status', 'Rules', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <span className="flex items-center gap-2">
                        <span aria-hidden="true">{CATEGORY_ICONS[offer.category] ?? '📦'}</span>
                        <span className="text-[var(--color-text-muted)]">
                          {CATEGORY_LABELS[offer.category] ?? offer.category}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[var(--color-text)]">
                      {offer.titleEn}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
                      {offer.titleFr}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text)]">
                      ${(offer.priceInCents / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={offer.isActive}
                        onClick={() => handleToggleActive(offer)}
                        disabled={togglingId === offer.id}
                        title={offer.isActive ? 'Click to deactivate' : 'Click to activate'}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-60 ${
                          offer.isActive ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            offer.isActive ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
                      {offer.rulesCount ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/upsells/${offer.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(offer.id)}
                          disabled={deletingId === offer.id}
                          className="text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-40"
                        >
                          {deletingId === offer.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
