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
  Lock,
  Plus,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react';
import FloatingWorkoutTimer from '@/components/FloatingWorkoutTimer';
import PremiumPaywall from '@/components/PremiumPaywall';
import { checkPremium } from '@/lib/premiumStore';
import type { PaywallTrigger } from '@/lib/paywallStore';
import { getTrainingLevel } from '@/lib/trainingStore';
import {
  getTimerSettings,
  pauseWorkoutTimer,
  resetWorkoutTimerToPhase,
  startWorkoutTimer,
  stopWorkoutTimer,
} from '@/lib/timerStore';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type WorkoutMode = 'template' | 'custom';

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
  difficulty: Difficulty;
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
    id: 'beginner-full-body-a',
    name: 'Full Body A',
    subtitle: 'Simple and balanced',
    focus: 'Easy full-body start',
    difficulty: 'beginner',
    exercises: [
      { id: 'bfa-1', name: 'Leg Press', sets: 3, reps: 12, weight: 80, muscleGroup: 'Legs' },
      { id: 'bfa-2', name: 'Chest Press', sets: 3, reps: 10, weight: 35, muscleGroup: 'Chest' },
      { id: 'bfa-3', name: 'Lat Pulldown', sets: 3, reps: 10, weight: 35, muscleGroup: 'Back' },
      { id: 'bfa-4', name: 'Seated Shoulder Press', sets: 2, reps: 12, weight: 18, muscleGroup: 'Shoulders' },
    ],
  },
  {
    id: 'beginner-full-body-b',
    name: 'Full Body B',
    subtitle: 'Clean basic progression',
    focus: 'Second beginner rotation',
    difficulty: 'beginner',
    exercises: [
      { id: 'bfb-1', name: 'Goblet Squat', sets: 3, reps: 12, weight: 16, muscleGroup: 'Legs' },
      { id: 'bfb-2', name: 'Incline Chest Press', sets: 3, reps: 10, weight: 30, muscleGroup: 'Chest' },
      { id: 'bfb-3', name: 'Seated Cable Row', sets: 3, reps: 10, weight: 35, muscleGroup: 'Back' },
      { id: 'bfb-4', name: 'Cable Crunch', sets: 3, reps: 15, weight: 25, muscleGroup: 'Core' },
    ],
  },
  {
    id: 'beginner-upper-lower',
    name: 'Upper + Lower Intro',
    subtitle: 'Still simple, slightly more structured',
    focus: 'Beginner split feel',
    difficulty: 'beginner',
    exercises: [
      { id: 'bul-1', name: 'Leg Extension', sets: 3, reps: 12, weight: 30, muscleGroup: 'Legs' },
      { id: 'bul-2', name: 'Machine Chest Press', sets: 3, reps: 10, weight: 40, muscleGroup: 'Chest' },
      { id: 'bul-3', name: 'Assisted Pull-Up', sets: 3, reps: 8, weight: 25, muscleGroup: 'Back' },
      { id: 'bul-4', name: 'Lateral Raise', sets: 2, reps: 15, weight: 6, muscleGroup: 'Shoulders' },
    ],
  },

  {
    id: 'intermediate-push',
    name: 'Push Power',
    subtitle: 'Chest, shoulders, triceps',
    focus: 'Pressing strength and pump',
    difficulty: 'intermediate',
    exercises: [
      { id: 'ip-1', name: 'Bench Press', sets: 4, reps: 6, weight: 70, muscleGroup: 'Chest' },
      { id: 'ip-2', name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 26, muscleGroup: 'Chest' },
      { id: 'ip-3', name: 'Machine Shoulder Press', sets: 3, reps: 10, weight: 35, muscleGroup: 'Shoulders' },
      { id: 'ip-4', name: 'Tricep Pushdown', sets: 3, reps: 12, weight: 30, muscleGroup: 'Triceps' },
    ],
  },
  {
    id: 'intermediate-pull',
    name: 'Pull Builder',
    subtitle: 'Back, rear delts, biceps',
    focus: 'Width, thickness and control',
    difficulty: 'intermediate',
    exercises: [
      { id: 'ipu-1', name: 'Lat Pulldown', sets: 4, reps: 10, weight: 55, muscleGroup: 'Back' },
      { id: 'ipu-2', name: 'Chest Supported Row', sets: 3, reps: 10, weight: 42, muscleGroup: 'Back' },
      { id: 'ipu-3', name: 'Rear Delt Fly', sets: 3, reps: 15, weight: 12, muscleGroup: 'Shoulders' },
      { id: 'ipu-4', name: 'EZ Bar Curl', sets: 3, reps: 12, weight: 25, muscleGroup: 'Biceps' },
    ],
  },
  {
    id: 'intermediate-legs',
    name: 'Leg Day Builder',
    subtitle: 'Quads, hamstrings, calves',
    focus: 'Lower body progression',
    difficulty: 'intermediate',
    exercises: [
      { id: 'il-1', name: 'Hack Squat', sets: 4, reps: 8, weight: 90, muscleGroup: 'Legs' },
      { id: 'il-2', name: 'Romanian Deadlift', sets: 3, reps: 8, weight: 70, muscleGroup: 'Hamstrings' },
      { id: 'il-3', name: 'Leg Press', sets: 3, reps: 12, weight: 160, muscleGroup: 'Legs' },
      { id: 'il-4', name: 'Standing Calf Raise', sets: 4, reps: 15, weight: 55, muscleGroup: 'Calves' },
    ],
  },

  {
    id: 'advanced-upper-strength',
    name: 'Upper Strength',
    subtitle: 'Heavy upper focus',
    focus: 'Performance-oriented upper session',
    difficulty: 'advanced',
    exercises: [
      { id: 'aus-1', name: 'Bench Press', sets: 5, reps: 5, weight: 85, muscleGroup: 'Chest' },
      { id: 'aus-2', name: 'Barbell Row', sets: 4, reps: 6, weight: 80, muscleGroup: 'Back' },
      { id: 'aus-3', name: 'Overhead Press', sets: 4, reps: 6, weight: 50, muscleGroup: 'Shoulders' },
      { id: 'aus-4', name: 'Weighted Dips', sets: 3, reps: 8, weight: 20, muscleGroup: 'Triceps' },
    ],
  },
  {
    id: 'advanced-lower-strength',
    name: 'Lower Strength',
    subtitle: 'Heavy lower body progression',
    focus: 'Power and stability',
    difficulty: 'advanced',
    exercises: [
      { id: 'als-1', name: 'Back Squat', sets: 5, reps: 5, weight: 110, muscleGroup: 'Legs' },
      { id: 'als-2', name: 'Romanian Deadlift', sets: 4, reps: 6, weight: 95, muscleGroup: 'Hamstrings' },
      { id: 'als-3', name: 'Walking Lunges', sets: 3, reps: 12, weight: 22, muscleGroup: 'Glutes' },
      { id: 'als-4', name: 'Seated Calf Raise', sets: 4, reps: 15, weight: 55, muscleGroup: 'Calves' },
    ],
  },
  {
    id: 'advanced-hypertrophy',
    name: 'Hypertrophy Max',
    subtitle: 'High output, high stimulus',
    focus: 'Advanced volume day',
    difficulty: 'advanced',
    exercises: [
      { id: 'ah-1', name: 'Incline Bench Press', sets: 4, reps: 8, weight: 75, muscleGroup: 'Chest' },
      { id: 'ah-2', name: 'Weighted Pull-Up', sets: 4, reps: 8, weight: 12, muscleGroup: 'Back' },
      { id: 'ah-3', name: 'Cable Lateral Raise', sets: 4, reps: 15, weight: 8, muscleGroup: 'Shoulders' },
      { id: 'ah-4', name: 'Barbell Curl', sets: 4, reps: 10, weight: 30, muscleGroup: 'Biceps' },
    ],
  },
];

