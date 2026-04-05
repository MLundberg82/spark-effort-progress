import { Purchases, CustomerInfo, PurchasesOfferings, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

const PREMIUM_KEY = 'gymrat-premium';
const PREMIUM_SOURCE_KEY = 'gymrat-premium-source';
const PREMIUM_PLAN_KEY = 'gymrat-premium-plan';
const PREMIUM_EXPIRY_KEY = 'gymrat-premium-expiry';
const PREMIUM_TRIAL_KEY = 'gymrat-premium-trial-used';

export type PremiumSource = 'purchase' | 'promo_code' | 'restore' | 'manual' | 'trial' | 'revenuecat';
export type PremiumPlan = 'monthly' | 'yearly' | 'lifetime' | 'trial';

export interface PremiumStatus {
  isPremium: boolean;
  source?: PremiumSource;
  expiresAt?: string;
  plan?: PremiumPlan;
  trialUsed?: boolean;
}

const ENTITLEMENT_ID = 'premium'; // måste matcha RevenueCat entitlement

function savePremiumStatus(status: PremiumStatus) {
  localStorage.setItem(PREMIUM_KEY, status.isPremium ? 'true' : 'false');

  if (status.source) localStorage.setItem(PREMIUM_SOURCE_KEY, status.source);
  else localStorage.removeItem(PREMIUM_SOURCE_KEY);

  if (status.plan) localStorage.setItem(PREMIUM_PLAN_KEY, status.plan);
  else localStorage.removeItem(PREMIUM_PLAN_KEY);

  if (status.expiresAt) localStorage.setItem(PREMIUM_EXPIRY_KEY, status.expiresAt);
  else localStorage.removeItem(PREMIUM_EXPIRY_KEY);

  if (status.trialUsed) localStorage.setItem(PREMIUM_TRIAL_KEY, 'true');

  window.dispatchEvent(new CustomEvent('premium-updated', { detail: status }));
}

export function checkPremium(): boolean {
  return localStorage.getItem(PREMIUM_KEY) === 'true';
}

export function getPremiumStatus(): PremiumStatus {
  return {
    isPremium: localStorage.getItem(PREMIUM_KEY) === 'true',
    source: (localStorage.getItem(PREMIUM_SOURCE_KEY) as PremiumSource | null) ?? undefined,
    plan: (localStorage.getItem(PREMIUM_PLAN_KEY) as PremiumPlan | null) ?? undefined,
    expiresAt: localStorage.getItem(PREMIUM_EXPIRY_KEY) ?? undefined,
    trialUsed: localStorage.getItem(PREMIUM_TRIAL_KEY) === 'true',
  };
}

export async function initRevenueCat(apiKey: string, appUserId?: string) {
  await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

  await Purchases.configure({
    apiKey,
    appUserID: appUserId,
  });

  await syncPremiumFromRevenueCat();
}

function mapPlanFromProductId(productId: string): PremiumPlan | undefined {
  const id = productId.toLowerCase();

  if (id.includes('monthly') || id.includes('month')) return 'monthly';
  if (id.includes('yearly') || id.includes('annual') || id.includes('year')) return 'yearly';
  if (id.includes('lifetime')) return 'lifetime';

  return undefined;
}

function premiumStatusFromCustomerInfo(customerInfo: CustomerInfo): PremiumStatus {
  const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

  if (!entitlement) {
    return {
      isPremium: false,
      trialUsed: localStorage.getItem(PREMIUM_TRIAL_KEY) === 'true',
    };
  }

  const plan = mapPlanFromProductId(entitlement.productIdentifier);

  return {
    isPremium: true,
    source: 'revenuecat',
    plan,
    expiresAt: entitlement.expirationDate ?? undefined,
    trialUsed:
      localStorage.getItem(PREMIUM_TRIAL_KEY) === 'true' ||
      entitlement.periodType === 'TRIAL',
  };
}

export async function syncPremiumFromRevenueCat(): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    const status = premiumStatusFromCustomerInfo(customerInfo);

    savePremiumStatus(status);
    return status.isPremium;
  } catch (error) {
    console.error('Failed syncing premium from RevenueCat', error);
    return checkPremium();
  }
}

export async function getOfferings(): Promise<PurchasesOfferings | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('Failed getting RevenueCat offerings', error);
    return null;
  }
}

export async function purchasePackage(rcPackage: any): Promise<boolean> {
  try {
    const result = await Purchases.purchasePackage({ aPackage: rcPackage });
    const status = premiumStatusFromCustomerInfo(result.customerInfo);
    savePremiumStatus(status);
    return status.isPremium;
  } catch (error: any) {
    if (error?.userCancelled) return false;
    console.error('RevenueCat purchase failed', error);
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const result = await Purchases.restorePurchases();
    const status = premiumStatusFromCustomerInfo(result.customerInfo);
    savePremiumStatus({
      ...status,
      source: status.isPremium ? 'restore' : status.source,
    });
    return status.isPremium;
  } catch (error) {
    console.error('RevenueCat restore failed', error);
    return false;
  }
}

export function grantPremiumFromPromoCode(days: number, plan: PremiumPlan = 'monthly'): void {
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  savePremiumStatus({
    isPremium: true,
    source: 'promo_code',
    plan,
    expiresAt,
    trialUsed: localStorage.getItem(PREMIUM_TRIAL_KEY) === 'true',
  });
}

export function revokePremium(): void {
  savePremiumStatus({
    isPremium: false,
    trialUsed: localStorage.getItem(PREMIUM_TRIAL_KEY) === 'true',
  });
}