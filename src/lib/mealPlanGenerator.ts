import { MacroTargets } from './nutritionStore';

export interface MealItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DayMealPlan {
  day: string;
  meals: { type: 'breakfast' | 'lunch' | 'dinner'; items: MealItem[] }[];
}

const mealDatabase: Record<string, MealItem[]> = {
  breakfast_high_protein: [
    { name: 'Greek Yogurt with Berries & Granola', calories: 350, protein: 25, carbs: 40, fat: 10 },
    { name: 'Egg White Omelette with Spinach', calories: 280, protein: 30, carbs: 8, fat: 12 },
    { name: 'Protein Oatmeal with Banana', calories: 420, protein: 28, carbs: 55, fat: 10 },
    { name: 'Smoked Salmon on Whole Grain Toast', calories: 340, protein: 26, carbs: 30, fat: 14 },
    { name: 'Filmjölk med Müsli & Blåbär', calories: 320, protein: 18, carbs: 42, fat: 8 },
    { name: 'Knäckebröd med Ägg & Kaviar', calories: 300, protein: 22, carbs: 28, fat: 12 },
    { name: 'Havregrynsgröt med Lingon', calories: 380, protein: 14, carbs: 58, fat: 10 },
    { name: 'Cottage Cheese Pancakes', calories: 380, protein: 32, carbs: 35, fat: 12 },
    { name: 'Turkey & Avocado Breakfast Wrap', calories: 450, protein: 28, carbs: 38, fat: 18 },
  ],
  lunch_balanced: [
    { name: 'Grilled Chicken Salad with Quinoa', calories: 520, protein: 42, carbs: 40, fat: 18 },
    { name: 'Tuna Poke Bowl with Brown Rice', calories: 550, protein: 38, carbs: 55, fat: 16 },
    { name: 'Salmon Fillet with Sweet Potato', calories: 560, protein: 38, carbs: 45, fat: 22 },
    { name: 'Köttbullar med Potatismos & Lingon', calories: 580, protein: 32, carbs: 50, fat: 24 },
    { name: 'Gravlax med Hovmästarsås & Potatis', calories: 520, protein: 34, carbs: 42, fat: 20 },
    { name: 'Ärtsoppa med Pannkakor', calories: 540, protein: 30, carbs: 62, fat: 16 },
    { name: 'Chicken Breast with Pasta & Veggies', calories: 600, protein: 42, carbs: 60, fat: 16 },
    { name: 'Lean Beef Stir-Fry with Rice', calories: 580, protein: 40, carbs: 55, fat: 20 },
  ],
  dinner_recovery: [
    { name: 'Baked Cod with Roasted Vegetables', calories: 450, protein: 38, carbs: 30, fat: 18 },
    { name: 'Grilled Salmon with Asparagus', calories: 520, protein: 42, carbs: 20, fat: 28 },
    { name: 'Lean Steak with Broccoli & Rice', calories: 600, protein: 45, carbs: 40, fat: 24 },
    { name: 'Janssons Frestelse med Sallad', calories: 480, protein: 22, carbs: 45, fat: 24 },
    { name: 'Stekt Strömming med Potatispuré', calories: 520, protein: 30, carbs: 40, fat: 26 },
    { name: 'Pytt i Panna med Stekt Ägg', calories: 560, protein: 28, carbs: 48, fat: 26 },
    { name: 'Turkey Meatballs with Zucchini Noodles', calories: 460, protein: 38, carbs: 25, fat: 22 },
    { name: 'Chicken Curry with Basmati Rice', calories: 580, protein: 36, carbs: 60, fat: 18 },
  ],
};

const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export function generateWeeklyMealPlan(targets: MacroTargets): DayMealPlan[] {
  const plan: DayMealPlan[] = [];

  for (let d = 0; d < 7; d++) {
    const breakfastIdx = d % mealDatabase.breakfast_high_protein.length;
    const lunchIdx = d % mealDatabase.lunch_balanced.length;
    const dinnerIdx = d % mealDatabase.dinner_recovery.length;

    const bf = { ...mealDatabase.breakfast_high_protein[breakfastIdx] };
    const lu = { ...mealDatabase.lunch_balanced[lunchIdx] };
    const di = { ...mealDatabase.dinner_recovery[dinnerIdx] };

    const totalRaw = bf.calories + lu.calories + di.calories;
    const scale = targets.calories > 0 ? targets.calories / totalRaw : 1;

    const scaleMeal = (m: MealItem): MealItem => ({
      ...m,
      calories: Math.round(m.calories * scale),
      protein: Math.round(m.protein * scale),
      carbs: Math.round(m.carbs * scale),
      fat: Math.round(m.fat * scale),
    });

    plan.push({
      day: dayKeys[d],
      meals: [
        { type: 'breakfast', items: [scaleMeal(bf)] },
        { type: 'lunch', items: [scaleMeal(lu)] },
        { type: 'dinner', items: [scaleMeal(di)] },
      ],
    });
  }

  return plan;
}
