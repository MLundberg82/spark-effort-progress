import { ArrowLeft, Crown, Flame, Sparkles, Target } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getNutritionEntries, saveNutritionEntry } from '../lib/nutritionStore';
import { getNutritionTargets, getProfile } from '../lib/profileStore';
import { isPremiumUnlocked } from '../lib/premiumStore';

export default function NutritionScreen({
  onBack,
  onOpenPaywall,
}: {
  onBack: () => void;
  onOpenPaywall: () => void;
}) {
  const premium = isPremiumUnlocked();
  const profile = getProfile();
  const targets = useMemo(() => getNutritionTargets(profile), [profile]);

  const [protein, setProtein] = useState(targets.protein);
  const [calories, setCalories] = useState(targets.calories);
  const [savedTick, setSavedTick] = useState(0);

  const entries = useMemo(() => getNutritionEntries(), [savedTick]);
  const latestEntry = entries[0] ?? null;

  const proteinGoal = targets.protein;
  const calorieGoal = targets.calories;

  const proteinPercent = Math.min(100, Math.round((protein / Math.max(1, proteinGoal)) * 100));
  const caloriesPercent = Math.min(100, Math.round((calories / Math.max(1, calorieGoal)) * 100));

  const handleSave = () => {
    if (!premium) {
      onOpenPaywall();
      return;
    }

    saveNutritionEntry({
      protein,
      calories,
      createdAt: new Date().toISOString(),
    });

    setSavedTick((value) => value + 1);
  };

  const goalLabel =
    profile?.goal === 'lose'
      ? 'High-support cut target'
      : profile?.goal === 'build'
      ? 'Growth-support build target'
      : 'Stable maintain target';

  return (
    <div className="min-h-screen bg-[#09090b] px-4 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-[430px]">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/10 px-3 py-2 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
              Nutrition
            </div>
            <div className="text-lg font-black leading-none">Fuel</div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
            Nutrition
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Fuel your progression</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Din onboarding styr målen automatiskt så nutrition matchar din riktning direkt.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
                <Target className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-xs text-zinc-400">Protein goal</div>
              <div className="mt-1 text-lg font-bold">{proteinGoal}g</div>
              <div className="mt-1 text-xs text-zinc-500">{goalLabel}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
                <Flame className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-xs text-zinc-400">Calorie goal</div>
              <div className="mt-1 text-lg font-bold">{calorieGoal}</div>
              <div className="mt-1 text-xs text-zinc-500">Auto-set from weight + goal</div>
            </div>
          </div>

          {!premium ? (
            <div className="mt-4 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-4">
              <div className="flex items-center gap-2 text-amber-100">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-semibold">Premium feature</span>
              </div>
              <p className="mt-2 text-sm text-zinc-200">
                Unlock nutrition tracking to log daily intake and tie food to progression.
              </p>
            </div>
          ) : null}

          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-sm font-semibold text-white">Today’s input</div>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm text-zinc-300">Protein (g)</span>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                />
              </label>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                  <span>Protein progress</span>
                  <span>{proteinPercent}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{ width: `${proteinPercent}%` }}
                  />
                </div>
              </div>

              <label className="block">
                <span className="text-sm text-zinc-300">Calories</span>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                />
              </label>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                  <span>Calorie progress</span>
                  <span>{caloriesPercent}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{ width: `${caloriesPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-4 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:scale-[1.01]"
            >
              <Sparkles className="h-4 w-4" />
              {premium ? 'Save nutrition' : 'Unlock premium to save'}
            </button>
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-sm font-semibold text-white">Latest entry</div>

            {latestEntry ? (
              <div className="mt-3 space-y-2 text-sm text-zinc-300">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Protein</span>
                  <span className="font-semibold text-white">{latestEntry.protein}g</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Calories</span>
                  <span className="font-semibold text-white">{latestEntry.calories}</span>
                </div>
                <div className="pt-1 text-xs text-zinc-500">
                  {new Date(latestEntry.createdAt).toLocaleString()}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-zinc-400">
                No nutrition entry saved yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}