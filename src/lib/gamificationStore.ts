import { checkPremium } from '@/lib/premiumStore';

export type XPBreakdown = {
  baseXP: number;
  volumeXP: number;
  consistencyXP: number;
  premiumBoostXP: number;
  totalXP: number;
};

export type WorkoutXPInput = {
  exercisesCompleted: number;
  volume: number;
  streak?: number;
};

const STORAGE_KEY = 'gymrat-gamification';

type GamificationState = {
  totalXP: number;
  totalWorkouts: number;
  streak: number;
  lastWorkoutDate: string | null;
};

function getDefaultState(): GamificationState {
  return {
    totalXP: 0,
    totalWorkouts: 0,
    streak: 0,
    lastWorkoutDate: null,
  };
}

function readState(): GamificationState {
  if (typeof window === 'undefined') return getDefaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();

    const parsed = JSON.parse(raw) as Partial<GamificationState>;

    return {
      totalXP: typeof parsed.totalXP === 'number' ? parsed.totalXP : 0,
      totalWorkouts:
        typeof parsed.totalWorkouts === 'number' ? parsed.totalWorkouts : 0,
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      lastWorkoutDate:
        typeof parsed.lastWorkoutDate === 'string'
          ? parsed.lastWorkoutDate
          : null,
    };
  } catch {
    return getDefaultState();
  }
}

function writeState(next: GamificationState) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(
    new CustomEvent('gamification-updated', {
      detail: next,
    })
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayDiff(a: Date, b: Date) {
  const ms = startOfDay(a).getTime() - startOfDay(b).getTime();
  return Math.round(ms / 86400000);
}

function getXPSpanForLevel(level: number) {
  const safeLevel = Math.max(1, Math.floor(level));

  return Math.floor(
    250 +
      (safeLevel - 1) * 18 +
      Math.max(0, safeLevel - 10) * 6 +
      Math.max(0, safeLevel - 25) * 8
  );
}

export function getTotalXP() {
  return readState().totalXP;
}

export function getTotalWorkouts() {
  return readState().totalWorkouts;
}

export function getStreak() {
  const state = readState();
  if (!state.lastWorkoutDate) return state.streak;

  const now = new Date();
  const last = new Date(state.lastWorkoutDate);
  const diff = dayDiff(now, last);

  if (diff <= 1) return state.streak;
  return 0;
}

export function getLevelFromXP(xp: number) {
  if (xp <= 0) return 1;

  let remaining = Math.floor(xp);
  let level = 1;

  while (remaining >= getXPSpanForLevel(level)) {
    remaining -= getXPSpanForLevel(level);
    level += 1;
  }

  return level;
}

export function getXPForLevel(level: number) {
  const safeLevel = Math.max(1, Math.floor(level));

  if (safeLevel <= 1) return 0;

  let total = 0;

  for (let current = 1; current < safeLevel; current += 1) {
    total += getXPSpanForLevel(current);
  }

  return total;
}

export function getCurrentLevelXP(xp: number) {
  const level = getLevelFromXP(xp);
  const levelStart = getXPForLevel(level);
  return Math.max(0, xp - levelStart);
}

export function getNextLevelXP(xp: number) {
  const level = getLevelFromXP(xp);
  return getXPSpanForLevel(level);
}

export function getProgressPercent(xp: number) {
  const nextLevelXP = getNextLevelXP(xp);
  const currentLevelXP = getCurrentLevelXP(xp);

  if (nextLevelXP <= 0) return 0;

  return Math.max(0, Math.min(100, (currentLevelXP / nextLevelXP) * 100));
}

export function getRatTier(levelOrXP: number) {
  const level = levelOrXP > 100 ? getLevelFromXP(levelOrXP) : levelOrXP;

  if (level >= 100) return 'mythic';
  if (level >= 80) return 'king';
  if (level >= 60) return 'legend';
  if (level >= 40) return 'elite';
  if (level >= 25) return 'alpha';
  if (level >= 15) return 'grind';
  if (level >= 5) return 'regular';
  return 'underground';
}

export function isPremium() {
  return checkPremium().isActive;
}

export function calculateWorkoutXP(input: WorkoutXPInput): XPBreakdown {
  const currentStreak = input.streak ?? getStreak();
  const baseXP = Math.max(40, input.exercisesCompleted * 18);
  const volumeXP = Math.max(0, Math.floor(input.volume / 120));
  const consistencyXP =
    currentStreak >= 30
      ? 40
      : currentStreak >= 14
        ? 25
        : currentStreak >= 7
          ? 15
          : currentStreak >= 3
            ? 8
            : 0;

  const subtotal = baseXP + volumeXP + consistencyXP;
  const premiumBoostXP = isPremium() ? Math.floor(subtotal * 0.15) : 0;
  const totalXP = subtotal + premiumBoostXP;

  return {
    baseXP,
    volumeXP,
    consistencyXP,
    premiumBoostXP,
    totalXP,
  };
}

export function addWorkoutXP(input: WorkoutXPInput) {
  const state = readState();
  const xp = calculateWorkoutXP(input);
  const now = new Date();

  let nextStreak = 1;

  if (state.lastWorkoutDate) {
    const last = new Date(state.lastWorkoutDate);
    const diff = dayDiff(now, last);

    if (diff <= 0) {
      nextStreak = state.streak || 1;
    } else if (diff === 1) {
      nextStreak = Math.max(1, state.streak + 1);
    } else {
      nextStreak = 1;
    }
  }

  const next: GamificationState = {
    totalXP: state.totalXP + xp.totalXP,
    totalWorkouts: state.totalWorkouts + 1,
    streak: nextStreak,
    lastWorkoutDate: now.toISOString(),
  };

  writeState(next);

  return {
    ...xp,
    previousXP: state.totalXP,
    newXP: next.totalXP,
    previousLevel: getLevelFromXP(state.totalXP),
    newLevel: getLevelFromXP(next.totalXP),
    streak: next.streak,
  };
}

export function addXP(amount: number) {
  const state = readState();
  const safeAmount = Math.max(0, Math.floor(amount));

  const next: GamificationState = {
    ...state,
    totalXP: state.totalXP + safeAmount,
  };

  writeState(next);

  return {
    previousXP: state.totalXP,
    newXP: next.totalXP,
    previousLevel: getLevelFromXP(state.totalXP),
    newLevel: getLevelFromXP(next.totalXP),
  };
}

export function setTotalXP(totalXP: number) {
  const state = readState();

  const next: GamificationState = {
    ...state,
    totalXP: Math.max(0, Math.floor(totalXP)),
  };

  writeState(next);
  return next;
}

export function resetGamification() {
  const next = getDefaultState();
  writeState(next);
  return next;
}