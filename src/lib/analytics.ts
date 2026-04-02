/**
 * Analytics event system — Firebase-ready abstraction.
 * All events flow through `trackEvent()`. When Firebase is integrated,
 * replace the `dispatch` function body with `firebase.analytics().logEvent(...)`.
 */

export type AnalyticsEvent =
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'workout_started'
  | 'workout_completed'
  | 'premium_clicked'
  | 'premium_purchase_started'
  | 'premium_purchased'
  | 'premium_restored'
  | 'code_redeemed'
  | 'shop_item_viewed'
  | 'shop_item_equipped'
  | 'shop_item_purchased'
  | 'level_up'
  | 'streak_updated'
  | 'paywall_shown'
  | 'paywall_dismissed'
  | 'app_opened'
  | 'paywall_shown'
  | 'paywall_cta_clicked'
  | 'paywall_started_trial'
  | 'paywall_purchase_started'
  | 'paywall_dismissed'
  | 'premium_shop_item_unlocked'
  | 'shop_item_purchased'
  | 'paywall_restore_started'

type EventParams = Record<string, string | number | boolean | undefined>;

const EVENT_LOG_KEY = 'gymrat-analytics-log';
const MAX_LOCAL_EVENTS = 500;

interface StoredEvent {
  event: AnalyticsEvent;
  params?: EventParams;
  timestamp: string;
}

/**
 * Core dispatch — currently logs to localStorage queue.
 * Replace this body with your analytics SDK call (Firebase, Amplitude, etc.)
 */
function dispatch(event: AnalyticsEvent, params?: EventParams): void {
  // Console log in dev
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${event}`, params ?? '');
  }

  // Store locally for later batch upload
  try {
    const raw = localStorage.getItem(EVENT_LOG_KEY);
    const log: StoredEvent[] = raw ? JSON.parse(raw) : [];
    log.push({ event, params, timestamp: new Date().toISOString() });
    // Keep bounded
    if (log.length > MAX_LOCAL_EVENTS) log.splice(0, log.length - MAX_LOCAL_EVENTS);
    localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(log));
  } catch {
    // Storage full — silently drop
  }
}

/** Track an analytics event */
export function trackEvent(event: AnalyticsEvent, params?: EventParams): void {
  dispatch(event, params);
}

/** Get locally stored events (for future batch upload) */
export function getStoredEvents(): StoredEvent[] {
  try {
    const raw = localStorage.getItem(EVENT_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Clear locally stored events after successful upload */
export function clearStoredEvents(): void {
  localStorage.removeItem(EVENT_LOG_KEY);
}
