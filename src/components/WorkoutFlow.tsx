import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Check,
  Dumbbell,
  Flame,
  Plus,
  Timer,
  Trash2,
} from 'lucide-react';
import { saveWorkoutDraft, clearWorkoutDraft, getWorkoutDraft } from '@/lib/workoutStore';
import {
  getExercisesForWorkoutDay,
  getRecommendedPlan,
  getTrainingLevel,
} from '@/lib/trainingStore';
import type { ExerciseDefinition } from '@/lib/exerciseData';

type WorkoutRow = {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
};

type WorkoutFlowProps = {
  onBack: () => void;
  onComplete: (result: {
    workoutName: string;
    durationMinutes: number;
    exercisesCompleted: number;
    volume: number;
  }) => void;
};

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function formatMinutes(totalSeconds: number) {
  const minutes = Math.max(0, Math.floor(totalSeconds / 60));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }

  return `${minutes} min`;
}

function parseRepValue(raw: string) {
  const match = raw.match(/\d+/);
  if (!match) return 10;
  return clampNumber(Number(match[0]), 1, 50);
}

function toWorkoutRow(exercise: ExerciseDefinition): WorkoutRow {
  return {
    id: createId(),
    exercise: exercise.name,
    sets: clampNumber(exercise.defaultSets, 1, 20),
    reps: parseRepValue(exercise.defaultReps),
    weight: clampNumber(exercise.defaultWeight ?? 0, 0, 500),
  };
}

function createFallbackRow(overrides?: Partial<WorkoutRow>): WorkoutRow {
  return {
    id: createId(),
    exercise: 'Bench Press',
    sets: 4,
    reps: 8,
    weight: 40,
    ...overrides,
  };
}

function buildPresetRows() {
  const level = getTrainingLevel();
  const plan = getRecommendedPlan(level);
  const primaryDay = plan.days[0];

  if (!primaryDay) {
    return {
      workoutName: plan.name,
      subtitle: 'Preset session',
      rows: [
        createFallbackRow(),
        createFallbackRow({ exercise: 'Lat Pulldown', weight: 35 }),
        createFallbackRow({ exercise: 'Shoulder Press', weight: 20 }),
      ],
    };
  }

  const dayExercises = getExercisesForWorkoutDay(level, primaryDay.muscleGroups).slice(0, 6);

  return {
    workoutName: `${plan.name} • ${primaryDay.label}`,
    subtitle: `${plan.name} / ${primaryDay.label}`,
    rows:
      dayExercises.length > 0
        ? dayExercises.map(toWorkoutRow)
        : [
            createFallbackRow(),
            createFallbackRow({ exercise: 'Lat Pulldown', weight: 35 }),
            createFallbackRow({ exercise: 'Shoulder Press', weight: 20 }),
          ],
  };
}

function SummaryCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-2 flex items-center gap-2 text-zinc-400">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/20">
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>

      <div className={`text-xl font-black text-white ${accent ?? ''}`}>{value}</div>
    </div>
  );
}

