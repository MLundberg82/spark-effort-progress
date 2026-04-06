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
  const width =
    maxValue > 0 ? Math.max(8, Math.min(100, (value / maxValue) * 100)) : 8;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-black uppercase tracking-[0.12em] text-white/65">
          {label}
        </div>
        <div className="text-[11px] font-black uppercase tracking-[0.12em] text-white/40">
          {Math.round(value)}
        </div>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-lime-300 transition-[width] duration-500"
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/45">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-black tracking-tight text-white">
        {value}
      </div>
    </div>
  );
}

export default function DailyCheckInScreen({
  onStartWorkout,
  onClose,
}: Props) {
  const suggestion = useMemo(() => getAdaptiveWorkoutSuggestion(), []);
  const streak = useMemo(() => getStreakState(), []);
  const breakdown = useMemo(() => getWorkoutFocusBreakdown(10), []);
  const proximity = useMemo(() => getPRProximity(), []);

  const maxValue = Math.max(...Object.values(breakdown), 1);
  const topPR = proximity[0] ?? null;

  return (
    <div className="min-h-screen bg-black px-5 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/80 transition hover:bg-white/[0.08]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mt-5 rounded-[30px] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-lime-300/80">
            Daily check-in
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Momentum today
          </h1>

          <p className="mt-2 text-sm leading-6 text-white/65">
            Quick streak, recovery and next-focus overview from your recent training.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <StatCard
              icon={<Flame className="h-3.5 w-3.5" />}
              label="Streak"
              value={streak.current}
            />
            <StatCard
              icon={<Trophy className="h-3.5 w-3.5" />}
              label="Best"
              value={streak.best}
            />
          </div>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-lime-100">
                <Sparkles className="h-3 w-3" />
                Recommended next focus
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/65">
                {muscleLabels[suggestion.focusArea]}
              </div>
            </div>

            <div className="mt-3 text-xl font-black tracking-tight text-white">
              {muscleLabels[suggestion.focusArea]} day
            </div>

            <div className="mt-2 text-sm leading-6 text-white/60">
              {suggestion.reason}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => onStartWorkout(suggestion.focusArea)}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[22px] bg-lime-300 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.18)] transition hover:brightness-105"
              >
                Start recommended
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => onStartWorkout()}
                className="inline-flex min-h-[52px] items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
              >
                Start anyway
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.9fr]">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
                Recent focus balance
              </div>

              <div className="mt-3 grid gap-2">
                {(Object.keys(breakdown) as MuscleGroup[]).map((group) => (
                  <FocusBar
                    key={group}
                    label={muscleLabels[group]}
                    value={breakdown[group]}
                    maxValue={maxValue}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
                  PR watch
                </div>

                {topPR ? (
                  <>
                    <div className="mt-3 text-lg font-black tracking-tight text-white">
                      {topPR.exercise}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-white/60">
                      You are only {topPR.diff} kg from your current best. Strong day to push if energy is there.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-3 text-lg font-black tracking-tight text-white">
                      No immediate PR target
                    </div>
                    <div className="mt-2 text-sm leading-6 text-white/60">
                      That is fine. Today can still be a consistency win.
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/65">
                  <Footprints className="h-3 w-3" />
                  Walk fallback
                </div>

                <div className="mt-3 text-lg font-black tracking-tight text-white">
                  Low energy still counts
                </div>

                <div className="mt-2 text-sm leading-6 text-white/60">
                  A walk can keep identity, momentum and streak alive even on a lighter day.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}