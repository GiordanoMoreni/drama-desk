import { config } from './config';

export type Locale = (typeof config.app.supportedLocales)[number];

// Get the user's preferred locale
export async function getUserLocale(): Promise<Locale> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const localeFromCookie = cookieStore.get('NEXT_LOCALE')?.value;

    if (localeFromCookie && isValidLocale(localeFromCookie)) {
      return localeFromCookie as Locale;
    }
  } catch (error) {
    // In case we're in a browser context, fall back to default
  }

  return config.app.defaultLocale;
}

// Set the user's preferred locale
export async function setUserLocale(locale: Locale) {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.set('NEXT_LOCALE', locale, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  } catch (error) {
    // Ignore cookie set errors in client context
  }
}

// Browser-side locale detection
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') {
    return config.app.defaultLocale;
  }

  // Check if locale is stored in localStorage
  const storedLocale = localStorage.getItem('NEXT_LOCALE');
  if (storedLocale && isValidLocale(storedLocale)) {
    return storedLocale as Locale;
  }

  // Check browser language
  const browserLocale = navigator.language.split('-')[0].toLowerCase();
  if (isValidLocale(browserLocale)) {
    return browserLocale as Locale;
  }

  return config.app.defaultLocale;
}

// Set browser locale (client-side)
export function setBrowserLocale(locale: Locale) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('NEXT_LOCALE', locale);
  }
}

// Validate if a locale is supported
function isValidLocale(locale: string): locale is Locale {
  return config.app.supportedLocales.includes(locale as any);
}

// Export all locales for reference
export const supportedLocales = config.app.supportedLocales;
export const defaultLocale = config.app.defaultLocale;
