export const locales = ['en', 'ms'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];
