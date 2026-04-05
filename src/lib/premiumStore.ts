import { Purchases } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { getCustomerInfo, getOfferings } from '../revenuecat';

export type PremiumPlan = 'monthly' | 'yearly' | null;
export type PremiumSource = 'revenuecat' | 'preview' | 'none';

export type PremiumState = {
  isActive: boolean;
  entitlementId: string | null;
  plan: PremiumPlan;
  source: PremiumSource;
  expiresAt: string | null;
  managementURL: string | null;
  lastSyncedAt: string | null;
};

const KEY = 'gymrat-premium-store';

const defaultState: PremiumState = {
  isActive: false,
  entitlementId: null,
  plan: null,
  source: 'none',
  expiresAt: null,
  managementURL: null,
  lastSyncedAt: null,
};

function isNativePlatform() {
  const platform = Capacitor.getPlatform();
  return platform === 'ios' || platform === 'android';
}

function readState(): PremiumState {
  if (typeof window === 'undefined') return defaultState;

  const raw = localStorage.getItem(KEY);
  if (!raw) return defaultState;

  try {
    return {
      ...defaultState,
      ...JSON.parse(raw),
    } as PremiumState;
  } catch {
    return defaultState;
  }
}

function writeState(next: PremiumState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('gymrat:premium-updated', { detail: next }));
}

function normalizePlan(productId?: string | null): PremiumPlan {
  if (!productId) return null;

  const id = productId.toLowerCase();

  if (
    id.includes('year') ||
    id.includes('annual') ||
    id.includes('yearly') ||
    id.includes('12m')
  ) {
    return 'yearly';
  }

  if (
    id.includes('month') ||
    id.includes('monthly') ||
    id.includes('1m')
  ) {
    return 'monthly';
  }

  return null;
}

function extractActiveEntitlement(customerInfo: any) {
  const active = customerInfo?.customerInfo?.entitlements?.active
    ?? customerInfo?.entitlements?.active
    ?? {};

  const entries = Object.entries(active);
  if (!entries.length) return null;

  const preferred =
    entries.find(([key]) => key.toLowerCase() === 'premium') ??
    entries[0];

  const [entitlementId, entitlement] = preferred as [string, any];

  return {
    entitlementId,
    entitlement,
  };
}

function mapCustomerInfoToState(customerInfo: any): PremiumState {
  const activeEntitlement = extractActiveEntitlement(customerInfo);

  if (!activeEntitlement) {
    return {
      ...defaultState,
      source: 'revenuecat',
      lastSyncedAt: new Date().toISOString(),
      managementURL:
        customerInfo?.customerInfo?.managementURL ??
        customerInfo?.managementURL ??
        null,
    };
  }

  const { entitlementId, entitlement } = activeEntitlement;

  return {
    isActive: true,
    entitlementId,
    plan: normalizePlan(
      entitlement?.productIdentifier ??
        entitlement?.product_identifier ??
        null
    ),
    source: 'revenuecat',
    expiresAt:
      entitlement?.expirationDate ??
      entitlement?.expiration_date ??
      null,
    managementURL:
      customerInfo?.customerInfo?.managementURL ??
      customerInfo?.managementURL ??
      null,
    lastSyncedAt: new Date().toISOString(),
  };
}

export function getPremiumState() {
  return readState();
}

export function isPremiumUnlocked() {
  return readState().isActive;
}

export function getPremiumPlan() {
  return readState().plan;
}

export function getPremiumManagementURL() {
  return readState().managementURL;
}

export function subscribePremium(listener: (state: PremiumState) => void) {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<PremiumState>;
    listener(customEvent.detail ?? readState());
  };

  window.addEventListener('gymrat:premium-updated', handler);

  return () => {
    window.removeEventListener('gymrat:premium-updated', handler);
  };
}

export async function refreshPremiumStatus() {
  if (!isNativePlatform()) {
    const current = readState();
    writeState({
      ...current,
      lastSyncedAt: new Date().toISOString(),
    });
    return current;
  }

  try {
    const customerInfo = await getCustomerInfo();
    const next = mapCustomerInfoToState(customerInfo);
    writeState(next);
    return next;
  } catch (error) {
    console.error('Failed to refresh premium status:', error);
    return readState();
  }
}

function resolvePackageFromOffering(offerings: any, plan: Exclude<PremiumPlan, null>) {
  const current =
    offerings?.current ??
    offerings?.all?.default ??
    null;

  if (!current) return null;

  const availablePackages: any[] = current.availablePackages ?? [];

  const findByPackageType = (packageType: string) =>
    availablePackages.find(
      (pkg) => String(pkg.packageType ?? '').toUpperCase() === packageType
    );

  const findByIdentifierIncludes = (needle: string) =>
    availablePackages.find((pkg) =>
      String(
        pkg.identifier ??
          pkg.packageIdentifier ??
          pkg.product?.identifier ??
          pkg.storeProduct?.identifier ??
          ''
      )
        .toLowerCase()
        .includes(needle)
    );

  if (plan === 'monthly') {
    return (
      findByPackageType('MONTHLY') ??
      findByIdentifierIncludes('month') ??
      findByIdentifierIncludes('monthly')
    );
  }

  return (
    findByPackageType('ANNUAL') ??
    findByPackageType('YEARLY') ??
    findByIdentifierIncludes('year') ??
    findByIdentifierIncludes('annual') ??
    findByIdentifierIncludes('yearly')
  );
}

export async function purchasePremium(plan: Exclude<PremiumPlan, null>) {
  if (!isNativePlatform()) {
    console.log('RevenueCat purchase skipped: not running on native iOS/Android');
    return { ok: false as const, reason: 'not-native' as const };
  }

  try {
    const offerings = await getOfferings();
    const targetPackage = resolvePackageFromOffering(offerings, plan);

    if (!targetPackage) {
      return { ok: false as const, reason: 'package-not-found' as const };
    }

    await Purchases.purchasePackage({
      aPackage: targetPackage,
    });

    const next = await refreshPremiumStatus();
    return { ok: true as const, state: next };
  } catch (error: any) {
    const code = error?.code ?? error?.message ?? 'purchase-failed';
    const userCancelled =
      code === 'PURCHASE_CANCELLED_ERROR' ||
      String(code).toLowerCase().includes('cancel');

    return {
      ok: false as const,
      reason: userCancelled ? 'cancelled' as const : 'purchase-failed' as const,
      error,
    };
  }
}

export async function restorePremium() {
  if (!isNativePlatform()) {
    console.log('RevenueCat restore skipped: not running on native iOS/Android');
    return { ok: false as const, reason: 'not-native' as const };
  }

  try {
    await Purchases.restorePurchases();
    const next = await refreshPremiumStatus();
    return { ok: true as const, state: next };
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    return { ok: false as const, reason: 'restore-failed' as const, error };
  }
}

/**
 * Behåll preview för lokal UI-testning i browser/emulator när store-flow inte används.
 * Vi kan ta bort detta helt senare när allt är kopplat live.
 */
export function unlockPremiumPreview(plan: PremiumPlan = 'monthly') {
  const next: PremiumState = {
    isActive: true,
    entitlementId: 'premium',
    plan,
    source: 'preview',
    expiresAt: null,
    managementURL: null,
    lastSyncedAt: new Date().toISOString(),
  };

  writeState(next);
  return next;
}

export function clearPremiumPreview() {
  writeState(defaultState);
}
export function checkPremium() {
  return isPremiumUnlocked();
}