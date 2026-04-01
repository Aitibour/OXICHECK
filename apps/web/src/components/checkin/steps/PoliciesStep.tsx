'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { StepProps } from '../types';

export function PoliciesStep({ formData, onNext }: StepProps) {
  const t = useTranslations();
  const tPolicies = useTranslations('precheck.policies');

  const [policies, setPolicies] = useState({
    cancellationAccepted: formData.policies?.cancellationAccepted ?? false,
    houseRulesAccepted: formData.policies?.houseRulesAccepted ?? false,
    privacyAccepted: formData.policies?.privacyAccepted ?? false,
    dataConsentAccepted: formData.policies?.dataConsentAccepted ?? false,
    marketingOptIn: formData.policies?.marketingOptIn ?? false,
  });

  const [showError, setShowError] = useState(false);

  function toggle(field: keyof typeof policies) {
    setPolicies((prev) => ({ ...prev, [field]: !prev[field] }));
    setShowError(false);
  }

  const allRequiredAccepted =
    policies.cancellationAccepted &&
    policies.houseRulesAccepted &&
    policies.privacyAccepted &&
    policies.dataConsentAccepted;

  function handleSubmit() {
    if (!allRequiredAccepted) {
      setShowError(true);
      return;
    }
    onNext({ policies });
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-1">{tPolicies('heading')}</h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">{tPolicies('description')}</p>

      {showError && (
        <Alert variant="error" className="mb-4">
          {tPolicies('allPoliciesRequired')}
        </Alert>
      )}

      <div className="space-y-5">
        {/* Cancellation Policy */}
        <div className="p-4 bg-[var(--color-bg-muted)] rounded-brand">
          <h3 className="font-medium text-sm mb-2">{tPolicies('cancellationPolicy')}</h3>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">
            Free cancellation up to 48 hours before check-in. Late cancellations may be charged one night&apos;s stay.
          </p>
          <Checkbox
            label={tPolicies('acceptPolicy', { policy: tPolicies('cancellationPolicy') })}
            checked={policies.cancellationAccepted}
            onChange={() => toggle('cancellationAccepted')}
            error={showError && !policies.cancellationAccepted ? t('errors.validation.required') : undefined}
          />
        </div>

        {/* House Rules */}
        <div className="p-4 bg-[var(--color-bg-muted)] rounded-brand">
          <h3 className="font-medium text-sm mb-2">{tPolicies('houseRules')}</h3>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">
            Check-in: 3:00 PM. Check-out: 11:00 AM. No smoking. Quiet hours: 10 PM - 8 AM.
          </p>
          <Checkbox
            label={tPolicies('acceptPolicy', { policy: tPolicies('houseRules') })}
            checked={policies.houseRulesAccepted}
            onChange={() => toggle('houseRulesAccepted')}
            error={showError && !policies.houseRulesAccepted ? t('errors.validation.required') : undefined}
          />
        </div>

        {/* Privacy Policy */}
        <div className="p-4 bg-[var(--color-bg-muted)] rounded-brand">
          <h3 className="font-medium text-sm mb-2">{tPolicies('privacyPolicy')}</h3>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">
            Your personal information is protected under PIPEDA and Quebec&apos;s Law 25.
          </p>
          <Checkbox
            label={tPolicies('acceptPolicy', { policy: tPolicies('privacyPolicy') })}
            checked={policies.privacyAccepted}
            onChange={() => toggle('privacyAccepted')}
            error={showError && !policies.privacyAccepted ? t('errors.validation.required') : undefined}
          />
        </div>

        {/* PIPEDA / Law 25 Data Consent */}
        <div className="p-4 border-2 border-brand-primary/20 rounded-brand">
          <Checkbox
            label={tPolicies('dataConsent')}
            description={tPolicies('dataConsentDescription')}
            checked={policies.dataConsentAccepted}
            onChange={() => toggle('dataConsentAccepted')}
            error={showError && !policies.dataConsentAccepted ? t('errors.validation.required') : undefined}
          />
        </div>

        {/* Marketing Opt-in (optional) */}
        <Checkbox
          label={tPolicies('marketingOptIn')}
          description={tPolicies('marketingOptInDescription')}
          checked={policies.marketingOptIn}
          onChange={() => toggle('marketingOptIn')}
        />
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={handleSubmit}>{t('common.next')}</Button>
      </div>
    </Card>
  );
}