export default function WorkoutFlow({ onBack, onComplete }: WorkoutFlowProps) {
  const initialDraft = useMemo(() => getWorkoutDraft(), []);
  const preset = useMemo(() => buildPresetRows(), []);

  const [workoutName, setWorkoutName] = useState(
    initialDraft?.workoutName?.trim()
      ? initialDraft.workoutName
      : preset.workoutName
  );

  const [rows, setRows] = useState<WorkoutRow[]>(() => {
    if (initialDraft?.notes) {
      try {
        const parsed = JSON.parse(initialDraft.notes) as WorkoutRow[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((row) => ({
            id: typeof row.id === 'string' ? row.id : createId(),
            exercise: typeof row.exercise === 'string' ? row.exercise : 'Exercise',
            sets: clampNumber(Number(row.sets), 1, 20),
            reps: clampNumber(Number(row.reps), 1, 50),
            weight: clampNumber(Number(row.weight), 0, 500),
          }));
        }
      } catch {
        // ignore broken draft
      }
    }

    return initialDraft?.isCustom
      ? [
          createFallbackRow(),
          createFallbackRow({ exercise: 'Incline Dumbbell Press', weight: 24 }),
          createFallbackRow({ exercise: 'Shoulder Press', weight: 20 }),
        ]
      : preset.rows;
  });

  const initialElapsed = useMemo(() => {
    if (!initialDraft?.startedAt) return 0;

    const started = new Date(initialDraft.startedAt).getTime();
    if (!Number.isFinite(started)) return 0;

    const seconds = Math.floor((Date.now() - started) / 1000);
    return Math.max(0, seconds);
  }, [initialDraft]);

  const [elapsedSeconds, setElapsedSeconds] = useState(initialElapsed);

  const exerciseOptions = useMemo(() => {
    const names = new Set<string>();

    preset.rows.forEach((row) => names.add(row.exercise));

    rows.forEach((row) => {
      if (row.exercise.trim()) names.add(row.exercise.trim());
    });

    [
      'Bench Press',
      'Incline Dumbbell Press',
      'Lat Pulldown',
      'Barbell Row',
      'Shoulder Press',
      'Lateral Raise',
      'Biceps Curl',
      'Triceps Pushdown',
      'Squat',
      'Leg Press',
      'Romanian Deadlift',
      'Plank',
      'Cable Crunch',
    ].forEach((name) => names.add(name));

    return Array.from(names);
  }, [preset.rows, rows]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    saveWorkoutDraft({
      startedAt: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      workoutName,
      notes: JSON.stringify(rows),
      planName: initialDraft?.planName ?? preset.subtitle,
      dayLabel: initialDraft?.dayLabel,
      isCustom: initialDraft?.isCustom ?? false,
    });
  }, [elapsedSeconds, workoutName, rows, initialDraft, preset.subtitle]);

  const volume = useMemo(() => {
    return rows.reduce((sum, row) => sum + row.sets * row.reps * row.weight, 0);
  }, [rows]);

  const progressPercent = useMemo(() => {
    const completed = rows.filter(
      (row) => row.exercise.trim() && row.sets > 0 && row.reps > 0
    ).length;

    return rows.length === 0
      ? 0
      : Math.max(0, Math.min(100, Math.round((completed / rows.length) * 100)));
  }, [rows]);

  const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

  const updateRow = (id: string, patch: Partial<WorkoutRow>) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  const addRow = () => {
    setRows((current) => [...current, createFallbackRow({ exercise: 'Bench Press' })]);
  };

  const removeRow = (id: string) => {
    setRows((current) => {
      if (current.length <= 1) return current;
      return current.filter((row) => row.id !== id);
    });
  };

  const handleComplete = () => {
    const cleanedRows = rows.filter(
      (row) => row.exercise.trim() && row.sets > 0 && row.reps > 0
    );

    const cleanedVolume = cleanedRows.reduce(
      (sum, row) => sum + row.sets * row.reps * row.weight,
      0
    );

    clearWorkoutDraft();

    onComplete({
      workoutName: workoutName.trim() || 'Workout',
      durationMinutes,
      exercisesCompleted: cleanedRows.length,
      volume: cleanedVolume,
    });
  };

  return (
    <div className="min-h-[100dvh] bg-[linear-gradient(180deg,#060606_0%,#0d0d0d_100%)] px-4 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-md">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
            Workout live
          </div>

          <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.02em] text-white">
            {initialDraft?.isCustom ? 'Custom Session' : 'Preset Session'}
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            {initialDraft?.isCustom
              ? 'Build it your way. Fast input, heavy feel.'
              : `Loaded from ${initialDraft?.planName ?? preset.subtitle}.`}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <SummaryCard
              icon={<Check className="h-4 w-4" />}
              label="Progress"
              value={`${progressPercent}%`}
              accent="text-lime-300"
            />
            <SummaryCard
              icon={<Dumbbell className="h-4 w-4" />}
              label="Exercises"
              value={rows.length}
            />
            <SummaryCard
              icon={<Timer className="h-4 w-4" />}
              label="Duration"
              value={formatMinutes(elapsedSeconds)}
            />
          </div>

          <div className="mt-5">
            <label className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
              Workout name
            </label>
            <input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-lime-400"
              placeholder="Workout name"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                    Exercise {index + 1}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white/70">
                    Log your work
                  </div>
                </div>

                <button
                  onClick={() => removeRow(row.id)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:bg-white/[0.08]"
                  aria-label="Remove exercise"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                    Exercise
                  </label>
                  <select
                    value={row.exercise}
                    onChange={(e) => updateRow(row.id, { exercise: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-lime-400"
                  >
                    {exerciseOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                      Sets
                    </label>
                    <input
                      type="number"
                      value={row.sets}
                      onChange={(e) =>
                        updateRow(row.id, {
                          sets: clampNumber(Number(e.target.value), 1, 20),
                        })
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-lime-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                      Reps
                    </label>
                    <input
                      type="number"
                      value={row.reps}
                      onChange={(e) =>
                        updateRow(row.id, {
                          reps: clampNumber(Number(e.target.value), 1, 50),
                        })
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-lime-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                      Weight
                    </label>
                    <input
                      type="number"
                      value={row.weight}
                      onChange={(e) =>
                        updateRow(row.id, {
                          weight: clampNumber(Number(e.target.value), 0, 500),
                        })
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-lime-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-[22px] border border-white/10 bg-white/[0.05] text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" />
          Add exercise
        </button>

        <div className="mt-4 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-5">
          <div className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Session summary
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SummaryCard
              icon={<Flame className="h-4 w-4" />}
              label="Estimated volume"
              value={`${volume} kg`}
            />
            <SummaryCard
              icon={<Timer className="h-4 w-4" />}
              label="Duration"
              value={`${durationMinutes} min`}
            />
          </div>

          <button
            type="button"
            onClick={handleComplete}
            className="mt-4 flex h-16 w-full items-center justify-center gap-2 rounded-[24px] border border-lime-400/25 bg-[linear-gradient(180deg,rgba(124,255,107,0.22),rgba(124,255,107,0.12))] text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-lime-300/45 hover:bg-[linear-gradient(180deg,rgba(124,255,107,0.3),rgba(124,255,107,0.16))] active:scale-[0.99]"
          >
            <Check className="h-4 w-4" />
            Finish workout
          </button>
        </div>
      </div>
    </div>
  );
}