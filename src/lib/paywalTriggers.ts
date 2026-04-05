import {
  getPaywallState,
  openPaywall,
  shouldOpenPaywall,
  type PaywallTrigger,
} from '@/lib/paywallStore';
import { checkPremium } from '@/lib/premiumStore';

type TriggerOptions = {
  force?: boolean;
};

export function tryOpenPaywall(
  trigger: PaywallTrigger,
  options: TriggerOptions = {}
) {
  if (checkPremium()) {
    return {
      opened: false,
      reason: 'premium-active' as const,
      state: getPaywallState(),
    };
  }

  if (!options.force && !shouldOpenPaywall(trigger)) {
    return {
      opened: false,
      reason: 'already-seen-this-session' as const,
      state: getPaywallState(),
    };
  }

  const state = openPaywall(trigger);

  return {
    opened: true,
    reason: 'opened' as const,
    state,
  };
}

export function openManualPaywall() {
  return tryOpenPaywall('manual', { force: true });
}

export function maybeOpenWorkoutCompletePaywall() {
  return tryOpenPaywall('workout_complete');
}

export function maybeOpenLevelUpPaywall() {
  return tryOpenPaywall('level_up');
}

export function maybeOpenPRPaywall() {
  return tryOpenPaywall('pr');
}

export function maybeOpenHistoryPaywall() {
  return tryOpenPaywall('history');
}

export function maybeOpenNutritionPaywall() {
  return tryOpenPaywall('nutrition');
}

export function maybeOpenCustomWorkoutPaywall() {
  return tryOpenPaywall('custom_workout');
}

export function maybeOpenShopPremiumPaywall() {
  return tryOpenPaywall('shop_premium');
}

export function maybeOpenFeatureLockPaywall() {
  return tryOpenPaywall('feature_lock');
}