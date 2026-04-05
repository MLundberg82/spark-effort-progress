import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Crown,
  Dumbbell,
  Flame,
  Plus,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react';
import FloatingWorkoutTimer from '@/components/FloatingWorkoutTimer';
import { checkPremium } from '@/lib/premiumStore';
import { getTrainingLevel } from '@/lib/trainingStore';
import {
  getTimerSettings,
  resetWorkoutTimerToPhase,
  startWorkoutTimer,
  stopWorkoutTimer,
} from '@/lib/timerStore';

type ExerciseRow = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  muscleGroup: string;
  completed?: boolean;
};

type WorkoutTemplate = {
  id: string;
  name: string;
  subtitle: string;
  focus: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: ExerciseRow[];
};

type WorkoutCompletePayload = {
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
};

type WorkoutFlowProps = {
  onBack: () => void;
  onComplete: (result: WorkoutCompletePayload) => void;
};

const workoutTemplates: WorkoutTemplate[] = [
  {
    id: 'beginner-full-body',
    name: 'Full Body Starter',
    subtitle: 'Simple, balanced, easy to follow',
    focus: 'Best starting point for new lifters',
    difficulty: 'beginner',
    exercises: [
      { id: '1', name: 'Leg Press', sets: 3, reps: 12, weight: 80, muscleGroup: 'Legs' },
      { id: '2', name: 'Chest Press', sets: 3, reps: 10, weight: 35, muscleGroup: 'Chest' },
      { id: '3', name: 'Lat Pulldown', sets: 3, reps: 10, weight: 35, muscleGroup: 'Back' },
      { id: '4', name: 'Shoulder Press', sets: 2, reps: 12, weight: 20, muscleGroup: 'Shoulders' },
    ],
  },
  {
    id: 'upper-power',
    name: 'Upper Power',
    subtitle: 'Chest, back, shoulders',
    focus: 'Strength-focused upper body session',
    difficulty: 'intermediate',
    exercises: [
      { id: '1', name: 'Bench Press', sets: 4, reps: 6, weight: 70, muscleGroup: 'Chest' },
      { id: '2', name: 'Barbell Row', sets: 4, reps: 8, weight: 65, muscleGroup: 'Back' },
      { id: '3', name: 'Shoulder Press', sets: 3, reps: 8, weight: 40, muscleGroup: 'Shoulders' },
      { id: '4', name: 'Lat Pulldown', sets: 3, reps: 10, weight: 55, muscleGroup: 'Back' },
    ],
  },
  {
    id: 'push-hypertrophy',
    name: 'Push Hypertrophy',
    subtitle: 'Chest, shoulders, triceps',
    focus: 'Pump, volume and progression feeling',
    difficulty: 'intermediate',
    exercises: [
      { id: '1', name: 'Incline Dumbbell Press', sets: 4, reps: 10, weight: 26, muscleGroup: 'Chest' },
      { id: '2', name: 'Machine Chest Press', sets: 3, reps: 12, weight: 65, muscleGroup: 'Chest' },
      { id: '3', name: 'Lateral Raise', sets: 4, reps: 15, weight: 10, muscleGroup: 'Shoulders' },
      { id: '4', name: 'Tricep Pushdown', sets: 3, reps: 12, weight: 30, muscleGroup: 'Triceps' },
    ],
  },
  {
    id: 'pull-hypertrophy',
    name: 'Pull Hypertrophy',
    subtitle: 'Back, biceps, rear delts',
    focus: 'Thickness, width and clean pump',
    difficulty: 'intermediate',
    exercises: [
      { id: '1', name: 'Lat Pulldown', sets: 4, reps: 10, weight: 55, muscleGroup: 'Back' },
      { id: '2', name: 'Seated Cable Row', sets: 4, reps: 10, weight: 55, muscleGroup: 'Back' },
      { id: '3', name: 'Rear Delt Fly', sets: 3, reps: 15, weight: 12, muscleGroup: 'Shoulders' },
      { id: '4', name: 'EZ Bar Curl', sets: 3, reps: 12, weight: 25, muscleGroup: 'Biceps' },
    ],
  },
  {
    id: 'advanced-lower',
    name: 'Lower Strength',
    subtitle: 'Legs, glutes, hamstrings',
    focus: 'Heavy lower body progression',
    difficulty: 'advanced',
    exercises: [
      { id: '1', name: 'Squat', sets: 4, reps: 6, weight: 90, muscleGroup: 'Legs' },
      { id: '2', name: 'Romanian Deadlift', sets: 4, reps: 8, weight: 80, muscleGroup: 'Hamstrings' },
      { id: '3', name: 'Leg Press', sets: 3, reps: 12, weight: 160, muscleGroup: 'Legs' },
      { id: '4', name: 'Calf Raise', sets: 3, reps: 15, weight: 60, muscleGroup: 'Calves' },
    ],
  },
];

