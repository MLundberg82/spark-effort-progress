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
import {
  clearWorkoutDraft,
  getWorkoutDraft,
  saveWorkoutDraft,
} from '@/lib/workoutStore';
import type {
  FocusArea,
  WorkoutExerciseDetail,
} from '@/lib/historyStore';

type WorkoutRow = {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
};

type WorkoutCompleteResult = {
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
  focusArea: FocusArea;
  details: WorkoutExerciseDetail[];
};

type WorkoutFlowProps = {
  onBack: () => void;
  onComplete: (result: WorkoutCompleteResult) => void;
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
] as const;

const EXERCISE_FOCUS: Record<string, FocusArea> = {
  'Bench Press': 'chest',
  'Incline Dumbbell Press': 'chest',
  'Chest Fly': 'chest',

  'Lat Pulldown': 'back',
  'Barbell Row': 'back',
  'Seated Cable Row': 'back',
  'Romanian Deadlift': 'back',

  'Shoulder Press': 'arms',
  'Lateral Raise': 'arms',
  'Rear Delt Fly': 'arms',
  'Barbell Curl': 'arms',
  'Hammer Curl': 'arms',
  'Triceps Pushdown': 'arms',
  'Overhead Extension': 'arms',

  'Squat': 'legs',
  'Leg Press': 'legs',
  'Leg Curl': 'legs',
  'Leg Extension': 'legs',
  'Calf Raise': 'legs',
};

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

function parseDraftRows(raw: string | undefined): WorkoutRow[] | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const next = parsed
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;

        const value = entry as Partial<WorkoutRow>;
        const exercise =
          typeof value.exercise === 'string' && value.exercise.trim().length > 0
            ? value.exercise.trim()
            : EXERCISE_OPTIONS[0];

        return createRow({
          exercise,
          sets: clampNumber(Number(value.sets), 1, 20),
          reps: clampNumber(Number(value.reps), 1, 50),
          weight: clampNumber(Number(value.weight), 0, 500),
        });
      })
      .filter((row): row is WorkoutRow => row !== null);

    return next.length > 0 ? next : null;
  } catch {
    return null;
  }
}

function inferFocusArea(workoutName: string, details: WorkoutExerciseDetail[]): FocusArea {
  const score: Record<FocusArea, number> = {
    chest: 0,
    back: 0,
    arms: 0,
    legs: 0,
  };

  for (const detail of details) {
    const mapped = EXERCISE_FOCUS[detail.exercise];
    if (!mapped) continue;

    score[mapped] += Math.max(1, detail.sets) * Math.max(1, detail.reps);
  }

  const ranked = (Object.keys(score) as FocusArea[])
    .map((area) => ({ area, value: score[area] }))
    .sort((a, b) => b.value - a.value);

  if (ranked[0]?.value > 0) {
    return ranked[0].area;
  }

  const lower = workoutName.toLowerCase();

  if (lower.includes('pull') || lower.includes('back') || lower.includes('row')) {
    return 'back';
  }

  if (lower.includes('leg') || lower.includes('lower') || lower.includes('squat')) {
    return 'legs';
  }

  if (
    lower.includes('arm') ||
    lower.includes('shoulder') ||
    lower.includes('bicep') ||
    lower.includes('tricep')
  ) {
    return 'arms';
  }

  return 'chest';
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
    <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.2)] backdrop-blur">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
        <span className={accent}>{icon}</span>
        {label}
      </div>
      <div className="mt-3 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

