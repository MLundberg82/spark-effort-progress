import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

export type RevenueCatPackage = {
  identifier: string;
  packageType: string;
  productIdentifier: string;
  title: string;
  priceString: string;
};

export type RevenueCatOffering = {
  identifier: string;
  serverDescription: string;
  availablePackages: RevenueCatPackage[];
};

export type RevenueCatEntitlementResult = {
  isActive: boolean;
  entitlementId: string | null;
  raw: unknown;
};

export type RevenueCatPurchaseResult =
  | {
      ok: true;
      customerInfo: unknown;
    }
  | {
      ok: false;
      reason:
        | 'not_initialized'
        | 'not_native'
        | 'missing_package'
        | 'cancelled'
        | 'failed';
      error?: unknown;
    };

const ENTITLEMENT_ID = 'premium';
const RC_API_KEY_ANDROID =
  (import.meta.env.VITE_REVENUECAT_ANDROID_API_KEY as string | undefined)?.trim() || '';
const RC_API_KEY_IOS =
  (import.meta.env.VITE_REVENUECAT_IOS_API_KEY as string | undefined)?.trim() || '';

let initialized = false;
let initializingPromise: Promise<boolean> | null = null;

function isNativePlatform() {
  const platform = Capacitor.getPlatform();
  return platform === 'ios' || platform === 'android';
}

function getApiKey() {
  const platform = Capacitor.getPlatform();
  if (platform === 'android') return RC_API_KEY_ANDROID;
  if (platform === 'ios') return RC_API_KEY_IOS;
  return '';
}

function getErrorCode(error: unknown): string {
  if (!error || typeof error !== 'object') return '';
  const candidate = error as { code?: string; userCancelled?: boolean };
  if (candidate.userCancelled) return 'USER_CANCELLED';
  return typeof candidate.code === 'string' ? candidate.code : '';
}

function normalizePackage(pkg: any): RevenueCatPackage {
  return {
    identifier: String(pkg?.identifier ?? ''),
    packageType: String(pkg?.packageType ?? ''),
    productIdentifier: String(
      pkg?.product?.identifier ?? pkg?.product?.productIdentifier ?? '',
    ),
    title: String(pkg?.product?.title ?? pkg?.product?.identifier ?? 'Premium'),
    priceString: String(pkg?.product?.priceString ?? ''),
  };
}

function getActiveEntitlementFromCustomerInfo(customerInfo: any) {
  const active = customerInfo?.entitlements?.active;
  if (!active || typeof active !== 'object') return null;

  if (active[ENTITLEMENT_ID]) {
    return {
      id: ENTITLEMENT_ID,
      value: active[ENTITLEMENT_ID],
    };
  }

  const firstKey = Object.keys(active)[0];
  if (!firstKey) return null;

  return {
    id: firstKey,
    value: active[firstKey],
  };
}

export async function initRevenueCat(): Promise<boolean> {
  if (!isNativePlatform()) {
    return false;
  }

  if (initialized) return true;
  if (initializingPromise) return initializingPromise;

  initializingPromise = (async () => {
    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        console.warn(
          'RevenueCat init skipped: missing VITE_REVENUECAT_ANDROID_API_KEY / VITE_REVENUECAT_IOS_API_KEY',
        );
        return false;
      }

      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      await Purchases.configure({
        apiKey,
      });

      initialized = true;
      return true;
    } catch (error) {
      console.error('RevenueCat init failed', error);
      initialized = false;
      return false;
    } finally {
      initializingPromise = null;
    }
  })();

  return initializingPromise;
}

export async function getOfferings(): Promise<RevenueCatOffering[] | null> {
  const ready = await initRevenueCat();
  if (!ready) return null;

  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;

    if (!current) return [];

    return [
      {
        identifier: String(current.identifier ?? 'default'),
        serverDescription: String(current.serverDescription ?? ''),
        availablePackages: Array.isArray(current.availablePackages)
          ? current.availablePackages.map(normalizePackage)
          : [],
      },
    ];
  } catch (error) {
    console.error('Error fetching offerings', error);
    return null;
  }
}

export async function getCustomerInfo() {
  const ready = await initRevenueCat();
  if (!ready) return null;

  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('Error fetching customer info', error);
    return null;
  }
}

export async function getRevenueCatEntitlementStatus(): Promise<RevenueCatEntitlementResult> {
  const customerInfo = await getCustomerInfo();
  if (!customerInfo) {
    return {
      isActive: false,
      entitlementId: null,
      raw: null,
    };
  }

  const activeEntitlement = getActiveEntitlementFromCustomerInfo(customerInfo);

  return {
    isActive: Boolean(activeEntitlement),
    entitlementId: activeEntitlement?.id ?? null,
    raw: customerInfo,
  };
}

export async function purchasePackage(
  packageIdentifier: string,
): Promise<RevenueCatPurchaseResult> {
  const ready = await initRevenueCat();
  if (!ready) {
    return {
      ok: false,
      reason: isNativePlatform() ? 'not_initialized' : 'not_native',
    };
  }

  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;

    if (!current?.availablePackages?.length) {
      return {
        ok: false,
        reason: 'missing_package',
      };
    }

    const matchedPackage =
      current.availablePackages.find((pkg: any) => pkg.identifier === packageIdentifier) ??
      current.availablePackages.find(
        (pkg: any) =>
          String(pkg.identifier).toLowerCase() === packageIdentifier.toLowerCase(),
      );

    if (!matchedPackage) {
      return {
        ok: false,
        reason: 'missing_package',
      };
    }

    const result = await Purchases.purchasePackage({
      aPackage: matchedPackage,
    });

    return {
      ok: true,
      customerInfo: result.customerInfo,
    };
  } catch (error) {
    const code = getErrorCode(error);

    if (code === '1' || code === 'PURCHASE_CANCELLED' || code === 'USER_CANCELLED') {
      return {
        ok: false,
        reason: 'cancelled',
        error,
      };
    }

    console.error('RevenueCat purchase failed', error);
    return {
      ok: false,
      reason: 'failed',
      error,
    };
  }
}

export async function restoreRevenueCatPurchases(): Promise<RevenueCatPurchaseResult> {
  const ready = await initRevenueCat();
  if (!ready) {
    return {
      ok: false,
      reason: isNativePlatform() ? 'not_initialized' : 'not_native',
    };
  }

  try {
    const result = await Purchases.restorePurchases();
    return {
      ok: true,
      customerInfo: result.customerInfo,
    };
  } catch (error) {
    console.error('RevenueCat restore failed', error);
    return {
      ok: false,
      reason: 'failed',
      error,
    };
  }
}

export function getRevenueCatConfigSummary() {
  return {
    isNative: isNativePlatform(),
    platform: Capacitor.getPlatform(),
    hasAndroidKey: Boolean(RC_API_KEY_ANDROID),
    hasIosKey: Boolean(RC_API_KEY_IOS),
    entitlementId: ENTITLEMENT_ID,
  };
}