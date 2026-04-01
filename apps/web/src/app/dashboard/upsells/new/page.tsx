'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUpsellOffer, getAuthToken, DashboardApiError } from '@/lib/dashboard-api';
import { UpsellOfferForm, type UpsellOfferFormData } from '@/components/dashboard/UpsellOfferForm';

function parsePropertyId(token: string): string | null {
  try {
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return p.propertyId ?? p.defaultPropertyId ?? null;
  } catch {
    return null;
  }
}

const FALLBACK_PROPERTY_ID = process.env.NEXT_PUBLIC_DEFAULT_PROPERTY_ID ?? '';

export default function NewUpsellOfferPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: UpsellOfferFormData) {
    setError(null);
    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      const propertyId = (token ? parsePropertyId(token) : null) ?? FALLBACK_PROPERTY_ID;
      await createUpsellOffer({ ...data, propertyId });
      router.push('/dashboard/upsells');
    } catch (err) {
      setError(err instanceof DashboardApiError ? err.message : 'Failed to create offer.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <Link
          href="/dashboard/upsells"
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          ← Back to Upsell Offers
        </Link>
        <h1 className="text-2xl font-bold text-[var(--color-text)] mt-2">New Upsell Offer</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
          Create a new upgrade or add-on offer for guests during pre-check-in
        </p>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card p-6">
        <UpsellOfferForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard/upsells')}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
