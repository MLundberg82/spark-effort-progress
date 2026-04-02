import React, { useEffect, useState } from 'react';
import IndexScreen from './pages/Index';
import PremiumPaywall from '@/components/PremiumPaywall';
import { isPremium } from '@/lib/gamificationStore';
import {
  type PaywallTrigger,
  resetPaywallSession,
} from '@/lib/paywallStore';
import { trackEvent } from '@/lib/analytics';
import {
  startTrial,
  purchaseMonthly,
  purchaseYearly,
  syncPremiumFromRevenueCat,
  restorePurchasesNative,
} from '@/lib/revenuecat';

export default function App() {
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallTrigger, setPaywallTrigger] = useState<PaywallTrigger>('manual');

  const premium = isPremium();

  useEffect(() => {
    resetPaywallSession();
  }, []);

  useEffect(() => {
  syncPremiumFromRevenueCat().catch((error) => {
    console.error('Initial RevenueCat sync failed:', error);
  });
}, []);

  const openPaywall = (trigger: PaywallTrigger) => {
    if (premium) return;

    setPaywallTrigger(trigger);
    setPaywallOpen(true);

    trackEvent('paywall_shown', { trigger });
  };

  const closePaywall = () => {
    setPaywallOpen(false);
  };

const handleStartTrial = async () => {
  trackEvent('paywall_started_trial', { trigger: paywallTrigger });

  const success = await startTrial();
  if (!success) return;

  setPaywallOpen(false);
  window.location.reload();
};

const handlePurchaseMonthly = async () => {
  trackEvent('paywall_purchase_started', {
    trigger: paywallTrigger,
    plan: 'monthly',
  });

  const success = await purchaseMonthly();
  if (!success) return;

  setPaywallOpen(false);
  window.location.reload();
};

const handlePurchaseYearly = async () => {
  trackEvent('paywall_purchase_started', {
    trigger: paywallTrigger,
    plan: 'yearly',
  });

  const success = await purchaseYearly();
  if (!success) return;

  setPaywallOpen(false);
  window.location.reload();
};

const handleRestorePurchases = async () => {
  trackEvent('paywall_restore_started', { trigger: paywallTrigger });

  const success = await restorePurchasesNative();
  if (!success) return;

  setPaywallOpen(false);
  window.location.reload();
};


  return (
    <>
      <IndexScreen openPaywall={openPaywall} />

<PremiumPaywall
  open={paywallOpen}
  trigger={paywallTrigger}
  onClose={closePaywall}
  onStartTrial={handleStartTrial}
  onPurchaseMonthly={handlePurchaseMonthly}
  onPurchaseYearly={handlePurchaseYearly}
  onRestorePurchases={handleRestorePurchases}
/>
    </>
  );
}