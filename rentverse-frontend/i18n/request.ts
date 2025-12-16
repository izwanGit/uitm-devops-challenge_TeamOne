import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'ms'];

export default getRequestConfig(async ({ requestLocale }) => {
    // Validate that the incoming `locale` parameter is valid
    const locale = await requestLocale || 'en';

    if (!locales.includes(locale)) notFound();

    return {
        locale,
        messages: (await import(`./translations/${locale}.json`)).default
    };
});
