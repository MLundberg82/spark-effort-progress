import { type PaywallTrigger } from '@/lib/paywallStore';

const PAYWALL_SHOWN_KEY = 'gymrat-paywall-shown-triggers';

function getShownTriggers(): Record<string, boolean> {
  const data = localStorage.getItem(PAYWALL_SHOWN_KEY);
  return data ? JSON.parse(data) : {};
}

function markShown(trigger: PaywallTrigger) {
  const current = getShownTriggers();
  current[trigger] = true;
  localStorage.setItem(PAYWALL_SHOWN_KEY, JSON.stringify(current));
}

export function shouldShowSmartPaywall(trigger: PaywallTrigger): boolean {
  const shown = getShownTriggers();

  if (shown[trigger]) return false;

  if (trigger === 'workout_complete') return true;

  if (trigger === 'level_up') {
    return Math.random() < 0.3;
  }

  if (
    trigger === 'history' ||
    trigger === 'nutrition' ||
    trigger === 'custom_workout' ||
    trigger === 'shop_premium' ||
    trigger === 'feature_lock' ||
    trigger === 'manual'
  ) {
    return true;
  }

  return false;
}

export function handlePaywallTrigger(
  trigger: PaywallTrigger,
  openPaywall: (trigger: PaywallTrigger) => void
) {
  if (shouldShowSmartPaywall(trigger)) {
    markShown(trigger);
    openPaywall(trigger);
  }
}