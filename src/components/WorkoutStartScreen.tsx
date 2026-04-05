import { ArrowLeft, Crown, Dumbbell, Lock, Sparkles, Zap } from 'lucide-react';
import { getTrainingLevel, getPlansForLevel } from '@/lib/trainingStore';

type WorkoutStartScreenProps = {
  isPremium: boolean;
  onBack: () => void;
  onStartPreset: (planIndex: number) => void;
  onStartCustom: () => void;
  onOpenPremium: () => void;
};

function getLevelLabel(level: ReturnType<typeof getTrainingLevel>) {
  if (level === 'beginner') return 'Beginner';
  if (level === 'intermediate') return 'Intermediate';
  return 'Advanced';
}

function getPlanAccent(index: number) {
  const accents = [
    'from-lime-300/18 via-emerald-300/8 to-transparent',
    'from-sky-300/18 via-cyan-300/8 to-transparent',
    'from-fuchsia-300/16 via-violet-300/8 to-transparent',
    'from-amber-300/16 via-orange-300/8 to-transparent',
    'from-rose-300/16 via-pink-300/8 to-transparent',
    'from-white/12 via-lime-300/6 to-transparent',
  ];

  return accents[index % accents.length];
}

function PlanCard({
  name,
  description,
  dayCount,
  accent,
  onClick,
}: {
  name: string;
  description: string;
  dayCount: number;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.25)] transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.995]"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-100`} />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-lime-300">
          <Sparkles className="h-3.5 w-3.5" />
          Free plan
        </div>

        <div className="mt-4 text-2xl font-black leading-none text-white">
          {name}
        </div>

        <p className="mt-3 text-sm leading-6 text-white/58">{description}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/70">
            {dayCount} {dayCount === 1 ? 'day' : 'days'}
          </div>

          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/72 transition group-hover:text-lime-300">
            Start
            <Zap className="h-4 w-4" />
          </div>
        </div>
      </div>
    </button>
  );
}

export default function WorkoutStartScreen({
  isPremium,
  onBack,
  onStartPreset,
  onStartCustom,
  onOpenPremium,
}: WorkoutStartScreenProps) {
  const trainingLevel = getTrainingLevel();
  const plans = getPlansForLevel(trainingLevel);
  const visiblePlans = plans.slice(0, 6);
  const levelLabel = getLevelLabel(trainingLevel);

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,rgba(132,204,22,0.14),transparent_28%),linear-gradient(180deg,#050505_0%,#0d0d0f_58%,#09090b_100%)] px-4 pb-8 pt-5 text-white">
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
            Start workout
          </div>

          <h1 className="mt-2 text-3xl font-black leading-none text-white">
            Pick your session
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/60">
            Fast start. Heavy feel. Built for momentum.
          </p>

          <div className="mt-5 flex items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">
                Current training level
              </div>
              <div className="mt-2 text-xl font-black text-white">{levelLabel}</div>
            </div>

            <div className="rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-lime-300">
              {visiblePlans.length} plans
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {visiblePlans.map((plan, index) => (
            <PlanCard
              key={`${plan.name}-${index}`}
              name={plan.name}
              description={plan.description}
              dayCount={plan.days.length}
              accent={getPlanAccent(index)}
              onClick={() => onStartPreset(index)}
            />
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
          {isPremium ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-lime-300">
                <Crown className="h-3.5 w-3.5 text-yellow-300" />
                Premium mode
              </div>

              <div className="mt-4 flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>

                <div>
                  <div className="text-2xl font-black leading-none text-white">
                    Custom Workout
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/58">
                    No preset wall. Build your own session and go straight into work.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onStartCustom}
                className="mt-5 inline-flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[24px] bg-lime-300 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[0_20px_55px_rgba(163,230,53,0.2)] transition hover:brightness-105 active:scale-[0.995]"
              >
                <Dumbbell className="h-4 w-4" />
                Start Custom Workout
              </button>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-yellow-200">
                <Crown className="h-3.5 w-3.5 text-yellow-300" />
                Premium
              </div>

              <div className="mt-4 flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
                  <Lock className="h-5 w-5 text-white/85" />
                </div>

                <div>
                  <div className="text-2xl font-black leading-none text-white">
                    Custom Workout
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/58">
                    Build your own session from scratch and train exactly how you want.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenPremium}
                className="mt-5 inline-flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[24px] border border-white/10 bg-white/[0.05] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.995]"
              >
                <Crown className="h-4 w-4 text-yellow-300" />
                Unlock Premium
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}