export default function WorkoutFlow({ onBack, onComplete }: WorkoutFlowProps) {
  const draft = getWorkoutDraft();
  const parsedDraftRows = parseDraftRows(draft?.notes);

  const [workoutName, setWorkoutName] = useState(
    draft?.workoutName?.trim() || 'Push Session',
  );
  const [rows, setRows] = useState<WorkoutRow[]>(
    parsedDraftRows ?? [
      createRow(),
      createRow({ exercise: 'Incline Dumbbell Press', weight: 26 }),
      createRow({ exercise: 'Shoulder Press', weight: 22 }),
    ],
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    if (!draft?.startedAt) return 0;

    const startedAt = new Date(draft.startedAt).getTime();
    if (!Number.isFinite(startedAt)) return 0;

    return Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  });

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

  const details = useMemo<WorkoutExerciseDetail[]>(() => {
    return rows
      .filter((row) => row.exercise.trim() && row.sets > 0 && row.reps > 0)
      .map((row) => ({
        exercise: row.exercise.trim(),
        sets: row.sets,
        reps: row.reps,
        weight: row.weight,
        volume: row.sets * row.reps * row.weight,
      }));
  }, [rows]);

  const volume = useMemo(() => {
    return details.reduce((sum, detail) => sum + detail.volume, 0);
  }, [details]);

  const progressPercent = useMemo(() => {
    const completed = rows.filter(
      (row) => row.exercise.trim() && row.sets > 0 && row.reps > 0,
    ).length;

    return rows.length === 0
      ? 0
      : Math.max(0, Math.min(100, Math.round((completed / rows.length) * 100)));
  }, [rows]);

  const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

  const updateRow = (id: string, patch: Partial<WorkoutRow>) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
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
    const cleanedDetails = details;
    const cleanedVolume = cleanedDetails.reduce((sum, detail) => sum + detail.volume, 0);
    const focusArea = inferFocusArea(workoutName.trim(), cleanedDetails);

    clearWorkoutDraft();

    onComplete({
      workoutName: workoutName.trim() || 'Workout',
      durationMinutes,
      exercisesCompleted: cleanedDetails.length,
      volume: cleanedVolume,
      focusArea,
      details: cleanedDetails,
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(132,204,22,0.12),transparent_32%),linear-gradient(180deg,#0b0b0d_0%,#111214_100%)] px-4 pb-10 pt-5 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/85 transition hover:bg-white/[0.08]"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-lime-300">
            Workout Live
          </div>
        </div>

        <div className="mt-6 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                Train clean. Level up.
              </div>
              <h1 className="mt-2 text-3xl font-black leading-none sm:text-4xl">
                Workout Flow
              </h1>
              <p className="mt-3 max-w-xl text-sm text-white/65">
                Fast workout logging with a heavy premium feel. Real data in, real
                progression out.
              </p>
            </div>

            <div className="hidden rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 sm:block">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/50">
                <Timer className="h-4 w-4 text-lime-300" />
                Duration
              </div>
              <div className="mt-2 text-xl font-black">{formatMinutes(elapsedSeconds)}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
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
              icon={<Flame className="h-4 w-4" />}
              label="Volume"
              value={`${volume} kg`}
              accent="text-amber-300"
            />
          </div>

          <div className="mt-6">
            <label className="text-[11px] font-black uppercase tracking-[0.18em] text-white/50">
              Workout name
            </label>
            <input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
              placeholder="Push Session"
            />
          </div>

          <div className="mt-6 space-y-4">
            {rows.map((row, index) => (
              <div
                key={row.id}
                className="rounded-[28px] border border-white/10 bg-black/20 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.22)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                      Exercise {index + 1}
                    </div>
                    <div className="mt-1 text-lg font-bold text-white">Log your work</div>
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

                <div className="mt-4">
                  <label className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
                    Exercise
                  </label>
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
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
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
                    <label className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
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
                    <label className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
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

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70">
                  Current exercise volume:{' '}
                  <span className="font-bold text-white">
                    {row.sets * row.reps * row.weight} kg
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addRow}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[22px] border border-dashed border-white/15 bg-white/[0.03] px-4 py-4 text-sm font-black uppercase tracking-[0.16em] text-white/80 transition hover:border-white/25 hover:bg-white/[0.06]"
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add exercise
          </button>

          <div className="mt-6 rounded-[28px] border border-lime-400/10 bg-lime-400/[0.04] p-5">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-lime-300/80">
              Session summary
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-white/45">
                  Estimated volume
                </div>
                <div className="mt-1 text-2xl font-black text-white">{volume} kg</div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-white/45">
                  Duration
                </div>
                <div className="mt-1 text-2xl font-black text-white">
                  {durationMinutes} min
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-white/45">
                  Logged exercises
                </div>
                <div className="mt-1 text-2xl font-black text-white">{details.length}</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="mt-6 inline-flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[24px] bg-lime-400 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:brightness-105 active:scale-[0.995]"
            type="button"
          >
            <Check className="h-5 w-5" />
            Finish workout
          </button>
        </div>
      </div>
    </div>
  );
}