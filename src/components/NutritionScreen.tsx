import { Crown, Flame, Sparkles, Target } from 'lucide-react';
import { useState } from 'react';
import { getNutritionEntries, saveNutritionEntry } from '../lib/nutritionStore';
import { isPremiumUnlocked } from '../lib/premiumStore';

export default function NutritionScreen({
  onBack,
  onOpenPaywall,
}: {
  onBack: () => void;
  onOpenPaywall: () => void;
}) {
  const premium = isPremiumUnlocked();
  const [protein, setProtein] = useState(150);
  const [calories, setCalories] = useState(2200);
  const entries = getNutritionEntries();

  const latestEntry = entries[0] ?? null;
  const proteinGoal = 180;
  const calorieGoal = 2400;

  const proteinPercent = Math.min(100, Math.round((protein / proteinGoal) * 100));
  const caloriesPercent = Math.min(100, Math.round((calories / calorieGoal) * 100));

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_24%),linear-gradient(180deg,_#09090b_0%,_#0f172a_100%)] px-4 py-4 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-400">Nutrition</p>
            <h1 className="mt-1 text-2xl font-black">Fuel your progression</h1>
          </div>

          <button
            onClick={onBack}
            type="button"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition hover:bg-white/10"
          >
            Back
          </button>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.14),transparent_18%),radial-gradient(circle_at_85%_25%,rgba(250,204,21,0.08),transparent_18%)]" />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Nutrition status</p>
                <h2 className="mt-1 text-2xl font-black">Build from the inside</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Food is not separate from progression. It supports everything.
                </p>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-400/15 bg-emerald-400/10 text-emerald-300 shadow-[0_0_40px_rgba(52,211,153,0.12)]">
                <Flame className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="mb-3 inline-flex rounded-2xl bg-emerald-400/10 p-2.5 text-emerald-300">
                  <Target className="h-4 w-4" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">Protein goal</p>
                <p className="mt-1 text-2xl font-black">{proteinGoal}g</p>
                <p className="mt-1 text-sm text-zinc-400">Current: {protein}g</p>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-yellow-300 transition-all"
                    style={{ width: `${proteinPercent}%` }}
                  />
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="mb-3 inline-flex rounded-2xl bg-yellow-300/10 p-2.5 text-yellow-200">
                  <Sparkles className="h-4 w-4" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">Calorie goal</p>
                <p className="mt-1 text-2xl font-black">{calorieGoal}</p>
                <p className="mt-1 text-sm text-zinc-400">Current: {calories}</p>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-yellow-300 transition-all"
                    style={{ width: `${caloriesPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {!premium && (
          <button
            onClick={onOpenPaywall}
            type="button"
            className="mt-4 flex w-full items-center justify-between rounded-[26px] border border-amber-300/20 bg-gradient-to-r from-amber-300/12 to-yellow-300/10 p-4 text-left shadow-[0_14px_30px_rgba(0,0,0,0.24)] transition hover:scale-[1.01]"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-amber-200">Premium feature</p>
              <p className="mt-1 font-black text-amber-100">Unlock nutrition tracking</p>
              <p className="mt-1 text-sm text-zinc-300">
                Fuel tracking, consistency and smarter progress.
              </p>
            </div>
            <div className="inline-flex rounded-2xl bg-amber-300/15 p-3 text-amber-200">
              <Crown className="h-5 w-5" />
            </div>
          </button>
        )}

        <div className="mt-4 space-y-4">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)]">
            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Today’s input</p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Protein (g)</label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none transition focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">Calories</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none transition focus:border-emerald-400"
                />
              </div>

              <button
                onClick={handleSave}
                type="button"
                className={`w-full rounded-[24px] px-5 py-4 text-base font-black transition ${
                  premium
                    ? 'bg-gradient-to-r from-emerald-400 via-lime-300 to-yellow-300 text-black shadow-[0_12px_40px_rgba(132,204,22,0.25)] hover:scale-[1.01]'
                    : 'border border-amber-300/20 bg-amber-300/10 text-amber-200 hover:bg-amber-300/15'
                }`}
              >
                {premium ? 'Save nutrition' : 'Unlock nutrition tracking'}
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
            <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-400">Latest check-in</p>

            {latestEntry ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Protein</p>
                  <p className="mt-1 text-2xl font-black">{latestEntry.protein}g</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(latestEntry.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Calories</p>
                  <p className="mt-1 text-2xl font-black">{latestEntry.calories}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(latestEntry.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">
                No nutrition entries yet. Start logging to connect food to progression.
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
            <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-400">GymRat mindset</p>
            <h3 className="mt-2 text-xl font-black">Recovery and fuel are part of the grind</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Training builds the signal. Nutrition supports the result. The strongest progress comes from both.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}