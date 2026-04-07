import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Filter,
  Flame,
  History as HistoryIcon,
  Timer,
  TrendingUp,
} from 'lucide-react';

import {
  calculateWorkoutVolume,
  getExerciseNameOptions,
  getWorkoutHistory,
  getWorkoutNameOptions,
} from '@/lib/historyStore';

type WorkoutEntry = ReturnType<typeof getWorkoutHistory>[number];

type Props = {
  onBack: () => void;
};

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-white/14 bg-white/[0.06] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/12 bg-white/[0.08] text-white/88">
          {icon}
        </div>
        <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">
          {title}
        </h2>
      </div>

      <div className="space-y-3">{children}</div>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[18px] border border-white/12 bg-black/28 p-3">
      <div className="flex items-center gap-2 text-white/62">
        {icon}
        <span className="text-[11px] font-black uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>

      <div className="mt-2 text-lg font-black text-white">{value}</div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/52">
        {label}
      </div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[16px] border border-white/12 bg-black/28 px-3 py-3 text-sm font-semibold text-white outline-none"
      >
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function HistoryScreen({ onBack }: Props) {
  const [history, setHistory] = useState<WorkoutEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [workoutFilter, setWorkoutFilter] = useState('all');
  const [exerciseFilter, setExerciseFilter] = useState('all');
  const [workoutOptions, setWorkoutOptions] = useState<string[]>([]);
  const [exerciseOptions, setExerciseOptions] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      setHistory(getWorkoutHistory());
      setWorkoutOptions(getWorkoutNameOptions());
      setExerciseOptions(getExerciseNameOptions());
    };

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('history-updated', sync as EventListener);

    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('history-updated', sync as EventListener);
    };
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter((workout) => {
      if (workoutFilter !== 'all' && workout.workoutName !== workoutFilter) {
        return false;
      }

      if (exerciseFilter !== 'all') {
        const hasExercise = workout.exercises.some(
          (exercise) => exercise.name === exerciseFilter,
        );
        if (!hasExercise) return false;
      }

      return true;
    });
  }, [history, workoutFilter, exerciseFilter]);

  const totalVolume = useMemo(() => {
    return filteredHistory.reduce(
      (sum, workout) => sum + calculateWorkoutVolume(workout),
      0,
    );
  }, [filteredHistory]);

  const totalMinutes = useMemo(() => {
    return filteredHistory.reduce(
      (sum, workout) => sum + (workout.durationMinutes ?? 0),
      0,
    );
  }, [filteredHistory]);

  const totalExercises = useMemo(() => {
    return filteredHistory.reduce(
      (sum, workout) => sum + workout.exercises.length,
      0,
    );
  }, [filteredHistory]);

  return (
    <div className="min-h-full">
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-white/14 bg-black/38 text-white transition hover:bg-black/46"
            aria-label="Back"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>

          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/56">
              History
            </div>
            <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white">
              Training archive
            </h1>
            <p className="mt-1 text-sm text-white/78">
              Sessions, volume and consistency in one clean view.
            </p>
          </div>
        </div>

        <SectionCard title="Overview" icon={<HistoryIcon className="h-4.5 w-4.5" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard
              icon={<Flame className="h-4 w-4" />}
              label="Workouts"
              value={filteredHistory.length}
            />
            <StatCard
              icon={<TrendingUp className="h-4 w-4" />}
              label="Volume"
              value={`${totalVolume} kg`}
            />
            <StatCard
              icon={<Timer className="h-4 w-4" />}
              label="Minutes"
              value={totalMinutes}
            />
            <StatCard
              icon={<Dumbbell className="h-4 w-4" />}
              label="Exercises"
              value={totalExercises}
            />
          </div>
        </SectionCard>

        <SectionCard title="Filters" icon={<Filter className="h-4.5 w-4.5" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <FilterSelect
              label="Workout"
              value={workoutFilter}
              onChange={setWorkoutFilter}
              options={workoutOptions}
            />

            <FilterSelect
              label="Exercise"
              value={exerciseFilter}
              onChange={setExerciseFilter}
              options={exerciseOptions}
            />
          </div>
        </SectionCard>

        <SectionCard title="Logs" icon={<HistoryIcon className="h-4.5 w-4.5" />}>
          {filteredHistory.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-white/14 bg-black/28 px-4 py-5 text-sm text-white/72">
              No workouts yet. Start your first one and the archive will come alive.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((workout) => {
                const volume = calculateWorkoutVolume(workout);
                const isOpen = expanded === workout.id;
                const workoutDate = new Date(workout.completedAt);

                return (
                  <div
                    key={workout.id}
                    className="rounded-[18px] border border-white/12 bg-black/28"
                  >
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : workout.id)}
                      className="w-full px-3.5 py-3 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
                            Workout log
                          </div>
                          <h3 className="mt-1 text-base font-black text-white">
                            {workout.workoutName}
                          </h3>
                          <div className="mt-1 text-sm text-white/72">
                            {workoutDate.toLocaleDateString()}
                          </div>
                        </div>

                        <div className="pt-1 text-white/78">
                          {isOpen ? (
                            <ChevronUp className="h-4.5 w-4.5" />
                          ) : (
                            <ChevronDown className="h-4.5 w-4.5" />
                          )}
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="rounded-[14px] border border-white/10 bg-white/[0.05] px-3 py-2">
                          <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/46">
                            Volume
                          </div>
                          <div className="mt-1 text-sm font-bold text-white">
                            {volume} kg
                          </div>
                        </div>

                        <div className="rounded-[14px] border border-white/10 bg-white/[0.05] px-3 py-2">
                          <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/46">
                            Time
                          </div>
                          <div className="mt-1 text-sm font-bold text-white">
                            {workout.durationMinutes} min
                          </div>
                        </div>

                        <div className="rounded-[14px] border border-white/10 bg-white/[0.05] px-3 py-2">
                          <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/46">
                            Exercises
                          </div>
                          <div className="mt-1 text-sm font-bold text-white">
                            {workout.exercises.length}
                          </div>
                        </div>
                      </div>
                    </button>

                    {isOpen ? (
                      <div className="border-t border-white/10 px-3.5 py-3">
                        <div className="space-y-3">
                          {workout.exercises.map((exercise, index) => (
                            <div
                              key={`${workout.id}-${exercise.name}-${index}`}
                              className="rounded-[16px] border border-white/10 bg-white/[0.05] p-3"
                            >
                              <h4 className="text-sm font-black text-white">
                                {exercise.name}
                              </h4>

                              <div className="mt-2 space-y-2">
                                {exercise.sets.map((set, setIndex) => (
                                  <div
                                    key={`${exercise.name}-${setIndex}`}
                                    className="flex items-center justify-between rounded-[12px] border border-white/8 bg-black/24 px-3 py-2 text-sm text-white/80"
                                  >
                                    <span className="font-semibold">
                                      Set {setIndex + 1}
                                    </span>
                                    <span>
                                      {set.reps} reps · {set.weight} kg
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}