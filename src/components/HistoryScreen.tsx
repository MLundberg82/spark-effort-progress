import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BarChart3, Clock3, Dumbbell, Flame } from 'lucide-react';
import { getWorkoutHistory, type WorkoutHistoryEntry } from '@/lib/historyStore';
import { useAppLanguage } from '@/lib/languageStore';

type HistoryScreenProps = {
  onBack: () => void;
};

type PeriodKey = 'day' | 'week' | 'month' | 'year';

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isWithinPeriod(dateString: string, period: PeriodKey) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = startOfDay(now).getTime() - startOfDay(date).getTime();
  const days = diff / 86400000;

  if (period === 'day') return days <= 1;
  if (period === 'week') return days <= 7;
  if (period === 'month') return days <= 31;
  return days <= 365;
}

function aggregateSeries(entries: WorkoutHistoryEntry[], period: PeriodKey) {
  const filtered = entries.filter((entry) => isWithinPeriod(entry.completedAt, period));

  const buckets =
    period === 'day'
      ? 7
      : period === 'week'
        ? 7
        : period === 'month'
          ? 6
          : 12;

  const labels =
    period === 'day'
      ? ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Today']
      : period === 'week'
        ? ['W-6', 'W-5', 'W-4', 'W-3', 'W-2', 'W-1', 'This']
        : period === 'month'
          ? ['M-5', 'M-4', 'M-3', 'M-2', 'M-1', 'This']
          : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const values = new Array(buckets).fill(0);

  filtered.forEach((entry) => {
    const date = new Date(entry.completedAt);

    if (period === 'year') {
      values[date.getMonth()] += entry.volume;
      return;
    }

    const now = new Date();
    const diffDays = Math.floor(
      (startOfDay(now).getTime() - startOfDay(date).getTime()) / 86400000,
    );

    if (period === 'day') {
      const index = Math.max(0, 6 - diffDays);
      if (index >= 0 && index < values.length) values[index] += 1;
      return;
    }

    if (period === 'week') {
      const weekIndex = Math.max(0, 6 - Math.floor(diffDays / 7));
      if (weekIndex >= 0 && weekIndex < values.length) values[weekIndex] += entry.volume;
      return;
    }

    const monthIndex = Math.max(0, 5 - Math.floor(diffDays / 30));
    if (monthIndex >= 0 && monthIndex < values.length) values[monthIndex] += entry.volume;
  });

  return labels.map((label, index) => ({
    label,
    value: values[index] ?? 0,
  }));
}

function extractExerciseNames(entries: WorkoutHistoryEntry[]) {
  const names = new Set<string>();

  entries.forEach((entry) => {
    const maybeDetails = (entry as WorkoutHistoryEntry & {
      details?: Array<{ exercise?: string }>;
    }).details;

    if (Array.isArray(maybeDetails)) {
      maybeDetails.forEach((detail) => {
        if (detail.exercise) names.add(detail.exercise);
      });
    }
  });

  return Array.from(names).sort();
}

