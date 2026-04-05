import { Crown, Dumbbell, Lock, Sparkles } from 'lucide-react';
import { getTrainingLevel, getPlansForLevel } from '@/lib/trainingStore';
import { t, useAppLanguage } from '@/lib/languageStore';

type WorkoutStartScreenProps = {
  isPremium: boolean;
  onBack: () => void;
  onStartPreset: (planIndex: number) => void;
  onStartCustom: () => void;
  onOpenPremium: () => void;
};

export default function WorkoutStartScreen({
  isPremium,
  onBack,
  onStartPreset,
  onStartCustom,
  onOpenPremium,
}: WorkoutStartScreenProps) {
  const language = useAppLanguage();
  const trainingLevel = getTrainingLevel();
  const plans = getPlansForLevel(trainingLevel);
  const visiblePlans = plans.slice(0, 6);

  if (isPremium) {
    return (
      <div className="min-h-[100dvh] bg-black text-white">
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-6 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="mb-5 inline-flex h-11 items-center justify-center self-start rounded-2xl border border-white/10 bg-white/5 px-4 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:border-white/20 hover:bg-white/10 active:scale-[0.98]"
          >
            {t('common.back', language)}
          </button>

          <div className="rounded-[30px] border border-lime-400/20 bg-[linear-gradient(180deg,rgba(132,255,88,0.14),rgba(255,255,255,0.03))] p-5">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-[20px] border border-lime-400/25 bg-lime-400/10">
              <Crown className="h-6 w-6 text-lime-300" />
            </div>

            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-300">
              {t('workoutStart.premiumMode', language)}
            </div>

            <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.03em]">
              {t('workoutStart.customTitle', language)}
            </h1>

            <p className="mt-2 text-sm text-white/55">
              {t('workoutStart.customSubtitle', language)}
            </p>

            <button
              type="button"
              onClick={onStartCustom}
              className="mt-6 flex h-16 w-full items-center justify-center gap-2 rounded-[24px] border border-lime-400/30 bg-[linear-gradient(180deg,rgba(132,255,88,0.24),rgba(132,255,88,0.12))] text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-lime-300/50 hover:bg-[linear-gradient(180deg,rgba(132,255,88,0.3),rgba(132,255,88,0.16))] active:scale-[0.99]"
            >
              <Sparkles className="h-4 w-4" />
              {t('workoutStart.customButton', language)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-6 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex h-11 items-center justify-center self-start rounded-2xl border border-white/10 bg-white/5 px-4 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:border-white/20 hover:bg-white/10 active:scale-[0.98]"
        >
          {t('common.back', language)}
        </button>

        <div className="mb-4">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
            {t('workoutStart.title', language)}
          </div>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.03em] text-white">
            {t('workoutStart.pickSession', language)}
          </h1>
          <p className="mt-2 text-sm text-white/55">
            {t('workoutStart.subtitle', language)}
          </p>
        </div>

        <div className="grid gap-3">
          {visiblePlans.map((plan, index) => (
            <button
              key={`${plan.name}-${index}`}
              type="button"
              onClick={() => onStartPreset(index)}
              className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 text-left transition-all duration-200 hover:border-white/20 hover:bg-white/8 active:scale-[0.99]"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/25">
                  <Dumbbell className="h-4 w-4 text-white/90" />
                </div>

                <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/55">
                  {t('common.free', language)}
                </div>
              </div>

              <div className="text-[13px] font-black uppercase tracking-[0.12em] text-white">
                {plan.name}
              </div>
              <p className="mt-1 text-sm text-white/50">{plan.description}</p>
              <div className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                {plan.days.length} {t('common.days', language)}
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenPremium}
          className="mt-4 rounded-[26px] border border-amber-400/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.16),rgba(255,255,255,0.04))] p-4 text-left transition hover:border-amber-300/35 hover:bg-[linear-gradient(180deg,rgba(251,191,36,0.22),rgba(255,255,255,0.06))] active:scale-[0.99]"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
              <Lock className="h-4 w-4 text-amber-300" />
            </div>

            <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-amber-300">
              {t('common.premium', language)}
            </div>
          </div>

          <div className="text-[13px] font-black uppercase tracking-[0.12em] text-white">
            {t('workoutStart.customLocked', language)}
          </div>
          <p className="mt-1 text-sm text-white/55">
            {t('workoutStart.customLockedSub', language)}
          </p>
        </button>
      </div>
    </div>
  );
}