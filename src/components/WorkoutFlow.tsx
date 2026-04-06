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

import { getSuggestedWeight, type MuscleGroup } from '@/lib/historyStore';
import { checkPremium } from '@/lib/premiumStore';
import {
  clearWorkoutDraft,
  getWorkoutDraft,
  saveWorkoutDraft,
} from '@/lib/workoutStore';
import { getRecommendedPlan, getTrainingLevel } from '@/lib/trainingStore';

type SetData = {
  reps: number;
  weight: number;
};

type ExerciseDraft = {
  name: string;
  muscleGroup: MuscleGroup;
  sets: SetData[];
};

type SupportedFocusArea = Extract<MuscleGroup, 'chest' | 'back' | 'arms' | 'legs'>;

type WorkoutCompleteResult = {
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
  focusArea: SupportedFocusArea;
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
  initialFocus?: SupportedFocusArea;
};

const focusLabels: Record<SupportedFocusArea, string> = {
  chest: 'Bröst',
  back: 'Rygg',
  legs: 'Ben',
  arms: 'Armar',
};

function toSupportedFocusArea(group: MuscleGroup): SupportedFocusArea {
  if (group === 'back' || group === 'arms' || group === 'legs') return group;
  return 'chest';
}

function getPrimaryFocus(exercises: ExerciseDraft[]): SupportedFocusArea {
  const score: Record<SupportedFocusArea, number> = {
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
    'chest') as SupportedFocusArea;
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

function buildPresetExercises(focus: SupportedFocusArea): ExerciseDraft[] {
  if (focus === 'chest') {
    return [
      {
        name: 'Bench Press',
        muscleGroup: 'chest',
        sets: [
          { reps: 10, weight: 40 },
          { reps: 8, weight: 45 },
          { reps: 8, weight: 45 },
        ],
      },
      {
        name: 'Incline Dumbbell Press',
        muscleGroup: 'chest',
        sets: [
          { reps: 12, weight: 18 },
          { reps: 10, weight: 20 },
          { reps: 10, weight: 20 },
        ],
      },
      {
        name: 'Chest Fly',
        muscleGroup: 'chest',
        sets: [
          { reps: 12, weight: 12 },
          { reps: 12, weight: 12 },
          { reps: 10, weight: 14 },
        ],
      },
      {
        name: 'Push-Up',
        muscleGroup: 'chest',
        sets: [
          { reps: 15, weight: 0 },
          { reps: 12, weight: 0 },
          { reps: 10, weight: 0 },
        ],
      },
    ];
  }

  if (focus === 'back') {
    return [
      {
        name: 'Lat Pulldown',
        muscleGroup: 'back',
        sets: [
          { reps: 12, weight: 35 },
          { reps: 10, weight: 40 },
          { reps: 10, weight: 40 },
        ],
      },
      {
        name: 'Seated Row',
        muscleGroup: 'back',
        sets: [
          { reps: 12, weight: 35 },
          { reps: 10, weight: 40 },
          { reps: 10, weight: 40 },
        ],
      },
      {
        name: 'Dumbbell Row',
        muscleGroup: 'back',
        sets: [
          { reps: 12, weight: 20 },
          { reps: 10, weight: 22.5 },
          { reps: 10, weight: 22.5 },
        ],
      },
      {
        name: 'Face Pull',
        muscleGroup: 'back',
        sets: [
          { reps: 15, weight: 15 },
          { reps: 15, weight: 15 },
          { reps: 12, weight: 17.5 },
        ],
      },
    ];
  }

  if (focus === 'arms') {
    return [
      {
        name: 'Biceps Curl',
        muscleGroup: 'arms',
        sets: [
          { reps: 12, weight: 10 },
          { reps: 10, weight: 12 },
          { reps: 10, weight: 12 },
        ],
      },
      {
        name: 'Hammer Curl',
        muscleGroup: 'arms',
        sets: [
          { reps: 12, weight: 10 },
          { reps: 10, weight: 12 },
          { reps: 10, weight: 12 },
        ],
      },
      {
        name: 'Triceps Pushdown',
        muscleGroup: 'arms',
        sets: [
          { reps: 12, weight: 20 },
          { reps: 10, weight: 25 },
          { reps: 10, weight: 25 },
        ],
      },
      {
        name: 'Overhead Extension',
        muscleGroup: 'arms',
        sets: [
          { reps: 12, weight: 12 },
          { reps: 10, weight: 14 },
          { reps: 10, weight: 14 },
        ],
      },
    ];
  }

  return [
    {
      name: 'Walk',
      muscleGroup: 'legs',
      sets: [
        { reps: 30, weight: 0 },
        { reps: 30, weight: 0 },
        { reps: 30, weight: 0 },
      ],
    },
    {
      name: 'Leg Press',
      muscleGroup: 'legs',
      sets: [
        { reps: 12, weight: 80 },
        { reps: 10, weight: 100 },
        { reps: 10, weight: 100 },
      ],
    },
    {
      name: 'Leg Curl',
      muscleGroup: 'legs',
      sets: [
        { reps: 12, weight: 25 },
        { reps: 12, weight: 30 },
        { reps: 10, weight: 30 },
      ],
    },
    {
      name: 'Calf Raise',
      muscleGroup: 'legs',
      sets: [
        { reps: 15, weight: 30 },
        { reps: 15, weight: 30 },
        { reps: 12, weight: 35 },
      ],
    },
  ];
}

function inferFocusFromRecommendedPlan(): SupportedFocusArea {
  const plan = getRecommendedPlan(getTrainingLevel());
  const firstDay = plan.days[0];
  const groups = firstDay?.muscleGroups ?? [];

  if (groups.includes('back')) return 'back';
  if (groups.includes('arms')) return 'arms';
  if (groups.includes('legs')) return 'legs';
  return 'chest';
}

function compactNumber(value: number) {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}

export default function WorkoutFlow({
  onBack,
  onComplete,
  initialFocus,
}: WorkoutFlowProps) {
  const premium = checkPremium().isActive;
  const draft = useMemo(() => getWorkoutDraft(), []);
  const fallbackFocus = useMemo(() => inferFocusFromRecommendedPlan(), []);
  const resolvedInitialFocus = initialFocus ?? fallbackFocus;

  const [startedAt] = useState(draft?.startedAt ?? new Date().toISOString());
  const [expandedExercise, setExpandedExercise] = useState<number | null>(0);
  const [exercises, setExercises] = useState(
    draft?.exercises && draft.exercises.length > 0
      ? normalizeExercises(draft.exercises)
      : buildPresetExercises(resolvedInitialFocus),
  );
  const [workoutName] = useState(
    draft?.workoutName ?? focusLabels[resolvedInitialFocus],
  );
  const [planName] = useState(
    draft?.planName ?? `${focusLabels[resolvedInitialFocus]} preset`,
  );
  const [dayLabel] = useState(draft?.dayLabel ?? `${focusLabels[resolvedInitialFocus]} day`);

  useEffect(() => {
    saveWorkoutDraft({
      startedAt,
      workoutName,
      planName,
      dayLabel,
      isCustom: false,
      exercises,
    });
  }, [startedAt, workoutName, planName, dayLabel, exercises]);

  const totalVolume = useMemo(() => {
    return exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((sum, set) => sum + set.reps * set.weight, 0);
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
          sets: exercise.sets.filter((_, currentSetIndex) => currentSetIndex !== setIndex),
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
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/80 transition hover:bg-white/[0.08]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/70">
              {premium ? (
                <>
                  <Crown className="h-3.5 w-3.5" />
                  Premium
                </>
              ) : (
                <>
                  <Dumbbell className="h-3.5 w-3.5" />
                  Preset
                </>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-lime-300/80">
              Workout
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight">{workoutName}</h1>
            <div className="mt-1 text-xs text-white/55">
              {planName} · {dayLabel}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <div className="rounded-[20px] border border-white/10 bg-black/20 px-3 py-3">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                Exercises
              </div>
              <div className="mt-1 text-xl font-black">{exercises.length}</div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-black/20 px-3 py-3">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                Sets
              </div>
              <div className="mt-1 text-xl font-black">{totalSets}</div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-black/20 px-3 py-3">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                Volume
              </div>
              <div className="mt-1 text-xl font-black">{Math.round(totalVolume)}</div>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {exercises.map((exercise, exerciseIndex) => {
              const suggestedWeight =
                premium && exercise.muscleGroup !== 'core'
                  ? getSuggestedWeight(exercise.name)
                  : null;
              const expanded = expandedExercise === exerciseIndex;

              return (
                <div
                  key={`${exercise.name}-${exerciseIndex}`}
                  className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3"
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
                    <div className="min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                        {exercise.muscleGroup}
                      </div>

                      <div className="mt-1 text-base font-black tracking-tight text-white">
                        {exercise.name}
                      </div>

                      {suggestedWeight ? (
                        <div className="mt-1.5 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-lime-200">
                          <Sparkles className="h-3 w-3" />
                          Suggested {compactNumber(suggestedWeight)} kg
                        </div>
                      ) : null}
                    </div>

                    <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                      {expanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </button>

                  {expanded ? (
                    <div className="mt-3 space-y-2">
                      {exercise.sets.map((set, setIndex) => (
                        <div
                          key={`${exercise.name}-set-${setIndex}`}
                          className="rounded-[18px] border border-white/10 bg-zinc-950/90 p-2.5"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white">
                              Set {setIndex + 1}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeSet(exerciseIndex, setIndex)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-zinc-300 transition hover:bg-white/[0.08]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-[0.12em] text-white/40">
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
                                className="mt-1.5 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-lime-300"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-black uppercase tracking-[0.12em] text-white/40">
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
                                className="mt-1.5 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-lime-300"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addSet(exerciseIndex)}
                        className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/[0.08]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add set
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-black/20 px-3 py-3">
            <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-white/55">
              <Save className="h-3.5 w-3.5" />
              Draft active
            </div>

            <div className="text-[11px] font-bold text-white/40">
              Autosave on
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="mt-4 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[22px] bg-lime-300 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.2)] transition hover:brightness-105"
          >
            <Check className="h-4 w-4" />
            Finish workout
          </button>
        </div>
      </div>
    </div>
  );
}