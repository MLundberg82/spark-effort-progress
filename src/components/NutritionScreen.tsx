import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Crown,
  Droplets,
  Flame,
  Plus,
  RotateCcw,
  Target,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';

import {
  addNutritionEntry,
  clearNutritionEntries,
  getNutritionGoal,
  getTodayNutritionTotals,
  subscribeNutrition,
} from '@/lib/nutritionStore';
import { getProfile } from '@/lib/profileStore';

type NutritionScreenProps = {
  onBack: () => void;
  onOpenPaywall: () => void;
};

type DraftValues = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
};

function clampNumber(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

function percentOf(current: number, target: number) {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

function MacroCard({
  label,
  value,
  target,
  unit,
  icon,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  icon: React.ReactNode;
}) {
  const progress = percentOf(value, target);

  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
        {icon}
        {label}
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <div className="text-lg font-black text-white">
            {value} <span className="text-sm text-white/45">{unit}</span>
          </div>
          <div className="mt-1 text-[11px] text-white/50">
            Target {target} {unit}
          </div>
        </div>

        <div className="text-xs font-black text-white/55">{progress}%</div>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-lime-300 transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/55">
        {label}
      </div>

      <div className="relative">
        <input
          value={value}
          inputMode="numeric"
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 pr-16 text-white outline-none transition focus:border-lime-400/50"
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-[0.12em] text-white/40">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

export default function NutritionScreen({
  onBack,
  onOpenPaywall,
}: NutritionScreenProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [savedFlash, setSavedFlash] = useState(false);
  const [draft, setDraft] = useState<DraftValues>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    waterMl: 0,
  });

  useEffect(() => {
    return subscribeNutrition(() => {
      setRefreshKey((value) => value + 1);
    });
  }, []);

  const goal = useMemo(() => getNutritionGoal(), [refreshKey]);
  const totals = useMemo(() => getTodayNutritionTotals(), [refreshKey]);
  const profile = getProfile();

  const targets = useMemo(() => {
    const weight = profile.weight ?? 80;
    const waterMl = Math.max(2000, weight * 35);

    return {
      calories: goal.calories,
      protein: goal.protein,
      carbs: goal.carbs,
      fat: goal.fat,
      waterMl,
    };
  }, [goal, profile.weight]);

  const saveDraft = () => {
    if (draft.calories > 0 || draft.protein > 0 || draft.carbs > 0 || draft.fat > 0) {
      addNutritionEntry({
        name: 'Quick log',
        calories: clampNumber(draft.calories),
        protein: clampNumber(draft.protein),
        carbs: clampNumber(draft.carbs),
        fat: clampNumber(draft.fat),
        loggedAt: new Date().toISOString(),
      });
    }

    setSavedFlash(true);
    setDraft({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      waterMl: 0,
    });
    window.setTimeout(() => setSavedFlash(false), 900);
  };

  const clearToday = () => {
    clearNutritionEntries();
    setSavedFlash(false);
  };

  const calorieProgress = percentOf(totals.calories, targets.calories);
  const proteinProgress = percentOf(totals.protein, targets.protein);
  const carbsProgress = percentOf(totals.carbs, targets.carbs);
  const fatProgress = percentOf(totals.fat, targets.fat);
  const waterProgress = percentOf(draft.waterMl, targets.waterMl);

  return (
    <div className="min-h-screen bg-black px-4 pb-6 pt-4 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-5xl flex-col">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-start justify-between gap-3">
            <button
              onClick={onBack}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.05] transition hover:bg-white/[0.08]"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1 text-center">
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-lime-300/80">
                Nutrition
              </div>
              <h1 className="mt-1 text-2xl font-black tracking-tight">Fuel the build</h1>
              <p className="mt-2 text-sm text-white/62">
                Targets follow your saved onboarding profile and goal.
              </p>
            </div>

            <button
              onClick={onOpenPaywall}
              className="inline-flex h-11 items-center gap-2 rounded-[18px] border border-yellow-300/20 bg-yellow-300/10 px-3 text-[11px] font-black uppercase tracking-[0.14em] text-yellow-100 transition hover:bg-yellow-300/15"
            >
              <Crown className="h-3.5 w-3.5" />
              Premium
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
                  <Target className="h-3.5 w-3.5" />
                  Today
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <MacroCard
                    label="Calories"
                    value={totals.calories}
                    target={targets.calories}
                    unit="kcal"
                    icon={<Flame className="h-3.5 w-3.5" />}
                  />
                  <MacroCard
                    label="Protein"
                    value={totals.protein}
                    target={targets.protein}
                    unit="g"
                    icon={<Zap className="h-3.5 w-3.5" />}
                  />
                  <MacroCard
                    label="Carbs"
                    value={totals.carbs}
                    target={targets.carbs}
                    unit="g"
                    icon={<UtensilsCrossed className="h-3.5 w-3.5" />}
                  />
                  <MacroCard
                    label="Fat"
                    value={totals.fat}
                    target={targets.fat}
                    unit="g"
                    icon={<Target className="h-3.5 w-3.5" />}
                  />
                  <MacroCard
                    label="Water"
                    value={draft.waterMl}
                    target={targets.waterMl}
                    unit="ml"
                    icon={<Droplets className="h-3.5 w-3.5" />}
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
                      Macro tracking live
                    </div>
                    <div className="mt-1 text-sm text-white/60">
                      Quick overview of where you are today.
                    </div>
                  </div>

                  {savedFlash ? (
                    <div className="rounded-full border border-lime-400/25 bg-lime-400/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-lime-100">
                      Saved
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 grid grid-cols-5 gap-2">
                  {[
                    { label: 'Kcal', value: calorieProgress },
                    { label: 'P', value: proteinProgress },
                    { label: 'C', value: carbsProgress },
                    { label: 'F', value: fatProgress },
                    { label: 'H2O', value: waterProgress },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-3 text-center"
                    >
                      <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                        {item.label}
                      </div>
                      <div className="mt-1 text-sm font-black text-white">{item.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
                <Plus className="h-3.5 w-3.5" />
                Quick log
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <div className="text-xs font-black uppercase tracking-[0.12em] text-white/70">
                  Based on profile
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-white/55">
                  <div>Goal: {profile.goal}</div>
                  <div>Weight: {profile.weight ?? '-'} kg</div>
                  <div>Height: {profile.height ?? '-'} cm</div>
                  <div>Age: {profile.age ?? '-'}</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field
                  label="Calories"
                  value={draft.calories}
                  suffix="kcal"
                  onChange={(value) =>
                    setDraft((current) => ({ ...current, calories: clampNumber(value) }))
                  }
                />
                <Field
                  label="Protein"
                  value={draft.protein}
                  suffix="g"
                  onChange={(value) =>
                    setDraft((current) => ({ ...current, protein: clampNumber(value) }))
                  }
                />
                <Field
                  label="Carbs"
                  value={draft.carbs}
                  suffix="g"
                  onChange={(value) =>
                    setDraft((current) => ({ ...current, carbs: clampNumber(value) }))
                  }
                />
                <Field
                  label="Fat"
                  value={draft.fat}
                  suffix="g"
                  onChange={(value) =>
                    setDraft((current) => ({ ...current, fat: clampNumber(value) }))
                  }
                />
              </div>

              <div className="mt-3">
                <Field
                  label="Water"
                  value={draft.waterMl}
                  suffix="ml"
                  onChange={(value) =>
                    setDraft((current) => ({ ...current, waterMl: clampNumber(value) }))
                  }
                />
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={saveDraft}
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-[18px] bg-lime-300 px-5 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:brightness-105"
                >
                  <Plus className="h-4 w-4" />
                  Save log
                </button>

                <button
                  onClick={clearToday}
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/[0.05] px-5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear logs
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto flex justify-end pt-4">
          <button
            onClick={onBack}
            className="inline-flex min-h-[48px] items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.05] px-5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
          >
            Back to menu
          </button>
        </div>
      </div>
    </div>
  );
}