const premiumExerciseLibrary: Record<string, string[]> = {
  Chest: [
    'Bench Press',
    'Incline Bench Press',
    'Decline Bench Press',
    'Dumbbell Press',
    'Incline Dumbbell Press',
    'Machine Chest Press',
    'Cable Fly',
    'Pec Deck',
  ],
  Back: [
    'Lat Pulldown',
    'Pull-Up',
    'Assisted Pull-Up',
    'Barbell Row',
    'Dumbbell Row',
    'Chest Supported Row',
    'Seated Cable Row',
    'Straight Arm Pulldown',
  ],
  Shoulders: [
    'Shoulder Press',
    'Dumbbell Shoulder Press',
    'Machine Shoulder Press',
    'Lateral Raise',
    'Cable Lateral Raise',
    'Rear Delt Fly',
    'Front Raise',
  ],
  Biceps: [
    'EZ Bar Curl',
    'Barbell Curl',
    'Dumbbell Curl',
    'Incline Curl',
    'Hammer Curl',
    'Cable Curl',
  ],
  Triceps: [
    'Tricep Pushdown',
    'Overhead Tricep Extension',
    'Skull Crusher',
    'Close Grip Bench Press',
    'Dips',
    'Single Arm Pushdown',
  ],
  Legs: [
    'Squat',
    'Front Squat',
    'Hack Squat',
    'Leg Press',
    'Bulgarian Split Squat',
    'Walking Lunges',
    'Leg Extension',
  ],
  Hamstrings: [
    'Romanian Deadlift',
    'Stiff Leg Deadlift',
    'Lying Leg Curl',
    'Seated Leg Curl',
    'Good Morning',
  ],
  Glutes: ['Hip Thrust', 'Glute Bridge', 'Cable Kickback', 'Smith Machine Lunge'],
  Calves: ['Standing Calf Raise', 'Seated Calf Raise', 'Leg Press Calf Raise'],
  Core: ['Crunch', 'Cable Crunch', 'Hanging Leg Raise', 'Plank', 'Ab Wheel', 'Russian Twist'],
};

