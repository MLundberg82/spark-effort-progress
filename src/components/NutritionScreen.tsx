import { Crown, Flame, Sparkles, Target } from 'lucide-react';
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

  const entries = getNutritionEntries();
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

    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#09090b] px-4 pb-8 pt-4 text-white">
      <div className="mx-auto max-w-[430px]">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
        >
          Back
        </button>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            <Sparkles className="h-4 w-4" />
            Nutrition
          </div>

          <h1 className="text-[2rem] font-black tracking-[-0.04em]">Fuel your progression</h1>
          <p className="mt-2 text-sm text-white/68">
            Din onboarding styr målen automatiskt så nutrition matchar din riktning direkt.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/45">
                <Target className="h-4 w-4 text-emerald-300" />
                Protein goal
              </div>
              <div className="text-2xl font-black">{proteinGoal}g</div>
              <div className="mt-1 text-sm text-white/55">
                {profile?.goal === 'lose'
                  ? 'High-support cut target'
                  : profile?.goal === 'build'
                    ? 'Growth-support build target'
                    : 'Stable maintain target'}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/45">
                <Flame className="h-4 w-4 text-orange-300" />
                Calorie goal
              </div>
              <div className="text-2xl font-black">{calorieGoal}</div>
              <div className="mt-1 text-sm text-white/55">
                Auto-set from weight + goal
              </div>
            </div>
          </div>

          {!premium ? (
            <div className="mt-4 rounded-[1.5rem] border border-yellow-400/20 bg-yellow-400/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-yellow-200">
                <Crown className="h-4 w-4" />
                Premium feature
              </div>
              <div className="text-lg font-bold">Unlock nutrition tracking</div>
              <p className="mt-1 text-sm text-yellow-100/80">
                Log daily intake, stay consistent and tie nutrition to progression.
              </p>
            </div>
          ) : null}

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white/50">
              Today’s input
            </div>

            <label className="mb-4 block">
              <div className="mb-2 text-sm font-medium text-white/70">Protein (g)</div>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none transition focus:border-emerald-400"
              />
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#34d399,#bef264)]"
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-medium text-white/70">Calories</div>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none transition focus:border-emerald-400"
              />
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#f59e0b,#fb7185)]"
                  style={{ width: `${caloriesPercent}%` }}
                />
              </div>
            </label>

            <button
              type="button"
              onClick={handleSave}
              className="mt-5 w-full rounded-2xl bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:scale-[1.01]"
            >
              {premium ? 'Save nutrition' : 'Unlock nutrition tracking'}
            </button>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-white/50">
              Latest check-in
            </div>

            {latestEntry ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-white/45">Protein</div>
                  <div className="mt-1 text-2xl font-black">{latestEntry.protein}g</div>
                  <div className="mt-1 text-xs text-white/45">
                    {new Date(latestEntry.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-white/45">Calories</div>
                  <div className="mt-1 text-2xl font-black">{latestEntry.calories}</div>
                  <div className="mt-1 text-xs text-white/45">
                    {new Date(latestEntry.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/55">
                No nutrition entries yet. Start logging to connect food to progression.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}