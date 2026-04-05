export type PaywallTrigger =
  | 'manual'
  | 'workout_complete'
  | 'level_up'
  | 'pr'
  | 'history'
  | 'nutrition'
  | 'custom_workout'
  | 'shop_premium'
  | 'feature_lock';

export type PaywallState = {
  isOpen: boolean;
  lastTrigger: PaywallTrigger | null;
  seenThisSession: PaywallTrigger[];
};

const STORAGE_KEY = 'gymrat-paywall-state';
const EVENT_NAME = 'paywall-updated';

function isBrowser() {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
}

function getDefaultState(): PaywallState {
  return {
    isOpen: false,
    lastTrigger: null,
    seenThisSession: [],
  };
}

function isPaywallTrigger(value: unknown): value is PaywallTrigger {
  return (
    value === 'manual' ||
    value === 'workout_complete' ||
    value === 'level_up' ||
    value === 'pr' ||
    value === 'history' ||
    value === 'nutrition' ||
    value === 'custom_workout' ||
    value === 'shop_premium' ||
    value === 'feature_lock'
  );
}

function readState(): PaywallState {
  if (!isBrowser()) return getDefaultState();

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();

    const parsed = JSON.parse(raw) as Partial<PaywallState>;

    return {
      isOpen: Boolean(parsed.isOpen),
      lastTrigger: isPaywallTrigger(parsed.lastTrigger) ? parsed.lastTrigger : null,
      seenThisSession: Array.isArray(parsed.seenThisSession)
        ? parsed.seenThisSession.filter(isPaywallTrigger)
        : [],
    };
  } catch {
    return getDefaultState();
  }
}

function writeState(next: PaywallState) {
  if (!isBrowser()) return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
}

export function subscribePaywall(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handler = () => callback();

  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

export function getPaywallState() {
  return readState();
}

export function isPaywallOpen() {
  return readState().isOpen;
}

export function getLastPaywallTrigger() {
  return readState().lastTrigger;
}

export function hasSeenPaywallTrigger(trigger: PaywallTrigger) {
  return readState().seenThisSession.includes(trigger);
}

export function shouldOpenPaywall(trigger: PaywallTrigger) {
  if (trigger === 'manual') return true;
  return !hasSeenPaywallTrigger(trigger);
}

export function openPaywall(trigger: PaywallTrigger = 'manual') {
  const current = readState();

  const next: PaywallState = {
    ...current,
    isOpen: true,
    lastTrigger: trigger,
    seenThisSession: current.seenThisSession.includes(trigger)
      ? current.seenThisSession
      : [...current.seenThisSession, trigger],
  };

  writeState(next);
  return next;
}

export function closePaywall() {
  const current = readState();

  const next: PaywallState = {
    ...current,
    isOpen: false,
  };

  writeState(next);
  return next;
}

export function resetPaywallSession() {
  writeState(getDefaultState());
}

export function getPaywallHeadline(trigger: PaywallTrigger) {
  switch (trigger) {
    case 'workout_complete':
      return 'Workout done. Now unlock the deeper systems.';
    case 'level_up':
      return 'You leveled up. Keep the momentum alive.';
    case 'pr':
      return 'You hit a new PR. Stack more wins with Premium.';
    case 'history':
      return 'See the bigger picture of your progress.';
    case 'nutrition':
      return 'Fuel your results, not just your workouts.';
    case 'custom_workout':
      return 'Train your way with custom sessions.';
    case 'shop_premium':
      return 'Unlock the premium side of your GymRat identity.';
    case 'feature_lock':
      return 'This feature is part of the deeper progression layer.';
    case 'manual':
    default:
      return 'Train smarter. Track more. Become harder to stop.';
  }
}

export function getPaywallSubtext(trigger: PaywallTrigger) {
  switch (trigger) {
    case 'workout_complete':
      return 'You already did the hard part. Premium helps you keep momentum with better tracking and more control.';
    case 'level_up':
      return 'A stronger rat deserves deeper progression, cleaner insight and stronger identity.';
    case 'pr':
      return 'When momentum is high, the right systems make it easier to keep stacking wins.';
    case 'history':
      return 'Unlock full workout history, progress stats and long-term tracking.';
    case 'nutrition':
      return 'Unlock nutrition tracking, macro goals and better daily consistency.';
    case 'custom_workout':
      return 'Create your own workouts and train exactly how you want.';
    case 'shop_premium':
      return 'Premium gives you exclusive identity upgrades, cosmetics and a stronger GymRat feel.';
    case 'feature_lock':
      return 'This is part of the premium progression layer.';
    case 'manual':
    default:
      return 'Keep the free flow simple, then unlock the heavier version when you want more.';
  }
}