import { checkPremium } from '@/lib/premiumStore';

export type ActivityKind = 'strength' | 'walk';

export type XPBreakdown = {
  baseXP: number;
  volumeXP: number;
  consistencyXP: number;
  premiumBoostXP: number;
  totalXP: number;
  activityXP: number;
  firstWorkoutXP: number;
  prXP: number;
  durationXP: number;
};

export type WorkoutXPInput = {
  exercisesCompleted: number;
  volume: number;
  streak?: number;
};

export type CompletedActivityXPInput = {
  kind: ActivityKind;
  exercisesCompleted: number;
  volume: number;
  durationMinutes: number;
  streak: number;
  prCount?: number;
  completedAt?: string;
};

export type ProgressionResult = {
  breakdown: XPBreakdown;
  previousXP: number;
  newXP: number;
  previousLevel: number;
  newLevel: number;
  streak: number;
  totalWorkouts: number;
  leveledUp: boolean;
  levelsGained: number;
  milestoneUnlocked: boolean;
  unlockedMilestoneLevel: number | null;
  firstWorkoutOfDay: boolean;
};

const STORAGE_KEY = 'gymrat-gamification';

type GamificationState = {
  totalXP: number;
  totalWorkouts: number;
  streak: number;
  lastWorkoutDate: string | null;
};

const MILESTONE_LEVELS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100] as const;

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

  if (safeLevel === 1) return 50;
  if (safeLevel === 2) return 65;
  if (safeLevel === 3) return 80;
  if (safeLevel === 4) return 95;
  if (safeLevel <= 14) return 110 + (safeLevel - 5) * 15;
  if (safeLevel <= 29) return 260 + (safeLevel - 15) * 20;
  return 560 + (safeLevel - 30) * 25;
}

function getHighestMilestoneBetween(previousLevel: number, newLevel: number) {
  const crossed = MILESTONE_LEVELS.filter(
    (level) => level > previousLevel && level <= newLevel,
  );

  return crossed.length > 0 ? crossed[crossed.length - 1] : null;
}

function wasFirstWorkoutToday(lastWorkoutDate: string | null, completedAt: Date) {
  if (!lastWorkoutDate) return true;
  const diff = dayDiff(completedAt, new Date(lastWorkoutDate));
  return diff > 0;
}

export function getMilestoneLevels() {
  return [...MILESTONE_LEVELS];
}

export function isMilestoneLevel(level: number) {
  return MILESTONE_LEVELS.includes(level as (typeof MILESTONE_LEVELS)[number]);
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

export function calculateCompletedActivityXP(
  input: CompletedActivityXPInput,
  options?: {
    firstWorkoutOfDay?: boolean;
  },
): XPBreakdown {
  const isWalk = input.kind === 'walk';
  const prCount = Math.max(0, Math.floor(input.prCount ?? 0));
  const currentStreak = Math.max(1, Math.floor(input.streak));
  const baseXP = isWalk ? 20 : 40;
  const activityXP =
    !isWalk && input.exercisesCompleted >= 5
      ? 10
      : !isWalk && input.exercisesCompleted >= 3
        ? 5
        : 0;
  const volumeXP = !isWalk ? Math.max(0, Math.floor(input.volume / 1200) * 5) : 0;
  const durationXP =
    input.durationMinutes >= 45
      ? 10
      : input.durationMinutes >= 30
        ? 5
        : 0;
  const firstWorkoutXP = options?.firstWorkoutOfDay ?? true ? 10 : 0;
  const consistencyXP = Math.min(20, currentStreak * 2);
  const prXP = prCount * 25;

  const subtotal =
    baseXP +
    activityXP +
    volumeXP +
    durationXP +
    firstWorkoutXP +
    consistencyXP +
    prXP;

  const premiumBoostXP = isPremium() ? Math.floor(subtotal * 0.15) : 0;
  const totalXP = subtotal + premiumBoostXP;

  return {
    baseXP,
    volumeXP,
    consistencyXP,
    premiumBoostXP,
    totalXP,
    activityXP,
    firstWorkoutXP,
    prXP,
    durationXP,
  };
}

export function calculateWorkoutXP(input: WorkoutXPInput): XPBreakdown {
  return calculateCompletedActivityXP({
    kind: 'strength',
    exercisesCompleted: input.exercisesCompleted,
    volume: input.volume,
    durationMinutes: 0,
    streak: input.streak ?? getStreak(),
    prCount: 0,
  });
}

export function addCompletedActivityXP(
  input: CompletedActivityXPInput,
): ProgressionResult {
  const state = readState();
  const completedAt = input.completedAt ? new Date(input.completedAt) : new Date();
  const firstWorkoutOfDay = wasFirstWorkoutToday(state.lastWorkoutDate, completedAt);
  const breakdown = calculateCompletedActivityXP(input, { firstWorkoutOfDay });

  const previousXP = state.totalXP;
  const newXP = previousXP + breakdown.totalXP;
  const previousLevel = getLevelFromXP(previousXP);
  const newLevel = getLevelFromXP(newXP);
  const unlockedMilestoneLevel = getHighestMilestoneBetween(previousLevel, newLevel);

  const next: GamificationState = {
    totalXP: newXP,
    totalWorkouts: state.totalWorkouts + 1,
    streak: Math.max(1, Math.floor(input.streak)),
    lastWorkoutDate: completedAt.toISOString(),
  };

  writeState(next);

  return {
    breakdown,
    previousXP,
    newXP,
    previousLevel,
    newLevel,
    streak: next.streak,
    totalWorkouts: next.totalWorkouts,
    leveledUp: newLevel > previousLevel,
    levelsGained: Math.max(0, newLevel - previousLevel),
    milestoneUnlocked: unlockedMilestoneLevel !== null,
    unlockedMilestoneLevel,
    firstWorkoutOfDay,
  };
}

export function addWorkoutXP(input: WorkoutXPInput) {
  return addCompletedActivityXP({
    kind: 'strength',
    exercisesCompleted: input.exercisesCompleted,
    volume: input.volume,
    durationMinutes: 0,
    streak: input.streak ?? getStreak(),
    prCount: 0,
  });
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
