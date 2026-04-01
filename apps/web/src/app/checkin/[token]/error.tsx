'use client';

import { useEffect } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

export default function CheckinError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Checkin page error:', error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <Alert variant="error" title="Something went wrong">
        <p className="mb-2">
          We encountered an unexpected error while loading your pre-check-in.
          Please try again.
        </p>
        <p className="text-xs opacity-70">
          Une erreur inattendue s&apos;est produite. Veuillez r&eacute;essayer.
        </p>
      </Alert>
      <div className="mt-6 text-center">
        <Button onClick={reset}>Try Again / R&eacute;essayer</Button>
      </div>
    </div>
  );
}
