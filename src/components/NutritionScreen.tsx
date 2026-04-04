import { useMemo, useState } from 'react';
import {
  Apple,
  ArrowLeft,
  Beef,
  Droplets,
  Flame,
  Sparkles,
  Target,
  Wheat,
} from 'lucide-react';
import { getUserProfile } from '@/components/TrainingLevelSelector';

type Props = {
  onBack: () => void;
  premiumActive?: boolean;
  onOpenPremium?: () => void;
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

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
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

  return { calories, protein, carbs, fats, waterLiters };
}

function readAllLogs(): Record<string, NutritionLog> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function readTodayLog(): NutritionLog {
  const all = readAllLogs();
  return (
    all[getTodayKey()] ?? {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      water: 0,
    }
  );
}

function saveTodayLog(log: NutritionLog) {
  const all = readAllLogs();
  all[getTodayKey()] = log;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function ProgressCard({
  icon: Icon,
  label,
  value,
  target,
  suffix,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  target: number;
  suffix: string;
}) {
  const progress = target > 0 ? Math.max(0, Math.min(100, (value / target) * 100)) : 0;

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Icon className="h-4 w-4 text-lime-300" />
          {label}
        </div>
        <div className="text-xs font-bold uppercase tracking-[0.15em] text-white/45">
          {Math.round(progress)}%
        </div>
      </div>

      <div className="mt-3 text-lg font-black text-white">
        {value}
        {suffix} / {target}
        {suffix}
      </div>

      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-yellow-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function NutritionInput({
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
    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
      <div className="mb-2 text-sm font-bold text-white/80">{label}</div>

      <div className="flex items-center gap-3">
        <input
          type="number"
          step={step}
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none"
        />
        <div className="text-sm font-bold text-white/55">{suffix}</div>
      </div>
    </div>
  );
}

export default function NutritionScreen({
  onBack,
  premiumActive = false,
  onOpenPremium,
}: Props) {
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
    <div className="min-h-screen bg-[#07110d] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-8 pt-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_50px_rgba(170,255,140,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-lime-300/75">
                Nutrition
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight">Fuel the rat</h1>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Daily macros and hydration built around your profile and goal.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-black/20 text-lime-200">
              <Apple className="h-7 w-7" />
            </div>
          </div>

          {!premiumActive && (
            <div className="mt-5 rounded-[26px] border border-yellow-300/20 bg-gradient-to-r from-yellow-300/12 via-white/[0.04] to-lime-300/12 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-300/10 text-yellow-200">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black text-white">Premium Nutrition</div>
                  <p className="mt-1 text-sm leading-6 text-white/68">
                    Unlock structured daily tracking, macro targets and stronger consistency.
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenPremium}
                className="mt-4 w-full rounded-[18px] bg-gradient-to-r from-yellow-300 via-amber-300 to-lime-300 px-4 py-3 text-sm font-black text-[#111]"
              >
                Unlock Premium
              </button>
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Target className="h-4 w-4 text-lime-300" />
                Goal calories
              </div>
              <div className="mt-3 text-2xl font-black text-white">{targets.calories}</div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Flame className="h-4 w-4 text-lime-300" />
                Water target
              </div>
              <div className="mt-3 text-2xl font-black text-white">{targets.waterLiters}L</div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <ProgressCard
              icon={Beef}
              label="Protein"
              value={protein}
              target={targets.protein}
              suffix="g"
            />
            <ProgressCard
              icon={Wheat}
              label="Carbs"
              value={carbs}
              target={targets.carbs}
              suffix="g"
            />
            <ProgressCard
              icon={Target}
              label="Calories"
              value={calories}
              target={targets.calories}
              suffix=""
            />
            <ProgressCard
              icon={Droplets}
              label="Water"
              value={water}
              target={targets.waterLiters}
              suffix="L"
            />
          </div>

          <div className="mt-5 space-y-3">
            <NutritionInput label="Calories" value={calories} onChange={setCalories} suffix="kcal" />
            <NutritionInput label="Protein" value={protein} onChange={setProtein} suffix="g" />
            <NutritionInput label="Carbs" value={carbs} onChange={setCarbs} suffix="g" />
            <NutritionInput label="Fats" value={fats} onChange={setFats} suffix="g" />
            <NutritionInput
              label="Water"
              value={water}
              onChange={setWater}
              suffix="L"
              step={0.1}
            />
          </div>

          <button
            onClick={handleSave}
            className={cn(
              'mt-6 w-full rounded-[22px] px-4 py-4 text-base font-black transition',
              saved
                ? 'bg-lime-300 text-[#101410]'
                : 'bg-gradient-to-r from-lime-300 via-emerald-300 to-yellow-300 text-[#101410]'
            )}
          >
            {saved ? 'Saved' : 'Save nutrition'}
          </button>
        </div>
      </div>
    </div>
  );
}