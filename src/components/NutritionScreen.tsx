import { useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Apple,
  Beef,
  Wheat,
  Droplets,
  Target,
  CheckCircle2,
} from 'lucide-react';
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

type NutritionLog = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number;
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
  const waterLiters = Math.max(2.5, Math.round(weight * 0.035 * 10) / 10);

  return {
    calories,
    protein,
    carbs,
    fats,
    waterLiters,
  };
}

function readTodayLog(): NutritionLog {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return (
      data[getTodayKey()] ?? {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        water: 0,
      }
    );
  } catch {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      water: 0,
    };
  }
}

function saveTodayLog(log: NutritionLog) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[getTodayKey()] = log;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function TargetCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-secondary/20 p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-xl font-bold">{value}</div>
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
    <div className="rounded-2xl border border-border/40 bg-secondary/20 p-4">
      <div className="mb-2 text-sm font-semibold">{label}</div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="h-11 w-full rounded-xl border border-border bg-background/70 px-3 outline-none"
        />
        <div className="min-w-[42px] text-sm text-muted-foreground">{suffix}</div>
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
  const safeTarget = Math.max(1, target);
  const progress = Math.max(0, Math.min(100, (value / safeTarget) * 100));

  return (
    <div className="rounded-2xl border border-border/40 bg-secondary/20 p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {value} / {target}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-background/80">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function NutritionScreen({ onBack }: Props) {
  const targets = useMemo(() => getTargets(), []);
  const initial = useMemo(() => readTodayLog(), []);

  const [calories, setCalories] = useState(initial.calories);
  const [protein, setProtein] = useState(initial.protein);
  const [carbs, setCarbs] = useState(initial.carbs);
  const [fats, setFats] = useState(initial.fats);
  const [water, setWater] = useState(initial.water);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveTodayLog({ calories, protein, carbs, fats, water });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-4 text-foreground">
      <div className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 rounded-2xl border border-border/50 bg-secondary/30 px-4 py-2 text-sm font-medium"
        >
          <span className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </span>
        </button>

        <div className="rounded-3xl border border-border/40 bg-card/70 p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Food
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Daily macros and hydration
          </h1>

          <div className="mt-5">
            <h2 className="text-lg font-bold">Your daily targets</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <TargetCard
                label="Calories"
                value={`${targets.calories} kcal`}
                icon={<Target className="h-4 w-4" />}
              />
              <TargetCard
                label="Protein"
                value={`${targets.protein} g`}
                icon={<Beef className="h-4 w-4" />}
              />
              <TargetCard
                label="Carbs"
                value={`${targets.carbs} g`}
                icon={<Wheat className="h-4 w-4" />}
              />
              <TargetCard
                label="Water"
                value={`${targets.waterLiters} L`}
                icon={<Droplets className="h-4 w-4" />}
              />
            </div>
          </div>

          <div className="mt-5">
            <h2 className="text-lg font-bold">Today's intake</h2>
            <div className="mt-3 space-y-3">
              <StatInput
                label="Calories"
                value={calories}
                onChange={setCalories}
                suffix="kcal"
              />
              <StatInput
                label="Protein"
                value={protein}
                onChange={setProtein}
                suffix="g"
              />
              <StatInput
                label="Carbs"
                value={carbs}
                onChange={setCarbs}
                suffix="g"
              />
              <StatInput
                label="Fats"
                value={fats}
                onChange={setFats}
                suffix="g"
              />
              <StatInput
                label="Water"
                value={water}
                onChange={setWater}
                suffix="L"
                step={0.1}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="mt-5 h-12 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-md"
          >
            Save Nutrition
          </button>

          {saved && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Saved for today
            </div>
          )}

          <div className="mt-5">
            <h3 className="mb-3 text-base font-bold">Progress today</h3>
            <div className="space-y-3">
              <ProgressRow label="Calories" value={calories} target={targets.calories} />
              <ProgressRow label="Protein" value={protein} target={targets.protein} />
              <ProgressRow label="Carbs" value={carbs} target={targets.carbs} />
              <ProgressRow label="Fats" value={fats} target={targets.fats} />
              <ProgressRow
                label="Water"
                value={Math.round(water * 10)}
                target={Math.round(targets.waterLiters * 10)}
              />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border/40 bg-secondary/20 p-4 text-sm text-muted-foreground">
            Macro targets are based on the onboarding profile you entered earlier.
          </div>
        </div>
      </div>
    </div>
  );
}