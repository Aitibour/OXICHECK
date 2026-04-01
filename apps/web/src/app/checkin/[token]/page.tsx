'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { validateToken, getReservation, type ReservationData, type TokenValidationResponse } from '@/lib/api';
import { CheckinWizard } from '@/components/checkin/CheckinWizard';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

type PageState =
  | { status: 'loading' }
  | { status: 'invalid'; reason?: string; contactEmail?: string; contactPhone?: string }
  | { status: 'ready'; reservation: ReservationData }
  | { status: 'error'; message: string };

export default function CheckinPage({ params }: { params: { token: string } }) {
  const { token } = params;
  const t = useTranslations();
  const [state, setState] = useState<PageState>({ status: 'loading' });
  const [locale, setLocale] = useState('en');

  const initialize = useCallback(async () => {
    setState({ status: 'loading' });

    try {
      // Step 1: validate the token
      const validation: TokenValidationResponse = await validateToken(token);

      if (!validation.valid) {
        setState({
          status: 'invalid',
          reason: validation.reason,
        });
        return;
      }

      // Step 2: fetch full reservation data (includes property branding)
      const reservation = await getReservation(token);

      // Apply hotel branding via CSS custom properties
      const branding = reservation.property.branding;
      const root = document.documentElement;
      if (branding.primaryColor) {
        root.style.setProperty('--brand-primary', branding.primaryColor);
      }
      if (branding.secondaryColor) {
        root.style.setProperty('--brand-secondary', branding.secondaryColor);
      }
      if (branding.accentColor) {
        root.style.setProperty('--brand-accent', branding.accentColor);
      }

      // Set locale from guest preference
      if (reservation.guest.locale) {
        setLocale(reservation.guest.locale);
      }

      setState({ status: 'ready', reservation });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('errors.serverErrorMessage');
      setState({ status: 'error', message });
    }
  }, [token, t]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Loading state
  if (state.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner size="lg" label={t('common.loading')} />
        <p className="text-[var(--color-text-muted)]">{t('common.loading')}</p>
      </div>
    );
  }

  // Invalid/expired token
  if (state.status === 'invalid') {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher currentLocale={locale} />
        </div>
        <Alert variant="error" title={t('errors.invalidToken')}>
          <p className="mb-4">{t('errors.invalidTokenMessage')}</p>
          {state.contactEmail && (
            <p>
              {t('errors.contactHotel')}:{' '}
              <a href={`mailto:${state.contactEmail}`} className="underline font-medium">
                {state.contactEmail}
              </a>
            </p>
          )}
        </Alert>
      </div>
    );
  }

  // Network / server error
  if (state.status === 'error') {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher currentLocale={locale} />
        </div>
        <Alert variant="error" title={t('errors.serverError')}>
          <p className="mb-4">{state.message}</p>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={initialize}>{t('common.tryAgain')}</Button>
        </div>
      </div>
    );
  }

  // Ready — render the wizard
  const { reservation } = state;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      {/* Header with hotel branding + language toggle */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {reservation.property.branding.logoUrl && (
            <img
              src={reservation.property.branding.logoUrl}
              alt={reservation.property.name}
              className="h-10 w-auto object-contain"
            />
          )}
          <div>
            <h1 className="text-lg font-semibold">{reservation.property.name}</h1>
            <p className="text-sm text-[var(--color-text-muted)]">{t('precheck.title')}</p>
          </div>
        </div>
        <LanguageSwitcher currentLocale={locale} />
      </header>

      {/* Welcome message */}
      <p className="text-[var(--color-text-muted)] mb-6">
        {reservation.guest.firstName
          ? t('precheck.welcome', { name: reservation.guest.firstName })
          : t('precheck.welcomeGeneric')}
        {' '}{t('precheck.subtitle')}
      </p>

      {/* Multi-step wizard */}
      <CheckinWizard token={token} reservation={reservation} />
    </div>
  );
}
