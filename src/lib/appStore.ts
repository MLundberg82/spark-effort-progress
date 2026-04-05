export type AppPage =
  | 'home'
  | 'workout'
  | 'complete'
  | 'history'
  | 'nutrition'
  | 'shop'
  | 'settings'
  | 'daily'
  | 'gallery';

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
    return {
      ...defaultState,
      ...JSON.parse(raw),
    } as UIState;
  } catch {
    return defaultState;
  }
}

function writeState(state: UIState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('gymrat:app-state-updated'));
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

export function getWorkoutSummary() {
  return readState().workoutSummary;
}

export function addXP(amount: number) {
  const state = readState();
  writeState({
    ...state,
    xp: Math.max(0, state.xp + Math.max(0, amount)),
  });
}

export function setXP(xp: number) {
  const state = readState();
  writeState({
    ...state,
    xp: Math.max(0, xp),
  });
}

export function getXP() {
  return readState().xp;
}

export function getLevelFromXP(xp: number) {
  return Math.floor(Math.max(0, xp) / 250) + 1;
}

export function getLevelProgress(xp: number) {
  const safeXP = Math.max(0, xp);
  const level = getLevelFromXP(safeXP);
  const levelStartXP = (level - 1) * 250;
  const currentLevelXP = safeXP - levelStartXP;
  const nextLevelXP = 250;
  const progressPercent = Math.min(100, (currentLevelXP / nextLevelXP) * 100);

  return {
    level,
    currentLevelXP,
    nextLevelXP,
    progressPercent,
  };
}

export function getAppStats(): AppStats {
  const state = readState();
  const progress = getLevelProgress(state.xp);

  let totalWorkouts = 0;

  if (typeof window !== 'undefined') {
    try {
      const historyRaw = localStorage.getItem('gymrat-history-store');
      const workouts = historyRaw ? (JSON.parse(historyRaw) as unknown[]) : [];
      totalWorkouts = Array.isArray(workouts) ? workouts.length : 0;
    } catch {
      totalWorkouts = 0;
    }
  }

  return {
    level: progress.level,
    totalXP: state.xp,
    currentLevelXP: progress.currentLevelXP,
    nextLevelXP: progress.nextLevelXP,
    progressPercent: progress.progressPercent,
    totalWorkouts,
  };
}

export function resetAppUIState() {
  writeState(defaultState);
}

export function subscribeAppState(listener: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = () => listener();
  window.addEventListener('gymrat:app-state-updated', handler);

  return () => {
    window.removeEventListener('gymrat:app-state-updated', handler);
  };
}