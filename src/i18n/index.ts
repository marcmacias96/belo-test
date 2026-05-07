import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

void i18next.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: 'en',
  fallbackLng: 'en',
  react: {
    useSuspense: false,
  },
  resources: {
    en: {
      translation: {
        welcome: 'Open up App.tsx to start working on your app!',
      },
    },
    es: {
      translation: {
        welcome: 'Abre App.tsx para empezar a trabajar en tu app.',
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