const premiumExerciseLibrary: Record<string, string[]> = {
  Chest: [
    'Bench Press',
    'Incline Bench Press',
    'Decline Bench Press',
    'Flat Dumbbell Press',
    'Incline Dumbbell Press',
    'Machine Chest Press',
    'Smith Machine Press',
    'Cable Fly',
    'Low Cable Fly',
    'Pec Deck',
    'Push-Up',
    'Weighted Dips',
  ],
  Back: [
    'Lat Pulldown',
    'Wide Grip Lat Pulldown',
    'Close Grip Lat Pulldown',
    'Pull-Up',
    'Weighted Pull-Up',
    'Assisted Pull-Up',
    'Barbell Row',
    'Dumbbell Row',
    'Chest Supported Row',
    'Seated Cable Row',
    'T-Bar Row',
    'Straight Arm Pulldown',
  ],
  Shoulders: [
    'Overhead Press',
    'Seated Shoulder Press',
    'Dumbbell Shoulder Press',
    'Machine Shoulder Press',
    'Arnold Press',
    'Lateral Raise',
    'Cable Lateral Raise',
    'Rear Delt Fly',
    'Face Pull',
    'Front Raise',
    'Machine Lateral Raise',
    'Upright Row',
  ],
  Biceps: [
    'EZ Bar Curl',
    'Barbell Curl',
    'Alternating Dumbbell Curl',
    'Incline Dumbbell Curl',
    'Hammer Curl',
    'Cable Curl',
    'Preacher Curl',
    'Machine Curl',
    'Spider Curl',
    'Concentration Curl',
    'Reverse Curl',
    'Bayesian Curl',
  ],
  Triceps: [
    'Tricep Pushdown',
    'Rope Pushdown',
    'Overhead Tricep Extension',
    'Skull Crusher',
    'Close Grip Bench Press',
    'Weighted Dips',
    'Single Arm Pushdown',
    'Cross Body Extension',
    'Machine Dip',
    'EZ Bar Overhead Extension',
    'Bench Dips',
    'Cable Kickback',
  ],
  Legs: [
    'Back Squat',
    'Front Squat',
    'Hack Squat',
    'Leg Press',
    'Bulgarian Split Squat',
    'Walking Lunges',
    'Smith Machine Squat',
    'Leg Extension',
    'Goblet Squat',
    'Pendulum Squat',
    'Step-Up',
    'Sissy Squat',
  ],
  Hamstrings: [
    'Romanian Deadlift',
    'Stiff Leg Deadlift',
    'Lying Leg Curl',
    'Seated Leg Curl',
    'Nordic Curl',
    'Good Morning',
    'Single Leg RDL',
    'Glute Ham Raise',
    'Cable Pull Through',
    'Smith Romanian Deadlift',
    'Slider Leg Curl',
    'Kettlebell RDL',
  ],
  Glutes: [
    'Hip Thrust',
    'Barbell Glute Bridge',
    'Cable Kickback',
    'Smith Machine Lunge',
    'Bulgarian Split Squat',
    'Walking Lunges',
    'Step-Up',
    'Reverse Lunge',
    'Frog Pumps',
    'Sumo Deadlift',
    'Cable Pull Through',
    'Single Leg Hip Thrust',
  ],
  Calves: [
    'Standing Calf Raise',
    'Seated Calf Raise',
    'Leg Press Calf Raise',
    'Single Leg Calf Raise',
    'Smith Machine Calf Raise',
    'Donkey Calf Raise',
    'Dumbbell Calf Raise',
    'Toe Press',
    'Paused Calf Raise',
    'Bodyweight Calf Raise',
    'Seated Toe Raise',
    'Machine Calf Press',
  ],
  Core: [
    'Crunch',
    'Cable Crunch',
    'Hanging Leg Raise',
    'Plank',
    'Ab Wheel',
    'Russian Twist',
    'Decline Sit-Up',
    'Dead Bug',
    'Mountain Climbers',
    'Toe Touch',
    'Side Plank',
    'Reverse Crunch',
  ],
};

