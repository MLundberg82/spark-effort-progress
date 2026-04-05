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
  'Lat Pulldown',
  'Barbell Row',
  'Shoulder Press',
  'Lateral Raise',
  'Barbell Curl',
  'Triceps Pushdown',
  'Squat',
  'Leg Press',
  'Romanian Deadlift',
  'Calf Raise',
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

  if (hours > 0) return `${hours}h ${mins}m`;
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
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-4 shadow-[0_12px_35px_rgba(0,0,0,0.22)]">
      <div className="mb-2 flex items-center gap-2 text-white/55">
        <div className="rounded-full border border-white/10 bg-black/20 p-2">
          {icon}
        </div>
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em]">
          {label}
        </span>
      </div>

      <p className={`text-xl font-black tracking-tight ${accent ?? 'text-white'}`}>
        {value}
      </p>
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

  const volume = useMemo(() => {
    return rows.reduce((sum, row) => sum + row.sets * row.reps * row.weight, 0);
  }, [rows]);

  const progressPercent = useMemo(() => {
    const completed = rows.filter(
      (row) => row.exercise.trim() && row.sets > 0 && row.reps > 0
    ).length;

    return rows.length === 0 ? 0 : Math.round((completed / rows.length) * 100);
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

    onComplete({
      workoutName: workoutName.trim() || 'Workout',
      durationMinutes,
      exercisesCompleted: cleanedRows.length,
      volume: cleanedVolume,
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_28%),linear-gradient(180deg,#07110d_0%,#0b1511_38%,#050806_100%)] px-4 pb-8 pt-5 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-emerald-300">
            Workout
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/75">
            <Flame className="h-3.5 w-3.5" />
            <span>Live</span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
            Train clean. Level up.
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/65">
            Fast workout flow, premium feel, zero clutter.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <SummaryCard
              icon={<Check className="h-4 w-4" />}
              label="Progress"
              value={`${progressPercent}%`}
              accent="text-emerald-300"
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

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <label className="block">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/45">
                Workout name
              </span>
              <input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                placeholder="Push Session"
              />
            </label>
          </div>

          <div className="mt-5 space-y-3">
            {rows.map((row, index) => (
              <div
                key={row.id}
                className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/45">
                      Exercise {index + 1}
                    </p>
                    <p className="mt-1 text-sm font-bold text-white">
                      Log your work
                    </p>
                  </div>

                  <button
                    onClick={() => removeRow(row.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:bg-white/[0.08]"
                    aria-label="Remove exercise"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <label className="block">
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/45">
                    Exercise
                  </span>
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
                </label>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <label className="block">
                    <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/45">
                      Sets
                    </span>
                    <input
                      type="number"
                      value={row.sets}
                      onChange={(e) =>
                        updateRow(row.id, {
                          sets: clampNumber(Number(e.target.value), 1, 20),
                        })
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/45">
                      Reps
                    </span>
                    <input
                      type="number"
                      value={row.reps}
                      onChange={(e) =>
                        updateRow(row.id, {
                          reps: clampNumber(Number(e.target.value), 1, 50),
                        })
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/45">
                      Weight
                    </span>
                    <input
                      type="number"
                      value={row.weight}
                      onChange={(e) =>
                        updateRow(row.id, {
                          weight: clampNumber(Number(e.target.value), 0, 500),
                        })
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addRow}
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]"
          >
            <Plus className="h-4 w-4" />
            <span>Add exercise</span>
          </button>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-white">Session summary</p>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/45">
                Live
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Estimated volume
                </p>
                <p className="mt-1 text-base font-black text-emerald-300">
                  {volume} kg
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Duration
                </p>
                <p className="mt-1 text-base font-black text-white">
                  {durationMinutes} min
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-[1.6rem] border border-emerald-300/20 bg-[linear-gradient(90deg,rgba(16,185,129,0.95),rgba(132,204,22,0.95))] px-5 py-4 text-base font-black tracking-[0.04em] text-black shadow-[0_18px_45px_rgba(16,185,129,0.28)] transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Check className="h-5 w-5" />
            <span>Finish workout</span>
          </button>
        </div>
      </div>
    </div>
  );
}