function Chart({
  title,
  data,
  suffix = '',
}: {
  title: string;
  data: { label: string; value: number }[];
  suffix?: string;
}) {
  const maxValue = Math.max(1, ...data.map((item) => item.value));

  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
        {title}
      </div>

      <div className="flex h-48 items-end gap-2">
        {data.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end">
              <div
                className="w-full rounded-t-2xl bg-[linear-gradient(180deg,rgba(132,255,88,0.9),rgba(132,255,88,0.22))]"
                style={{
                  height: `${Math.max(8, (item.value / maxValue) * 100)}%`,
                }}
                title={`${item.value}${suffix}`}
              />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/40">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HistoryScreen({ onBack }: HistoryScreenProps) {
  const language = useAppLanguage();
  const [refreshKey, setRefreshKey] = useState(0);
  const [period, setPeriod] = useState<PeriodKey>('week');
  const [selectedWorkout, setSelectedWorkout] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState('all');

  useEffect(() => {
    const sync = () => setRefreshKey((value) => value + 1);
    window.addEventListener('history-updated', sync);
    return () => window.removeEventListener('history-updated', sync);
  }, []);

  const workouts = useMemo(() => getWorkoutHistory(), [refreshKey]);

  const totalWorkouts = workouts.length;
  const totalMinutes = workouts.reduce((sum, item) => sum + item.durationMinutes, 0);
  const totalVolume = workouts.reduce((sum, item) => sum + item.volume, 0);

  const workoutOptions = useMemo(() => {
    return Array.from(new Set(workouts.map((entry) => entry.workoutName))).sort();
  }, [workouts]);

  const exerciseOptions = useMemo(() => extractExerciseNames(workouts), [workouts]);

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((entry) => {
      if (selectedWorkout !== 'all' && entry.workoutName !== selectedWorkout) {
        return false;
      }

      if (selectedExercise !== 'all') {
        const maybeDetails = (entry as WorkoutHistoryEntry & {
          details?: Array<{ exercise?: string }>;
        }).details;

        if (!Array.isArray(maybeDetails)) return false;

        return maybeDetails.some((detail) => detail.exercise === selectedExercise);
      }

      return true;
    });
  }, [workouts, selectedWorkout, selectedExercise]);

  const countSeries = useMemo(
    () => aggregateSeries(filteredWorkouts, period),
    [filteredWorkouts, period],
  );

  const volumeSeries = useMemo(() => {
    return aggregateSeries(
      filteredWorkouts.map((entry) => ({ ...entry, volume: entry.volume })),
      period,
    );
  }, [filteredWorkouts, period]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.16),_transparent_30%),linear-gradient(180deg,_#09090b_0%,_#111113_100%)] px-4 py-5 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          {language === 'sv' ? 'Tillbaka' : 'Back'}
        </button>

        <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            {language === 'sv' ? 'Historik' : 'History'}
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            {language === 'sv' ? 'Följ din progression' : 'Track your progression'}
          </h1>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-white/45">
              <Dumbbell className="h-4 w-4 text-lime-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                Workouts
              </span>
            </div>
            <div className="mt-2 text-3xl font-black text-white">{totalWorkouts}</div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-white/45">
              <Clock3 className="h-4 w-4 text-lime-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                {language === 'sv' ? 'Tid' : 'Time'}
              </span>
            </div>
            <div className="mt-2 text-3xl font-black text-white">{totalMinutes} min</div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-white/45">
              <Flame className="h-4 w-4 text-lime-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                Volume
              </span>
            </div>
            <div className="mt-2 text-3xl font-black text-white">{totalVolume}</div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-3 flex items-center gap-2 text-white/45">
            <BarChart3 className="h-4 w-4 text-lime-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.18em]">
              {language === 'sv' ? 'Filter' : 'Filters'}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="grid grid-cols-4 gap-2">
              {(['day', 'week', 'month', 'year'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPeriod(key)}
                  className={`rounded-2xl px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
                    period === key
                      ? 'border border-lime-400/30 bg-lime-400/12 text-white'
                      : 'border border-white/10 bg-white/[0.04] text-white/65'
                  }`}
                >
                  {language === 'sv'
                    ? key === 'day'
                      ? 'Dag'
                      : key === 'week'
                        ? 'Vecka'
                        : key === 'month'
                          ? 'Månad'
                          : 'År'
                    : key}
                </button>
              ))}
            </div>

            <select
              value={selectedWorkout}
              onChange={(event) => setSelectedWorkout(event.target.value)}
              className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none"
            >
              <option value="all">
                {language === 'sv' ? 'Välj pass' : 'Select workout'}
              </option>
              {workoutOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={selectedExercise}
              onChange={(event) => setSelectedExercise(event.target.value)}
              className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none"
            >
              <option value="all">
                {language === 'sv' ? 'Välj övning' : 'Select exercise'}
              </option>
              {exerciseOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Chart
            title={language === 'sv' ? 'Pass över tid' : 'Workouts over time'}
            data={countSeries}
          />
          <Chart
            title={language === 'sv' ? 'Volym över tid' : 'Volume over time'}
            data={volumeSeries}
            suffix=" kg"
          />
        </div>

        <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
            {language === 'sv' ? 'Vald vy' : 'Selected view'}
          </div>

          {selectedExercise !== 'all' && exerciseOptions.length === 0 ? (
            <p className="mt-3 text-sm text-white/55">
              {language === 'sv'
                ? 'Övningsgrafen blir riktig när per-övning-data sparas i historiken.'
                : 'Exercise-specific graphs become real once per-exercise data is saved to history.'}
            </p>
          ) : filteredWorkouts.length === 0 ? (
            <p className="mt-3 text-sm text-white/55">
              {language === 'sv'
                ? 'Ingen data för det filtret än.'
                : 'No data for that filter yet.'}
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {filteredWorkouts.slice(0, 6).map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                >
                  <div>
                    <div className="font-bold text-white">{workout.workoutName}</div>
                    <div className="text-sm text-white/50">
                      {new Date(workout.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right text-sm text-white/65">
                    <div>{workout.durationMinutes} min</div>
                    <div>{workout.volume} kg</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}