const muscleGroupOrder = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Core',
];

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

function normalizeDifficulty(value: string): Difficulty {
  if (value === 'advanced') return 'advanced';
  if (value === 'intermediate') return 'intermediate';
  return 'beginner';
}

function getRecommendedDifficulty(): Difficulty {
  return normalizeDifficulty(getTrainingLevel());
}

function getTemplateDifficultyLabel(difficulty: Difficulty) {
  if (difficulty === 'advanced') return 'Advanced';
  if (difficulty === 'intermediate') return 'Intermediate';
  return 'Beginner';
}

function formatMinutes(minutes: number) {
  return `${minutes} min`;
}

function clampNumber(value: string | number, fallback: number, min = 0, max = 999) {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(parsed)));
}

export default function WorkoutFlow({ onBack, onComplete }: WorkoutFlowProps) {
  const recommendedDifficulty = getRecommendedDifficulty();
  const timerSettings = getTimerSettings();

  const availableTemplates = useMemo(() => {
    const exact = workoutTemplates.filter((template) => template.difficulty === recommendedDifficulty);
    return exact.length ? exact : workoutTemplates;
  }, [recommendedDifficulty]);

  const defaultTemplate = availableTemplates[0];

  const [mode, setMode] = useState<WorkoutMode>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplate.id);
  const [workoutName, setWorkoutName] = useState(defaultTemplate.name);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [rows, setRows] = useState<ExerciseRow[]>(cloneExercises(defaultTemplate.exercises));
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallTrigger, setPaywallTrigger] = useState<PaywallTrigger>('custom_workout');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('Chest');

  const selectedTemplate =
    availableTemplates.find((template) => template.id === selectedTemplateId) ?? defaultTemplate;

  const groupedPremiumExercises = useMemo(
    () =>
      muscleGroupOrder
        .filter((group) => premiumExerciseLibrary[group])
        .map((group) => [group, premiumExerciseLibrary[group]] as const),
    []
  );

  const activeRow = rows[activeExerciseIndex] ?? null;

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
    const template = availableTemplates.find((item) => item.id === templateId);
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

  const openPremiumPaywall = (trigger: PaywallTrigger) => {
    setPaywallTrigger(trigger);
    setPaywallOpen(true);
  };

  const switchToCustom = () => {
    if (!checkPremium()) {
      openPremiumPaywall('custom_workout');
      return;
    }

    const starterRows = rows.length
      ? rows
      : [
          {
            id: makeId('Bench Press'),
            name: 'Bench Press',
            sets: 3,
            reps: 10,
            weight: 40,
            muscleGroup: 'Chest',
            completed: false,
          },
        ];

    setMode('custom');
    setWorkoutName((current) => current || 'Custom Workout');
    setRows(starterRows);
  };

  const switchToTemplate = () => {
    setMode('template');
    setPaywallOpen(false);
  };

  const addCustomExercise = (exerciseName: string, muscleGroup: string) => {
    if (!checkPremium()) {
      openPremiumPaywall('custom_workout');
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

  const updateRow = (
    id: string,
    field: keyof ExerciseRow,
    value: string | boolean | number
  ) => {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== id) return row;

        if (field === 'name' || field === 'muscleGroup') {
          return { ...row, [field]: String(value) };
        }

        if (field === 'completed') {
          return { ...row, completed: Boolean(value) };
        }

        return {
          ...row,
          [field]: clampNumber(value as string | number, row[field] as number, 0, 999),
        };
      })
    );
  };

  const removeRow = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id));
    setActiveExerciseIndex((current) => Math.max(0, current - 1));
  };

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

  const handlePauseTimer = () => {
    pauseWorkoutTimer();
  };

  const handleStopWorkout = () => {
    stopWorkoutTimer();
    setSessionStarted(false);
    resetWorkoutTimerToPhase('set');
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

  const currentGroupExercises = premiumExerciseLibrary[selectedMuscleGroup] ?? [];
  const premiumActive = checkPremium();

  return (
    <div className="min-h-screen bg-[#0a0d12] px-4 pb-28 pt-5 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              stopWorkoutTimer();
              onBack();
            }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
            <Dumbbell size={16} />
            Workout
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(245,158,11,0.10),rgba(255,255,255,0.03))] p-6 shadow-[0_16px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/65">
                <Flame size={14} />
                Real-life effort
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight">
                Train clean. Level up.
              </h1>

              <p className="mt-2 text-sm leading-6 text-white/65">
                Fast workout flow, premium feel, zero clutter. Free gives you curated programs.
                Premium gives you full custom control with a much bigger exercise bank.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:min-w-[360px]">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Progress
                </div>
                <div className="mt-2 text-xl font-black text-white">{progressPercent}%</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Exercises
                </div>
                <div className="mt-2 text-xl font-black text-white">
                  {completedExercises}/{rows.length}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Duration
                </div>
                <div className="mt-2 text-xl font-black text-white">
                  {formatMinutes(durationMinutes)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.05fr_1.35fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-white">Workout setup</div>
                <div className="mt-1 text-sm text-white/55">
                  Recommended for your level: {getTemplateDifficultyLabel(recommendedDifficulty)}
                </div>
              </div>

              <div className="inline-flex rounded-2xl border border-white/10 bg-black/20 p-1">
                <button
                  type="button"
                  onClick={switchToTemplate}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    mode === 'template'
                      ? 'bg-emerald-400 text-black'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  Quick start
                </button>
                <button
                  type="button"
                  onClick={switchToCustom}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    mode === 'custom'
                      ? 'bg-white text-black'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {!premiumActive ? <Lock size={14} /> : <Crown size={14} />}
                    Custom
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                Workout name
              </label>
              <input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400/40"
                placeholder="Workout name"
              />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                Estimated duration (minutes)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                step={5}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(clampNumber(e.target.value, durationMinutes, 5, 180))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400/40"
              />
            </div>

            {mode === 'template' ? (
              <div className="mt-5">
                <div className="text-sm font-bold text-white">Free workout programs</div>
                <div className="mt-1 text-sm text-white/55">
                  Curated, fast and friction-free. Perfect for basic training flow.
                </div>

                <div className="mt-4 grid gap-3">
                  {availableTemplates.map((template) => {
                    const active = template.id === selectedTemplateId;

                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => applyTemplate(template.id)}
                        className={`w-full rounded-[22px] border p-4 text-left transition ${
                          active
                            ? 'border-emerald-400/25 bg-emerald-400/10'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-base font-bold text-white">{template.name}</div>
                            <div className="mt-1 text-sm text-white/60">{template.subtitle}</div>
                          </div>

                          {active ? (
                            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                              Active
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                            {getTemplateDifficultyLabel(template.difficulty)}
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                            {template.focus}
                          </span>
                        </div>

                        <div className="mt-3 text-sm text-white/65">
                          {template.exercises.length} exercises included
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-white">Premium custom builder</div>
                    <div className="mt-1 text-sm text-white/55">
                      Build freely. Bigger bank. Real premium flexibility.
                    </div>
                  </div>

                  <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200">
                    Premium
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {groupedPremiumExercises.map(([group, list]) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setSelectedMuscleGroup(group)}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                        selectedMuscleGroup === group
                          ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
                          : 'border-white/10 bg-white/[0.03] text-white/70 hover:text-white'
                      }`}
                    >
                      {group} · {list.length}
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-bold text-white">{selectedMuscleGroup}</div>
                      <div className="mt-1 text-sm text-white/55">
                        {currentGroupExercises.length} exercises available
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                      <Sparkles size={12} />
                      Large bank
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {currentGroupExercises.map((exerciseName) => (
                      <button
                        key={exerciseName}
                        type="button"
                        onClick={() => addCustomExercise(exerciseName, selectedMuscleGroup)}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:bg-white/[0.07]"
                      >
                        <span className="text-sm font-medium text-white">{exerciseName}</span>
                        <Plus size={16} className="text-emerald-300" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-white">Workout timer</div>
                  <div className="mt-1 text-sm text-white/55">
                    Basic feature. Compact during workout. All settings stay in menu.
                  </div>
                </div>

                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                  <span className="inline-flex items-center gap-2">
                    <Clock3 size={12} />
                    {timerSettings.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {!sessionStarted ? (
                  <button
                    type="button"
                    onClick={handleStartSession}
                    className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black transition hover:brightness-105"
                  >
                    Start workout
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => startWorkoutTimer()}
                      className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black transition hover:brightness-105"
                    >
                      Start timer
                    </button>
                    <button
                      type="button"
                      onClick={handlePauseTimer}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]"
                    >
                      Pause timer
                    </button>
                    <button
                      type="button"
                      onClick={handleStopWorkout}
                      className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-3 text-sm font-bold text-red-200 transition hover:bg-red-400/15"
                    >
                      Stop workout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-white">Exercise flow</div>
                <div className="mt-1 text-sm text-white/55">
                  One exercise focus. Clean and fast.
                </div>
              </div>

              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                {mode === 'custom' ? 'Custom workout' : 'Template workout'}
              </div>
            </div>

            {activeRow ? (
              <div className="mt-5 rounded-[26px] border border-emerald-400/20 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(255,255,255,0.03))] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                      <Target size={12} />
                      Current exercise
                    </div>

                    <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
                      {activeRow.name}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/75">
                        {activeRow.muscleGroup}
                      </span>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/75">
                        {activeExerciseIndex + 1} / {rows.length}
                      </span>
                    </div>
                  </div>

                  {activeRow.completed ? (
                    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                      Completed
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                      Sets
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={activeRow.sets}
                      onChange={(e) => updateRow(activeRow.id, 'sets', e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-lg font-bold text-white outline-none"
                    />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                      Reps
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={activeRow.reps}
                      onChange={(e) => updateRow(activeRow.id, 'reps', e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-lg font-bold text-white outline-none"
                    />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                      Weight
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={999}
                      value={activeRow.weight}
                      onChange={(e) => updateRow(activeRow.id, 'weight', e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-lg font-bold text-white outline-none"
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={goToPreviousExercise}
                    disabled={activeExerciseIndex === 0}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08] disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    Prev
                  </button>

                  <button
                    type="button"
                    onClick={markCurrentDone}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-black text-black transition hover:brightness-105"
                  >
                    <Check size={16} />
                    Mark done
                  </button>

                  <button
                    type="button"
                    onClick={goToNextExercise}
                    disabled={activeExerciseIndex === rows.length - 1}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08] disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={handleFinishWorkout}
                    className="inline-flex items-center gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-200 transition hover:bg-amber-300/15"
                  >
                    <Sparkles size={16} />
                    Finish workout
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[24px] border border-dashed border-white/10 bg-black/20 p-8 text-center">
                <div className="text-lg font-bold text-white">No exercises yet</div>
                <div className="mt-2 text-sm text-white/55">
                  Choose a template or add exercises in custom mode.
                </div>
              </div>
            )}

            <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-white">Workout list</div>
                  <div className="mt-1 text-sm text-white/55">
                    Edit the full session here.
                  </div>
                </div>

                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                  Total volume {totalVolume}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                {rows.map((row, index) => {
                  const active = index === activeExerciseIndex;

                  return (
                    <div
                      key={row.id}
                      className={`rounded-2xl border p-4 transition ${
                        active
                          ? 'border-emerald-400/20 bg-emerald-400/10'
                          : 'border-white/10 bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveExerciseIndex(index)}
                              className="text-left text-base font-bold text-white"
                            >
                              {row.name}
                            </button>

                            {row.completed ? (
                              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                                Done
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-2 text-sm text-white/55">{row.muscleGroup}</div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 lg:w-[280px]">
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={row.sets}
                            onChange={(e) => updateRow(row.id, 'sets', e.target.value)}
                            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-semibold text-white outline-none"
                          />
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={row.reps}
                            onChange={(e) => updateRow(row.id, 'reps', e.target.value)}
                            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-semibold text-white outline-none"
                          />
                          <input
                            type="number"
                            min={0}
                            max={999}
                            value={row.weight}
                            onChange={(e) => updateRow(row.id, 'weight', e.target.value)}
                            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-semibold text-white outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateRow(row.id, 'completed', !row.completed)}
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                              row.completed
                                ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                                : 'border-white/10 bg-white/[0.04] text-white/70'
                            }`}
                            aria-label="Toggle completed"
                          >
                            <Check size={16} />
                          </button>

                          {mode === 'custom' ? (
                            <button
                              type="button"
                              onClick={() => removeRow(row.id)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/10 text-red-200 transition hover:bg-red-400/15"
                              aria-label="Remove exercise"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {mode === 'template' ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
                  Free mode is curated and fast on purpose. Premium custom mode unlocks the bigger
                  exercise library and full workout building.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {sessionStarted ? <FloatingWorkoutTimer /> : null}

      <PremiumPaywall
        open={paywallOpen}
        trigger={paywallTrigger}
        onClose={() => setPaywallOpen(false)}
        onUnlocked={() => {
          setPaywallOpen(false);
          setMode('custom');
        }}
      />
    </div>
  );
}