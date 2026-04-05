const STORAGE_KEY = 'gymrat-rest-timer';
const EVENT_NAME = 'rest-timer-updated';

export type TimerState = {
  startedAt: string | null;
  durationSeconds: number;
  isRunning: boolean;
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function getDefaultState(): TimerState {
  return {
    startedAt: null,
    durationSeconds: 90,
    isRunning: false,
  };
}

function readState(): TimerState {
  if (!isBrowser()) return getDefaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();

    const parsed = JSON.parse(raw) as Partial<TimerState>;

    return {
      startedAt:
        typeof parsed.startedAt === 'string' && parsed.startedAt.length > 0
          ? parsed.startedAt
          : null,
      durationSeconds:
        typeof parsed.durationSeconds === 'number'
          ? Math.max(0, Math.floor(parsed.durationSeconds))
          : 90,
      isRunning: Boolean(parsed.isRunning),
    };
  } catch {
    return getDefaultState();
  }
}

function writeState(state: TimerState) {
  if (!isBrowser()) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: state }));
}

export function getTimerState() {
  return readState();
}

export function startTimer(durationSeconds = 90) {
  const next: TimerState = {
    startedAt: new Date().toISOString(),
    durationSeconds: Math.max(0, Math.floor(durationSeconds)),
    isRunning: true,
  };

  writeState(next);
  return next;
}

export function stopTimer() {
  const next = {
    ...readState(),
    isRunning: false,
  };

  writeState(next);
  return next;
}

export function resetTimer(durationSeconds = 90) {
  const next: TimerState = {
    startedAt: null,
    durationSeconds: Math.max(0, Math.floor(durationSeconds)),
    isRunning: false,
  };

  writeState(next);
  return next;
}

export function getSecondsRemaining() {
  const state = readState();
  if (!state.isRunning || !state.startedAt) return state.durationSeconds;

  const elapsed = Math.floor(
    (Date.now() - new Date(state.startedAt).getTime()) / 1000,
  );

  return Math.max(0, state.durationSeconds - elapsed);
}