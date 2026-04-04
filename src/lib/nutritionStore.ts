export type NutritionEntry = {
  id: string;
  protein: number;
  calories: number;
  createdAt: string;
};

const KEY = 'gymrat-nutrition-store';

function read(): NutritionEntry[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as NutritionEntry[];
  } catch {
    return [];
  }
}

function write(items: NutritionEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getNutritionEntries() {
  return read().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function saveNutritionEntry(entry: Omit<NutritionEntry, 'id'>) {
  const current = read();
  const next: NutritionEntry = {
    id: crypto.randomUUID(),
    ...entry,
  };
  write([next, ...current]);
}