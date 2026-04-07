import { useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Flame,
  Footprints,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { getAdaptiveWorkoutSuggestion } from '@/lib/adaptiveWorkout';
import {
  getPRProximity,
  getWorkoutFocusBreakdown,
  type MuscleGroup,
} from '@/lib/historyStore';
import { getStreakState } from '@/lib/streakStore';

type Props = {
  onStartWorkout: (focus?: MuscleGroup) => void;
  onClose: () => void;
};

const muscleLabels: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  arms: 'Arms',
  legs: 'Legs',
  shoulders: 'Shoulders',
  core: 'Core',
};

function FocusBar({
  label,
  value,
  maxValue,
}: {
  label: string;
  value: number;
  maxValue: number;
}) {
  const width = maxValue > 0 ? Math.max(10, Math.min(100, (value / maxValue) * 100)) : 10;

  return (
    <div className="rounded-[18px] border border-white/10 bg-[#0d0d0d] px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-black uppercase tracking-[0.15em] text-white/72">
          {label}
        </div>
        <div className="text-[11px] font-black text-white/88">{Math.round(value)}</div>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-lime-300 transition-[width] duration-300"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-[#0d0d0d] px-3 py-3">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/62">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 text-[15px] font-black text-white">{value}</div>
    </div>
  );
}

export default function DailyCheckInScreen({ onStartWorkout, onClose }: Props) {
  const suggestion = useMemo(() => getAdaptiveWorkoutSuggestion(), []);
  const streak = useMemo(() => getStreakState(), []);
  const breakdown = useMemo(() => getWorkoutFocusBreakdown(10), []);
  const proximity = useMemo(() => getPRProximity(), []);
  const maxValue = Math.max(...Object.values(breakdown), 1);
  const topPR = proximity[0] ?? null;

  return (
    <div className="min-h-screen bg-black px-4 pb-6 pt-4 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-4xl flex-col">
        <div className="rounded-[26px] border border-white/10 bg-[#080808] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="Back"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/78 transition hover:bg-white/[0.08]"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>

            <div className="min-w-0 flex-1 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-300/85">
                Daily Check-In
              </p>
              <h1 className="mt-1 text-[28px] font-black tracking-tight text-white">
                Momentum today
              </h1>
              <p className="mx-auto mt-2 max-w-[32rem] text-sm leading-5 text-white/72">
                Quick streak, recovery and next-focus overview from your recent training.
              </p>
            </div>

            <div className="h-10 w-10 shrink-0" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
            <StatCard
              icon={<Flame className="h-3.5 w-3.5 text-lime-300" />}
              label="Streak"
              value={streak.current}
            />
            <StatCard
              icon={<Trophy className="h-3.5 w-3.5 text-yellow-200" />}
              label="Best"
              value={streak.best}
            />
            <StatCard
              icon={<Sparkles className="h-3.5 w-3.5 text-white" />}
              label="Focus"
              value={muscleLabels[suggestion.focusArea]}
            />
            <StatCard
              icon={<Footprints className="h-3.5 w-3.5 text-white" />}
              label="Fallback"
              value="Walk"
            />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_0.9fr]">
            <section className="rounded-[20px] border border-lime-300/14 bg-lime-300/[0.05] p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-lime-200/90">
                Recommended next focus
              </div>
              <h2 className="mt-1 text-[22px] font-black tracking-tight text-white">
                {muscleLabels[suggestion.focusArea]} day
              </h2>
              <p className="mt-2 text-sm leading-5 text-white/80">{suggestion.reason}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onStartWorkout(suggestion.focusArea)}
                  className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[14px] bg-lime-300 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-black transition hover:brightness-105"
                >
                  Start recommended
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onStartWorkout()}
                  className="inline-flex min-h-[42px] items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
                >
                  Choose workout
                </button>
              </div>
            </section>

            <section className="rounded-[20px] border border-white/10 bg-[#0d0d0d] p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/62">
                PR watch
              </div>

              {topPR ? (
                <>
                  <h3 className="mt-1 text-[18px] font-black text-white">{topPR.exercise}</h3>
                  <p className="mt-2 text-sm leading-5 text-white/78">
                    You are only {topPR.diff} kg from your current best. Strong day to push if
                    energy is there.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mt-1 text-[18px] font-black text-white">No immediate PR target</h3>
                  <p className="mt-2 text-sm leading-5 text-white/78">
                    That is fine. Today can still be a consistency win.
                  </p>
                </>
              )}

              <div className="mt-4 rounded-[16px] border border-white/10 bg-white/[0.03] px-3 py-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
                  <Footprints className="h-3.5 w-3.5" />
                  Walk fallback
                </div>
                <p className="mt-1.5 text-sm leading-5 text-white/76">
                  A walk can keep identity, momentum and streak alive even on a lighter day.
                </p>
              </div>
            </section>
          </div>

          <section className="mt-4 rounded-[20px] border border-white/10 bg-[#0d0d0d] p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/62">
              Recent focus balance
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {(Object.keys(breakdown) as MuscleGroup[]).map((group) => (
                <FocusBar
                  key={group}
                  label={muscleLabels[group]}
                  value={breakdown[group]}
                  maxValue={maxValue}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}