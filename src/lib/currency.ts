import { getLanguage, Language } from './i18n';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  freeItemPrice: number;
  premiumItemPrice: number;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyMonthly: number; // yearly / 12 rounded
}

const currencyMap: Record<Language, CurrencyInfo> = {
  en: { code: 'USD', symbol: '$', freeItemPrice: 0.99, premiumItemPrice: 2.99, monthlyPrice: 7.99, yearlyPrice: 59.99, yearlyMonthly: 5 },
  es: { code: 'EUR', symbol: '€', freeItemPrice: 0.99, premiumItemPrice: 2.99, monthlyPrice: 7.99, yearlyPrice: 59.99, yearlyMonthly: 5 },
  zh: { code: 'USD', symbol: '$', freeItemPrice: 0.99, premiumItemPrice: 2.99, monthlyPrice: 7.99, yearlyPrice: 59.99, yearlyMonthly: 5 },
  ru: { code: 'EUR', symbol: '€', freeItemPrice: 0.99, premiumItemPrice: 2.99, monthlyPrice: 7.99, yearlyPrice: 59.99, yearlyMonthly: 5 },
  ar: { code: 'USD', symbol: '$', freeItemPrice: 0.99, premiumItemPrice: 2.99, monthlyPrice: 7.99, yearlyPrice: 59.99, yearlyMonthly: 5 },
  sv: { code: 'SEK', symbol: 'kr', freeItemPrice: 9, premiumItemPrice: 29, monthlyPrice: 79, yearlyPrice: 599, yearlyMonthly: 50 },
};

export function getCurrency(): CurrencyInfo {
  return currencyMap[getLanguage()];
}

export function formatPrice(amount: number, currency?: CurrencyInfo): string {
  const c = currency || getCurrency();
  if (c.code === 'SEK') return `${amount} kr`;
  if (c.code === 'EUR') return `€${amount}`;
  return `$${amount}`;
}

export function getItemPrice(isPremium: boolean): number {
  const c = getCurrency();
  return isPremium ? c.premiumItemPrice : c.freeItemPrice;
}
