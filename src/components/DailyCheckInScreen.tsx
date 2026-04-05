import { ArrowLeft, Flame, Sparkles, Trophy } from 'lucide-react';
import EquippedRatPreview from '@/components/EquippedRatPreview';
import { getAppStats } from '@/lib/appStore';
import { getWorkoutHistory } from '@/lib/historyStore';
import { useAppLanguage } from '@/lib/languageStore';

type DailyCheckInScreenProps = {
  onBack: () => void;
};

type FocusKey = 'chest' | 'back' | 'arms' | 'legs';

function getWorkoutFocusCounts() {
  const history = getWorkoutHistory();

  const counts: Record<FocusKey, number> = {
    chest: 0,
    back: 0,
    arms: 0,
    legs: 0,
  };

  history.forEach((entry) => {
    const name = entry.workoutName.toLowerCase();

    if (name.includes('chest') || name.includes('push') || name.includes('bench')) {
      counts.chest += 1;
    }
    if (name.includes('back') || name.includes('pull') || name.includes('row')) {
      counts.back += 1;
    }
    if (
      name.includes('arms') ||
      name.includes('bicep') ||
      name.includes('tricep') ||
      name.includes('curl')
    ) {
      counts.arms += 1;
    }
    if (
      name.includes('leg') ||
      name.includes('squat') ||
      name.includes('lower') ||
      name.includes('hamstring')
    ) {
      counts.legs += 1;
    }
  });

  return counts;
}

function getRecommendedFocus(language: string) {
  const counts = getWorkoutFocusCounts();
  const sorted = Object.entries(counts).sort((a, b) => a[1] - b[1]);
  const next = sorted[0]?.[0] as FocusKey | undefined;

  if (language === 'sv') {
    if (next === 'chest') return 'Bröst';
    if (next === 'back') return 'Rygg';
    if (next === 'arms') return 'Armar';
    if (next === 'legs') return 'Ben';
    return 'Bröst';
  }

  if (next === 'chest') return 'Chest';
  if (next === 'back') return 'Back';
  if (next === 'arms') return 'Arms';
  if (next === 'legs') return 'Legs';
  return 'Chest';
}

export default function DailyCheckInScreen({ onBack }: DailyCheckInScreenProps) {
  const language = useAppLanguage();
  const stats = getAppStats();
  const recommendedFocus = getRecommendedFocus(language);

  return (
    <div className="min-h-[100dvh] bg-black px-4 py-5 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          {language === 'sv' ? 'Tillbaka' : 'Back'}
        </button>

        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
          <div className="absolute inset-0 opacity-45">
            <EquippedRatPreview level={stats.level} className="h-full w-full" />
          </div>

          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.28),rgba(0,0,0,0.76))]" />

          <div className="relative z-10 p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
              {language === 'sv' ? 'Daily Check-In' : 'Daily Check-In'}
            </div>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.03em]">
              {language === 'sv' ? 'Momentum idag' : 'Momentum today'}
            </h1>
            <p className="mt-2 text-sm text-white/60">
              {language === 'sv'
                ? 'Snabb överblick över streak, XP och vad du bör träna härnäst.'
                : 'Quick view of streak, XP and what you should train next.'}
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3">
              <div className="rounded-[22px] border border-white/10 bg-black/35 p-4 backdrop-blur-sm">
                <div className="mb-2 flex items-center gap-2 text-white/45">
                  <Flame className="h-4 w-4 text-lime-300" />
                  <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                    {language === 'sv' ? 'Streak' : 'Streak'}
                  </span>
                </div>
                <div className="text-3xl font-black text-white">{stats.streak}</div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-black/35 p-4 backdrop-blur-sm">
                <div className="mb-2 flex items-center gap-2 text-white/45">
                  <Trophy className="h-4 w-4 text-amber-300" />
                  <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                    XP
                  </span>
                </div>
                <div className="text-3xl font-black text-white">{stats.totalXP}</div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-black/35 p-4 backdrop-blur-sm">
                <div className="mb-2 flex items-center gap-2 text-white/45">
                  <Sparkles className="h-4 w-4 text-lime-300" />
                  <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                    {language === 'sv' ? 'Rekommenderat nästa pass' : 'Recommended next'}
                  </span>
                </div>
                <div className="text-2xl font-black text-white">{recommendedFocus}</div>
                <p className="mt-1 text-sm text-white/55">
                  {language === 'sv'
                    ? 'Det här området har fått minst fokus hittills.'
                    : 'This area has had the least attention so far.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}