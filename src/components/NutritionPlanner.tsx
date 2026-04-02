import { useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  addFoodEntry,
  deleteFoodEntry,
  FoodEntry,
  getFoodEntriesByDate,
  getNutritionPlannerData,
  getTodayDateString,
  MealType,
  saveMacroTargets,
} from '@/lib/nutritionStore';
import { useT } from '@/lib/i18n';
import { Calculator, Trash2, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import BarcodeScanner from '@/components/BarcodeScanner';

const mealTypeOptions: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
type Goal = 'lose' | 'maintain' | 'gain';

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const activityLabels: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (office job)',
  light: 'Light (1-2x/week)',
  moderate: 'Moderate (3-5x/week)',
  active: 'Active (6-7x/week)',
  very_active: 'Very Active (2x/day)',
};

function calculateTDEE(gender: Gender, weightKg: number, heightCm: number, age: number, activity: ActivityLevel): number {
  const bmr = gender === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  return Math.round(bmr * activityMultipliers[activity]);
}

function calculateMacros(calories: number, weightKg: number, goal: Goal) {
  const proteinPerKg = goal === 'gain' ? 2.2 : goal === 'lose' ? 2.0 : 1.8;
  const protein = Math.round(weightKg * proteinPerKg);
  const fatCalories = calories * 0.25;
  const fat = Math.round(fatCalories / 9);
  const carbCalories = calories - (protein * 4) - (fat * 9);
  const carbs = Math.round(Math.max(0, carbCalories / 4));
  return { protein, fat, carbs };
}

const COLLAPSIBLE_STORAGE_KEY = 'gymrat-nutrition-collapsibles';

