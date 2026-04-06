export type AppLanguage = 'en' | 'sv' | 'es' | 'ru' | 'zh';

const LANGUAGE_KEY = 'gymrat-language';
const EVENT_NAME = 'language-updated';

export const languageOptions: Array<{ value: AppLanguage; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'sv', label: 'Svenska' },
  { value: 'es', label: 'Español' },
  { value: 'ru', label: 'Русский' },
  { value: 'zh', label: '中文' },
];

export function getLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'en';

  const raw = localStorage.getItem(LANGUAGE_KEY);
  if (raw === 'sv' || raw === 'es' || raw === 'ru' || raw === 'zh' || raw === 'en') {
    return raw;
  }

  return 'en';
}

export function setLanguage(language: AppLanguage) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(LANGUAGE_KEY, language);
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: { language },
    }),
  );
}

export function getLanguageLabel(language: AppLanguage) {
  return languageOptions.find((option) => option.value === language)?.label ?? 'English';
}

export function subscribeLanguage(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handler = () => callback();

  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}