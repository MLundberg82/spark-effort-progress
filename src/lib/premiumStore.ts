export type PremiumPlan = 'monthly' | 'yearly' | 'lifetime';
export type PremiumSource = 'preview' | 'revenuecat' | 'manual';

export type PremiumStatus = {
  isPremium: boolean;
  isActive: boolean;
  source?: PremiumSource;
  plan?: PremiumPlan;
  expiresAt?: string;
  trialUsed: boolean;
};

type PurchaseResult = {
  ok: boolean;
  reason?:
    | 'cancelled'
    | 'not-supported'
    | 'package-not-found'
    | 'preview-only'
    | 'nothing-to-restore'
    | 'failed';
};

const PREMIUM_KEY = 'gymrat-premium-active';
const PREMIUM_SOURCE_KEY = 'gymrat-premium-source';
const PREMIUM_PLAN_KEY = 'gymrat-premium-plan';
const PREMIUM_EXPIRY_KEY = 'gymrat-premium-expiry';
const PREMIUM_TRIAL_KEY = 'gymrat-premium-trial-used';
const PREMIUM_EVENT = 'premium-updated';

function emit(status: PremiumStatus) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PREMIUM_EVENT, { detail: status }));
}

function normalizeStatus(status: Partial<PremiumStatus>): PremiumStatus {
  const isPremium = status.isPremium === true || status.isActive === true;

  return {
    isPremium,
    isActive: isPremium,
    source: status.source,
    plan: status.plan,
    expiresAt: status.expiresAt,
    trialUsed: status.trialUsed === true,
  };
}

function savePremiumStatus(input: Partial<PremiumStatus>) {
  if (typeof window === 'undefined') return;

  const status = normalizeStatus(input);

  localStorage.setItem(PREMIUM_KEY, status.isPremium ? 'true' : 'false');

  if (status.source) localStorage.setItem(PREMIUM_SOURCE_KEY, status.source);
  else localStorage.removeItem(PREMIUM_SOURCE_KEY);

  if (status.plan) localStorage.setItem(PREMIUM_PLAN_KEY, status.plan);
  else localStorage.removeItem(PREMIUM_PLAN_KEY);

  if (status.expiresAt) localStorage.setItem(PREMIUM_EXPIRY_KEY, status.expiresAt);
  else localStorage.removeItem(PREMIUM_EXPIRY_KEY);

  if (status.trialUsed) localStorage.setItem(PREMIUM_TRIAL_KEY, 'true');
  else localStorage.removeItem(PREMIUM_TRIAL_KEY);

  emit(status);
}

export function checkPremium(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PREMIUM_KEY) === 'true';
}

export function isPremiumUnlocked(): boolean {
  return checkPremium();
}

export function getPremiumStatus(): PremiumStatus {
  if (typeof window === 'undefined') {
    return {
      isPremium: false,
      isActive: false,
      trialUsed: false,
    };
  }

  const isPremium = localStorage.getItem(PREMIUM_KEY) === 'true';

  return {
    isPremium,
    isActive: isPremium,
    source: (localStorage.getItem(PREMIUM_SOURCE_KEY) as PremiumSource | null) ?? undefined,
    plan: (localStorage.getItem(PREMIUM_PLAN_KEY) as PremiumPlan | null) ?? undefined,
    expiresAt: localStorage.getItem(PREMIUM_EXPIRY_KEY) ?? undefined,
    trialUsed: localStorage.getItem(PREMIUM_TRIAL_KEY) === 'true',
  };
}

export function getPremiumState() {
  return getPremiumStatus();
}

export function unlockPremiumPreview(plan: PremiumPlan = 'monthly') {
  savePremiumStatus({
    isPremium: true,
    isActive: true,
    source: 'preview',
    plan,
    trialUsed: true,
  });
}

export function clearPremiumPreview() {
  savePremiumStatus({
    isPremium: false,
    isActive: false,
    source: undefined,
    plan: undefined,
    expiresAt: undefined,
    trialUsed: false,
  });
}

export function subscribePremium(listener: (state: PremiumStatus) => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handler = (event: Event) => {
    const custom = event as CustomEvent<PremiumStatus>;
    listener(custom.detail ?? getPremiumStatus());
  };

  window.addEventListener(PREMIUM_EVENT, handler);
  listener(getPremiumStatus());

  return () => {
    window.removeEventListener(PREMIUM_EVENT, handler);
  };
}

