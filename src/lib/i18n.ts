import { useSyncExternalStore } from 'react';

export type Language = 'en' | 'sv';

const STORAGE_KEY = 'gymrat-language';

type TranslationKey =
  | 'loadingGains'
  | 'startWorkout'
  | 'gallery'
  | 'shop'
  | 'premium'
  | 'settings'
  | 'history'
  | 'nutrition'
  | 'back'
  | 'continue'
  | 'close'
  | 'restorePurchases'
  | 'premiumActive'
  | 'freePlan'
  | 'contactSupport'
  | 'reportBug'
  | 'language'
  | 'appSettings'
  | 'trainingHistory'
  | 'xpBoost'
  | 'premiumGear'
  | 'dailyReminder'
  | 'soundEffects'
  | 'vibration'
  | 'darkMode';

type TranslationMap = Record<Language, Record<TranslationKey, string>>;

const translations: TranslationMap = {
  en: {
    loadingGains: 'Loading gains...',
    startWorkout: 'Start workout',
    gallery: 'Gallery',
    shop: 'Shop',
    premium: 'Premium',
    settings: 'Settings',
    history: 'History',
    nutrition: 'Nutrition',
    back: 'Back',
    continue: 'Continue',
    close: 'Close',
    restorePurchases: 'Restore purchases',
    premiumActive: 'Premium active',
    freePlan: 'Free plan',
    contactSupport: 'Contact support',
    reportBug: 'Report a bug',
    language: 'Language',
    appSettings: 'App settings',
    trainingHistory: 'Training history',
    xpBoost: 'XP boost',
    premiumGear: 'Premium gear',
    dailyReminder: 'Daily reminder',
    soundEffects: 'Sound effects',
    vibration: 'Vibration',
    darkMode: 'Dark mode',
  },
  sv: {
    loadingGains: 'Laddar gains...',
    startWorkout: 'Starta pass',
    gallery: 'Galleri',
    shop: 'Shop',
    premium: 'Premium',
    settings: 'Inställningar',
    history: 'Historik',
    nutrition: 'Kost',
    back: 'Tillbaka',
    continue: 'Fortsätt',
    close: 'Stäng',
    restorePurchases: 'Återställ köp',
    premiumActive: 'Premium aktivt',
    freePlan: 'Gratisplan',
    contactSupport: 'Kontakta support',
    reportBug: 'Rapportera bugg',
    language: 'Språk',
    appSettings: 'Appinställningar',
    trainingHistory: 'Träningshistorik',
    xpBoost: 'XP-boost',
    premiumGear: 'Premium-utrustning',
    dailyReminder: 'Daglig påminnelse',
    soundEffects: 'Ljudeffekter',
    vibration: 'Vibration',
    darkMode: 'Mörkt läge',
  },
};

function detectDeviceLanguage(): Language {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'sv' || saved === 'en') return saved;

  const preferred =
    (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    'en';

  const normalized = preferred.toLowerCase();

  if (normalized.startsWith('sv')) return 'sv';
  return 'en';
}

let currentLanguage: Language = detectDeviceLanguage();

function emitLanguageChanged() {
  window.dispatchEvent(new Event('gymrat-language-changed'));
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function setLanguage(language: Language) {
  currentLanguage = language;
  localStorage.setItem(STORAGE_KEY, language);
  emitLanguageChanged();
}

export function initLanguage() {
  currentLanguage = detectDeviceLanguage();
  localStorage.setItem(STORAGE_KEY, currentLanguage);
  return currentLanguage;
}

export function t(key: TranslationKey, language: Language = currentLanguage): string {
  return translations[language][key] ?? translations.en[key] ?? key;
}

export function useLanguage(): Language {
  return useSyncExternalStore(
    (callback) => {
      const handler = () => callback();
      window.addEventListener('gymrat-language-changed', handler);
      return () => window.removeEventListener('gymrat-language-changed', handler);
    },
    () => currentLanguage,
    () => currentLanguage
  );
}

export function useT() {
  const language = useLanguage();

  return (key: TranslationKey) => t(key, language);
}