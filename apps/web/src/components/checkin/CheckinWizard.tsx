'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { ReservationData, PreCheckFormData } from '@/lib/api';
import { savePreCheckProgress } from '@/lib/api';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { ProfileStep } from './steps/ProfileStep';
import { StayDetailsStep } from './steps/StayDetailsStep';
import { PoliciesStep } from './steps/PoliciesStep';
import { UpsellsStep } from './steps/UpsellsStep';
import { IdUploadStep } from './steps/IdUploadStep';
import { ConfirmationStep } from './steps/ConfirmationStep';

interface CheckinWizardProps {
  token: string;
  reservation: ReservationData;
}

const STEP_IDS = ['profile', 'stayDetails', 'policies', 'upsells', 'idUpload', 'confirmation'] as const;
type StepId = (typeof STEP_IDS)[number];

export function CheckinWizard({ token, reservation }: CheckinWizardProps) {
  const t = useTranslations();

  const steps = STEP_IDS.map((id) => ({
    id,
    label: t(`precheck.steps.${id}`),
  }));

  // Determine initial step from saved progress
  const initialStep = reservation.preCheckData ? determineResumeStep(reservation.preCheckData) : 0;

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => {
    const set = new Set<number>();
    for (let i = 0; i < initialStep; i++) set.add(i);
    return set;
  });

  const [formData, setFormData] = useState<PreCheckFormData>(() => ({
    profile: reservation.preCheckData?.profile ?? {
      firstName: reservation.guest.firstName || '',
      lastName: reservation.guest.lastName || '',
      email: reservation.guest.email || '',
      phone: reservation.guest.phone || '',
      preferredLocale: reservation.guest.locale || 'en',
    },
    stayDetails: reservation.preCheckData?.stayDetails ?? {
      adults: reservation.adults || 1,
      children: reservation.children || 0,
      specialRequests: reservation.specialRequests || '',
      arrivalTime: reservation.arrivalTime || '',
    },
    policies: reservation.preCheckData?.policies ?? {
      cancellationAccepted: false,
      houseRulesAccepted: false,
      privacyAccepted: false,
      dataConsentAccepted: false,
      marketingOptIn: false,
    },
    selectedUpsellIds: reservation.preCheckData?.selectedUpsellIds ?? [],
    idUploaded: reservation.preCheckData?.idUploaded ?? false,
  }));

  const [isSaving, setIsSaving] = useState(false);

  // Auto-save partial progress on step change
  const autoSave = useCallback(
    async (data: PreCheckFormData) => {
      setIsSaving(true);
      try {
        await savePreCheckProgress(token, data);
      } catch {
        // Silent fail for auto-save — user can still continue
        console.warn('Auto-save failed');
      } finally {
        setIsSaving(false);
      }
    },
    [token],
  );

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(step);
      // Scroll to top for new step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [],
  );

  const handleNext = useCallback(
    (stepData?: Partial<PreCheckFormData>) => {
      const updated = stepData ? { ...formData, ...stepData } : formData;
      setFormData(updated);
      setCompletedSteps((prev) => new Set([...prev, currentStep]));

      // Auto-save
      autoSave(updated);

      if (currentStep < STEP_IDS.length - 1) {
        goToStep(currentStep + 1);
      }
    },
    [formData, currentStep, autoSave, goToStep],
  );

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const handleSkip = useCallback(() => {
    if (currentStep < STEP_IDS.length - 1) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, goToStep]);

  const updateFormData = useCallback((partial: Partial<PreCheckFormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  }, []);

  // Keyboard navigation: Escape to go back
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && currentStep > 0) {
        handleBack();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, handleBack]);

  const stepProps = {
    token,
    reservation,
    formData,
    updateFormData,
    onNext: handleNext,
    onBack: handleBack,
    onSkip: handleSkip,
    goToStep,
  };

  return (
    <div>
      {/* Progress indicator */}
      <div className="mb-8">
        <ProgressBar steps={steps} currentStep={currentStep} completedSteps={completedSteps} />
      </div>

      {/* Auto-save indicator */}
      {isSaving && (
        <p className="text-xs text-[var(--color-text-muted)] text-right mb-2" aria-live="polite">
          {t('common.save')}...
        </p>
      )}

      {/* Step content */}
      <div role="region" aria-label={steps[currentStep]?.label} aria-live="polite">
        {currentStep === 0 && <ProfileStep {...stepProps} />}
        {currentStep === 1 && <StayDetailsStep {...stepProps} />}
        {currentStep === 2 && <PoliciesStep {...stepProps} />}
        {currentStep === 3 && <UpsellsStep {...stepProps} />}
        {currentStep === 4 && <IdUploadStep {...stepProps} />}
        {currentStep === 5 && (
          <ConfirmationStep {...stepProps} completedSteps={completedSteps} />
        )}
      </div>

      {/* Navigation buttons */}
      {currentStep < STEP_IDS.length - 1 && (
        <div className="flex justify-between mt-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            aria-label={t('common.back')}
          >
            {t('common.back')}
          </Button>
          <p className="text-xs text-[var(--color-text-muted)] self-center">
            {t('common.stepOf', { current: currentStep + 1, total: STEP_IDS.length })}
          </p>
        </div>
      )}
    </div>
  );
}

/** Determine which step to resume from based on saved data */
function determineResumeStep(data: PreCheckFormData): number {
  if (!data.profile?.firstName) return 0;
  if (!data.stayDetails) return 1;
  if (!data.policies?.dataConsentAccepted) return 2;
  if (data.selectedUpsellIds === undefined) return 3;
  return 4;
}
