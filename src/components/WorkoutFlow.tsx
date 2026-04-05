import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Dumbbell,
  Flame,
  Plus,
  Timer,
  Trash2,
} from 'lucide-react';
import { saveWorkoutDraft, clearWorkoutDraft } from '@/lib/workoutStore';

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

const EXERCISE_OPTIONS = [
  'Bench Press',
  'Incline Dumbbell Press',
  'Chest Fly',
  'Lat Pulldown',
  'Barbell Row',
  'Seated Cable Row',
  'Shoulder Press',
  'Lateral Raise',
  'Rear Delt Fly',
  'Barbell Curl',
  'Hammer Curl',
  'Triceps Pushdown',
  'Overhead Extension',
  'Squat',
  'Leg Press',
  'Romanian Deadlift',
  'Leg Curl',
  'Leg Extension',
  'Calf Raise',
  'Crunch',
  'Plank',
];

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createRow(overrides?: Partial<WorkoutRow>): WorkoutRow {
  return {
    id: createId(),
    exercise: EXERCISE_OPTIONS[0],
    sets: 3,
    reps: 10,
    weight: 40,
    ...overrides,
  };
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

function SummaryCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-zinc-400">
        <span className={accent}>{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`mt-3 text-2xl font-black text-white ${accent ?? ''}`}>
        {value}
      </div>
    </div>
  );
}

export default function WorkoutFlow({
  onBack,
  onComplete,
}: WorkoutFlowProps) {
  const [workoutName, setWorkoutName] = useState('Push Session');
  const [rows, setRows] = useState<WorkoutRow[]>([
    createRow(),
    createRow({ exercise: 'Incline Dumbbell Press', weight: 26 }),
    createRow({ exercise: 'Shoulder Press', weight: 22 }),
  ]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

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
    });
  }, [elapsedSeconds, workoutName, rows]);

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
    setRows((current) => [...current, createRow()]);
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_35%),linear-gradient(180deg,_#09090b_0%,_#111113_100%)] px-4 py-5 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/[0.08]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">
            Workout Live
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/15 via-lime-400/10 to-transparent p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                <Dumbbell className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
                  Train clean. Level up.
                </p>
                <h1 className="text-2xl font-black sm:text-3xl">Workout Flow</h1>
              </div>
            </div>

            <p className="mt-3 max-w-xl text-sm text-zinc-300">
              Fast workout logging with a premium feel. Clean, simple, and ready
              to finish strong.
            </p>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-3">
            <SummaryCard
              icon={<Check className="h-4 w-4" />}
              label="Progress"
              value={`${progressPercent}%`}
              accent="text-emerald-300"
            />
            <SummaryCard
              icon={<Flame className="h-4 w-4" />}
              label="Exercises"
              value={rows.length}
            />
            <SummaryCard
              icon={<Timer className="h-4 w-4" />}
              label="Duration"
              value={formatMinutes(elapsedSeconds)}
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.28)]">
          <label className="block text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">
            Workout name
          </label>
          <input
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
            placeholder="Push Session"
          />
        </div>

        <div className="flex flex-col gap-4">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.28)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                    Exercise {index + 1}
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-white">
                    Log your work
                  </h2>
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

              <div className="mt-4 grid gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Exercise
                  </label>
                  <select
                    value={row.exercise}
                    onChange={(e) =>
                      updateRow(row.id, { exercise: e.target.value })
                    }
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                  >
                    {EXERCISE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                      Sets
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={row.sets}
                      onChange={(e) =>
                        updateRow(row.id, {
                          sets: clampNumber(Number(e.target.value), 1, 20),
                        })
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                      Reps
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={row.reps}
                      onChange={(e) =>
                        updateRow(row.id, {
                          reps: clampNumber(Number(e.target.value), 1, 50),
                        })
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                      Weight
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={500}
                      value={row.weight}
                      onChange={(e) =>
                        updateRow(row.id, {
                          weight: clampNumber(Number(e.target.value), 0, 500),
                        })
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addRow}
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-zinc-200 transition hover:bg-white/[0.08]"
        >
          <Plus className="h-4 w-4" />
          Add exercise
        </button>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.28)]">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-zinc-400">
            <Timer className="h-4 w-4 text-emerald-300" />
            Session summary
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Estimated volume
              </p>
              <p className="mt-2 text-2xl font-black text-white">{volume} kg</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Duration
              </p>
              <p className="mt-2 text-2xl font-black text-white">
                {durationMinutes} min
              </p>
            </div>
          </div>

          <button
            onClick={handleComplete}
            type="button"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-300 px-5 py-4 text-sm font-black text-black shadow-[0_12px_35px_rgba(74,222,128,0.35)] transition hover:scale-[1.01]"
          >
            <Check className="h-4 w-4" />
            Finish workout
          </button>
        </div>
      </div>
    </div>
  );
}