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

type PaywallState = {
  isOpen: boolean;
  lastTrigger: PaywallTrigger | null;
  seenThisSession: PaywallTrigger[];
};

const STORAGE_KEY = 'gymrat-paywall-state';

function getDefaultState(): PaywallState {
  return {
    isOpen: false,
    lastTrigger: null,
    seenThisSession: [],
  };
}

function readState(): PaywallState {
  if (typeof window === 'undefined') return getDefaultState();

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();

    const parsed = JSON.parse(raw) as Partial<PaywallState>;

    return {
      isOpen: Boolean(parsed.isOpen),
      lastTrigger: parsed.lastTrigger ?? null,
      seenThisSession: Array.isArray(parsed.seenThisSession)
        ? parsed.seenThisSession
        : [],
    };
  } catch {
    return getDefaultState();
  }
}

function writeState(next: PaywallState) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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

export function hasSeenPaywallTrigger(trigger: PaywallTrigger) {
  return readState().seenThisSession.includes(trigger);
}

export function shouldOpenPaywall(trigger: PaywallTrigger) {
  if (trigger === 'manual') return true;
  return !hasSeenPaywallTrigger(trigger);
}

export function resetPaywallSession() {
  writeState(getDefaultState());
}

export function getPaywallHeadline(trigger: PaywallTrigger) {
  switch (trigger) {
    case 'workout_complete':
      return 'You finished the work. Now unlock the deeper systems.';
    case 'level_up':
      return 'You leveled up. Keep that momentum going.';
    case 'pr':
      return 'You hit a new high. Build on it with Premium.';
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
      return 'Train smarter. Track everything. Become unstoppable.';
  }
}

export function getPaywallSubtext(trigger: PaywallTrigger) {
  switch (trigger) {
    case 'workout_complete':
      return 'You already did the hard part. Premium helps you keep the streak alive with better tracking and more control.';
    case 'level_up':
      return 'A stronger rat deserves deeper progression, more insight and stronger personalization.';
    case 'pr':
      return 'When momentum is high, the right tools make it easier to keep stacking wins.';
    case 'history':
      return 'Get full workout history, progress stats, and long-term tracking.';
    case 'nutrition':
      return 'Unlock nutrition tracking, macro goals, and daily consistency tools.';
    case 'custom_workout':
      return 'Create your own workouts and train exactly how you want.';
    case 'shop_premium':
      return 'Premium gives you access to exclusive rewards, upgrades, and a better GymRat experience.';
    case 'feature_lock':
    case 'manual':
    default:
      return 'Train smarter. Track everything. Become unstoppable.';
  }
}