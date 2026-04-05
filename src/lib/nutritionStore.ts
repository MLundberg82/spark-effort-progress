import { getNutritionTargets, getProfile } from '@/lib/profileStore';

export type NutritionEntry = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  date: string;
};

const KEY = 'gymrat-nutrition-store';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function read(): NutritionEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(entries: NutritionEntry[]) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(KEY, JSON.stringify(entries));
  window.dispatchEvent(
    new CustomEvent('nutrition-updated', {
      detail: entries,
    })
  );
}

export function getNutritionHistory() {
  return read().sort((a, b) => b.date.localeCompare(a.date));
}

export function getTodayNutrition(): NutritionEntry {
  const today = getTodayKey();
  const found = read().find((entry) => entry.date === today);

  if (found) return found;

  return {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    waterMl: 0,
    date: today,
  };
}

export function saveTodayNutrition(partial: Partial<NutritionEntry>) {
  const today = getTodayKey();
  const entries = read();
  const existing = entries.find((entry) => entry.date === today);

  const next: NutritionEntry = {
    ...(existing ?? {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      waterMl: 0,
      date: today,
    }),
    ...partial,
    date: today,
  };

  const filtered = entries.filter((entry) => entry.date !== today);
  write([next, ...filtered]);
  return next;
}

export function getNutritionOverview() {
  const profile = getProfile();
  const targets = getNutritionTargets(profile);
  const today = getTodayNutrition();

  return {
    today,
    targets: {
      calories: targets.calories,
      protein: targets.protein,
      carbs: Math.round(targets.calories * 0.4 / 4),
      fat: Math.round(targets.calories * 0.25 / 9),
      waterMl: 2500,
    },
  };
}