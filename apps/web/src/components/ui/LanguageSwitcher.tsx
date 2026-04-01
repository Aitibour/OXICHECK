'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import clsx from 'clsx';

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const t = useTranslations('accessibility');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLocale(locale: string) {
    // Set cookie and reload to pick up the new locale
    document.cookie = `locale=${locale};path=/;max-age=31536000;samesite=lax`;
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={t('languageSwitcher')}
      className="inline-flex rounded-brand border border-[var(--color-border)] overflow-hidden"
    >
      <button
        type="button"
        onClick={() => switchLocale('en')}
        disabled={isPending}
        className={clsx(
          'px-3 py-1.5 text-sm font-medium transition-colors',
          currentLocale === 'en'
            ? 'bg-brand-primary text-white'
            : 'bg-white text-[var(--color-text)] hover:bg-gray-50',
        )}
        aria-pressed={currentLocale === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchLocale('fr')}
        disabled={isPending}
        className={clsx(
          'px-3 py-1.5 text-sm font-medium transition-colors',
          currentLocale === 'fr'
            ? 'bg-brand-primary text-white'
            : 'bg-white text-[var(--color-text)] hover:bg-gray-50',
        )}
        aria-pressed={currentLocale === 'fr'}
      >
        FR
      </button>
    </div>
  );
}
