import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';

import {
  appendWorkoutHistory,
  getRecommendedPlan,
  getSelectedPlanIndex,
  getTrainingLevel,
  getPlansForLevel,
  getExercisesForWorkoutDay,
  saveLastWorkoutSummary,
} from '@/lib/trainingStore';
import type { Exercise } from '@/lib/exerciseData';

type Props = {
  onBack: () => void;
  onComplete?: () => void;
  openPaywall?: (trigger: string) => void;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function WorkoutFlow({ onBack, onComplete, openPaywall }: Props) {
  const trainingLevel = getTrainingLevel();
  const plans = getPlansForLevel(trainingLevel);
  const selectedPlanIndex = Math.min(getSelectedPlanIndex(), plans.length - 1);
  const currentPlan = getRecommendedPlan(trainingLevel);

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentDay = currentPlan.days[selectedDayIndex];

  const workoutExercises = useMemo<Exercise[]>(
    () => getExercisesForWorkoutDay(currentDay, trainingLevel),
    [currentDay, trainingLevel]
  );

  const progress = workoutExercises.length
    ? Math.round((completedExerciseIds.length / workoutExercises.length) * 100)
    : 0;

  const startWorkout = () => {
    if (!startedAt) setStartedAt(Date.now());
  };

  const toggleExercise = (exerciseId: string) => {
    setCompletedExerciseIds((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const finishWorkout = () => {
    const durationMinutes = startedAt
      ? Math.max(1, Math.round((Date.now() - startedAt) / 60000))
      : 20;

    const xpEarned = 50 + completedExerciseIds.length * 20;

    const summary = {
      completedAt: new Date().toISOString(),
      durationMinutes,
      exercisesCompleted: completedExerciseIds.length,
      planName: currentPlan.name,
      xpEarned,
    };

    saveLastWorkoutSummary(summary);
    appendWorkoutHistory(summary);

    window.dispatchEvent(new Event('premium-updated'));
    window.dispatchEvent(new Event('focus'));
    setIsFinished(true);
    openPaywall?.('workout_complete');
    onComplete?.();

  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#07110d] text-white">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-8 pt-6">
          <button
            onClick={onBack}
            className="mb-4 inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </button>

          <div className="rounded-[32px] border border-lime-300/20 bg-gradient-to-br from-lime-300/10 via-white/[0.04] to-yellow-300/10 p-6 text-center shadow-[0_0_60px_rgba(170,255,140,0.1)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-lime-300/20 to-yellow-300/20 text-lime-200">
              <Trophy className="h-10 w-10" />
            </div>

            <div className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-lime-300/75">
              Workout complete
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight">XP secured</h1>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Good session. Momentum stacks when you keep showing up.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-white/45">XP</div>
                <div className="mt-2 text-2xl font-black text-white">
                  {50 + completedExerciseIds.length * 20}
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-white/45">Done</div>
                <div className="mt-2 text-2xl font-black text-white">
                  {completedExerciseIds.length}
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-white/45">Plan</div>
                <div className="mt-2 text-sm font-black text-white">
                  {currentPlan.name}
                </div>
              </div>
            </div>

            <button
              onClick={onBack}
              className="mt-6 w-full rounded-[22px] bg-gradient-to-r from-lime-300 via-emerald-300 to-yellow-300 px-4 py-4 text-base font-black text-[#101410]"
            >
              Return home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07110d] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-8 pt-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_50px_rgba(170,255,140,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-lime-300/75">
                Workout
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight">{currentPlan.name}</h1>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Level: <span className="font-bold capitalize text-white">{trainingLevel}</span>
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-black/20 text-lime-200">
              <Dumbbell className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-white/50">
              <span>Session progress</span>
              <span>{progress}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-yellow-300 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-3 flex items-center gap-3 text-sm text-white/65">
              <span className="inline-flex items-center gap-1">
                <Check className="h-4 w-4 text-lime-300" />
                {completedExerciseIds.length} completed
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-4 w-4 text-lime-300" />
                {startedAt ? 'In progress' : 'Not started'}
              </span>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-white/45">
              Workout days
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {currentPlan.days.map((day, index) => {
                const active = index === selectedDayIndex;
                return (
                  <button
                    key={`${day.label}-${index}`}
                    onClick={() => {
                      setSelectedDayIndex(index);
                      setCompletedExerciseIds([]);
                      setStartedAt(null);
                    }}
                    className={cn(
                      'shrink-0 rounded-2xl px-4 py-3 text-sm font-bold transition',
                      active
                        ? 'bg-gradient-to-r from-lime-300 to-emerald-300 text-[#111]'
                        : 'border border-white/10 bg-white/[0.04] text-white/80'
                    )}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-black text-white">{currentDay.label}</div>
                <div className="mt-1 text-sm text-white/60">
                  {currentDay.muscleGroups.join(' • ')}
                </div>
              </div>

              <div className="rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-lime-200">
                Plan {selectedPlanIndex + 1}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {workoutExercises.map((exercise) => {
              const done = completedExerciseIds.includes(exercise.id);

              return (
                <button
                  key={exercise.id}
                  onClick={() => {
                    if (!startedAt) startWorkout();
                    toggleExercise(exercise.id);
                  }}
                  className={cn(
                    'w-full rounded-[24px] border p-4 text-left transition',
                    done
                      ? 'border-lime-300/30 bg-lime-300/10'
                      : 'border-white/10 bg-white/[0.04]'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-black text-white">{exercise.name}</div>
                        {done && (
                          <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-lime-200">
                            Done
                          </span>
                        )}
                      </div>

                      <div className="mt-1 text-xs font-bold uppercase tracking-[0.15em] text-white/45">
                        {exercise.equipment} • {exercise.level}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {exercise.primaryMuscles.map((muscle) => (
                          <span
                            key={muscle}
                            className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] font-semibold text-white/70"
                          >
                            {muscle}
                          </span>
                        ))}
                      </div>

                      <ul className="mt-3 space-y-1 text-sm leading-6 text-white/62">
                        {exercise.instructions.map((instruction) => (
                          <li key={instruction}>• {instruction}</li>
                        ))}
                      </ul>
                    </div>

                    <div
                      className={cn(
                        'mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                        done ? 'bg-lime-300 text-[#101410]' : 'bg-white/8 text-white/60'
                      )}
                    >
                      {done ? <Check className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <div className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-white/45">
                <Flame className="h-3.5 w-3.5 text-lime-300" />
                Momentum
              </div>
              <div className="mt-2 text-lg font-black text-white">High</div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <div className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-white/45">
                <Zap className="h-3.5 w-3.5 text-lime-300" />
                XP
              </div>
              <div className="mt-2 text-lg font-black text-white">
                {50 + completedExerciseIds.length * 20}
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <div className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-white/45">
                <Sparkles className="h-3.5 w-3.5 text-lime-300" />
                Feel
              </div>
              <div className="mt-2 text-lg font-black text-white">Premium</div>
            </div>
          </div>

          <button
            onClick={finishWorkout}
            disabled={completedExerciseIds.length === 0}
            className={cn(
              'mt-6 w-full rounded-[22px] px-4 py-4 text-base font-black transition',
              completedExerciseIds.length > 0
                ? 'bg-gradient-to-r from-lime-300 via-emerald-300 to-yellow-300 text-[#101410]'
                : 'cursor-not-allowed bg-white/10 text-white/35'
            )}
          >
            Finish workout
          </button>
        </div>
      </div>
    </div>
  );
}