export type NutritionGoal = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type NutritionEntry = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string;
};

type NutritionState = {
  goal: NutritionGoal;
  entries: NutritionEntry[];
};

const STORAGE_KEY = 'gymrat-nutrition-state';
const EVENT_NAME = 'nutrition-updated';

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function defaultGoal(): NutritionGoal {
  return {
    calories: 2200,
    protein: 180,
    carbs: 220,
    fat: 70,
  };
}

function defaultState(): NutritionState {
  return {
    goal: defaultGoal(),
    entries: [],
  };
}

function sanitizeGoal(value: unknown): NutritionGoal {
  if (!value || typeof value !== 'object') {
    return defaultGoal();
  }

  const raw = value as Partial<NutritionGoal>;

  return {
    calories: Number.isFinite(Number(raw.calories)) ? Math.max(0, Math.round(Number(raw.calories))) : 2200,
    protein: Number.isFinite(Number(raw.protein)) ? Math.max(0, Math.round(Number(raw.protein))) : 180,
    carbs: Number.isFinite(Number(raw.carbs)) ? Math.max(0, Math.round(Number(raw.carbs))) : 220,
    fat: Number.isFinite(Number(raw.fat)) ? Math.max(0, Math.round(Number(raw.fat))) : 70,
  };
}

function sanitizeEntry(value: unknown): NutritionEntry | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Partial<NutritionEntry>;
  if (typeof raw.name !== 'string' || raw.name.trim().length === 0) return null;

  return {
    id:
      typeof raw.id === 'string' && raw.id.trim().length > 0
        ? raw.id
        : `nutrition-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: raw.name.trim(),
    calories: Number.isFinite(Number(raw.calories)) ? Math.max(0, Number(raw.calories)) : 0,
    protein: Number.isFinite(Number(raw.protein)) ? Math.max(0, Number(raw.protein)) : 0,
    carbs: Number.isFinite(Number(raw.carbs)) ? Math.max(0, Number(raw.carbs)) : 0,
    fat: Number.isFinite(Number(raw.fat)) ? Math.max(0, Number(raw.fat)) : 0,
    loggedAt:
      typeof raw.loggedAt === 'string' && raw.loggedAt.trim().length > 0
        ? raw.loggedAt
        : new Date().toISOString(),
  };
}

function readState(): NutritionState {
  if (!isBrowser()) return defaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();

    const parsed = JSON.parse(raw) as Partial<NutritionState>;

    return {
      goal: sanitizeGoal(parsed.goal),
      entries: Array.isArray(parsed.entries)
        ? parsed.entries.map(sanitizeEntry).filter((entry): entry is NutritionEntry => Boolean(entry))
        : [],
    };
  } catch {
    return defaultState();
  }
}

function writeState(state: NutritionState) {
  if (!isBrowser()) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: state }));
}

export function getNutritionState() {
  return readState();
}

export function getNutritionGoal() {
  return readState().goal;
}

export function setNutritionGoal(goal: Partial<NutritionGoal>) {
  const current = readState();

  const next: NutritionState = {
    ...current,
    goal: sanitizeGoal({
      ...current.goal,
      ...goal,
    }),
  };

  writeState(next);
  return next.goal;
}

export function getNutritionEntries() {
  return readState().entries;
}

export function addNutritionEntry(entry: Omit<NutritionEntry, 'id' | 'loggedAt'> & Partial<Pick<NutritionEntry, 'id' | 'loggedAt'>>) {
  const current = readState();

  const nextEntry = sanitizeEntry(entry);
  if (!nextEntry) return null;

  const next: NutritionState = {
    ...current,
    entries: [nextEntry, ...current.entries],
  };

  writeState(next);
  return nextEntry;
}

export function removeNutritionEntry(id: string) {
  const current = readState();

  const next: NutritionState = {
    ...current,
    entries: current.entries.filter((entry) => entry.id !== id),
  };

  writeState(next);
  return next.entries;
}

export function clearNutritionEntries() {
  const current = readState();

  const next: NutritionState = {
    ...current,
    entries: [],
  };

  writeState(next);
  return next.entries;
}

export function getTodayNutritionTotals() {
  const today = new Date().toISOString().slice(0, 10);

  return readState().entries
    .filter((entry) => entry.loggedAt.slice(0, 10) === today)
    .reduce(
      (totals, entry) => ({
        calories: totals.calories + entry.calories,
        protein: totals.protein + entry.protein,
        carbs: totals.carbs + entry.carbs,
        fat: totals.fat + entry.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
}

export function subscribeNutrition(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handler = () => callback();

  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}