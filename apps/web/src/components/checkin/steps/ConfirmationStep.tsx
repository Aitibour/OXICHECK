'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { submitPreCheck } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import type { StepProps } from '../types';

interface ConfirmationStepProps extends StepProps {
  completedSteps: Set<number>;
}

export function ConfirmationStep({
  token,
  reservation,
  formData,
  goToStep,
  completedSteps,
}: ConfirmationStepProps) {
  const t = useTranslations();
  const tConfirm = useTranslations('precheck.confirmation');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const dateFormat = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      await submitPreCheck(token, formData);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.serverErrorMessage'));
    } finally {
      setSubmitting(false);
    }
  }

  // Success state
  if (success) {
    return (
      <Card>
        <div className="text-center py-8">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-2xl font-bold mb-2">{tConfirm('successTitle')}</h2>
          <p className="text-[var(--color-text-muted)] mb-4">
            {tConfirm('successMessage', {
              date: dateFormat.format(new Date(reservation.checkInDate)),
            })}
          </p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
            {tConfirm('successInstructions')}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-1">{tConfirm('heading')}</h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">{tConfirm('description')}</p>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="space-y-6">
        {/* Profile summary */}
        <Section
          title={tConfirm('profileSection')}
          onEdit={() => goToStep(0)}
          editLabel={t('common.edit')}
        >
          <p>{formData.profile?.firstName} {formData.profile?.lastName}</p>
          <p className="text-sm text-[var(--color-text-muted)]">{formData.profile?.email}</p>
          {formData.profile?.phone && (
            <p className="text-sm text-[var(--color-text-muted)]">{formData.profile.phone}</p>
          )}
        </Section>

        {/* Stay details summary */}
        <Section
          title={tConfirm('staySection')}
          onEdit={() => goToStep(1)}
          editLabel={t('common.edit')}
        >
          <p>
            {dateFormat.format(new Date(reservation.checkInDate))} &mdash;{' '}
            {dateFormat.format(new Date(reservation.checkOutDate))}
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            {reservation.roomType} &bull; {formData.stayDetails?.adults} adult(s)
            {(formData.stayDetails?.children ?? 0) > 0 &&
              `, ${formData.stayDetails?.children} child(ren)`}
          </p>
          {formData.stayDetails?.arrivalTime && (
            <p className="text-sm text-[var(--color-text-muted)]">
              Arrival: {formData.stayDetails.arrivalTime}
            </p>
          )}
        </Section>

        {/* Policies summary */}
        <Section
          title={tConfirm('policiesSection')}
          onEdit={() => goToStep(2)}
          editLabel={t('common.edit')}
        >
          <p className="text-sm text-green-600">All required policies accepted</p>
          {formData.policies?.marketingOptIn && (
            <p className="text-sm text-[var(--color-text-muted)]">Marketing opt-in: Yes</p>
          )}
        </Section>

        {/* Upsells summary */}
        <Section
          title={tConfirm('upsellsSection')}
          onEdit={() => goToStep(3)}
          editLabel={t('common.edit')}
        >
          {formData.selectedUpsellIds && formData.selectedUpsellIds.length > 0 ? (
            <p className="text-sm">
              {formData.selectedUpsellIds.length} item(s) selected
            </p>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">{tConfirm('noneSelected')}</p>
          )}
        </Section>

        {/* ID upload summary */}
        <Section
          title={tConfirm('idSection')}
          onEdit={() => goToStep(4)}
          editLabel={t('common.edit')}
        >
          <p className="text-sm">
            {formData.idUploaded ? tConfirm('idUploaded') : tConfirm('idNotUploaded')}
          </p>
        </Section>
      </div>

      {/* Submit */}
      <div className="flex justify-center pt-8">
        <Button size="lg" onClick={handleSubmit} loading={submitting}>
          {submitting ? tConfirm('submitting') : tConfirm('submitCheckin')}
        </Button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Helper section component
// ---------------------------------------------------------------------------

function Section({
  title,
  onEdit,
  editLabel,
  children,
}: {
  title: string;
  onEdit: () => void;
  editLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between p-4 bg-[var(--color-bg-muted)] rounded-brand">
      <div>
        <h3 className="font-medium text-sm mb-1">{title}</h3>
        {children}
      </div>
      <Button variant="ghost" size="sm" onClick={onEdit} aria-label={`${editLabel} ${title}`}>
        {editLabel}
      </Button>
    </div>
  );
}
