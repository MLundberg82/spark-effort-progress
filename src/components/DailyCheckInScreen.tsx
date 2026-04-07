import { useMemo } from 'react';
import {
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
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white/82">{label}</span>
        <span className="text-xs font-black text-white/50">{Math.round(value)}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-lime-300 transition-all"
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
    <div className="rounded-[18px] border border-white/12 bg-black/32 p-3">
      <div className="flex items-center gap-2 text-white/62">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-[0.16em]">
          {label}
        </span>
      </div>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
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
    <div
      className="absolute inset-y-0 right-0 flex w-[80%] max-w-[420px] flex-col border-l border-white/12 bg-[#070707]/98 shadow-[-24px_0_80px_rgba(0,0,0,0.58)]"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 pb-4 pt-6">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-black/30 px-4 text-[11px] font-black uppercase tracking-[0.16em] text-white/82 transition hover:bg-black/45 hover:text-white"
        >
          Back
        </button>

        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/38">
            Daily Check-In
          </p>
          <h1 className="text-base font-black uppercase tracking-[0.16em] text-white">
            Momentum today
          </h1>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
        <div className="space-y-3">
          <div className="rounded-[24px] border border-white/12 bg-white/[0.055] p-4">
            <p className="text-sm leading-6 text-white/72">
              Quick streak, recovery and next-focus overview from your recent training.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <StatCard
                icon={<Flame className="h-4 w-4" />}
                label="Streak"
                value={streak.current}
              />
              <StatCard
                icon={<Trophy className="h-4 w-4" />}
                label="Best"
                value={streak.best}
              />
              <StatCard
                icon={<Sparkles className="h-4 w-4" />}
                label="Focus"
                value={muscleLabels[suggestion.focusArea]}
              />
              <StatCard
                icon={<Footprints className="h-4 w-4" />}
                label="Fallback"
                value="Walk"
              />
            </div>
          </div>

          <div className="rounded-[24px] border border-white/12 bg-white/[0.055] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-lime-300/85">
              Recommended next focus
            </p>

            <h2 className="mt-2 text-[20px] font-black leading-none text-white">
              {muscleLabels[suggestion.focusArea]} day
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/72">
              {suggestion.reason}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onStartWorkout(suggestion.focusArea)}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[16px] bg-lime-300 px-3 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.16)] transition hover:brightness-105"
              >
                Start
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => onStartWorkout()}
                className="inline-flex min-h-[44px] items-center justify-center rounded-[16px] border border-white/10 bg-black/30 px-3 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-black/45"
              >
                Choose
              </button>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/12 bg-white/[0.055] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">
              PR watch
            </p>

            {topPR ? (
              <>
                <h3 className="mt-2 text-lg font-black text-white">{topPR.exercise}</h3>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  You are only {topPR.diff} kg from your current best. Strong day to push if energy is there.
                </p>
              </>
            ) : (
              <>
                <h3 className="mt-2 text-lg font-black text-white">
                  No immediate PR target
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  That is fine. Today can still be a consistency win.
                </p>
              </>
            )}
          </div>

          <div className="rounded-[24px] border border-white/12 bg-white/[0.055] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">
              Walk fallback
            </p>
            <p className="mt-2 text-sm leading-6 text-white/72">
              A walk can keep identity, momentum and streak alive even on a lighter day.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/12 bg-white/[0.055] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">
              Recent focus balance
            </p>

            <div className="mt-4 space-y-4">
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
        </div>
      </div>
    </div>
  );
}