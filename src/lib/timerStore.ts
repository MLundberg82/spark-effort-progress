export type TimerPhase = 'set' | 'rest';

export type TimerSettings = {
  enabled: boolean;
  setSeconds: number;
  restSeconds: number;
  autoLoop: boolean;
  autoStartWorkout: boolean;
};

export type WorkoutTimerState = {
  running: boolean;
  phase: TimerPhase;
  remainingSeconds: number;
  startedAt: number | null;
  lastTickAt: number | null;
};

const SETTINGS_KEY = 'gymrat-timer-settings';
const LEGACY_REST_KEY = 'gymrat-rest-timer-seconds';
const LEGACY_SET_KEY = 'gymrat-set-timer-seconds';
const LEGACY_LOOP_KEY = 'gymrat-timer-auto-loop';

const STATE_KEY = 'gymrat-workout-timer-state';

const SETTINGS_EVENT = 'timer-settings-updated';
const STATE_EVENT = 'workout-timer-updated';

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function clampSeconds(value: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(5, Math.min(60 * 60, Math.round(value)));
}

function defaultSettings(): TimerSettings {
  return {
    enabled: true,
    setSeconds: 45,
    restSeconds: 90,
    autoLoop: true,
    autoStartWorkout: false,
  };
}

function defaultState(settings = getTimerSettings()): WorkoutTimerState {
  return {
    running: false,
    phase: 'set',
    remainingSeconds: settings.setSeconds,
    startedAt: null,
    lastTickAt: null,
  };
}

function readLegacySettings(): Partial<TimerSettings> {
  if (!isBrowser()) return {};

  const restRaw = localStorage.getItem(LEGACY_REST_KEY);
  const setRaw = localStorage.getItem(LEGACY_SET_KEY);
  const loopRaw = localStorage.getItem(LEGACY_LOOP_KEY);

  return {
    restSeconds:
      restRaw !== null ? clampSeconds(Number(restRaw), defaultSettings().restSeconds) : undefined,
    setSeconds:
      setRaw !== null ? clampSeconds(Number(setRaw), defaultSettings().setSeconds) : undefined,
    autoLoop:
      loopRaw === 'true' ? true : loopRaw === 'false' ? false : undefined,
  };
}

function sanitizeSettings(value: unknown): TimerSettings {
  const base = defaultSettings();

  if (!value || typeof value !== 'object') {
    return {
      ...base,
      ...readLegacySettings(),
    };
  }

  const raw = value as Partial<TimerSettings>;
  const legacy = readLegacySettings();

  return {
    enabled: typeof raw.enabled === 'boolean' ? raw.enabled : base.enabled,
    setSeconds: clampSeconds(
      Number(raw.setSeconds ?? legacy.setSeconds),
      base.setSeconds,
    ),
    restSeconds: clampSeconds(
      Number(raw.restSeconds ?? legacy.restSeconds),
      base.restSeconds,
    ),
    autoLoop:
      typeof raw.autoLoop === 'boolean'
        ? raw.autoLoop
        : typeof legacy.autoLoop === 'boolean'
        ? legacy.autoLoop
        : base.autoLoop,
    autoStartWorkout: false,
  };
}

function sanitizePhase(value: unknown): TimerPhase {
  return value === 'rest' ? 'rest' : 'set';
}

function sanitizeState(value: unknown, settings = getTimerSettings()): WorkoutTimerState {
  const base = defaultState(settings);

  if (!value || typeof value !== 'object') return base;

  const raw = value as Partial<WorkoutTimerState>;

  return {
    running: typeof raw.running === 'boolean' ? raw.running : base.running,
    phase: sanitizePhase(raw.phase),
    remainingSeconds: clampSeconds(
      Number(raw.remainingSeconds),
      raw.phase === 'rest' ? settings.restSeconds : settings.setSeconds,
    ),
    startedAt: Number.isFinite(Number(raw.startedAt)) ? Number(raw.startedAt) : null,
    lastTickAt: Number.isFinite(Number(raw.lastTickAt)) ? Number(raw.lastTickAt) : null,
  };
}

function emitSettings(settings: TimerSettings) {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: settings }));
  window.dispatchEvent(new CustomEvent('gymrat-timer-updated', { detail: settings }));
}

function emitState(state: WorkoutTimerState) {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(STATE_EVENT, { detail: state }));
}

function writeSettings(settings: TimerSettings) {
  if (!isBrowser()) return;

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  localStorage.setItem(LEGACY_REST_KEY, String(settings.restSeconds));
  localStorage.setItem(LEGACY_SET_KEY, String(settings.setSeconds));
  localStorage.setItem(LEGACY_LOOP_KEY, String(settings.autoLoop));

  emitSettings(settings);
}

function writeState(state: WorkoutTimerState) {
  if (!isBrowser()) return;

  localStorage.setItem(STATE_KEY, JSON.stringify(state));
  emitState(state);
}

