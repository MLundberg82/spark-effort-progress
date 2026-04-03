import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Dumbbell,
  Plus,
  Trash2,
  Zap,
} from 'lucide-react';
import {
  exercises,
  type MuscleGroup,
  muscleGroupLabels,
} from '@/lib/exerciseData';
import {
  saveWorkout,
  getWorkouts,
  type WorkoutEntry,
  type WorkoutLog,
  type WorkoutSet,
} from '@/lib/workoutStore';
import {
  calculateWorkoutXP,
  addXP,
  type XPBreakdown,
  isPremium,
} from '@/lib/gamificationStore';
import {
  getRecommendedPlan,
  getTrainingLevel,
} from '@/lib/trainingStore';
import { muscleGroupIconMap } from '@/lib/muscleGroupIcons';
import { Button } from '@/components/ui/button';

type WorkoutFlowProps = {
  onComplete: (breakdown: XPBreakdown, oldLevel: number, newLevel: number) => void;
  onCancel: () => void;
};

type FlowPhase = 'select' | 'logging';

const muscleGroups: MuscleGroup[] = [
  'chest',
  'back',
  'shoulders',
  'legs',
  'arms',
  'core',
  'warmup',
  'stretching',
];

function getLastValues(exerciseId: string): { weight: number; reps: number } {
  const workouts = getWorkouts();

  for (let i = workouts.length - 1; i >= 0; i--) {
    const entry = workouts[i].entries.find((e) => e.exerciseId === exerciseId);
    if (entry && entry.sets.length > 0) {
      const lastSet = entry.sets[entry.sets.length - 1];
      return {
        weight: lastSet.weight || 0,
        reps: lastSet.reps || 10,
      };
    }
  }

  return { weight: 0, reps: 10 };
}

