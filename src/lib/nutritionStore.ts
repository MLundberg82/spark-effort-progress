export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodEntry {
  id: string;
  date: string;
  mealType: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionPlannerData {
  targets: MacroTargets;
  entries: FoodEntry[];
}

const NUTRITION_STORAGE_KEY = 'fitforge-nutrition';

const defaultData: NutritionPlannerData = {
  targets: {
    calories: 2200,
    protein: 160,
    carbs: 220,
    fat: 70,
  },
  entries: [],
};

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getNutritionPlannerData(): NutritionPlannerData {
  const raw = localStorage.getItem(NUTRITION_STORAGE_KEY);
  if (!raw) return defaultData;

  try {
    const parsed = JSON.parse(raw) as NutritionPlannerData;
    return {
      targets: {
        calories: Number(parsed.targets?.calories ?? defaultData.targets.calories),
        protein: Number(parsed.targets?.protein ?? defaultData.targets.protein),
        carbs: Number(parsed.targets?.carbs ?? defaultData.targets.carbs),
        fat: Number(parsed.targets?.fat ?? defaultData.targets.fat),
      },
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    };
  } catch {
    return defaultData;
  }
}

function saveNutritionPlannerData(data: NutritionPlannerData): void {
  localStorage.setItem(NUTRITION_STORAGE_KEY, JSON.stringify(data));
}

export function saveMacroTargets(targets: MacroTargets): void {
  const data = getNutritionPlannerData();
  saveNutritionPlannerData({ ...data, targets });
}

export function addFoodEntry(entry: Omit<FoodEntry, 'id'>): void {
  const data = getNutritionPlannerData();
  const next: FoodEntry = {
    id: crypto.randomUUID(),
    ...entry,
  };

  saveNutritionPlannerData({
    ...data,
    entries: [next, ...data.entries],
  });
}

export function deleteFoodEntry(id: string): void {
  const data = getNutritionPlannerData();
  saveNutritionPlannerData({
    ...data,
    entries: data.entries.filter(entry => entry.id !== id),
  });
}

export function getFoodEntriesByDate(date: string): FoodEntry[] {
  return getNutritionPlannerData().entries.filter(entry => entry.date === date);
}