function makeId(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function cloneExercises(rows: ExerciseRow[]) {
  return rows.map((row, index) => ({
    ...row,
    id: makeId(`${row.name}-${index}`),
    completed: false,
  }));
}

function getRecommendedDifficulty(): 'beginner' | 'intermediate' | 'advanced' {
  const trainingLevel = getTrainingLevel();

  if (trainingLevel === 'advanced') return 'advanced';
  if (trainingLevel === 'intermediate') return 'intermediate';
  return 'beginner';
}

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function WorkoutFlow({ onBack, onComplete }: WorkoutFlowProps) {
  const premium = checkPremium();
  const timerSettings = getTimerSettings();
  const recommendedDifficulty = getRecommendedDifficulty();

  const defaultTemplate =
    workoutTemplates.find((template) => template.difficulty === recommendedDifficulty) ||
    workoutTemplates[0];

  const [mode, setMode] = useState<'template' | 'custom'>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplate.id);
  const [workoutName, setWorkoutName] = useState(defaultTemplate.name);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [rows, setRows] = useState<ExerciseRow[]>(cloneExercises(defaultTemplate.exercises));
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [showPremiumInfo, setShowPremiumInfo] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  const selectedTemplate =
    workoutTemplates.find((template) => template.id === selectedTemplateId) || defaultTemplate;

  const groupedPremiumExercises = useMemo(() => Object.entries(premiumExerciseLibrary), []);

  const completedExercises = useMemo(
    () => rows.filter((row) => row.completed).length,
    [rows]
  );

  const totalVolume = useMemo(
    () => rows.reduce((sum, row) => sum + row.sets * row.reps * row.weight, 0),
    [rows]
  );

  const progressPercent = useMemo(() => {
    if (!rows.length) return 0;
    return Math.round((completedExercises / rows.length) * 100);
  }, [completedExercises, rows.length]);

  useEffect(() => {
    resetWorkoutTimerToPhase('set');
    return () => {
      stopWorkoutTimer();
    };
  }, []);

  const applyTemplate = (templateId: string) => {
    const template = workoutTemplates.find((item) => item.id === templateId);
    if (!template) return;

    setSelectedTemplateId(template.id);
    setWorkoutName(template.name);
    setRows(cloneExercises(template.exercises));
    setActiveExerciseIndex(0);
    setMode('template');
    setSessionStarted(false);
    stopWorkoutTimer();
    resetWorkoutTimerToPhase('set');
  };

  const updateRow = (id: string, field: keyof ExerciseRow, value: string | boolean) => {
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]:
                field === 'name' || field === 'muscleGroup'
                  ? String(value)
                  : field === 'completed'
                  ? Boolean(value)
                  : Number(value),
            }
          : row
      )
    );
  };

  const removeRow = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id));
    setActiveExerciseIndex((current) => Math.max(0, current - 1));
  };

  const addCustomExercise = (exerciseName: string, muscleGroup: string) => {
    if (!premium) {
      setShowPremiumInfo(true);
      return;
    }

    setRows((current) => [
      ...current,
      {
        id: makeId(exerciseName),
        name: exerciseName,
        sets: 3,
        reps: 10,
        weight: 20,
        muscleGroup,
        completed: false,
      },
    ]);
  };

  const switchToCustom = () => {
    if (!premium) {
      setShowPremiumInfo(true);
      return;
    }

    setMode('custom');
  };

  const switchToTemplate = () => {
    setMode('template');
    setShowPremiumInfo(false);
  };

  const activeRow = rows[activeExerciseIndex] || null;

  const markCurrentDone = () => {
    if (!activeRow) return;

    updateRow(activeRow.id, 'completed', true);

    if (activeExerciseIndex < rows.length - 1) {
      setActiveExerciseIndex((current) => current + 1);
    }
  };

  const goToPreviousExercise = () => {
    setActiveExerciseIndex((current) => Math.max(0, current - 1));
  };

  const goToNextExercise = () => {
    setActiveExerciseIndex((current) => Math.min(rows.length - 1, current + 1));
  };

  const handleStartSession = () => {
    setSessionStarted(true);
    resetWorkoutTimerToPhase('set');

    if (timerSettings.enabled) {
      startWorkoutTimer();
    }
  };

