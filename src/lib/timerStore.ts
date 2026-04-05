export type TimerPhase = 'set' | 'rest';

export type TimerSettings = {
  enabled: boolean;
  setSeconds: number;
  restSeconds: number;
};

const TIMER_SETTINGS_KEY = 'gymrat-timer-settings';

const defaultSettings: TimerSettings = {
  enabled: true,
  setSeconds: 45,
  restSeconds: 90,
};

function emitUpdate() {
  window.dispatchEvent(new CustomEvent('timer-settings-updated'));
}

export function getTimerSettings(): TimerSettings {
  try {
    const raw = localStorage.getItem(TIMER_SETTINGS_KEY);
    if (!raw) return defaultSettings;

    const parsed = JSON.parse(raw);

    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : defaultSettings.enabled,
      setSeconds:
        typeof parsed.setSeconds === 'number' && parsed.setSeconds > 0
          ? parsed.setSeconds
          : defaultSettings.setSeconds,
      restSeconds:
        typeof parsed.restSeconds === 'number' && parsed.restSeconds > 0
          ? parsed.restSeconds
          : defaultSettings.restSeconds,
    };
  } catch {
    return defaultSettings;
  }
}

export function saveTimerSettings(settings: TimerSettings) {
  localStorage.setItem(TIMER_SETTINGS_KEY, JSON.stringify(settings));
  emitUpdate();
}

export function updateSetSeconds(seconds: number) {
  const current = getTimerSettings();
  saveTimerSettings({
    ...current,
    setSeconds: Math.max(5, Math.floor(seconds)),
  });
}

export function updateRestSeconds(seconds: number) {
  const current = getTimerSettings();
  saveTimerSettings({
    ...current,
    restSeconds: Math.max(5, Math.floor(seconds)),
  });
}

export function toggleTimerEnabled() {
  const current = getTimerSettings();
  saveTimerSettings({
    ...current,
    enabled: !current.enabled,
  });
}

export function resetTimerSettings() {
  saveTimerSettings(defaultSettings);
}

export type WorkoutTimerState = {
  running: boolean;
  phase: TimerPhase;
  remainingSeconds: number;
};

const WORKOUT_TIMER_KEY = 'gymrat-workout-timer-state';

const defaultWorkoutTimerState = (): WorkoutTimerState => {
  const settings = getTimerSettings();

  return {
    running: false,
    phase: 'set',
    remainingSeconds: settings.setSeconds,
  };
};

function emitWorkoutUpdate() {
  window.dispatchEvent(new CustomEvent('workout-timer-updated'));
}

export function getWorkoutTimerState(): WorkoutTimerState {
  try {
    const raw = localStorage.getItem(WORKOUT_TIMER_KEY);
    if (!raw) return defaultWorkoutTimerState();

    const parsed = JSON.parse(raw);

    return {
      running: typeof parsed.running === 'boolean' ? parsed.running : false,
      phase: parsed.phase === 'rest' ? 'rest' : 'set',
      remainingSeconds:
        typeof parsed.remainingSeconds === 'number' && parsed.remainingSeconds >= 0
          ? parsed.remainingSeconds
          : defaultWorkoutTimerState().remainingSeconds,
    };
  } catch {
    return defaultWorkoutTimerState();
  }
}

export function saveWorkoutTimerState(state: WorkoutTimerState) {
  localStorage.setItem(WORKOUT_TIMER_KEY, JSON.stringify(state));
  emitWorkoutUpdate();
}

export function startWorkoutTimer() {
  const settings = getTimerSettings();
  const current = getWorkoutTimerState();

  if (!settings.enabled) return;

  saveWorkoutTimerState({
    ...current,
    running: true,
    remainingSeconds:
      current.remainingSeconds > 0
        ? current.remainingSeconds
        : current.phase === 'set'
        ? settings.setSeconds
        : settings.restSeconds,
  });
}

export function pauseWorkoutTimer() {
  const current = getWorkoutTimerState();
  saveWorkoutTimerState({
    ...current,
    running: false,
  });
}

export function stopWorkoutTimer() {
  const settings = getTimerSettings();
  saveWorkoutTimerState({
    running: false,
    phase: 'set',
    remainingSeconds: settings.setSeconds,
  });
}

export function tickWorkoutTimer() {
  const current = getWorkoutTimerState();
  const settings = getTimerSettings();

  if (!current.running) return current;

  if (current.remainingSeconds > 1) {
    const updated = {
      ...current,
      remainingSeconds: current.remainingSeconds - 1,
    };
    saveWorkoutTimerState(updated);
    return updated;
  }

  const nextPhase: TimerPhase = current.phase === 'set' ? 'rest' : 'set';
  const nextSeconds = nextPhase === 'set' ? settings.setSeconds : settings.restSeconds;

  const updated = {
    running: true,
    phase: nextPhase,
    remainingSeconds: nextSeconds,
  };

  saveWorkoutTimerState(updated);
  return updated;
}

export function resetWorkoutTimerToPhase(phase: TimerPhase = 'set') {
  const settings = getTimerSettings();

  saveWorkoutTimerState({
    running: false,
    phase,
    remainingSeconds: phase === 'set' ? settings.setSeconds : settings.restSeconds,
  });
}