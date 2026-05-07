import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';

function detectLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0] ?? 'en';
  } catch {
    return 'en';
  }
}

const supportedLanguages = ['en', 'es'];
const detectedLocale = detectLocale();
const lng = supportedLanguages.includes(detectedLocale) ? detectedLocale : 'en';

void i18next.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng,
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'wallet', 'market', 'coin', 'swap', 'notifications'],
  react: {
    useSuspense: false,
  },
  resources: {
    en: {
      common: en.common,
      wallet: en.wallet,
      market: en.market,
      coin: en.coin,
      swap: en.swap,
      notifications: en.notifications,
      // Backward-compat namespace so existing t('welcome') still resolves
      translation: {
        welcome: en.common.welcome,
      },
    },
    es: {
      common: es.common,
      wallet: es.wallet,
      market: es.market,
      coin: es.coin,
      swap: es.swap,
      notifications: es.notifications,
      translation: {
        welcome: es.common.welcome,
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
