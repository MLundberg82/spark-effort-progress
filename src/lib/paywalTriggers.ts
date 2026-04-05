import { setPaywallOpen } from '@/lib/appStore';

function open(reason: string) {
  setPaywallOpen(true);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('gymrat-paywall-trigger', {
        detail: { reason, openedAt: new Date().toISOString() },
      })
    );
  }
}

export function maybeOpenHistoryPaywall() {
  open('history');
}

export function maybeOpenNutritionPaywall() {
  open('nutrition');
}

export function openManualPaywall() {
  open('manual');
}