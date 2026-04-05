export type TimerSettings = {
  enabled: boolean;
  setSeconds: number;
  restSeconds: number;
};

export type WorkoutTimerPhase = 'set' | 'rest';

export type WorkoutTimerState = {
  running: boolean;
  phase: WorkoutTimerPhase;
  remainingSeconds: number;
};

const SETTINGS_KEY = 'gymrat-timer-store';
const TIMER_KEY = 'gymrat-workout-timer-store';

const DEFAULT_SETTINGS: TimerSettings = {
  enabled: true,
  setSeconds: 45,
  restSeconds: 90,
};

const DEFAULT_TIMER_STATE: WorkoutTimerState = {
  running: false,
  phase: 'set',
  remainingSeconds: DEFAULT_SETTINGS.setSeconds,
};

function sanitizeSeconds(value: unknown, fallback: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(5, Math.min(600, Math.floor(value)));
}

function emitSettings(state: TimerSettings) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('timer-settings-updated', {
      detail: state,
    })
  );
}

function emitTimer(state: WorkoutTimerState) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('workout-timer-updated', {
      detail: state,
    })
  );
}

function readSettings(): TimerSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<TimerSettings>;

    return {
      enabled: parsed.enabled !== false,
      setSeconds: sanitizeSeconds(parsed.setSeconds, DEFAULT_SETTINGS.setSeconds),
      restSeconds: sanitizeSeconds(
        parsed.restSeconds,
        DEFAULT_SETTINGS.restSeconds
      ),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function writeSettings(next: TimerSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  emitSettings(next);
}

function getPhaseSeconds(
  phase: WorkoutTimerPhase,
  settings: TimerSettings
): number {
  return phase === 'set' ? settings.setSeconds : settings.restSeconds;
}

function readTimer(): WorkoutTimerState {
  if (typeof window === 'undefined') return DEFAULT_TIMER_STATE;

  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (!raw) {
      const settings = readSettings();
      return {
        ...DEFAULT_TIMER_STATE,
        remainingSeconds: settings.setSeconds,
      };
    }

    const parsed = JSON.parse(raw) as Partial<WorkoutTimerState>;
    const settings = readSettings();
    const phase: WorkoutTimerPhase =
      parsed.phase === 'rest' ? 'rest' : 'set';

    return {
      running: parsed.running === true,
      phase,
      remainingSeconds: sanitizeSeconds(
        parsed.remainingSeconds,
        getPhaseSeconds(phase, settings)
      ),
    };
  } catch {
    const settings = readSettings();
    return {
      ...DEFAULT_TIMER_STATE,
      remainingSeconds: settings.setSeconds,
    };
  }
}

function writeTimer(next: WorkoutTimerState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TIMER_KEY, JSON.stringify(next));
  emitTimer(next);
}

export function getTimerSettings() {
  return readSettings();
}

export function saveTimerSettings(next: TimerSettings) {
  const safe: TimerSettings = {
    enabled: next.enabled,
    setSeconds: sanitizeSeconds(next.setSeconds, DEFAULT_SETTINGS.setSeconds),
    restSeconds: sanitizeSeconds(
      next.restSeconds,
      DEFAULT_SETTINGS.restSeconds
    ),
  };

  writeSettings(safe);

  const currentTimer = readTimer();
  if (!currentTimer.running) {
    const synced: WorkoutTimerState = {
      ...currentTimer,
      remainingSeconds: getPhaseSeconds(currentTimer.phase, safe),
    };
    writeTimer(synced);
  }

  return safe;
}

export function resetTimerSettings() {
  writeSettings(DEFAULT_SETTINGS);
  writeTimer({
    running: false,
    phase: 'set',
    remainingSeconds: DEFAULT_SETTINGS.setSeconds,
  });
  return DEFAULT_SETTINGS;
}

export function getWorkoutTimerState() {
  return readTimer();
}

export function startWorkoutTimer() {
  const current = readTimer();
  const next: WorkoutTimerState = {
    ...current,
    running: true,
  };
  writeTimer(next);
  return next;
}

export function pauseWorkoutTimer() {
  const current = readTimer();
  const next: WorkoutTimerState = {
    ...current,
    running: false,
  };
  writeTimer(next);
  return next;
}

export function resetWorkoutTimerToPhase(phase: WorkoutTimerPhase) {
  const settings = readSettings();
  const next: WorkoutTimerState = {
    running: false,
    phase,
    remainingSeconds: getPhaseSeconds(phase, settings),
  };
  writeTimer(next);
  return next;
}

export function tickWorkoutTimer() {
  const current = readTimer();
  const settings = readSettings();

  if (!current.running) return current;

  if (current.remainingSeconds > 1) {
    const next: WorkoutTimerState = {
      ...current,
      remainingSeconds: current.remainingSeconds - 1,
    };
    writeTimer(next);
    return next;
  }

  const nextPhase: WorkoutTimerPhase = current.phase === 'set' ? 'rest' : 'set';
  const next: WorkoutTimerState = {
    running: true,
    phase: nextPhase,
    remainingSeconds: getPhaseSeconds(nextPhase, settings),
  };

  writeTimer(next);
  return next;
}