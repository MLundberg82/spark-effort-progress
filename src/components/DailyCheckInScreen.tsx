import { useMemo } from 'react';
import { ArrowRight, Flame, Sparkles, Trophy, X } from 'lucide-react';

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
    maxValue > 0 ? Math.max(6, Math.min(100, (value / maxValue) * 100)) : 6;

  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-sm font-black text-white">{label}</div>
        <div className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
          {Math.round(value)}
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-lime-300 transition-all duration-500"
          style={{ width: `${width}%` }}
        />
      </div>
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
    <div className="min-h-screen bg-black px-5 py-5 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-lime-200">
            <Sparkles className="h-3.5 w-3.5" />
            Daily check-in
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/[0.08]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-zinc-950/90 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.48)]">
          <h1 className="text-3xl font-black tracking-tight">Start smart today</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            Quick daily momentum screen built on your actual history, streak and PR proximity.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                <Flame className="h-3.5 w-3.5" />
                Streak
              </div>
              <div className="mt-2 text-2xl font-black text-white">{streak.current}</div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                <Trophy className="h-3.5 w-3.5" />
                Best
              </div>
              <div className="mt-2 text-2xl font-black text-white">{streak.best}</div>
            </div>
          </div>

          {topPR ? (
            <div className="mt-5 rounded-[26px] border border-yellow-300/20 bg-yellow-300/10 p-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-yellow-100">
                <Trophy className="h-3.5 w-3.5" />
                PR watch
              </div>

              <div className="mt-3 text-lg font-black text-white">{topPR.exercise}</div>
              <p className="mt-2 text-sm leading-6 text-yellow-50">
                You are only {topPR.diff} kg from your current best. This is a strong day to push.
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
              <div className="text-lg font-black text-white">No immediate PR target</div>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                That is fine. Today can still be a momentum day.
              </p>
            </div>
          )}

          <div className="mt-5 rounded-[28px] border border-lime-300/20 bg-lime-300/10 p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-lime-200">
              Recommended next focus
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {muscleLabels[suggestion.focusArea]}
            </div>
            <p className="mt-2 text-sm leading-6 text-lime-50">
              {suggestion.reason}
            </p>

            <button
              type="button"
              onClick={() => onStartWorkout(suggestion.focusArea)}
              className="mt-4 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[22px] bg-lime-300 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.18)] transition hover:brightness-105"
            >
              Start recommended workout
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => onStartWorkout()}
              className="mt-3 inline-flex min-h-[50px] w-full items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
            >
              Start anyway
            </button>
          </div>

          <div className="mt-5">
            <div className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
              Recent focus balance
            </div>

            <div className="space-y-3">
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

          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <div className="text-sm font-black text-white">Walk fallback</div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Low energy today? A walk still helps keep identity and streak momentum alive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}