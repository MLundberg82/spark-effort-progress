const STORAGE_KEY = 'gymrat-streak-state';
const EVENT_NAME = 'streak-updated';

export type StreakState = {
  current: number;
  best: number;
  lastActivityDate: string | null;
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayDiff(a: Date, b: Date) {
  const ms = startOfDay(a).getTime() - startOfDay(b).getTime();
  return Math.round(ms / 86400000);
}

function getDefaultState(): StreakState {
  return {
    current: 0,
    best: 0,
    lastActivityDate: null,
  };
}

function readState(): StreakState {
  if (!isBrowser()) return getDefaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();

    const parsed = JSON.parse(raw) as Partial<StreakState>;

    return {
      current: typeof parsed.current === 'number' ? Math.max(0, Math.floor(parsed.current)) : 0,
      best: typeof parsed.best === 'number' ? Math.max(0, Math.floor(parsed.best)) : 0,
      lastActivityDate:
        typeof parsed.lastActivityDate === 'string' ? parsed.lastActivityDate : null,
    };
  } catch {
    return getDefaultState();
  }
}

function writeState(state: StreakState) {
  if (!isBrowser()) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: state }));
}

export function getStreakState() {
  const state = readState();

  if (!state.lastActivityDate) return state;

  const diff = dayDiff(new Date(), new Date(state.lastActivityDate));
  if (diff <= 1) return state;

  return {
    ...state,
    current: 0,
  };
}

export function logStreakActivity(date = new Date().toISOString()) {
  const current = readState();
  const now = new Date(date);

  let nextCurrent = 1;

  if (current.lastActivityDate) {
    const diff = dayDiff(now, new Date(current.lastActivityDate));

    if (diff <= 0) {
      nextCurrent = Math.max(1, current.current);
    } else if (diff === 1) {
      nextCurrent = Math.max(1, current.current + 1);
    } else {
      nextCurrent = 1;
    }
  }

  const next: StreakState = {
    current: nextCurrent,
    best: Math.max(current.best, nextCurrent),
    lastActivityDate: now.toISOString(),
  };

  writeState(next);
  return next;
}

export function resetStreak() {
  const next = getDefaultState();
  writeState(next);
  return next;
}