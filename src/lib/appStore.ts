import {
  addXP as addGamificationXP,
  getCurrentLevelXP,
  getLevelFromXP,
  getNextLevelXP,
  getProgressPercent,
  getStreak,
  getTotalWorkouts,
  getTotalXP,
} from '@/lib/gamificationStore';

export type AppPage =
  | 'home'
  | 'workout'
  | 'complete'
  | 'history'
  | 'nutrition'
  | 'shop'
  | 'gallery'
  | 'premium'
  | 'settings'
  | 'daily';

export type AppStats = {
  level: number;
  totalXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
  totalWorkouts: number;
  streak: number;
};

type AppState = {
  currentPage: AppPage;
  menuOpen: boolean;
  paywallOpen: boolean;
  workoutSummary: unknown | null;
};

const KEY = 'gymrat-app-store';

const DEFAULT_STATE: AppState = {
  currentPage: 'home',
  menuOpen: false,
  paywallOpen: false,
  workoutSummary: null,
};

function isValidPage(value: unknown): value is AppPage {
  return [
    'home',
    'workout',
    'complete',
    'history',
    'nutrition',
    'shop',
    'gallery',
    'premium',
    'settings',
    'daily',
  ].includes(String(value));
}

function readState(): AppState {
  if (typeof window === 'undefined') return DEFAULT_STATE;

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;

    const parsed = JSON.parse(raw) as Partial<AppState>;

    return {
      ...DEFAULT_STATE,
      ...parsed,
      currentPage: isValidPage(parsed.currentPage) ? parsed.currentPage : 'home',
      menuOpen: parsed.menuOpen === true,
      paywallOpen: parsed.paywallOpen === true,
      workoutSummary: parsed.workoutSummary ?? null,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(state: AppState) {
  if (typeof window === 'undefined') return;

  const currentRaw = localStorage.getItem(KEY);
  let current: Record<string, unknown> = {};

  try {
    current = currentRaw ? JSON.parse(currentRaw) : {};
  } catch {
    current = {};
  }

  const merged = {
    ...current,
    ...state,
  };

  localStorage.setItem(KEY, JSON.stringify(merged));
  window.dispatchEvent(
    new CustomEvent('app-store-updated', {
      detail: merged,
    })
  );
}

export function getCurrentPage(): AppPage {
  return readState().currentPage;
}

export function setCurrentPage(currentPage: AppPage) {
  const state = readState();
  writeState({ ...state, currentPage });
}

export function getUIState() {
  const state = readState();
  return {
    menuOpen: state.menuOpen,
    paywallOpen: state.paywallOpen,
  };
}

export function setMenuOpen(menuOpen: boolean) {
  const state = readState();
  writeState({ ...state, menuOpen });
}

export function setPaywallOpen(paywallOpen: boolean) {
  const state = readState();
  writeState({ ...state, paywallOpen });
}

export function setWorkoutSummary(workoutSummary: unknown | null) {
  const state = readState();
  writeState({ ...state, workoutSummary });
}

export function getWorkoutSummary<T>() {
  return readState().workoutSummary as T | null;
}

export function addXP(amount: number) {
  return addGamificationXP(amount);
}

export function getAppStats(): AppStats {
  const totalXP = getTotalXP();
  const level = getLevelFromXP(totalXP);

  return {
    level,
    totalXP,
    currentLevelXP: getCurrentLevelXP(totalXP),
    nextLevelXP: getNextLevelXP(totalXP),
    progressPercent: getProgressPercent(totalXP),
    totalWorkouts: getTotalWorkouts(),
    streak: getStreak(),
  };
}

export function resetAppState() {
  writeState(DEFAULT_STATE);
}