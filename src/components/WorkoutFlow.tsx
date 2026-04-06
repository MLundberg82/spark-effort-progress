import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  Dumbbell,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';

import {
  getSuggestedWeight,
  type ExerciseEntry,
  type MuscleGroup,
} from '@/lib/historyStore';
import { checkPremium } from '@/lib/premiumStore';
import {
  clearWorkoutDraft,
  getWorkoutDraft,
  saveWorkoutDraft,
} from '@/lib/workoutStore';
import {
  getRecommendedPlan,
  getTrainingLevel,
  type WorkoutPlan,
} from '@/lib/trainingStore';

type SetData = {
  reps: number;
  weight: number;
};

type ExerciseDraft = {
  name: string;
  muscleGroup: MuscleGroup;
  sets: SetData[];
};

type WorkoutCompleteResult = {
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
  focusArea: Extract<MuscleGroup, 'chest' | 'back' | 'arms' | 'legs'>;
  details: Array<{
    exercise: string;
    sets: number;
    reps: number;
    weight: number;
    volume: number;
  }>;
};

type WorkoutFlowProps = {
  onBack: () => void;
  onComplete: (result: WorkoutCompleteResult) => void;
};

function toSupportedFocusArea(
  group: MuscleGroup,
): WorkoutCompleteResult['focusArea'] {
  if (group === 'back' || group === 'arms' || group === 'legs') return group;
  return 'chest';
}

function getPrimaryFocus(
  exercises: ExerciseDraft[],
): WorkoutCompleteResult['focusArea'] {
  const score: Record<WorkoutCompleteResult['focusArea'], number> = {
    chest: 0,
    back: 0,
    arms: 0,
    legs: 0,
  };

  for (const exercise of exercises) {
    const supported = toSupportedFocusArea(exercise.muscleGroup);
    score[supported] += exercise.sets.length;
  }

  return (Object.entries(score).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    'chest') as WorkoutCompleteResult['focusArea'];
}

function buildExercisesFromPlan(plan: WorkoutPlan): ExerciseDraft[] {
  const day = plan.days[0];

  return day.muscleGroups.map((group, index) => {
    if (group === 'legs' && index === 0) {
      return {
        name: 'Walk',
        muscleGroup: 'legs',
        sets: [{ reps: 30, weight: 0 }],
      };
    }

    if (group === 'chest') {
      return {
        name: 'Bench Press',
        muscleGroup: 'chest',
        sets: [
          { reps: 10, weight: 40 },
          { reps: 8, weight: 45 },
          { reps: 8, weight: 45 },
        ],
      };
    }

    if (group === 'back') {
      return {
        name: 'Lat Pulldown',
        muscleGroup: 'back',
        sets: [
          { reps: 12, weight: 35 },
          { reps: 10, weight: 40 },
          { reps: 10, weight: 40 },
        ],
      };
    }

    if (group === 'arms') {
      return {
        name: 'Biceps Curl',
        muscleGroup: 'arms',
        sets: [
          { reps: 12, weight: 10 },
          { reps: 10, weight: 12 },
          { reps: 10, weight: 12 },
        ],
      };
    }

    if (group === 'shoulders') {
      return {
        name: 'Shoulder Press',
        muscleGroup: 'shoulders',
        sets: [
          { reps: 10, weight: 20 },
          { reps: 10, weight: 20 },
          { reps: 8, weight: 22.5 },
        ],
      };
    }

    return {
      name: 'Plank',
      muscleGroup: group,
      sets: [
        { reps: 45, weight: 0 },
        { reps: 45, weight: 0 },
      ],
    };
  });
}

function normalizeExercises(raw: unknown): ExerciseDraft[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((exercise) => {
      if (!exercise || typeof exercise !== 'object') return null;

      const candidate = exercise as {
        name?: string;
        muscleGroup?: string;
        sets?: Array<{ reps?: number; weight?: number }>;
      };

      if (!candidate.name || !Array.isArray(candidate.sets) || candidate.sets.length === 0) {
        return null;
      }

      const muscleGroup: MuscleGroup =
        candidate.muscleGroup === 'back' ||
        candidate.muscleGroup === 'arms' ||
        candidate.muscleGroup === 'legs' ||
        candidate.muscleGroup === 'shoulders' ||
        candidate.muscleGroup === 'core'
          ? candidate.muscleGroup
          : 'chest';

      return {
        name: candidate.name,
        muscleGroup,
        sets: candidate.sets.map((set) => ({
          reps: Number.isFinite(Number(set.reps))
            ? Math.max(0, Math.round(Number(set.reps)))
            : 0,
          weight: Number.isFinite(Number(set.weight))
            ? Math.max(0, Number(set.weight))
            : 0,
        })),
      } satisfies ExerciseDraft;
    })
    .filter((exercise): exercise is ExerciseDraft => Boolean(exercise));
}

