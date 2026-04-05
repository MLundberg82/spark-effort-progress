// src/lib/streakStore.ts

import { getWorkoutHistory } from '@/lib/historyStore';

export type StreakSummary = {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  isAtRisk: boolean;
  daysSinceLastActivity: number | null;
};

const DEFAULT_ALLOWED_GAP_DAYS = 2;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffInDays(a: Date, b: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const aDay = startOfDay(a).getTime();
  const bDay = startOfDay(b).getTime();
  return Math.round((aDay - bDay) / msPerDay);
}

function getUniqueActivityDates(): Date[] {
  const history = getWorkoutHistory();

  const unique = new Set<string>();

  history.forEach((entry) => {
    const date = new Date(entry.completedAt);
    const key = startOfDay(date).toISOString();
    unique.add(key);
  });

  return Array.from(unique)
    .map((value) => new Date(value))
    .sort((a, b) => b.getTime() - a.getTime());
}

function calculateLongestStreak(
  dates: Date[],
  allowedGapDays: number
): number {
  if (dates.length === 0) return 0;
  if (dates.length === 1) return 1;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i += 1) {
    const gap = diffInDays(dates[i - 1], dates[i]);

    if (gap <= allowedGapDays) {
      current += 1;
    } else {
      current = 1;
    }

    if (current > longest) {
      longest = current;
    }
  }

  return longest;
}

function calculateCurrentStreak(
  dates: Date[],
  allowedGapDays: number
): number {
  if (dates.length === 0) return 0;

  const today = new Date();
  const lastActivity = dates[0];
  const gapFromToday = diffInDays(today, lastActivity);

  if (gapFromToday > allowedGapDays) {
    return 0;
  }

  let streak = 1;

  for (let i = 1; i < dates.length; i += 1) {
    const gap = diffInDays(dates[i - 1], dates[i]);

    if (gap <= allowedGapDays) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export function getStreakSummary(
  allowedGapDays: number = DEFAULT_ALLOWED_GAP_DAYS
): StreakSummary {
  const dates = getUniqueActivityDates();

  if (dates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      isAtRisk: false,
      daysSinceLastActivity: null,
    };
  }

  const today = new Date();
  const lastActivity = dates[0];
  const daysSinceLastActivity = diffInDays(today, lastActivity);

  const currentStreak = calculateCurrentStreak(dates, allowedGapDays);
  const longestStreak = calculateLongestStreak(dates, allowedGapDays);

  return {
    currentStreak,
    longestStreak,
    lastActivityDate: lastActivity.toISOString(),
    daysSinceLastActivity,
    isAtRisk:
      currentStreak > 0 &&
      daysSinceLastActivity >= allowedGapDays &&
      daysSinceLastActivity < allowedGapDays + 1,
  };
}

export function getCurrentStreak(): number {
  return getStreakSummary().currentStreak;
}

export function isStreakAtRisk(): boolean {
  return getStreakSummary().isAtRisk;
}