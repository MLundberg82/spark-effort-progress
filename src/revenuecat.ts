import { Capacitor } from '@capacitor/core';
import { Purchases } from '@revenuecat/purchases-capacitor';

const isNativePlatform = () => {
  return Capacitor.getPlatform() === "ios" || Capacitor.getPlatform() === "android";
};

export const getOfferings = async () => {
  if (!isNativePlatform()) {
    console.log("RevenueCat skipped: not running on native iOS/Android");
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error("Error fetching offerings:", error);
    return null;
  }
};

export const getCustomerInfo = async () => {
  if (!isNativePlatform()) {
    console.log("RevenueCat skipped: not running on native iOS/Android");
    return null;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error("Error fetching customer info:", error);
    return null;
  }
};