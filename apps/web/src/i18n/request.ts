import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const headerStore = headers();

  // Priority: cookie > Accept-Language header > default
  let locale = cookieStore.get('locale')?.value;

  if (!locale) {
    const acceptLang = headerStore.get('accept-language') || '';
    locale = acceptLang.includes('fr') ? 'fr' : 'en';
  }

  if (!['en', 'fr'].includes(locale)) {
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
