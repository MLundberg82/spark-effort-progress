import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Dumbbell,
  Flame,
  Scale,
  Trophy,
} from 'lucide-react';
import {
  getExerciseHistory,
  getExerciseNameOptions,
  getWorkoutHistory,
  getWorkoutNameOptions,
  type WorkoutHistoryEntry,
} from '@/lib/historyStore';

type HistoryScreenProps = {
  onBack: () => void;
};

type RangeKey = 'day' | 'week' | 'month' | 'year';

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getRangeStart(range: RangeKey) {
  const now = new Date();
  const base = startOfDay(now);

  if (range === 'day') {
    return base;
  }

  if (range === 'week') {
    const next = new Date(base);
    next.setDate(next.getDate() - 6);
    return next;
  }

  if (range === 'month') {
    const next = new Date(base);
    next.setDate(next.getDate() - 29);
    return next;
  }

  const next = new Date(base);
  next.setFullYear(next.getFullYear() - 1);
  next.setDate(next.getDate() + 1);
  return next;
}

function formatRangeLabel(range: RangeKey) {
  if (range === 'day') return 'Today';
  if (range === 'week') return 'Last 7 days';
  if (range === 'month') return 'Last 30 days';
  return 'Last 12 months';
}

function aggregateByRange(workouts: WorkoutHistoryEntry[], range: RangeKey) {
  const from = getRangeStart(range).getTime();

  if (range === 'day') {
    const filtered = workouts.filter(
      (entry) => new Date(entry.completedAt).getTime() >= from,
    );

    return [
      {
        label: 'Today',
        workouts: filtered.length,
        volume: filtered.reduce((sum, entry) => sum + entry.volume, 0),
      },
    ];
  }

  if (range === 'week') {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const buckets = labels.map((label) => ({
      label,
      workouts: 0,
      volume: 0,
    }));

    workouts.forEach((entry) => {
      const date = new Date(entry.completedAt);
      const time = date.getTime();
      if (time < from) return;

      const jsDay = date.getDay();
      const index = jsDay === 0 ? 6 : jsDay - 1;

      buckets[index].workouts += 1;
      buckets[index].volume += entry.volume;
    });

    return buckets;
  }

  if (range === 'month') {
    const buckets = Array.from({ length: 4 }, (_, index) => ({
      label: `W${index + 1}`,
      workouts: 0,
      volume: 0,
    }));

    workouts.forEach((entry) => {
      const time = new Date(entry.completedAt).getTime();
      if (time < from) return;

      const diffDays = Math.floor((Date.now() - time) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.min(3, Math.max(0, 3 - Math.floor(diffDays / 7)));

      buckets[weekIndex].workouts += 1;
      buckets[weekIndex].volume += entry.volume;
    });

    return buckets;
  }

  const monthNames = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const buckets = monthNames.map((label) => ({
    label,
    workouts: 0,
    volume: 0,
  }));

  workouts.forEach((entry) => {
    const date = new Date(entry.completedAt);
    const time = date.getTime();
    if (time < from) return;

    const bucketIndex = monthNames.indexOf(
      date.toLocaleString(undefined, { month: 'short' }),
    );

    if (bucketIndex >= 0) {
      buckets[bucketIndex].workouts += 1;
      buckets[bucketIndex].volume += entry.volume;
    }
  });

  return buckets;
}

function formatDate(value: string) {
  const date = new Date(value);
  return `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function Chart({
  data,
  mode,
}: {
  data: Array<{ label: string; workouts: number; volume: number }>;
  mode: 'workouts' | 'volume';
}) {
  const maxValue = Math.max(
    1,
    ...data.map((item) => (mode === 'workouts' ? item.workouts : item.volume)),
  );

  return (
    <div className="rounded-[28px] border border-white/10 bg-black/20 p-4">
      <div className="flex h-44 items-end gap-3">
        {data.map((item) => {
          const value = mode === 'workouts' ? item.workouts : item.volume;
          const height = Math.max(8, Math.round((value / maxValue) * 100));

          return (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="text-[10px] font-bold text-white/45">
                {mode === 'workouts' ? value : `${value}`}
              </div>
              <div className="flex h-32 w-full items-end">
                <div
                  className="w-full rounded-t-2xl bg-lime-300 transition-all"
                  style={{ height: `${height}%` }}
                />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sublabel,
  icon,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_12px_34px_rgba(0,0,0,0.24)]">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
        <span className="text-lime-300">{icon}</span>
        {label}
      </div>
      <div className="mt-3 text-2xl font-black text-white">{value}</div>
      {sublabel ? <div className="mt-1 text-sm text-white/55">{sublabel}</div> : null}
    </div>
  );
}

export default function HistoryScreen({ onBack }: HistoryScreenProps) {
  const [workouts, setWorkouts] = useState(() => getWorkoutHistory());
  const [range, setRange] = useState<RangeKey>('week');
  const [selectionType, setSelectionType] = useState<'workout' | 'exercise'>('exercise');
  const [selectedWorkoutName, setSelectedWorkoutName] = useState('');
  const [selectedExerciseName, setSelectedExerciseName] = useState('');

  useEffect(() => {
    const refresh = () => {
      setWorkouts(getWorkoutHistory());
    };

    window.addEventListener('history-updated', refresh);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener('history-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const workoutOptions = useMemo(() => getWorkoutNameOptions(), [workouts]);
  const exerciseOptions = useMemo(() => getExerciseNameOptions(), [workouts]);

  useEffect(() => {
    if (!selectedWorkoutName && workoutOptions.length > 0) {
      setSelectedWorkoutName(workoutOptions[0]);
    }
  }, [selectedWorkoutName, workoutOptions]);

  useEffect(() => {
    if (!selectedExerciseName && exerciseOptions.length > 0) {
      setSelectedExerciseName(exerciseOptions[0]);
    }
  }, [selectedExerciseName, exerciseOptions]);

  const totalMinutes = workouts.reduce((sum, workout) => sum + workout.durationMinutes, 0);
  const totalVolume = workouts.reduce((sum, workout) => sum + workout.volume, 0);
  const averageMinutes = workouts.length > 0 ? Math.round(totalMinutes / workouts.length) : 0;
  const averageVolume = workouts.length > 0 ? Math.round(totalVolume / workouts.length) : 0;

  const chartData = useMemo(() => aggregateByRange(workouts, range), [workouts, range]);

  const filteredWorkoutSessions = useMemo(() => {
    if (!selectedWorkoutName) return [];
    return workouts.filter((entry) => entry.workoutName === selectedWorkoutName);
  }, [workouts, selectedWorkoutName]);

  const selectedExerciseHistory = useMemo(() => {
    if (!selectedExerciseName) return [];
    return getExerciseHistory(selectedExerciseName);
  }, [selectedExerciseName, workouts]);

  const selectedExerciseBest = useMemo(() => {
    if (selectedExerciseHistory.length === 0) return null;

    return selectedExerciseHistory.reduce((best, entry) => {
      if (!best) return entry;
      if (entry.weight > best.weight) return entry;
      if (entry.weight === best.weight && entry.volume > best.volume) return entry;
      return best;
    }, selectedExerciseHistory[0]);
  }, [selectedExerciseHistory]);

  const selectedWorkoutSummary = useMemo(() => {
    if (filteredWorkoutSessions.length === 0) return null;

    return {
      sessions: filteredWorkoutSessions.length,
      totalVolume: filteredWorkoutSessions.reduce((sum, entry) => sum + entry.volume, 0),
      avgDuration: Math.round(
        filteredWorkoutSessions.reduce((sum, entry) => sum + entry.durationMinutes, 0) /
          filteredWorkoutSessions.length,
      ),
      latest: filteredWorkoutSessions[0],
    };
  }, [filteredWorkoutSessions]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(132,204,22,0.12),transparent_30%),linear-gradient(180deg,#09090b_0%,#101113_60%,#0b0b0d_100%)] px-4 pb-10 pt-5 text-white">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white/85 transition hover:bg-white/[0.08]"
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mt-5 rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_28px_100px_rgba(0,0,0,0.36)] backdrop-blur">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-lime-300">
            History
          </div>
          <h1 className="mt-2 text-4xl font-black leading-none">Your momentum</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/62">
            Clean summary on top. Then real progression views by timeframe, workout and exercise.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Workouts"
              value={workouts.length}
              sublabel="Logged sessions"
              icon={<Trophy className="h-4 w-4" />}
            />
            <SummaryCard
              label="Avg time"
              value={`${averageMinutes} min`}
              sublabel="Per session"
              icon={<CalendarDays className="h-4 w-4" />}
            />
            <SummaryCard
              label="Total time"
              value={`${totalMinutes} min`}
              sublabel="All sessions"
              icon={<Flame className="h-4 w-4" />}
            />
            <SummaryCard
              label="Volume"
              value={`${totalVolume} kg`}
              sublabel={`Avg ${averageVolume} kg`}
              icon={<Scale className="h-4 w-4" />}
            />
          </div>
        </div>

        <div className="mt-4 rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/50">
                Progress chart
              </div>
              <div className="mt-1 text-2xl font-black text-white">
                {formatRangeLabel(range)}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['day', 'week', 'month', 'year'] as RangeKey[]).map((entry) => (
                <button
                  key={entry}
                  onClick={() => setRange(entry)}
                  className={`rounded-2xl px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] transition ${
                    range === entry
                      ? 'bg-lime-300 text-black'
                      : 'border border-white/10 bg-black/20 text-white/75'
                  }`}
                  type="button"
                >
                  {entry}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                Workout count
              </div>
              <Chart data={chartData} mode="workouts" />
            </div>

            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                Volume
              </div>
              <Chart data={chartData} mode="volume" />
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/50">
                Deep dive
              </div>
              <div className="mt-1 text-2xl font-black text-white">
                Track by workout or exercise
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectionType('exercise')}
                className={`rounded-2xl px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] transition ${
                  selectionType === 'exercise'
                    ? 'bg-lime-300 text-black'
                    : 'border border-white/10 bg-black/20 text-white/75'
                }`}
                type="button"
              >
                Exercise
              </button>
              <button
                onClick={() => setSelectionType('workout')}
                className={`rounded-2xl px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] transition ${
                  selectionType === 'workout'
                    ? 'bg-lime-300 text-black'
                    : 'border border-white/10 bg-black/20 text-white/75'
                }`}
                type="button"
              >
                Workout
              </button>
            </div>
          </div>

          {selectionType === 'exercise' ? (
            <div className="mt-5">
              <label className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
                Select exercise
              </label>
              <div className="relative mt-2">
                <select
                  value={selectedExerciseName}
                  onChange={(e) => setSelectedExerciseName(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-lime-300"
                >
                  {exerciseOptions.map((exercise) => (
                    <option key={exercise} value={exercise}>
                      {exercise}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
              </div>

              {selectedExerciseHistory.length === 0 ? (
                <div className="mt-4 rounded-[24px] border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/55">
                  No exercise data yet. Finish a workout with saved exercise rows and it shows up here.
                </div>
              ) : (
                <>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <SummaryCard
                      label="Entries"
                      value={selectedExerciseHistory.length}
                      sublabel="Tracked sets in history"
                      icon={<Dumbbell className="h-4 w-4" />}
                    />
                    <SummaryCard
                      label="Best weight"
                      value={`${selectedExerciseBest?.weight ?? 0} kg`}
                      sublabel={
                        selectedExerciseBest
                          ? `${selectedExerciseBest.reps} reps`
                          : undefined
                      }
                      icon={<Trophy className="h-4 w-4" />}
                    />
                    <SummaryCard
                      label="Best volume"
                      value={`${
                        Math.max(...selectedExerciseHistory.map((entry) => entry.volume))
                      } kg`}
                      sublabel="Single logged exercise entry"
                      icon={<Flame className="h-4 w-4" />}
                    />
                  </div>

                  <div className="mt-4 rounded-[26px] border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                      Exercise progression
                    </div>

                    <div className="mt-4 space-y-3">
                      {selectedExerciseHistory
                        .slice()
                        .reverse()
                        .map((entry, index) => {
                          const maxVolume = Math.max(
                            1,
                            ...selectedExerciseHistory.map((item) => item.volume),
                          );
                          const width = Math.max(
                            8,
                            Math.round((entry.volume / maxVolume) * 100),
                          );

                          return (
                            <div
                              key={`${entry.completedAt}-${index}`}
                              className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4"
                            >
                              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <div className="font-bold text-white">
                                    {entry.workoutName}
                                  </div>
                                  <div className="mt-1 text-sm text-white/55">
                                    {formatDate(entry.completedAt)}
                                  </div>
                                </div>
                                <div className="text-sm text-white/65">
                                  {entry.sets} sets · {entry.reps} reps · {entry.weight} kg
                                </div>
                              </div>

                              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-lime-300"
                                  style={{ width: `${width}%` }}
                                />
                              </div>

                              <div className="mt-2 text-sm font-semibold text-white">
                                Volume: {entry.volume} kg
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="mt-5">
              <label className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
                Select workout
              </label>
              <div className="relative mt-2">
                <select
                  value={selectedWorkoutName}
                  onChange={(e) => setSelectedWorkoutName(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-lime-300"
                >
                  {workoutOptions.map((workoutName) => (
                    <option key={workoutName} value={workoutName}>
                      {workoutName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
              </div>

              {!selectedWorkoutSummary ? (
                <div className="mt-4 rounded-[24px] border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/55">
                  No workout data yet.
                </div>
              ) : (
                <>
                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <SummaryCard
                      label="Sessions"
                      value={selectedWorkoutSummary.sessions}
                      sublabel="Times completed"
                      icon={<Trophy className="h-4 w-4" />}
                    />
                    <SummaryCard
                      label="Avg time"
                      value={`${selectedWorkoutSummary.avgDuration} min`}
                      sublabel="Per completion"
                      icon={<CalendarDays className="h-4 w-4" />}
                    />
                    <SummaryCard
                      label="Total volume"
                      value={`${selectedWorkoutSummary.totalVolume} kg`}
                      sublabel="Across all completions"
                      icon={<Flame className="h-4 w-4" />}
                    />
                    <SummaryCard
                      label="Latest"
                      value={selectedWorkoutSummary.latest.focusArea}
                      sublabel={formatDate(selectedWorkoutSummary.latest.completedAt)}
                      icon={<Dumbbell className="h-4 w-4" />}
                    />
                  </div>

                  <div className="mt-4 space-y-3">
                    {filteredWorkoutSessions.map((session) => (
                      <div
                        key={session.id}
                        className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="text-lg font-bold text-white">
                              {session.workoutName}
                            </div>
                            <div className="mt-1 text-sm text-white/55">
                              {formatDate(session.completedAt)}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white/75">
                            Focus: {session.focusArea}
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                            <div className="text-xs uppercase tracking-[0.14em] text-white/45">
                              Duration
                            </div>
                            <div className="mt-1 text-lg font-black text-white">
                              {session.durationMinutes} min
                            </div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                            <div className="text-xs uppercase tracking-[0.14em] text-white/45">
                              Exercises
                            </div>
                            <div className="mt-1 text-lg font-black text-white">
                              {session.exercisesCompleted}
                            </div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                            <div className="text-xs uppercase tracking-[0.14em] text-white/45">
                              Volume
                            </div>
                            <div className="mt-1 text-lg font-black text-white">
                              {session.volume} kg
                            </div>
                          </div>
                        </div>

                        {session.details.length > 0 ? (
                          <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                            <div className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                              Exercise details
                            </div>

                            <div className="mt-3 space-y-2">
                              {session.details.map((detail, index) => (
                                <div
                                  key={`${session.id}-${detail.exercise}-${index}`}
                                  className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 md:flex-row md:items-center md:justify-between"
                                >
                                  <div className="font-semibold text-white">
                                    {detail.exercise}
                                  </div>
                                  <div className="text-sm text-white/65">
                                    {detail.sets} sets · {detail.reps} reps · {detail.weight} kg
                                  </div>
                                  <div className="text-sm font-bold text-white">
                                    {detail.volume} kg
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {workouts.length === 0 ? (
          <div className="mt-4 rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-6 text-center">
            <div className="text-lg font-bold text-white">No workouts yet</div>
            <div className="mt-2 text-sm text-white/55">
              Finish your first real session and history will start filling with progression data.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}