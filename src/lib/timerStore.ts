export type TimerSettings = {
  enabled: boolean;
  setSeconds: number;
  restSeconds: number;
};

const KEY = 'gymrat-timer-settings';

const DEFAULT_SETTINGS: TimerSettings = {
  enabled: true,
  setSeconds: 45,
  restSeconds: 90,
};

function sanitize(input: Partial<TimerSettings> | null | undefined): TimerSettings {
  const setSeconds = Number(input?.setSeconds);
  const restSeconds = Number(input?.restSeconds);

  return {
    enabled: input?.enabled !== false,
    setSeconds: Number.isFinite(setSeconds) ? Math.max(5, Math.min(600, Math.floor(setSeconds))) : DEFAULT_SETTINGS.setSeconds,
    restSeconds: Number.isFinite(restSeconds) ? Math.max(5, Math.min(600, Math.floor(restSeconds))) : DEFAULT_SETTINGS.restSeconds,
  };
}

export function getTimerSettings(): TimerSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return sanitize(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveTimerSettings(settings: Partial<TimerSettings>) {
  if (typeof window === 'undefined') return;

  const current = getTimerSettings();
  const next = sanitize({ ...current, ...settings });

  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('timer-settings-updated', { detail: next }));
}

export function resetTimerSettings() {
  if (typeof window === 'undefined') return;

  localStorage.setItem(KEY, JSON.stringify(DEFAULT_SETTINGS));
  window.dispatchEvent(new CustomEvent('timer-settings-updated', { detail: DEFAULT_SETTINGS }));
}