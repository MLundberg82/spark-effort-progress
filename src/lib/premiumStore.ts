const PREMIUM_KEY = 'gymrat-premium';
const PREMIUM_SOURCE_KEY = 'gymrat-premium-source';
const PREMIUM_EXPIRY_KEY = 'gymrat-premium-expiry';
const PREMIUM_PLAN_KEY = 'gymrat-premium-plan';
const PREMIUM_TRIAL_KEY = 'gymrat-premium-trial-used';

export type PremiumSource = 'purchase' | 'promo_code' | 'restore' | 'manual' | 'trial';
export type PremiumPlan = 'monthly' | 'yearly' | 'lifetime' | 'trial';

export interface PremiumStatus {
  isPremium: boolean;
  source?: PremiumSource;
  expiresAt?: string;
  plan?: PremiumPlan;
  trialUsed?: boolean;
}

function isExpired(expiry?: string | null): boolean {
  if (!expiry || expiry === 'lifetime') return false;
  return new Date(expiry).getTime() < Date.now();
}

function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function addMonths(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

function addYears(years: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString();
}

/** Check if user has active premium */
export function checkPremium(): boolean {
  const val = localStorage.getItem(PREMIUM_KEY);
  if (val !== 'true') return false;

  const expiry = localStorage.getItem(PREMIUM_EXPIRY_KEY);
  if (isExpired(expiry)) {
    revokePremium();
    return false;
  }

  return true;
}

/** Get full premium status */
export function getPremiumStatus(): PremiumStatus {
  const isPremium = checkPremium();
  const source = localStorage.getItem(PREMIUM_SOURCE_KEY) as PremiumSource | null;
  const expiresAt = localStorage.getItem(PREMIUM_EXPIRY_KEY);
  const plan = localStorage.getItem(PREMIUM_PLAN_KEY) as PremiumPlan | null;
  const trialUsed = localStorage.getItem(PREMIUM_TRIAL_KEY) === 'true';

  return {
    isPremium,
    source: source ?? undefined,
    expiresAt: expiresAt ?? undefined,
    plan: plan ?? undefined,
    trialUsed,
  };
}

/** Generic premium grant */
export function grantPremium(
  source: PremiumSource,
  expiresAt?: string,
  plan: PremiumPlan = 'lifetime'
): void {
  localStorage.setItem(PREMIUM_KEY, 'true');
  localStorage.setItem(PREMIUM_SOURCE_KEY, source);
  localStorage.setItem(PREMIUM_PLAN_KEY, plan);

  if (expiresAt) {
    localStorage.setItem(PREMIUM_EXPIRY_KEY, expiresAt);
  } else {
    localStorage.setItem(PREMIUM_EXPIRY_KEY, 'lifetime');
  }

  if (source === 'trial') {
    localStorage.setItem(PREMIUM_TRIAL_KEY, 'true');
  }
}

/** Start free trial */
export function startPremiumTrial(days = 7): void {
  const expiresAt = addDays(days);
  grantPremium('trial', expiresAt, 'trial');
}

/** Simulate monthly purchase */
export function purchaseMonthlyPremium(): void {
  const expiresAt = addMonths(1);
  grantPremium('purchase', expiresAt, 'monthly');
}

/** Simulate yearly purchase */
export function purchaseYearlyPremium(): void {
  const expiresAt = addYears(1);
  grantPremium('purchase', expiresAt, 'yearly');
}

/** Lifetime/manual premium */
export function grantLifetimePremium(source: PremiumSource = 'manual'): void {
  grantPremium(source, 'lifetime', 'lifetime');
}

/** Revoke premium */
export function revokePremium(): void {
  localStorage.removeItem(PREMIUM_KEY);
  localStorage.removeItem(PREMIUM_SOURCE_KEY);
  localStorage.removeItem(PREMIUM_EXPIRY_KEY);
  localStorage.removeItem(PREMIUM_PLAN_KEY);
}

/** Trial helpers */
export function hasUsedTrial(): boolean {
  return localStorage.getItem(PREMIUM_TRIAL_KEY) === 'true';
}

export function clearTrialFlag(): void {
  localStorage.removeItem(PREMIUM_TRIAL_KEY);
}

/** Restore purchases — placeholder until RevenueCat is wired */
export async function restorePurchases(): Promise<boolean> {
  const source = localStorage.getItem(PREMIUM_SOURCE_KEY);
  const expiry = localStorage.getItem(PREMIUM_EXPIRY_KEY);

  if ((source === 'purchase' || source === 'trial' || source === 'restore') && !isExpired(expiry)) {
    localStorage.setItem(PREMIUM_KEY, 'true');
    return true;
  }

  return false;
}
