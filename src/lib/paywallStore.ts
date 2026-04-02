export type PaywallTrigger =
  | 'workout_complete'
  | 'level_up'
  | 'feature_lock'
  | 'manual'
  | 'nutrition'
  | 'history'
  | 'custom_workout'
  | 'shop_premium';

const LAST_PAYWALL_SHOWN_KEY = 'gymrat_last_paywall_shown';
const PAYWALL_SESSION_KEY = 'gymrat_paywall_session_shown';

const DEFAULT_COOLDOWN_HOURS = 24;

export function resetPaywallSession(): void {
  sessionStorage.removeItem(PAYWALL_SESSION_KEY);
}

export function markPaywallShown(): void {
  localStorage.setItem(LAST_PAYWALL_SHOWN_KEY, String(Date.now()));
  sessionStorage.setItem(PAYWALL_SESSION_KEY, 'true');
}

export function getLastPaywallShown(): number | null {
  const raw = localStorage.getItem(LAST_PAYWALL_SHOWN_KEY);
  if (!raw) return null;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function hasShownPaywallThisSession(): boolean {
  return sessionStorage.getItem(PAYWALL_SESSION_KEY) === 'true';
}

export function shouldShowPaywall(
  cooldownHours: number = DEFAULT_COOLDOWN_HOURS
): boolean {
  if (hasShownPaywallThisSession()) return false;

  const lastShown = getLastPaywallShown();
  if (!lastShown) return true;

  const now = Date.now();
  const hoursSince = (now - lastShown) / (1000 * 60 * 60);

  return hoursSince >= cooldownHours;
}

export function getPaywallHeadline(trigger: PaywallTrigger): string {
  switch (trigger) {
    case 'workout_complete':
      return 'Keep Your Momentum Going';
    case 'level_up':
      return 'You’re Leveling Up';
    case 'history':
      return 'See Your Full Progress';
    case 'nutrition':
      return 'Dial In Your Nutrition';
    case 'custom_workout':
      return 'Build Workouts Your Way';
    case 'shop_premium':
      return 'Unlock Premium Rewards';
    case 'feature_lock':
    case 'manual':
    default:
      return 'Unlock Your Full Potential';
  }
}

export function getPaywallSubheadline(trigger: PaywallTrigger): string {
  switch (trigger) {
    case 'workout_complete':
      return 'Track every session, review your progress, and train smarter with Premium.';
    case 'level_up':
      return 'You’re improving. Unlock the tools that help you keep pushing forward.';
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