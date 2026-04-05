const XP_PER_LEVEL = 250;
const APP_KEY = 'gymrat-app-store';
const HISTORY_KEY = 'gymrat-history-store';

type GamificationState = {
  xp: number;
};

type WorkoutHistoryEntry = {
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
  completedAt: string;
};

function readAppState(): GamificationState {
  if (typeof window === 'undefined') {
    return { xp: 0 };
  }

  try {
    const raw = localStorage.getItem(APP_KEY);
    if (!raw) return { xp: 0 };

    const parsed = JSON.parse(raw) as Partial<GamificationState>;
    return {
      xp: typeof parsed.xp === 'number' ? Math.max(0, parsed.xp) : 0,
    };
  } catch {
    return { xp: 0 };
  }
}

function writeAppState(next: GamificationState) {
  if (typeof window === 'undefined') return;

  const currentRaw = localStorage.getItem(APP_KEY);
  let current: Record<string, unknown> = {};

  try {
    current = currentRaw ? JSON.parse(currentRaw) : {};
  } catch {
    current = {};
  }

  const merged = {
    ...current,
    xp: Math.max(0, Math.round(next.xp)),
  };

  localStorage.setItem(APP_KEY, JSON.stringify(merged));
  window.dispatchEvent(
    new CustomEvent('gamification-updated', {
      detail: merged,
    })
  );
}

function readHistory(): WorkoutHistoryEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addXP(amount: number): number {
  const current = readAppState();
  const safeAmount = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  const nextXP = current.xp + safeAmount;

  writeAppState({ xp: nextXP });
  return nextXP;
}

export function setXP(amount: number) {
  writeAppState({ xp: Math.max(0, Math.round(amount)) });
}

export function getTotalXP(): number {
  return readAppState().xp;
}

export function getLevelFromXP(xp: number): number {
  const safeXP = Math.max(0, Math.floor(xp));
  return Math.floor(safeXP / XP_PER_LEVEL) + 1;
}

export function getCurrentLevelXP(xp: number): number {
  const level = getLevelFromXP(xp);
  const levelStartXP = (level - 1) * XP_PER_LEVEL;
  return Math.max(0, xp - levelStartXP);
}

export function getNextLevelXP(_xp?: number): number {
  return XP_PER_LEVEL;
}

export function getProgressPercent(xp: number): number {
  return Math.max(
    0,
    Math.min(100, Math.round((getCurrentLevelXP(xp) / XP_PER_LEVEL) * 100))
  );
}

export function getTotalWorkouts(): number {
  return readHistory().length;
}

export function getRatTier(level: number): {
  tier: string;
  label: string;
} {
  if (level >= 100) return { tier: 'mythic', label: 'Mythic' };
  if (level >= 80) return { tier: 'king', label: 'King' };
  if (level >= 60) return { tier: 'legend', label: 'Legend' };
  if (level >= 40) return { tier: 'beast', label: 'Beast' };
  if (level >= 25) return { tier: 'buff', label: 'Buff' };
  if (level >= 15) return { tier: 'strong', label: 'Strong' };
  if (level >= 8) return { tier: 'regular', label: 'Regular' };
  if (level >= 3) return { tier: 'rookie', label: 'Rookie' };
  return { tier: 'baby', label: 'Baby' };
}

export function getStreak(): number {
  const workouts = readHistory();
  if (!workouts.length) return 0;

  const uniqueDays = new Set(
    workouts
      .map((entry) => {
        if (!entry?.completedAt) return null;
        const date = new Date(entry.completedAt);
        if (Number.isNaN(date.getTime())) return null;
        return date.toISOString().slice(0, 10);
      })
      .filter(Boolean) as string[]
  );

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