export type RootPage =
  | 'home'
  | 'daily'
  | 'workout'
  | 'complete'
  | 'gallery'
  | 'shop'
  | 'history'
  | 'nutrition'
  | 'settings';

export type OverlayPage = 'none' | 'menu' | 'paywall';

export type AppStoreState = {
  page: RootPage;
  overlay: OverlayPage;
  showDailyCheckIn: boolean;
  hasSeenSplash: boolean;
  lastVisitedAt: string | null;
};

const STORAGE_KEY = 'gymrat-app-store';
const EVENT_NAME = 'gymrat-app-store-updated';

const DEFAULT_STATE: AppStoreState = {
  page: 'home',
  overlay: 'none',
  showDailyCheckIn: false,
  hasSeenSplash: true,
  lastVisitedAt: null,
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function isRootPage(value: unknown): value is RootPage {
  return (
    value === 'home' ||
    value === 'daily' ||
    value === 'workout' ||
    value === 'complete' ||
    value === 'gallery' ||
    value === 'shop' ||
    value === 'history' ||
    value === 'nutrition' ||
    value === 'settings'
  );
}

function isOverlayPage(value: unknown): value is OverlayPage {
  return value === 'none' || value === 'menu' || value === 'paywall';
}

function sanitizeState(input: Partial<AppStoreState> | null | undefined): AppStoreState {
  return {
    page: isRootPage(input?.page) ? input.page : DEFAULT_STATE.page,
    overlay: isOverlayPage(input?.overlay) ? input.overlay : DEFAULT_STATE.overlay,
    showDailyCheckIn:
      typeof input?.showDailyCheckIn === 'boolean'
        ? input.showDailyCheckIn
        : DEFAULT_STATE.showDailyCheckIn,
    hasSeenSplash:
      typeof input?.hasSeenSplash === 'boolean'
        ? input.hasSeenSplash
        : DEFAULT_STATE.hasSeenSplash,
    lastVisitedAt:
      typeof input?.lastVisitedAt === 'string' && input.lastVisitedAt.trim().length > 0
        ? input.lastVisitedAt
        : null,
  };
}

export function getAppState(): AppStoreState {
  if (!isBrowser()) {
    return DEFAULT_STATE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(raw) as Partial<AppStoreState>;
    return sanitizeState(parsed);
  } catch {
    return DEFAULT_STATE;
  }
}

export function setAppState(next: Partial<AppStoreState>): AppStoreState {
  const merged = sanitizeState({
    ...getAppState(),
    ...next,
    lastVisitedAt: new Date().toISOString(),
  });

  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: merged }));
  }

  return merged;
}

export function updatePage(page: RootPage): AppStoreState {
  return setAppState({ page });
}

export function openOverlay(overlay: Exclude<OverlayPage, 'none'>): AppStoreState {
  return setAppState({ overlay });
}

export function closeOverlay(): AppStoreState {
  return setAppState({ overlay: 'none' });
}

export function setShowDailyCheckIn(showDailyCheckIn: boolean): AppStoreState {
  return setAppState({ showDailyCheckIn });
}

export function markSplashSeen(): AppStoreState {
  return setAppState({ hasSeenSplash: true });
}

export function resetAppState(): AppStoreState {
  if (isBrowser()) {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: DEFAULT_STATE }));
  }

  return DEFAULT_STATE;
}

export function subscribeAppState(listener: (state: AppStoreState) => void): () => void {
  if (!isBrowser()) {
    return () => undefined;
  }

  const emit = () => listener(getAppState());

  const onCustomUpdate = () => emit();
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === STORAGE_KEY) {
      emit();
    }
  };

  window.addEventListener(EVENT_NAME, onCustomUpdate as EventListener);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(EVENT_NAME, onCustomUpdate as EventListener);
    window.removeEventListener('storage', onStorage);
  };
}