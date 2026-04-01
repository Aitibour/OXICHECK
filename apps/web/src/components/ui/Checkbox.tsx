'use client';

import { forwardRef, type InputHTMLAttributes, useId } from 'react';
import clsx from 'clsx';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className, id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const descId = `${id}-desc`;

    return (
      <div className={clsx('relative flex items-start', className)}>
        <div className="flex h-6 items-center">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className={clsx(
              'h-4 w-4 rounded border-gray-300 text-brand-primary',
              'focus:ring-brand-primary focus:ring-2 focus:ring-offset-2',
              error && 'border-red-500',
            )}
            aria-invalid={!!error}
            aria-describedby={
              [description ? descId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined
            }
            {...props}
          />
        </div>
        <div className="ml-3 text-sm leading-6">
          <label htmlFor={id} className="font-medium text-[var(--color-text)]">
            {label}
          </label>
          {description && (
            <p id={descId} className="text-[var(--color-text-muted)]">
              {description}
            </p>
          )}
          {error && (
            <p id={errorId} className="text-red-600 mt-0.5" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
