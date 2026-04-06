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
  const width = maxValue > 0 ? Math.max(8, Math.min(100, (value / maxValue) * 100)) : 8;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/55">
          {label}
        </div>
        <div className="text-xs font-black text-white/70">{Math.round(value)}</div>
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-black text-white">{value}</div>
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
    <div className="min-h-screen bg-black px-4 pb-6 pt-4 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-4xl flex-col">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-start justify-between gap-3">
            <button
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.05] transition hover:bg-white/[0.08]"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1 text-center">
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-lime-300/80">
                Daily check-in
              </div>
              <h1 className="mt-1 text-2xl font-black tracking-tight">Momentum today</h1>
              <p className="mt-2 text-sm text-white/62">
                Quick streak, recovery and next-focus overview from your recent training.
              </p>
            </div>

            <div className="h-11 w-11" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
            <StatCard icon={<Flame className="h-3.5 w-3.5" />} label="Streak" value={streak.current} />
            <StatCard icon={<Trophy className="h-3.5 w-3.5" />} label="Best" value={streak.best} />
            <StatCard
              icon={<Sparkles className="h-3.5 w-3.5" />}
              label="Focus"
              value={muscleLabels[suggestion.focusArea]}
            />
            <StatCard
              icon={<Footprints className="h-3.5 w-3.5" />}
              label="Fallback"
              value="Walk"
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
                Recommended next focus
              </div>

              <div className="mt-3 rounded-[22px] border border-lime-400/20 bg-lime-400/10 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-lime-100/85">
                  {muscleLabels[suggestion.focusArea]} day
                </div>
                <div className="mt-1 text-lg font-black text-white">
                  {muscleLabels[suggestion.focusArea]}
                </div>
                <div className="mt-2 text-sm leading-6 text-white/70">{suggestion.reason}</div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => onStartWorkout(suggestion.focusArea)}
                  className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-[22px] bg-lime-300 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.18)] transition hover:brightness-105"
                >
                  Start recommended
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => onStartWorkout()}
                  className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
                >
                  Start anyway
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
                PR watch
              </div>

              <div className="mt-3 rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                {topPR ? (
                  <>
                    <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                      Closest PR
                    </div>
                    <div className="mt-1 text-lg font-black text-white">{topPR.exercise}</div>
                    <p className="mt-2 text-sm leading-6 text-white/65">
                      You are only {topPR.diff} kg from your current best. Strong day to push if
                      energy is there.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                      No immediate PR target
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/65">
                      That is fine. Today can still be a consistency win.
                    </p>
                  </>
                )}
              </div>

              <div className="mt-3 rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                  Walk fallback
                </div>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  A walk can keep identity, momentum and streak alive even on a lighter day.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
              Recent focus balance
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
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

        <div className="mt-auto flex justify-end pt-4">
          <button
            onClick={onClose}
            className="inline-flex min-h-[48px] items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.05] px-5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
          >
            Back to menu
          </button>
        </div>
      </div>
    </div>
  );
}