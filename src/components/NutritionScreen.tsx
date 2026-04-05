import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Crown, Target } from 'lucide-react';
import { getNutritionOverview, getTodayNutrition, saveTodayNutrition } from '@/lib/nutritionStore';
import { useAppLanguage } from '@/lib/languageStore';

type NutritionScreenProps = {
  onBack: () => void;
  onOpenPaywall: () => void;
};

function MacroCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm text-zinc-400">{hint}</p>
    </div>
  );
}

export default function NutritionScreen({
  onBack,
  onOpenPaywall,
}: NutritionScreenProps) {
  const language = useAppLanguage();
  const [refreshKey, setRefreshKey] = useState(0);
  const [draft, setDraft] = useState(getTodayNutrition());

  useEffect(() => {
    const handler = () => {
      setDraft(getTodayNutrition());
      setRefreshKey((value) => value + 1);
    };

    window.addEventListener('nutrition-updated', handler);
    return () => window.removeEventListener('nutrition-updated', handler);
  }, []);

  const overview = useMemo(() => getNutritionOverview(), [refreshKey]);

  const saveField = (field: keyof typeof draft, value: number) => {
    const next = {
      ...draft,
      [field]: Math.max(0, Number.isFinite(value) ? value : 0),
    };
    setDraft(next);
    saveTodayNutrition(next);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.16),_transparent_30%),linear-gradient(180deg,_#09090b_0%,_#111113_100%)] px-4 py-5 text-white">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'sv' ? 'Tillbaka' : 'Back'}
          </button>

          <button
            type="button"
            onClick={onOpenPaywall}
            className="inline-flex items-center gap-2 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-3 text-sm font-black text-yellow-100"
          >
            <Crown className="h-4 w-4" />
            Premium
          </button>
        </div>

        <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            Nutrition
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            {language === 'sv'
              ? 'Beräkna och följ upp dina makros'
              : 'Calculate and track your macros'}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-zinc-300 sm:text-base">
            {language === 'sv'
              ? 'Beräkna och följ upp dina makros för att nå dina mål.'
              : 'Calculate and track your macros to reach your goals.'}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MacroCard
            label={language === 'sv' ? 'Kalorimål' : 'Calories target'}
            value={`${overview.targets.calories}`}
            hint={language === 'sv' ? 'Baserat på din profil och ditt mål.' : 'Estimated from your profile and goal.'}
          />
          <MacroCard
            label={language === 'sv' ? 'Proteinamål' : 'Protein target'}
            value={`${overview.targets.protein} g`}
            hint={language === 'sv' ? 'Protein som stark bas för återhämtning.' : 'Protein as a strong base for recovery.'}
          />
          <MacroCard
            label={language === 'sv' ? 'Vattenmål' : 'Water target'}
            value={`${overview.targets.waterMl} ml`}
            hint={language === 'sv' ? 'En enkel hydreringsnivå för bättre träning.' : 'Simple hydration baseline for better sessions.'}
          />
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            <Target className="h-4 w-4 text-emerald-300" />
            {language === 'sv' ? 'Idag' : 'Today'}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                {language === 'sv' ? 'Kalorier' : 'Calories'}
              </label>
              <input
                type="number"
                value={draft.calories}
                onChange={(e) => saveField('calories', Number(e.target.value))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                {language === 'sv' ? 'Protein (g)' : 'Protein (g)'}
              </label>
              <input
                type="number"
                value={draft.protein}
                onChange={(e) => saveField('protein', Number(e.target.value))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                {language === 'sv' ? 'Kolhydrater (g)' : 'Carbs (g)'}
              </label>
              <input
                type="number"
                value={draft.carbs}
                onChange={(e) => saveField('carbs', Number(e.target.value))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                {language === 'sv' ? 'Fett (g)' : 'Fat (g)'}
              </label>
              <input
                type="number"
                value={draft.fat}
                onChange={(e) => saveField('fat', Number(e.target.value))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                {language === 'sv' ? 'Vatten (ml)' : 'Water (ml)'}
              </label>
              <input
                type="number"
                value={draft.waterMl}
                onChange={(e) => saveField('waterMl', Number(e.target.value))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}