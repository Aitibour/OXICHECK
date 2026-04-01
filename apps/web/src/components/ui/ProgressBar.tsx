'use client';

import clsx from 'clsx';
import { CheckIcon } from '@heroicons/react/20/solid';
import { useTranslations } from 'next-intl';

interface Step {
  id: string;
  label: string;
}

interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
  completedSteps: Set<number>;
}

export function ProgressBar({ steps, currentStep, completedSteps }: ProgressBarProps) {
  const t = useTranslations('accessibility');

  return (
    <nav aria-label={t('navigation')}>
      <ol
        className="flex items-center gap-2"
        role="list"
      >
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          const isCurrent = index === currentStep;
          const isUpcoming = !isCompleted && !isCurrent;

          return (
            <li key={step.id} className="flex items-center gap-2 flex-1">
              <div
                className={clsx(
                  'flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0 transition-colors',
                  isCompleted && 'bg-brand-primary text-white',
                  isCurrent && 'bg-brand-primary text-white ring-2 ring-brand-primary ring-offset-2',
                  isUpcoming && 'bg-gray-200 text-gray-500',
                )}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={
                  isCompleted
                    ? t('stepComplete', { step: step.label })
                    : isCurrent
                      ? t('stepCurrent', { step: step.label })
                      : t('stepUpcoming', { step: step.label })
                }
              >
                {isCompleted ? (
                  <CheckIcon className="w-4 h-4" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={clsx(
                  'hidden sm:block text-xs truncate',
                  isCurrent ? 'font-semibold text-[var(--color-text)]' : 'text-[var(--color-text-muted)]',
                )}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={clsx(
                    'flex-1 h-0.5 hidden sm:block',
                    isCompleted ? 'bg-brand-primary' : 'bg-gray-200',
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
      {/* Mobile: show current step label */}
      <p className="sm:hidden text-center text-sm mt-2 text-[var(--color-text-muted)]" aria-live="polite">
        {steps[currentStep]?.label} ({currentStep + 1}/{steps.length})
      </p>
    </nav>
  );
}
