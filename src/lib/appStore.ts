export type AppPage =
  | 'home'
  | 'workout'
  | 'complete'
  | 'history'
  | 'nutrition'
  | 'shop'
  | 'settings'
  | 'daily';

export type AppStats = {
  level: number;
  totalXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
  totalWorkouts: number;
};

type UIState = {
  currentPage: AppPage;
  menuOpen: boolean;
  paywallOpen: boolean;
  xp: number;
  workoutSummary: unknown | null;
};

const KEY = 'gymrat-app-store';

const defaultState: UIState = {
  currentPage: 'home',
  menuOpen: false,
  paywallOpen: false,
  xp: 0,
  workoutSummary: null,
};

function readState(): UIState {
  if (typeof window === 'undefined') return defaultState;
  const raw = localStorage.getItem(KEY);
  if (!raw) return defaultState;

  try {
    return { ...defaultState, ...JSON.parse(raw) } as UIState;
  } catch {
    return defaultState;
  }
}

function writeState(state: UIState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getUIState() {
  return readState();
}

export function getCurrentPage(): AppPage {
  return readState().currentPage;
}

export function setCurrentPage(page: AppPage) {
  const state = readState();
  writeState({ ...state, currentPage: page });
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

export function addXP(amount: number) {
  const state = readState();
  writeState({
    ...state,
    xp: state.xp + amount,
  });
}

export function getLevelFromXP(xp: number) {
  return Math.floor(xp / 250) + 1;
}

export function getAppStats(): AppStats {
  const state = readState();
  const level = getLevelFromXP(state.xp);
  const levelStart = (level - 1) * 250;
  const nextLevelXP = 250;
  const currentLevelXP = state.xp - levelStart;
  const progressPercent = Math.min(100, (currentLevelXP / 250) * 100);

  const historyRaw = localStorage.getItem('gymrat-history-store');
  const workouts = historyRaw ? (JSON.parse(historyRaw) as unknown[]) : [];

  return {
    level,
    totalXP: state.xp,
    currentLevelXP,
    nextLevelXP,
    progressPercent,
    totalWorkouts: workouts.length,
  };
}