export default function WorkoutFlow({
  onComplete,
  onCancel,
}: WorkoutFlowProps) {
  const [phase, setPhase] = useState<FlowPhase>('select');
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);

  const level = getTrainingLevel();
  const plan = level ? getRecommendedPlan(level) : null;

  const presetDays = useMemo(() => {
    if (!plan) return [];

    return plan.days.map((day) => ({
      label: day.label,
      muscleGroups: day.muscleGroups,
      exercises: day.muscleGroups.flatMap((mg) =>
        exercises.filter((ex) => ex.muscleGroup === mg).slice(0, 3)
      ),
    }));
  }, [plan]);

  const currentEntry = entries[currentExerciseIdx];
  const currentExercise = currentEntry
    ? exercises.find((e) => e.id === currentEntry.exerciseId)
    : null;

  const loadPreset = (preset: (typeof presetDays)[number]) => {
    const newEntries: WorkoutEntry[] = preset.exercises.map((ex) => {
      const last = getLastValues(ex.id);
      return {
        exerciseId: ex.id,
        sets: [
          { weight: last.weight, reps: last.reps },
          { weight: last.weight, reps: last.reps },
          { weight: last.weight, reps: last.reps },
        ],
      };
    });

    setEntries(newEntries);
    setCurrentExerciseIdx(0);
    setPhase('logging');
  };

  const addExercise = (exerciseId: string) => {
    if (entries.some((e) => e.exerciseId === exerciseId)) return;

    const last = getLastValues(exerciseId);

    setEntries((prev) => [
      ...prev,
      {
        exerciseId,
        sets: [{ weight: last.weight, reps: last.reps }],
      },
    ]);
  };

  const startLogging = () => {
    if (entries.length === 0) return;
    setCurrentExerciseIdx(0);
    setPhase('logging');
  };

  const updateSet = (
    setIndex: number,
    field: keyof WorkoutSet,
    value: number
  ) => {
    setEntries((prev) => {
      const updated = [...prev];
      updated[currentExerciseIdx] = {
        ...updated[currentExerciseIdx],
        sets: updated[currentExerciseIdx].sets.map((set, i) =>
          i === setIndex ? { ...set, [field]: value } : set
        ),
      };
      return updated;
    });
  };

  const addSet = () => {
    if (!currentEntry) return;

    const lastSet = currentEntry.sets[currentEntry.sets.length - 1] || {
      weight: 0,
      reps: 10,
    };

    setEntries((prev) => {
      const updated = [...prev];
      updated[currentExerciseIdx] = {
        ...updated[currentExerciseIdx],
        sets: [...updated[currentExerciseIdx].sets, { ...lastSet }],
      };
      return updated;
    });
  };

  const removeSet = (setIndex: number) => {
    if (!currentEntry || currentEntry.sets.length <= 1) return;

    setEntries((prev) => {
      const updated = [...prev];
      updated[currentExerciseIdx] = {
        ...updated[currentExerciseIdx],
        sets: updated[currentExerciseIdx].sets.filter((_, i) => i !== setIndex),
      };
      return updated;
    });
  };

  const nextExercise = () => {
    if (currentExerciseIdx < entries.length - 1) {
      setCurrentExerciseIdx((prev) => prev + 1);
    }
  };

  const prevExercise = () => {
    if (currentExerciseIdx > 0) {
      setCurrentExerciseIdx((prev) => prev - 1);
    }
  };

  const finishWorkout = () => {
    if (entries.length === 0) return;

    const workout: WorkoutLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      entries,
    };

    saveWorkout(workout);

    const breakdown = calculateWorkoutXP(workout);
    const { oldLevel, newLevel } = addXP(breakdown.total);

    onComplete(breakdown, oldLevel, newLevel);
  };

  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-background px-4 py-4 text-foreground">
        <div className="mx-auto w-full max-w-md">
          <button
            type="button"
            onClick={onCancel}
            className="mb-4 rounded-2xl border border-border/50 bg-secondary/30 px-4 py-2 text-sm font-medium"
          >
            Back
          </button>

          <div className="rounded-3xl border border-border/40 bg-card/70 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Workout
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Choose Exercises
            </h1>

            {presetDays.length > 0 && (
              <div className="mt-5">
                <h2 className="text-lg font-bold">Quick Start</h2>
                <div className="mt-3 space-y-3">
                  {presetDays.map((preset, i) => (
                    <button
                      key={`${preset.label}-${i}`}
                      type="button"
                      onClick={() => loadPreset(preset)}
                      className="w-full rounded-2xl border border-border/40 bg-secondary/20 p-4 text-left transition hover:bg-secondary/30"
                    >
                      <div className="font-semibold">{preset.label}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {preset.exercises.length} exercises
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Custom Workout</h2>
                {!isPremium() && (
                  <div className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-300">
                    Premium
                  </div>
                )}
              </div>

              {isPremium() ? (
                <div className="mt-3 space-y-3">
                  {muscleGroups.map((group) => {
                    const groupExercises = exercises.filter(
                      (ex) => ex.muscleGroup === group
                    );
                    const Icon = muscleGroupIconMap[group] || Dumbbell;

                    return (
                      <div
                        key={group}
                        className="rounded-2xl border border-border/40 bg-secondary/20 p-4"
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div className="font-semibold">
                            {muscleGroupLabels[group]}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {groupExercises.map((ex) => {
                            const isAdded = entries.some(
                              (e) => e.exerciseId === ex.id
                            );

                            return (
                              <button
                                key={ex.id}
                                type="button"
                                onClick={() => addExercise(ex.id)}
                                disabled={isAdded}
                                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                                  isAdded
                                    ? 'border border-primary/30 bg-primary/10 text-primary'
                                    : 'bg-background/70 text-foreground hover:bg-background'
                                }`}
                              >
                                <span>{ex.name}</span>
                                {isAdded ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {entries.length > 0 && (
                    <Button onClick={startLogging} className="mt-4 w-full">
                      Start ({entries.length} exercises)
                    </Button>
                  )}
                </div>
              ) : (
                <div className="mt-3 rounded-2xl border border-border/40 bg-secondary/20 p-4">
                  <div className="font-semibold">Custom Workout Builder</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Unlock Premium to build your own workouts from individual exercises.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-4 text-foreground">
      <div className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={onCancel}
          className="mb-4 rounded-2xl border border-border/50 bg-secondary/30 px-4 py-2 text-sm font-medium"
        >
          Back
        </button>

        <div className="rounded-3xl border border-border/40 bg-card/70 p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Workout Flow
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight">
            {currentExercise?.name || 'Exercise'}
          </h1>
          <div className="mt-1 text-sm text-muted-foreground">
            {currentExerciseIdx + 1} / {entries.length}
          </div>

          <div className="mt-5 space-y-3">
            {currentEntry?.sets.map((set, si) => (
              <div
                key={si}
                className="rounded-2xl border border-border/40 bg-secondary/20 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="font-semibold">Set {si + 1}</div>
                  {si > 0 && (
                    <button
                      type="button"
                      onClick={() => removeSet(si)}
                      className="text-muted-foreground transition hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="mb-2 text-sm font-medium">Weight</div>
                    <input
                      type="number"
                      min={0}
                      value={set.weight}
                      onChange={(e) =>
                        updateSet(si, 'weight', Number(e.target.value) || 0)
                      }
                      className="h-11 w-full rounded-xl border border-border bg-background/70 px-3 outline-none"
                    />
                  </div>

                  <div>
                    <div className="mb-2 text-sm font-medium">Reps</div>
                    <input
                      type="number"
                      min={0}
                      value={set.reps}
                      onChange={(e) =>
                        updateSet(si, 'reps', Number(e.target.value) || 0)
                      }
                      className="h-11 w-full rounded-xl border border-border bg-background/70 px-3 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addSet}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border/40 bg-secondary/20 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            Add Set
          </button>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={prevExercise}
              disabled={currentExerciseIdx === 0}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border/40 bg-secondary/20 text-sm font-semibold disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {currentExerciseIdx < entries.length - 1 ? (
              <button
                type="button"
                onClick={nextExercise}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finishWorkout}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground"
              >
                <Zap className="h-4 w-4" />
                Finish Workout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}