function getCollapsibleStates(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(COLLAPSIBLE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function setCollapsibleState(key: string, open: boolean) {
  const states = getCollapsibleStates();
  states[key] = open;
  localStorage.setItem(COLLAPSIBLE_STORAGE_KEY, JSON.stringify(states));
}

const NutritionPlanner = () => {
  const t = useT();
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [plannerVersion, setPlannerVersion] = useState(0);
  const savedStates = getCollapsibleStates();
  const [showCalc, setShowCalc] = useState(savedStates['calc'] ?? false);
  const [showTargets, setShowTargets] = useState(savedStates['targets'] ?? false);
  const [showAddFood, setShowAddFood] = useState(savedStates['addFood'] ?? false);

  const planner = useMemo(() => getNutritionPlannerData(), [plannerVersion]);
  const entriesForSelectedDate = useMemo(
    () => getFoodEntriesByDate(selectedDate),
    [plannerVersion, selectedDate]
  );

  const [targetDraft, setTargetDraft] = useState(planner.targets);
  const [entryDraft, setEntryDraft] = useState({
    mealType: 'breakfast' as MealType,
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  const [calcGender, setCalcGender] = useState<Gender>('male');
  const [calcAge, setCalcAge] = useState(25);
  const [calcWeight, setCalcWeight] = useState(80);
  const [calcHeight, setCalcHeight] = useState(178);
  const [calcActivity, setCalcActivity] = useState<ActivityLevel>('moderate');
  const [calcGoal, setCalcGoal] = useState<Goal>('maintain');
  const [calcResult, setCalcResult] = useState<{ calories: number; protein: number; carbs: number; fat: number } | null>(null);

  const [servingAmount, setServingAmount] = useState('');

  const totals = entriesForSelectedDate.reduce(
    (acc, entry) => {
      acc.calories += entry.calories;
      acc.protein += entry.protein;
      acc.carbs += entry.carbs;
      acc.fat += entry.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleSaveTargets = () => {
    saveMacroTargets({
      calories: Math.max(0, Number(targetDraft.calories) || 0),
      protein: Math.max(0, Number(targetDraft.protein) || 0),
      carbs: Math.max(0, Number(targetDraft.carbs) || 0),
      fat: Math.max(0, Number(targetDraft.fat) || 0),
    });
    setPlannerVersion(v => v + 1);
  };

  const handleAddFood = () => {
    if (!entryDraft.name.trim()) return;
    addFoodEntry({
      date: selectedDate,
      mealType: entryDraft.mealType,
      name: entryDraft.name.trim(),
      calories: Math.max(0, Number(entryDraft.calories) || 0),
      protein: Math.max(0, Number(entryDraft.protein) || 0),
      carbs: Math.max(0, Number(entryDraft.carbs) || 0),
      fat: Math.max(0, Number(entryDraft.fat) || 0),
    });
    setEntryDraft(prev => ({ ...prev, name: '', calories: '', protein: '', carbs: '', fat: '' }));
    setPlannerVersion(v => v + 1);
  };

  const handleCalculate = () => {
    const goalCalorieOffset = calcGoal === 'lose' ? -500 : calcGoal === 'gain' ? 300 : 0;
    const tdee = calculateTDEE(calcGender, calcWeight, calcHeight, calcAge, calcActivity);
    const targetCalories = Math.max(1200, tdee + goalCalorieOffset);
    const macros = calculateMacros(targetCalories, calcWeight, calcGoal);
    setCalcResult({ calories: targetCalories, ...macros });
  };

  const handleApplyCalcResult = () => {
    if (!calcResult) return;
    setTargetDraft(calcResult);
    saveMacroTargets(calcResult);
    setPlannerVersion(v => v + 1);
    setShowCalc(false);
  };

  const handleScanResult = useCallback((result: { name: string; calories: number; protein: number; carbs: number; fat: number; servingSize: string }) => {
    setServingAmount('');
    setEntryDraft(prev => ({
      ...prev,
      name: result.name,
      calories: String(result.calories),
      protein: String(result.protein),
      carbs: String(result.carbs),
      fat: String(result.fat),
    }));
  }, []);


  const mealTypeLabels: Record<string, string> = {
    breakfast: t('breakfast'),
    lunch: t('lunch'),
    dinner: t('dinner'),
    snack: t('snack'),
  };

  const renderProgress = (label: string, value: number, target: number, unit: string) => {
    const ratio = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="text-foreground font-medium">{value}{unit} / {target}{unit}</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden shadow-inset">
          <div className="h-full gradient-primary transition-all duration-300" style={{ width: `${ratio}%` }} />
        </div>
      </div>
    );
  };

  const handleCollapsibleChange = (key: string, setter: (v: boolean) => void) => (open: boolean) => {
    setter(open);
    setCollapsibleState(key, open);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Macro Progress — top card with date picker */}
      <div className="card-3d rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-foreground">{t('macroProgress')}</h3>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto text-center input-3d text-xs h-8"
          />
        </div>
        {renderProgress(t('calories'), totals.calories, planner.targets.calories, ' kcal')}
        {renderProgress(t('protein'), totals.protein, planner.targets.protein, 'g')}
        {renderProgress(t('carbs'), totals.carbs, planner.targets.carbs, 'g')}
        {renderProgress(t('fat'), totals.fat, planner.targets.fat, 'g')}
      </div>

      {/* Add Food - collapsible, right under macro progress */}
      <Collapsible open={showAddFood} onOpenChange={handleCollapsibleChange('addFood', setShowAddFood)}>
        <div className="card-3d rounded-2xl overflow-hidden">
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4">
            <h3 className="font-display font-semibold text-foreground">{t('addFood')}</h3>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${showAddFood ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              <select
                value={entryDraft.mealType}
                onChange={(e) => setEntryDraft(prev => ({ ...prev, mealType: e.target.value as MealType }))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground input-3d"
              >
                {mealTypeOptions.map(option => (
                  <option key={option} value={option}>{mealTypeLabels[option]}</option>
                ))}
              </select>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{t('mealName')}</label>
                <Input placeholder="e.g. Chicken bowl" value={entryDraft.name} onChange={(e) => setEntryDraft(prev => ({ ...prev, name: e.target.value }))} className="input-3d" />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{t('amount')}</label>
                <Input type="text" placeholder="e.g. 150g, 2 cups, 1 slice" value={servingAmount}
                  onChange={(e) => setServingAmount(e.target.value)} className="input-3d" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t('calories')}</label>
                  <Input type="number" min={0} placeholder="0" value={entryDraft.calories} onChange={(e) => setEntryDraft(prev => ({ ...prev, calories: e.target.value }))} className="input-3d" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t('protein')}</label>
                  <Input type="number" min={0} placeholder="0" value={entryDraft.protein} onChange={(e) => setEntryDraft(prev => ({ ...prev, protein: e.target.value }))} className="input-3d" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t('carbs')}</label>
                  <Input type="number" min={0} placeholder="0" value={entryDraft.carbs} onChange={(e) => setEntryDraft(prev => ({ ...prev, carbs: e.target.value }))} className="input-3d" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t('fat')}</label>
                  <Input type="number" min={0} placeholder="0" value={entryDraft.fat} onChange={(e) => setEntryDraft(prev => ({ ...prev, fat: e.target.value }))} className="input-3d" />
                </div>
              </div>

              <Button className="w-full gradient-primary text-primary-foreground btn-3d" onClick={handleAddFood}>{t('addToPlan')}</Button>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      

      {/* TDEE Calculator */}
      <Collapsible open={showCalc} onOpenChange={handleCollapsibleChange('calc', setShowCalc)}>
        <div className="card-3d rounded-2xl overflow-hidden">
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold text-foreground">{t('macroCalculator')}</h3>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${showCalc ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t('gender')}</label>
                  <select value={calcGender} onChange={(e) => setCalcGender(e.target.value as Gender)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground input-3d">
                    <option value="male">{t('male')}</option>
                    <option value="female">{t('female')}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t('age')}</label>
                  <Input type="number" min={10} max={100} value={calcAge} onChange={(e) => setCalcAge(Number(e.target.value))} className="input-3d" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t('weight')}</label>
                  <Input type="number" min={30} max={300} value={calcWeight} onChange={(e) => setCalcWeight(Number(e.target.value))} className="input-3d" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t('height')}</label>
                  <Input type="number" min={100} max={250} value={calcHeight} onChange={(e) => setCalcHeight(Number(e.target.value))} className="input-3d" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{t('activityLevel')}</label>
                <select value={calcActivity} onChange={(e) => setCalcActivity(e.target.value as ActivityLevel)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground input-3d">
                  {(Object.keys(activityLabels) as ActivityLevel[]).map(key => (
                    <option key={key} value={key}>{activityLabels[key]}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{t('goal')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['lose', 'maintain', 'gain'] as Goal[]).map(g => (
                    <button
                      key={g}
                      onClick={() => setCalcGoal(g)}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                        calcGoal === g ? 'gradient-primary text-primary-foreground shadow-button btn-3d' : 'bg-secondary text-secondary-foreground shadow-elevated'
                      }`}
                    >
                      {g === 'lose' ? t('loseFat') : g === 'maintain' ? t('maintain') : t('buildMuscle')}
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full gradient-primary text-primary-foreground btn-3d" onClick={handleCalculate}>{t('calculate')}</Button>

              {calcResult && (
                <div className="rounded-xl bg-secondary/50 border border-border/50 p-3 space-y-2 shadow-elevated">
                  <p className="text-sm font-semibold text-foreground text-center">{t('yourDailyTargets')}</p>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg bg-background/50 p-2 shadow-inset">
                      <p className="text-lg font-bold text-primary">{calcResult.calories}</p>
                      <p className="text-[10px] text-muted-foreground">{t('calories')}</p>
                    </div>
                    <div className="rounded-lg bg-background/50 p-2 shadow-inset">
                      <p className="text-lg font-bold text-primary">{calcResult.protein}g</p>
                      <p className="text-[10px] text-muted-foreground">{t('protein')}</p>
                    </div>
                    <div className="rounded-lg bg-background/50 p-2 shadow-inset">
                      <p className="text-lg font-bold text-primary">{calcResult.carbs}g</p>
                      <p className="text-[10px] text-muted-foreground">{t('carbs')}</p>
                    </div>
                    <div className="rounded-lg bg-background/50 p-2 shadow-inset">
                      <p className="text-lg font-bold text-primary">{calcResult.fat}g</p>
                      <p className="text-[10px] text-muted-foreground">{t('fat')}</p>
                    </div>
                  </div>
                  <Button className="w-full gradient-primary text-primary-foreground btn-3d" onClick={handleApplyCalcResult}>
                    {t('applyTargets')}
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Daily Macro Targets — collapsible */}
      <Collapsible open={showTargets} onOpenChange={handleCollapsibleChange('targets', setShowTargets)}>
        <div className="card-3d rounded-2xl overflow-hidden">
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4">
            <h3 className="font-display font-semibold text-foreground">{t('dailyTargets')}</h3>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${showTargets ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t('calories')}</label>
                  <Input type="number" min={0} placeholder="2000" value={targetDraft.calories} onChange={(e) => setTargetDraft(prev => ({ ...prev, calories: Number(e.target.value) }))} className="input-3d" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t('protein')}</label>
                  <Input type="number" min={0} placeholder="150" value={targetDraft.protein} onChange={(e) => setTargetDraft(prev => ({ ...prev, protein: Number(e.target.value) }))} className="input-3d" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t('carbs')}</label>
                  <Input type="number" min={0} placeholder="250" value={targetDraft.carbs} onChange={(e) => setTargetDraft(prev => ({ ...prev, carbs: Number(e.target.value) }))} className="input-3d" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t('fat')}</label>
                  <Input type="number" min={0} placeholder="65" value={targetDraft.fat} onChange={(e) => setTargetDraft(prev => ({ ...prev, fat: Number(e.target.value) }))} className="input-3d" />
                </div>
              </div>
              <Button className="w-full gradient-primary text-primary-foreground btn-3d" onClick={handleSaveTargets}>{t('saveTargets')}</Button>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>




      {/* Today's entries - inline list */}
      {entriesForSelectedDate.length > 0 && (
        <div className="card-3d rounded-2xl p-4 space-y-2">
          <h3 className="font-display font-semibold text-foreground text-sm">{t('todaysFood' as any) || "Today's Food"}</h3>
          {entriesForSelectedDate.map((entry: FoodEntry) => (
            <div key={entry.id} className="rounded-xl bg-secondary/50 border border-border/50 p-3 flex items-start justify-between gap-2 shadow-elevated">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground capitalize">{mealTypeLabels[entry.mealType]} · {entry.name}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.calories} kcal · P {entry.protein}g · C {entry.carbs}g · F {entry.fat}g
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  deleteFoodEntry(entry.id);
                  setPlannerVersion(v => v + 1);
                }}
                className="h-8 w-8"
                aria-label="Delete meal entry"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NutritionPlanner;
