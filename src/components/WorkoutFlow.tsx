import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Dumbbell, Flame, Plus, Timer, Trash2 } from 'lucide-react';

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

function createRow(): WorkoutRow {
  return {
    id: crypto.randomUUID(),
    exercise: EXERCISE_OPTIONS[0],
    sets: 3,
    reps: 10,
    weight: 40,
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

export default function WorkoutFlow({ onBack, onComplete }: WorkoutFlowProps) {
  const [workoutName, setWorkoutName] = useState('Push Session');
  const [rows, setRows] = useState<WorkoutRow[]>([
    createRow(),
    { ...createRow(), exercise: 'Incline Dumbbell Press', weight: 26 },
    { ...createRow(), exercise: 'Shoulder Press', weight: 22 },
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
    <div className="min-h-screen bg-[#09090b] px-4 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-[430px]">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/10 px-3 py-2 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
              Workout
            </div>
            <div className="text-lg font-black leading-none">Live</div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
            Real-life effort
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Train clean. Level up.</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Fast workout flow, premium feel, zero clutter.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
                <Flame className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-xs text-zinc-400">Progress</div>
              <div className="mt-1 text-lg font-bold">{progressPercent}%</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
                <Dumbbell className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-xs text-zinc-400">Exercises</div>
              <div className="mt-1 text-lg font-bold">{rows.length}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
                <Timer className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-xs text-zinc-400">Duration</div>
              <div className="mt-1 text-lg font-bold">{formatMinutes(elapsedSeconds)}</div>
            </div>
          </div>

          <div className="mt-5">
            <label className="block">
              <span className="text-sm text-zinc-300">Workout name</span>
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
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300/80">
                      Exercise {index + 1}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:bg-white/[0.08]"
                    aria-label="Remove exercise"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm text-zinc-300">Exercise</span>
                    <select
                      value={row.exercise}
                      onChange={(e) => updateRow(row.id, { exercise: e.target.value })}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    >
                      {EXERCISE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    <label className="block">
                      <span className="text-sm text-zinc-300">Sets</span>
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
                      <span className="text-sm text-zinc-300">Reps</span>
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
                      <span className="text-sm text-zinc-300">Weight</span>
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
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRow}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold transition hover:bg-white/[0.08]"
          >
            <Plus className="h-4 w-4" />
            Add exercise
          </button>

          <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300/80">
              Session summary
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-zinc-400">Estimated volume</span>
              <span className="font-bold text-white">{volume} kg</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-zinc-400">Duration</span>
              <span className="font-bold text-white">{durationMinutes} min</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleComplete}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-4 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:scale-[1.01]"
          >
            <Check className="h-4 w-4" />
            Finish workout
          </button>
        </div>
      </div>
    </div>
  );
}