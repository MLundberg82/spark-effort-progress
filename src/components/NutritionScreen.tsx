import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Crown,
  Droplets,
  Flame,
  Save,
  Target,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';
import {
  getNutritionOverview,
  getTodayNutrition,
  saveTodayNutrition,
} from '@/lib/nutritionStore';

type NutritionScreenProps = {
  onBack: () => void;
  onOpenPaywall: () => void;
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
    <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.22)]">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
        <span className="text-lime-300">{icon}</span>
        {label}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-black text-white">
            {value}
            <span className="ml-1 text-sm text-white/35">{unit}</span>
          </div>
          <div className="mt-1 text-sm text-white/50">
            Target {target} {unit}
          </div>
        </div>

        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/65">
          {progress}%
        </div>
      </div>

      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,rgba(132,204,22,1)_0%,rgba(250,204,21,1)_100%)] transition-all duration-300"
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
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3">
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
        {label}
      </div>

      <div className="relative mt-2">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 pr-16 text-white outline-none transition focus:border-lime-400/50"
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-white/35">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function NutritionScreen({
  onBack,
  onOpenPaywall,
}: NutritionScreenProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [draft, setDraft] = useState(() => getTodayNutrition());
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    const handler = () => {
      setDraft(getTodayNutrition());
      setRefreshKey((value) => value + 1);
    };

    window.addEventListener('nutrition-updated', handler);
    window.addEventListener('profile-updated', handler);

    return () => {
      window.removeEventListener('nutrition-updated', handler);
      window.removeEventListener('profile-updated', handler);
    };
  }, []);

  const overview = useMemo(() => getNutritionOverview(), [refreshKey]);

  const saveField = (
    field: keyof typeof draft,
    value: number,
  ) => {
    const next = {
      ...draft,
      [field]: clampNumber(value),
    };

    setDraft(next);
    saveTodayNutrition(next);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 900);
  };

  const calorieProgress = percentOf(draft.calories, overview.targets.calories);
  const proteinProgress = percentOf(draft.protein, overview.targets.protein);
  const carbsProgress = percentOf(draft.carbs, overview.targets.carbs);
  const fatProgress = percentOf(draft.fat, overview.targets.fat);
  const waterProgress = percentOf(draft.waterMl, overview.targets.waterMl);

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,rgba(132,204,22,0.12),transparent_28%),linear-gradient(180deg,#050505_0%,#0d0d0f_58%,#09090b_100%)] px-4 pb-8 pt-5 text-white">
      <div className="mx-auto max-w-md">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mt-4 overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-300">
            Nutrition
          </div>

          <h1 className="mt-2 text-3xl font-black leading-none text-white">
            Fuel the build
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/60">
            Beräkna och följ upp dina makros för att nå dina mål.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                <Target className="h-3.5 w-3.5 text-lime-300" />
                Goal calories
              </div>
              <div className="mt-2 text-2xl font-black text-white">
                {overview.targets.calories}
              </div>
              <div className="mt-1 text-sm text-white/50">kcal</div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                <Zap className="h-3.5 w-3.5 text-lime-300" />
                Goal protein
              </div>
              <div className="mt-2 text-2xl font-black text-white">
                {overview.targets.protein}
              </div>
              <div className="mt-1 text-sm text-white/50">g</div>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  Today
                </div>
                <div className="mt-1 text-lg font-black text-white">
                  Macro tracking live
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenPaywall}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/75 transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                <Crown className="h-3.5 w-3.5 text-yellow-300" />
                Premium
              </button>
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
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-3 text-center"
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                    {item.label}
                  </div>
                  <div className="mt-1 text-sm font-black text-white">
                    {item.value}%
                  </div>
                </div>
              ))}
            </div>

            {savedFlash ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-lime-200">
                <Save className="h-3.5 w-3.5" />
                Saved
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <MacroCard
            label="Calories"
            value={draft.calories}
            target={overview.targets.calories}
            unit="kcal"
            icon={<Flame className="h-4 w-4" />}
          />
          <MacroCard
            label="Protein"
            value={draft.protein}
            target={overview.targets.protein}
            unit="g"
            icon={<Zap className="h-4 w-4" />}
          />
          <MacroCard
            label="Carbs"
            value={draft.carbs}
            target={overview.targets.carbs}
            unit="g"
            icon={<UtensilsCrossed className="h-4 w-4" />}
          />
          <MacroCard
            label="Fat"
            value={draft.fat}
            target={overview.targets.fat}
            unit="g"
            icon={<Target className="h-4 w-4" />}
          />
          <MacroCard
            label="Water"
            value={draft.waterMl}
            target={overview.targets.waterMl}
            unit="ml"
            icon={<Droplets className="h-4 w-4" />}
          />
        </div>

        <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
            Log today
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field
              label="Calories"
              value={draft.calories}
              suffix="kcal"
              onChange={(value) => saveField('calories', value)}
            />
            <Field
              label="Protein"
              value={draft.protein}
              suffix="g"
              onChange={(value) => saveField('protein', value)}
            />
            <Field
              label="Carbs"
              value={draft.carbs}
              suffix="g"
              onChange={(value) => saveField('carbs', value)}
            />
            <Field
              label="Fat"
              value={draft.fat}
              suffix="g"
              onChange={(value) => saveField('fat', value)}
            />
          </div>

          <div className="mt-3">
            <Field
              label="Water"
              value={draft.waterMl}
              suffix="ml"
              onChange={(value) => saveField('waterMl', value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}