const handleFinishWorkout = () => {
  stopWorkoutTimer();

  onComplete({
    workoutName,
    durationMinutes,
    exercisesCompleted: rows.filter((row) => row.completed).length,
    volume: totalVolume,
  });
};

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-28 pt-safe">
        <div className="flex items-center justify-between pt-3">
          <button
            type="button"
            onClick={() => {
              stopWorkoutTimer();
              onBack();
            }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-semibold text-lime-300">
            Workout
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime-300/80">
            Real-life effort
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Train clean. Level up.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Fast workout flow, clear structure, no clutter.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={switchToTemplate}
            className={`rounded-2xl border p-4 text-left transition ${
              mode === 'template'
                ? 'border-lime-400/20 bg-lime-400/10'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              <p className="text-sm font-semibold">Quick start</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Choose a base workout and start fast.
            </p>
          </button>

          <button
            type="button"
            onClick={switchToCustom}
            className={`rounded-2xl border p-4 text-left transition ${
              mode === 'custom'
                ? 'border-lime-400/20 bg-lime-400/10'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <p className="text-sm font-semibold">Custom workout</p>
              {!premium && <Crown className="h-4 w-4 text-lime-300" />}
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Premium builder with full exercise library.
            </p>
          </button>
        </div>

        {mode === 'template' && (
          <div className="mt-5 space-y-3">
            <div className="rounded-[28px] border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-lime-300" />
                <p className="text-sm font-semibold">Choose workout type</p>
              </div>

              <div className="space-y-2">
                {workoutTemplates.map((template) => {
                  const active = template.id === selectedTemplateId;

                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => applyTemplate(template.id)}
                      className={`w-full rounded-[22px] border p-4 text-left transition ${
                        active
                          ? 'border-lime-400/20 bg-lime-400/10'
                          : 'border-border bg-background hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{template.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{template.subtitle}</p>
                        </div>

                        {active && (
                          <span className="rounded-full bg-lime-400 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-xs leading-5 text-muted-foreground">
                        {template.focus}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {mode === 'custom' && (
          <div className="mt-5 space-y-3">
            <div className="rounded-[28px] border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-lime-300" />
                <p className="text-sm font-semibold">Premium builder</p>
              </div>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Build your own workout from a larger exercise library divided by muscle group.
              </p>

              {!premium && (
                <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-200" />
                    <p className="text-sm font-semibold text-amber-100">Premium feature</p>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-amber-100/80">
                    Unlock custom workouts, bigger exercise library and more control over your sessions.
                  </p>
                </div>
              )}

              <div className="mt-4 space-y-4">
                {groupedPremiumExercises.map(([group, exercises]) => (
                  <div key={group}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-lime-300/80">
                      {group}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {exercises.map((exercise) => (
                        <button
                          key={exercise}
                          type="button"
                          onClick={() => addCustomExercise(exercise, group)}
                          className={`rounded-full px-3 py-2 text-sm transition ${
                            premium
                              ? 'border border-border bg-background hover:bg-accent'
                              : 'border border-amber-300/20 bg-amber-300/10 text-amber-100'
                          }`}
                        >
                          {premium ? (
                            exercise
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <Crown className="h-3.5 w-3.5" />
                              {exercise}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 rounded-[28px] border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-lime-300" />
            <p className="text-sm font-semibold">Session setup</p>
          </div>

          <div className="grid gap-3">
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Workout name
              </label>
              <input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-lime-400"
                placeholder="Workout name"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Duration (minutes)
              </label>
              <input
                type="number"
                min={5}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-lime-400"
                placeholder="45"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[28px] border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Session summary</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {rows.length} exercises · {completedExercises} completed
              </p>
            </div>

            <div className="rounded-2xl border border-lime-400/20 bg-lime-400/10 px-3 py-2 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-lime-300/80">
                Progress
              </p>
              <p className="text-sm font-bold text-lime-200">{progressPercent}%</p>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-lime-400 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-border bg-background px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Exercises
              </p>
              <p className="mt-1 text-base font-bold">{rows.length}</p>
            </div>

            <div className="rounded-2xl border border-border bg-background px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Volume
              </p>
              <p className="mt-1 text-base font-bold">{totalVolume}</p>
            </div>

            <div className="rounded-2xl border border-border bg-background px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Timer
              </p>
              <p className="mt-1 text-base font-bold">
                {timerSettings.enabled
                  ? `${formatSeconds(timerSettings.setSeconds)} / ${formatSeconds(timerSettings.restSeconds)}`
                  : 'Off'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[28px] border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Workout flow</p>
              <p className="mt-1 text-xs text-muted-foreground">
                One exercise at a time, clean and focused.
              </p>
            </div>

            {!sessionStarted ? (
              <button
                type="button"
                onClick={handleStartSession}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-lime-400 px-4 text-sm font-bold text-black"
              >
                Start
              </button>
            ) : (
              <span className="rounded-full bg-lime-400/10 px-3 py-1 text-xs font-semibold text-lime-300">
                Running
              </span>
            )}
          </div>

          {activeRow ? (
            <div className="rounded-[24px] border border-lime-400/20 bg-lime-400/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-300/80">
                    Current exercise
                  </p>
                  <h3 className="mt-2 text-xl font-bold">{activeRow.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{activeRow.muscleGroup}</p>
                </div>

                {activeRow.completed && (
                  <div className="rounded-full bg-lime-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
                    Done
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-border bg-background px-3 py-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Sets
                  </p>
                  <p className="mt-1 text-base font-bold">{activeRow.sets}</p>
                </div>

                <div className="rounded-2xl border border-border bg-background px-3 py-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Reps
                  </p>
                  <p className="mt-1 text-base font-bold">{activeRow.reps}</p>
                </div>

                <div className="rounded-2xl border border-border bg-background px-3 py-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Weight
                  </p>
                  <p className="mt-1 text-base font-bold">{activeRow.weight}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={goToPreviousExercise}
                  disabled={activeExerciseIndex === 0}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-background disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={markCurrentDone}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-lime-400 font-bold text-black"
                >
                  <Check className="h-4 w-4" />
                  Done
                </button>

                <button
                  type="button"
                  onClick={goToNextExercise}
                  disabled={activeExerciseIndex === rows.length - 1}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-background disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-background px-4 py-6 text-center text-sm text-muted-foreground">
              No exercises in this workout yet.
            </div>
          )}
        </div>

        <div className="mt-5 rounded-[28px] border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Exercise list</p>
            {mode === 'custom' && premium && (
              <span className="rounded-full bg-lime-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-lime-300">
                Editable
              </span>
            )}
          </div>

          <div className="space-y-3">
            {rows.map((row, index) => (
              <div
                key={row.id}
                className={`rounded-[22px] border p-4 ${
                  index === activeExerciseIndex
                    ? 'border-lime-400/20 bg-lime-400/10'
                    : 'border-border bg-background'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-300/80">
                      {row.muscleGroup}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{row.name}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {row.completed && (
                      <span className="rounded-full bg-lime-400 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
                        Done
                      </span>
                    )}

                    {mode === 'custom' && premium && (
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {mode === 'custom' && premium ? (
                  <div className="mt-3 grid gap-3">
                    <input
                      value={row.name}
                      onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                      className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-lime-400"
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        min={1}
                        value={row.sets}
                        onChange={(e) => updateRow(row.id, 'sets', e.target.value)}
                        className="rounded-2xl border border-border bg-card px-3 py-3 outline-none transition focus:border-lime-400"
                        placeholder="Sets"
                      />
                      <input
                        type="number"
                        min={1}
                        value={row.reps}
                        onChange={(e) => updateRow(row.id, 'reps', e.target.value)}
                        className="rounded-2xl border border-border bg-card px-3 py-3 outline-none transition focus:border-lime-400"
                        placeholder="Reps"
                      />
                      <input
                        type="number"
                        min={0}
                        value={row.weight}
                        onChange={(e) => updateRow(row.id, 'weight', e.target.value)}
                        className="rounded-2xl border border-border bg-card px-3 py-3 outline-none transition focus:border-lime-400"
                        placeholder="Weight"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-2xl border border-border bg-card px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Sets
                      </p>
                      <p className="mt-1 text-sm font-bold">{row.sets}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Reps
                      </p>
                      <p className="mt-1 text-sm font-bold">{row.reps}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Weight
                      </p>
                      <p className="mt-1 text-sm font-bold">{row.weight}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {mode === 'custom' && premium && (
            <button
              type="button"
              onClick={() =>
                setRows((current) => [
                  ...current,
                  {
                    id: makeId('custom'),
                    name: 'New Exercise',
                    sets: 3,
                    reps: 10,
                    weight: 20,
                    muscleGroup: 'Custom',
                    completed: false,
                  },
                ])
              }
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Add empty exercise
            </button>
          )}

          {showPremiumInfo && !premium && (
            <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-200" />
                <p className="text-sm font-semibold text-amber-100">Premium unlock</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-amber-100/80">
                Custom builder stays premium so the free flow remains clean and simple, while premium users get more control and more variety.
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleFinishWorkout}
          className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-[24px] bg-gradient-to-r from-lime-400 via-lime-300 to-yellow-300 text-base font-black text-black shadow-[0_12px_40px_rgba(132,204,22,0.25)] transition hover:scale-[1.01]"
        >
          <Dumbbell className="h-5 w-5" />
          Finish workout
        </button>
      </div>

      <FloatingWorkoutTimer />
    </div>
  );
}