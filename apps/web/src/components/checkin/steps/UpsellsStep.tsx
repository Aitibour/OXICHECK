'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { getUpsellOffers, type UpsellOfferData } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import type { StepProps } from '../types';
import clsx from 'clsx';

// Category icons (using heroicons-friendly emoji as placeholder — in production use @heroicons/react)
const CATEGORY_ICONS: Record<string, string> = {
  BREAKFAST: '\u2615',
  SPA: '\u2728',
  AIRPORT_PICKUP: '\u2708\ufe0f',
  ROOM_UPGRADE: '\u2b06\ufe0f',
  EARLY_CHECKIN: '\u23f0',
  LATE_CHECKOUT: '\ud83c\udf19',
  PARKING: '\ud83c\udd7f\ufe0f',
  CELEBRATION: '\ud83c\udf89',
};

export function UpsellsStep({ token, reservation, formData, onNext, onSkip }: StepProps) {
  const t = useTranslations();
  const tUpsells = useTranslations('precheck.upsells');

  const [offers, setOffers] = useState<UpsellOfferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(formData.selectedUpsellIds ?? []),
  );

  useEffect(() => {
    async function load() {
      try {
        const data = await getUpsellOffers(reservation.property.id, token);
        setOffers(data);
      } catch {
        setError(t('errors.serverErrorMessage'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reservation.property.id, token, t]);

  const toggleOffer = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const total = offers
    .filter((o) => selectedIds.has(o.id))
    .reduce((sum, o) => sum + o.priceInCents, 0);

  function handleContinue() {
    onNext({ selectedUpsellIds: Array.from(selectedIds) });
  }

  if (loading) {
    return (
      <Card>
        <div className="flex justify-center py-8">
          <Spinner size="lg" label={t('common.loading')} />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert variant="error">{error}</Alert>
        <div className="flex justify-end mt-4">
          <Button variant="ghost" onClick={onSkip}>{t('common.skip')}</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-1">{tUpsells('heading')}</h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">{tUpsells('description')}</p>

      {offers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[var(--color-text-muted)]">{tUpsells('noOffers')}</p>
          <div className="mt-4">
            <Button onClick={handleContinue}>{t('common.next')}</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {offers.map((offer) => {
              const isSelected = selectedIds.has(offer.id);
              const categoryLabel = tUpsells(`categories.${offer.category}` as any);
              const icon = CATEGORY_ICONS[offer.category] || '\u2b50';

              return (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => toggleOffer(offer.id)}
                  className={clsx(
                    'text-left p-4 rounded-brand border-2 transition-all',
                    isSelected
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-[var(--color-border)] hover:border-brand-primary/50',
                  )}
                  aria-pressed={isSelected}
                  aria-label={`${offer.title} - $${(offer.priceInCents / 100).toFixed(2)} ${offer.currency}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-brand-primary uppercase tracking-wider">
                        {categoryLabel}
                      </p>
                      <p className="font-semibold mt-0.5">{offer.title}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">
                        {offer.description}
                      </p>
                      <p className="font-semibold mt-2">
                        ${(offer.priceInCents / 100).toFixed(2)} {offer.currency}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="text-brand-primary text-sm font-medium shrink-0">
                        {tUpsells('selected')}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Running total */}
          {selectedIds.size > 0 && (
            <div
              className="flex items-center justify-between p-3 bg-brand-primary/5 rounded-brand mb-4"
              aria-live="polite"
            >
              <span className="font-medium">{tUpsells('runningTotal')}</span>
              <span className="font-semibold text-lg">
                ${(total / 100).toFixed(2)} CAD
              </span>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => onNext({ selectedUpsellIds: [] })}>
              {tUpsells('skipUpsells')}
            </Button>
            <Button onClick={handleContinue}>{t('common.next')}</Button>
          </div>
        </>
      )}
    </Card>
  );
}