function toExerciseEntries(exercises: ExerciseDraft[]): ExerciseEntry[] {
  return exercises.map((exercise) => ({
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    sets: exercise.sets,
  }));
}

export default function WorkoutFlow({
  onBack,
  onComplete,
}: WorkoutFlowProps) {
  const premium = checkPremium().isActive;
  const recommendedPlan = useMemo(
    () => getRecommendedPlan(getTrainingLevel()),
    [],
  );
  const draft = useMemo(() => getWorkoutDraft(), []);

  const [startedAt] = useState(draft?.startedAt ?? new Date().toISOString());
  const [workoutName, setWorkoutName] = useState(
    draft?.workoutName ?? recommendedPlan.name,
  );
  const [notes, setNotes] = useState(draft?.notes ?? '');
  const [planName] = useState(draft?.planName ?? recommendedPlan.name);
  const [dayLabel] = useState(draft?.dayLabel ?? recommendedPlan.days[0]?.label ?? 'Day 1');
  const [expandedExercise, setExpandedExercise] = useState<number | null>(0);
  const [exercises, setExercises] = useState(
    draft?.exercises && draft.exercises.length > 0
      ? normalizeExercises(draft.exercises)
      : buildExercisesFromPlan(recommendedPlan),
  );

  useEffect(() => {
    saveWorkoutDraft({
      startedAt,
      workoutName,
      notes,
      planName,
      dayLabel,
      isCustom: false,
      exercises,
    });
  }, [startedAt, workoutName, notes, planName, dayLabel, exercises]);

  const totalVolume = useMemo(() => {
    return exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.sets.reduce((sum, set) => sum + set.reps * set.weight, 0)
      );
    }, 0);
  }, [exercises]);

  const totalSets = useMemo(() => {
    return exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  }, [exercises]);

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight',
    value: number,
  ) => {
    setExercises((current) =>
      current.map((exercise, currentExerciseIndex) => {
        if (currentExerciseIndex !== exerciseIndex) return exercise;

        return {
          ...exercise,
          sets: exercise.sets.map((set, currentSetIndex) => {
            if (currentSetIndex !== setIndex) return set;

            return {
              ...set,
              [field]:
                field === 'reps'
                  ? Math.max(0, Math.round(value))
                  : Math.max(0, value),
            };
          }),
        };
      }),
    );
  };

  const addSet = (exerciseIndex: number) => {
    setExercises((current) =>
      current.map((exercise, index) => {
        if (index !== exerciseIndex) return exercise;

        const lastSet = exercise.sets[exercise.sets.length - 1] ?? {
          reps: 10,
          weight: 0,
        };

        return {
          ...exercise,
          sets: [...exercise.sets, { ...lastSet }],
        };
      }),
    );
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setExercises((current) =>
      current.map((exercise, index) => {
        if (index !== exerciseIndex) return exercise;
        if (exercise.sets.length <= 1) return exercise;

        return {
          ...exercise,
          sets: exercise.sets.filter(
            (_, currentSetIndex) => currentSetIndex !== setIndex,
          ),
        };
      }),
    );
  };

  const handleFinish = () => {
    const durationMinutes = Math.max(
      1,
      Math.round((Date.now() - new Date(startedAt).getTime()) / 60000),
    );

    const details = exercises.map((exercise) => {
      const topSet = exercise.sets.reduce(
        (best, current) => (current.weight > best.weight ? current : best),
        exercise.sets[0] ?? { reps: 0, weight: 0 },
      );

      const volume = exercise.sets.reduce(
        (sum, set) => sum + set.reps * set.weight,
        0,
      );

      return {
        exercise: exercise.name,
        sets: exercise.sets.length,
        reps: topSet.reps,
        weight: topSet.weight,
        volume,
      };
    });

    clearWorkoutDraft();

    onComplete({
      workoutName,
      durationMinutes,
      exercisesCompleted: exercises.length,
      volume: totalVolume,
      focusArea: getPrimaryFocus(exercises),
      details,
    });
  };

  return (
    <div className="min-h-screen bg-black px-5 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/80 transition hover:bg-white/[0.08]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mt-5 rounded-[30px] border border-white/10 bg-white/[0.04] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-lime-300/80">
                Workout
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight">
                Active session
              </h1>
              <div className="mt-2 text-sm text-white/60">
                {planName} · {dayLabel}
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/70">
              {premium ? (
                <>
                  <Crown className="h-3.5 w-3.5" />
                  Premium
                </>
              ) : (
                <>
                  <Dumbbell className="h-3.5 w-3.5" />
                  Base
                </>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <label className="block">
                <div className="text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
                  Workout name
                </div>
                <input
                  value={workoutName}
                  onChange={(event) => setWorkoutName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-lime-300"
                  placeholder="Push day"
                />
              </label>

              <label className="mt-4 block">
                <div className="text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
                  Notes
                </div>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="mt-2 min-h-[96px] w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-lime-300"
                  placeholder="Energy, pump, what felt strong..."
                />
              </label>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
                    Autosave
                  </div>
                  <div className="mt-1 text-lg font-black">Draft active</div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-300">
                  <Save className="h-3.5 w-3.5" />
                  Safe
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                    Exercises
                  </div>
                  <div className="mt-1 text-2xl font-black text-white">
                    {exercises.length}
                  </div>
                </div>

                <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                    Sets
                  </div>
                  <div className="mt-1 text-2xl font-black text-white">
                    {totalSets}
                  </div>
                </div>

                <div className="col-span-2 rounded-[20px] border border-white/10 bg-black/20 px-4 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                    Volume
                  </div>
                  <div className="mt-1 text-2xl font-black text-white">
                    {Math.round(totalVolume)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {exercises.map((exercise, exerciseIndex) => {
              const suggestedWeight =
                premium && exercise.muscleGroup !== 'core'
                  ? getSuggestedWeight(exercise.name)
                  : null;
              const expanded = expandedExercise === exerciseIndex;

              return (
                <div
                  key={`${exercise.name}-${exerciseIndex}`}
                  className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedExercise((current) =>
                        current === exerciseIndex ? null : exerciseIndex,
                      )
                    }
                    className="flex w-full items-start justify-between gap-3 text-left"
                  >
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
                        {exercise.muscleGroup}
                      </div>

                      <div className="mt-1 text-xl font-black tracking-tight text-white">
                        {exercise.name}
                      </div>

                      {suggestedWeight ? (
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-lime-200">
                          <Sparkles className="h-3.5 w-3.5" />
                          Suggested {suggestedWeight} kg
                        </div>
                      ) : !premium && exercise.muscleGroup !== 'core' ? (
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-yellow-100">
                          <Crown className="h-3.5 w-3.5" />
                          Smart suggestions in premium
                        </div>
                      ) : null}
                    </div>

                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                      {expanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </button>

                  {expanded ? (
                    <div className="mt-4 space-y-3">
                      {exercise.sets.map((set, setIndex) => (
                        <div
                          key={`${exercise.name}-set-${setIndex}`}
                          className="rounded-[22px] border border-white/10 bg-zinc-950/90 p-3"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div className="text-sm font-black uppercase tracking-[0.14em] text-white">
                              Set {setIndex + 1}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeSet(exerciseIndex, setIndex)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-zinc-300 transition hover:bg-white/[0.08]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                                Reps
                              </label>
                              <input
                                value={set.reps}
                                onChange={(event) =>
                                  updateSet(
                                    exerciseIndex,
                                    setIndex,
                                    'reps',
                                    Number(event.target.value),
                                  )
                                }
                                inputMode="numeric"
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-lime-300"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                                Weight
                              </label>
                              <input
                                value={set.weight}
                                onChange={(event) =>
                                  updateSet(
                                    exerciseIndex,
                                    setIndex,
                                    'weight',
                                    Number(event.target.value),
                                  )
                                }
                                inputMode="decimal"
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-lime-300"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addSet(exerciseIndex)}
                        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
                      >
                        <Plus className="h-4 w-4" />
                        Add set
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="mt-5 inline-flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[24px] bg-lime-300 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.2)] transition hover:brightness-105"
          >
            <Check className="h-4 w-4" />
            Finish workout
          </button>
        </div>
      </div>
    </div>
  );
}