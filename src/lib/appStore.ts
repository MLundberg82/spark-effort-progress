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
  xp: number;
};

const KEY = 'gymrat-app-store';
const XP_PER_LEVEL = 250;

const DEFAULT_STATE: AppState = {
  currentPage: 'home',
  menuOpen: false,
  paywallOpen: false,
  workoutSummary: null,
  xp: 0,
};

function readState(): AppState {
  if (typeof window === 'undefined') return DEFAULT_STATE;

  const raw = localStorage.getItem(KEY);
  if (!raw) return DEFAULT_STATE;

  try {
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      currentPage: isValidPage(parsed?.currentPage) ? parsed.currentPage : 'home',
      xp: typeof parsed?.xp === 'number' ? parsed.xp : 0,
      menuOpen: parsed?.menuOpen === true,
      paywallOpen: parsed?.paywallOpen === true,
      workoutSummary: parsed?.workoutSummary ?? null,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(state: AppState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('app-store-updated', { detail: state }));
}

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

export function getWorkoutSummary<T = unknown>() {
  return readState().workoutSummary as T | null;
}

export function addXP(amount: number) {
  const state = readState();
  writeState({
    ...state,
    xp: Math.max(0, state.xp + Math.max(0, amount)),
  });
}

export function getTotalXP() {
  return readState().xp;
}

export function getLevelFromXP(xp: number) {
  return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
}

function getHistoryEntries(): Array<{ completedAt?: string }> {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem('gymrat-history-store');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function calculateStreak(entries: Array<{ completedAt?: string }>) {
  if (!entries.length) return 0;

  const uniqueDays = new Set(
    entries
      .map((entry) => {
        if (!entry?.completedAt) return null;
        const date = new Date(entry.completedAt);
        if (Number.isNaN(date.getTime())) return null;
        return date.toISOString().slice(0, 10);
      })
      .filter(Boolean) as string[]
  );

  if (!uniqueDays.size) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (!uniqueDays.has(iso)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getAppStats(): AppStats {
  const state = readState();
  const level = getLevelFromXP(state.xp);
  const levelStartXP = (level - 1) * XP_PER_LEVEL;
  const currentLevelXP = state.xp - levelStartXP;
  const progressPercent = Math.min(100, (currentLevelXP / XP_PER_LEVEL) * 100);
  const historyEntries = getHistoryEntries();

  return {
    level,
    totalXP: state.xp,
    currentLevelXP,
    nextLevelXP: XP_PER_LEVEL,
    progressPercent,
    totalWorkouts: historyEntries.length,
    streak: calculateStreak(historyEntries),
  };
}

export function resetAppState() {
  writeState(DEFAULT_STATE);
}