import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pre-Check-In | HotelCheckIn',
  description: 'Complete your hotel pre-check-in online for a faster arrival experience.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir="ltr">
      <body className="min-h-screen bg-[var(--color-bg-muted)]">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <NextIntlClientProvider messages={messages}>
          <main id="main-content" role="main">
            {children}
          </main>
        </NextIntlClientProvider>
        <footer className="py-6 text-center text-xs text-[var(--color-text-muted)]">
          Powered by HotelCheckIn
        </footer>
      </body>
    </html>
  );
}
