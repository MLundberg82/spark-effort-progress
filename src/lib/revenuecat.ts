import { Purchases } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { grantPremium, revokePremium, hasUsedTrial } from '@/lib/premiumStore';

const ENTITLEMENT_ID = 'premium';

export function isNativePlatform(): boolean {
  const platform = Capacitor.getPlatform();
  return platform === 'ios' || platform === 'android';
}

export async function getOfferingsSafe() {
  if (!isNativePlatform()) return null;

  try {
    return await Purchases.getOfferings();
  } catch (error) {
    console.error('RevenueCat getOfferings failed:', error);
    return null;
  }
}

export async function getCurrentOfferingSafe() {
  const offerings = await getOfferingsSafe();
  return offerings?.current ?? null;
}

export async function getMonthlyPackage() {
  const offering = await getCurrentOfferingSafe();
  if (!offering?.availablePackages?.length) return null;

  return offering.availablePackages.find((pkg: any) => pkg.packageType === '$rc_monthly') ?? null;
}

export async function getYearlyPackage() {
  const offering = await getCurrentOfferingSafe();
  if (!offering?.availablePackages?.length) return null;

  return offering.availablePackages.find((pkg: any) => pkg.packageType === '$rc_annual') ?? null;
}

export async function getCustomerInfoSafe() {
  if (!isNativePlatform()) return null;

  try {
    const result = await Purchases.getCustomerInfo();
    return result?.customerInfo ?? null;
  } catch (error) {
    console.error('RevenueCat getCustomerInfo failed:', error);
    return null;
  }
}

export function hasActivePremiumEntitlement(customerInfo: any): boolean {
  return !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];
}

export async function syncPremiumFromRevenueCat(): Promise<boolean> {
  const customerInfo = await getCustomerInfoSafe();
  if (!customerInfo) return false;

  const entitlement = customerInfo.entitlements?.active?.[ENTITLEMENT_ID];

  if (!entitlement) {
    revokePremium();
    return false;
  }

  const productId = String(
    entitlement.productIdentifier ||
      entitlement.productPlanIdentifier ||
      ''
  ).toLowerCase();

  const expirationDate = entitlement.expirationDate ?? undefined;
  const periodType = String(entitlement.periodType || '').toLowerCase();

  if (periodType === 'trial' && !hasUsedTrial()) {
    grantPremium('trial', expirationDate, 'trial');
    return true;
  }

  if (productId.includes('year')) {
    grantPremium('purchase', expirationDate, 'yearly');
    return true;
  }

  if (productId.includes('month')) {
    grantPremium('purchase', expirationDate, 'monthly');
    return true;
  }

  grantPremium('purchase', expirationDate, 'monthly');
  return true;
}

export async function purchaseMonthly(): Promise<boolean> {
  try {
    const pkg = await getMonthlyPackage();
    if (!pkg) {
      console.error('Monthly package not found');
      return false;
    }

    await Purchases.purchasePackage({ aPackage: pkg });
    return await syncPremiumFromRevenueCat();
  } catch (error) {
    console.error('Monthly purchase failed:', error);
    return false;
  }
}

export async function purchaseYearly(): Promise<boolean> {
  try {
    const pkg = await getYearlyPackage();
    if (!pkg) {
      console.error('Yearly package not found');
      return false;
    }

    await Purchases.purchasePackage({ aPackage: pkg });
    return await syncPremiumFromRevenueCat();
  } catch (error) {
    console.error('Yearly purchase failed:', error);
    return false;
  }
}

export async function startTrial(): Promise<boolean> {
  try {
    const yearly = await getYearlyPackage();
    const monthly = await getMonthlyPackage();
    const pkg = yearly ?? monthly;

    if (!pkg) {
      console.error('No package found for trial purchase');
      return false;
    }

    await Purchases.purchasePackage({ aPackage: pkg });
    return await syncPremiumFromRevenueCat();
  } catch (error) {
    console.error('Trial purchase failed:', error);
    return false;
  }
}

export async function restorePurchasesNative(): Promise<boolean> {
  try {
    await Purchases.restorePurchases();
    return await syncPremiumFromRevenueCat();
  } catch (error) {
    console.error('Restore purchases failed:', error);
    return false;
  }
}