function getPurchases(): any | null {
  if (typeof window === 'undefined') return null;
  return (window as any).Purchases ?? null;
}

function inferPlanFromPackageId(value: string): PremiumPlan | undefined {
  const id = value.toLowerCase();
  if (id.includes('month')) return 'monthly';
  if (id.includes('year') || id.includes('annual')) return 'yearly';
  if (id.includes('life')) return 'lifetime';
  return undefined;
}

export async function syncPremiumFromRevenueCat(): Promise<boolean> {
  const Purchases = getPurchases();
  if (!Purchases?.getCustomerInfo) return checkPremium();

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlement =
      customerInfo?.customerInfo?.entitlements?.active?.premium ??
      customerInfo?.entitlements?.active?.premium;

    if (!entitlement) {
      savePremiumStatus({
        isPremium: false,
        isActive: false,
        trialUsed: getPremiumStatus().trialUsed,
      });
      return false;
    }

    savePremiumStatus({
      isPremium: true,
      isActive: true,
      source: 'revenuecat',
      plan: inferPlanFromPackageId(entitlement.productIdentifier ?? ''),
      expiresAt: entitlement.expirationDate ?? undefined,
      trialUsed: getPremiumStatus().trialUsed || entitlement.periodType === 'TRIAL',
    });

    return true;
  } catch {
    return checkPremium();
  }
}

export async function getOfferings(): Promise<any | null> {
  const Purchases = getPurchases();
  if (!Purchases?.getOfferings) return null;

  try {
    return await Purchases.getOfferings();
  } catch {
    return null;
  }
}

export async function purchasePackage(rcPackage: any): Promise<boolean> {
  const Purchases = getPurchases();
  if (!Purchases?.purchasePackage || !rcPackage) return false;

  try {
    const result = await Purchases.purchasePackage({ aPackage: rcPackage });
    const entitlement =
      result?.customerInfo?.entitlements?.active?.premium ??
      result?.entitlements?.active?.premium;

    const isPremium = Boolean(entitlement);

    savePremiumStatus({
      isPremium,
      isActive: isPremium,
      source: isPremium ? 'revenuecat' : undefined,
      plan: isPremium ? inferPlanFromPackageId(entitlement?.productIdentifier ?? '') : undefined,
      expiresAt: entitlement?.expirationDate ?? undefined,
      trialUsed: getPremiumStatus().trialUsed || entitlement?.periodType === 'TRIAL',
    });

    return isPremium;
  } catch (error: any) {
    if (error?.userCancelled) return false;
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  const Purchases = getPurchases();
  if (!Purchases?.restorePurchases) return false;

  try {
    const result = await Purchases.restorePurchases();
    const entitlement =
      result?.customerInfo?.entitlements?.active?.premium ??
      result?.entitlements?.active?.premium;

    const isPremium = Boolean(entitlement);

    savePremiumStatus({
      isPremium,
      isActive: isPremium,
      source: isPremium ? 'revenuecat' : undefined,
      plan: isPremium ? inferPlanFromPackageId(entitlement?.productIdentifier ?? '') : undefined,
      expiresAt: entitlement?.expirationDate ?? undefined,
      trialUsed: getPremiumStatus().trialUsed,
    });

    return isPremium;
  } catch {
    return false;
  }
}

export async function purchasePremium(plan: PremiumPlan): Promise<PurchaseResult> {
  const offerings = await getOfferings();

  if (!offerings) {
    return { ok: false, reason: 'preview-only' };
  }

  const current = offerings.current;
  const availablePackages: any[] = current?.availablePackages ?? [];

  const selectedPackage =
    availablePackages.find((pkg) => {
      const identifier = String(pkg?.identifier ?? '').toLowerCase();
      const productId = String(pkg?.product?.identifier ?? pkg?.productIdentifier ?? '').toLowerCase();

      if (plan === 'monthly') return identifier.includes('month') || productId.includes('month');
      if (plan === 'yearly') return identifier.includes('year') || productId.includes('year') || productId.includes('annual');
      return identifier.includes('life') || productId.includes('life');
    }) ?? null;

  if (!selectedPackage) {
    return { ok: false, reason: 'package-not-found' };
  }

  const ok = await purchasePackage(selectedPackage);
  return ok ? { ok: true } : { ok: false, reason: 'failed' };
}

export async function restorePremiumPurchases(): Promise<PurchaseResult> {
  const ok = await restorePurchases();
  return ok ? { ok: true } : { ok: false, reason: 'nothing-to-restore' };
}