export function getTimerSettings(): TimerSettings {
  if (!isBrowser()) return defaultSettings();

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return sanitizeSettings(null);
    return sanitizeSettings(JSON.parse(raw));
  } catch {
    return sanitizeSettings(null);
  }
}

export function setTimerSettings(partial: Partial<TimerSettings>) {
  const current = getTimerSettings();

  const next = sanitizeSettings({
    ...current,
    ...partial,
    autoStartWorkout: false,
  });

  writeSettings(next);

  const currentState = getWorkoutTimerState();
  if (!currentState.running) {
    const syncedState =
      currentState.phase === 'rest'
        ? { ...currentState, remainingSeconds: next.restSeconds }
        : { ...currentState, remainingSeconds: next.setSeconds };

    writeState(sanitizeState(syncedState, next));
  }

  return next;
}

export function getWorkoutTimerState(): WorkoutTimerState {
  const settings = getTimerSettings();

  if (!isBrowser()) return defaultState(settings);

  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return defaultState(settings);
    return sanitizeState(JSON.parse(raw), settings);
  } catch {
    return defaultState(settings);
  }
}

export function setWorkoutTimerState(partial: Partial<WorkoutTimerState>) {
  const settings = getTimerSettings();
  const current = getWorkoutTimerState();

  const next = sanitizeState(
    {
      ...current,
      ...partial,
    },
    settings,
  );

  writeState(next);
  return next;
}

export function resetWorkoutTimerToPhase(phase: TimerPhase) {
  const settings = getTimerSettings();

  const next: WorkoutTimerState = {
    running: false,
    phase,
    remainingSeconds: phase === 'rest' ? settings.restSeconds : settings.setSeconds,
    startedAt: null,
    lastTickAt: null,
  };

  writeState(next);
  return next;
}

export function startWorkoutTimer() {
  const current = getWorkoutTimerState();

  const next: WorkoutTimerState = {
    ...current,
    running: true,
    startedAt: current.startedAt ?? Date.now(),
    lastTickAt: Date.now(),
  };

  writeState(next);
  return next;
}

export function pauseWorkoutTimer() {
  const current = getWorkoutTimerState();

  const next: WorkoutTimerState = {
    ...current,
    running: false,
    lastTickAt: null,
  };

  writeState(next);
  return next;
}

export function stopWorkoutTimer() {
  const current = getWorkoutTimerState();
  const settings = getTimerSettings();

  const next: WorkoutTimerState = {
    running: false,
    phase: current.phase,
    remainingSeconds:
      current.phase === 'rest' ? settings.restSeconds : settings.setSeconds,
    startedAt: null,
    lastTickAt: null,
  };

  writeState(next);
  return next;
}

export function toggleWorkoutTimer() {
  const current = getWorkoutTimerState();
  return current.running ? pauseWorkoutTimer() : startWorkoutTimer();
}

export function switchWorkoutTimerPhase() {
  const current = getWorkoutTimerState();
  const nextPhase: TimerPhase = current.phase === 'set' ? 'rest' : 'set';
  return resetWorkoutTimerToPhase(nextPhase);
}

export function tickWorkoutTimer() {
  const current = getWorkoutTimerState();
  const settings = getTimerSettings();

  if (!current.running) return current;

  const now = Date.now();
  const last = current.lastTickAt ?? now;
  const elapsedSeconds = Math.max(0, Math.floor((now - last) / 1000));

  if (elapsedSeconds <= 0) return current;

  const remaining = current.remainingSeconds - elapsedSeconds;

  if (remaining > 0) {
    const next: WorkoutTimerState = {
      ...current,
      remainingSeconds: remaining,
      lastTickAt: now,
    };

    writeState(next);
    return next;
  }

  if (!settings.autoLoop) {
    const next: WorkoutTimerState = {
      ...current,
      running: false,
      remainingSeconds: 0,
      lastTickAt: now,
    };

    writeState(next);
    return next;
  }

  const nextPhase: TimerPhase = current.phase === 'set' ? 'rest' : 'set';
  const phaseSeconds = nextPhase === 'rest' ? settings.restSeconds : settings.setSeconds;

  const next: WorkoutTimerState = {
    running: true,
    phase: nextPhase,
    remainingSeconds: phaseSeconds,
    startedAt: current.startedAt ?? now,
    lastTickAt: now,
  };

  writeState(next);
  return next;
}

export function subscribeTimerSettings(callback: () => void) {
  if (!isBrowser()) return () => undefined;

  const handler = () => callback();
  window.addEventListener(SETTINGS_EVENT, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(SETTINGS_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function subscribeWorkoutTimer(callback: () => void) {
  if (!isBrowser()) return () => undefined;

  const handler = () => callback();
  window.addEventListener(STATE_EVENT, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(STATE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}