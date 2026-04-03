import React, { useMemo, useState } from 'react';
import { ArrowLeft, Apple, Beef, Wheat, Droplets, Target } from 'lucide-react';
import { getUserProfile } from '@/components/TrainingLevelSelector';

type Props = {
  onBack: () => void;
};

type NutritionGoal = 'lose' | 'maintain' | 'gain';

type NutritionTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  waterLiters: number;
};

const STORAGE_KEY = 'gymrat-nutrition-log';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getTargets(): NutritionTargets {
  const profile = getUserProfile();

  const weight = profile?.weight || 75;
  const goal = (profile?.goal ?? 'maintain') as NutritionGoal;

  let calories = Math.round(weight * 32);

  if (goal === 'lose') calories -= 350;
  if (goal === 'gain') calories += 250;

  const protein = Math.round(weight * 2.0);
  const fats = Math.round(weight * 0.8);
  const carbs = Math.max(100, Math.round((calories - protein * 4 - fats * 9) / 4));
  const waterLiters = Math.max(2.5, Math.round((weight * 0.035) * 10) / 10);

  return { calories, protein, carbs, fats, waterLiters };
}

function readTodayLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data[getTodayKey()] ?? { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 };
  } catch {
    return { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 };
  }
}

function saveTodayLog(log: {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number;
}) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[getTodayKey()] = log;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const NutritionScreen = ({ onBack }: Props) => {
  const targets = useMemo(() => getTargets(), []);
  const initial = useMemo(() => readTodayLog(), []);

  const [calories, setCalories] = useState(initial.calories);
  const [protein, setProtein] = useState(initial.protein);
  const [carbs, setCarbs] = useState(initial.carbs);
  const [fats, setFats] = useState(initial.fats);
  const [water, setWater] = useState(initial.water);

  const handleSave = () => {
    saveTodayLog({ calories, protein, carbs, fats, water });
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-4">
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Food</h1>
            <p className="text-xs text-muted-foreground">Daily macros and hydration</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-border/50 bg-card/60 p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4" />
              <h2 className="font-semibold">Your daily targets</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TargetCard label="Calories" value={`${targets.calories} kcal`} icon={<Apple className="h-4 w-4" />} />
              <TargetCard label="Protein" value={`${targets.protein} g`} icon={<Beef className="h-4 w-4" />} />
              <TargetCard label="Carbs" value={`${targets.carbs} g`} icon={<Wheat className="h-4 w-4" />} />
              <TargetCard label="Fats" value={`${targets.fats} g`} icon={<Apple className="h-4 w-4" />} />
              <TargetCard label="Water" value={`${targets.waterLiters} L`} icon={<Droplets className="h-4 w-4" />} />
            </div>
          </div>

          <div className="rounded-3xl border border-border/50 bg-card/60 p-4 shadow-lg space-y-4">
            <h2 className="font-semibold">Today's intake</h2>

            <StatInput label="Calories" value={calories} onChange={setCalories} suffix="kcal" />
            <StatInput label="Protein" value={protein} onChange={setProtein} suffix="g" />
            <StatInput label="Carbs" value={carbs} onChange={setCarbs} suffix="g" />
            <StatInput label="Fats" value={fats} onChange={setFats} suffix="g" />
            <StatInput label="Water" value={water} onChange={setWater} suffix="L" step={0.1} />

            <button
              onClick={handleSave}
              className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold"
            >
              Save Nutrition
            </button>
          </div>

          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-4">
            <h3 className="font-semibold mb-3">Progress today</h3>
            <ProgressRow label="Calories" value={calories} target={targets.calories} />
            <ProgressRow label="Protein" value={protein} target={targets.protein} />
            <ProgressRow label="Carbs" value={carbs} target={targets.carbs} />
            <ProgressRow label="Fats" value={fats} target={targets.fats} />
            <ProgressRow label="Water" value={water} target={targets.waterLiters} />
          </div>
        </div>
      </div>
    </div>
  );
};

function TargetCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-secondary/40 p-3">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function StatInput({
  label,
  value,
  onChange,
  suffix,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix: string;
  step?: number;
}) {
  return (
    <div className="rounded-2xl bg-secondary/40 p-3">
      <div className="text-sm font-medium mb-2">{label}</div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-11 rounded-xl border border-border bg-background/70 px-3 outline-none"
        />
        <div className="min-w-[44px] text-sm text-muted-foreground">{suffix}</div>
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  target,
}: {
  label: string;
  value: number;
  target: number;
}) {
  const progress = Math.max(0, Math.min(100, (value / target) * 100));

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between text-xs mb-1">
        <span>{label}</span>
        <span>
          {value} / {target}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default NutritionScreen;