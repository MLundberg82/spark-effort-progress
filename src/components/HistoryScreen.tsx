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
    <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center gap-2 text-white/55">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-[0.16em]">
          {label}
        </span>
      </div>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
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
      <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
        <Filter className="h-3.5 w-3.5" />
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[16px] border border-white/10 bg-black/20 px-3 py-3 text-sm font-semibold text-white outline-none"
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
    <div
      className="absolute inset-y-0 right-0 flex w-[80%] max-w-[420px] flex-col border-l border-white/10 bg-[#0a0a0a]/96 shadow-[-24px_0_80px_rgba(0,0,0,0.45)]"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 pb-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[11px] font-black uppercase tracking-[0.16em] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>

        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
            Menu
          </p>
          <h1 className="text-base font-black uppercase tracking-[0.16em] text-white">
            History
          </h1>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
        <div className="space-y-3">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-white/65">
              <HistoryIcon className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                Training archive
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Full panel, proper scroll, tighter log overview.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
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
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <div className="grid grid-cols-1 gap-3">
              <FilterSelect
                label="Workout filter"
                value={workoutFilter}
                onChange={setWorkoutFilter}
                options={workoutOptions}
              />
              <FilterSelect
                label="Exercise filter"
                value={exerciseFilter}
                onChange={setExerciseFilter}
                options={exerciseOptions}
              />
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-center">
              <h3 className="text-base font-black text-white">
                No workouts yet
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/58">
                Start your first one and this panel will begin to feel alive.
              </p>
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
                    className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded(isOpen ? null : workout.id)
                      }
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                            Workout log
                          </p>
                          <h3 className="mt-1 truncate text-lg font-black text-white">
                            {workout.workoutName}
                          </h3>
                          <p className="mt-1 text-sm text-white/55">
                            {workoutDate.toLocaleDateString()}
                          </p>
                        </div>

                        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/72">
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                            Volume
                          </p>
                          <p className="mt-1 text-sm font-black text-white">
                            {volume} kg
                          </p>
                        </div>

                        <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                            Time
                          </p>
                          <p className="mt-1 text-sm font-black text-white">
                            {workout.durationMinutes} min
                          </p>
                        </div>

                        <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                            Exercises
                          </p>
                          <p className="mt-1 text-sm font-black text-white">
                            {workout.exercises.length}
                          </p>
                        </div>
                      </div>
                    </button>

                    {isOpen ? (
                      <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                        {workout.exercises.map((exercise, index) => (
                          <div
                            key={`${workout.id}-${exercise.name}-${index}`}
                            className="rounded-[18px] border border-white/10 bg-black/20 p-3"
                          >
                            <h4 className="text-sm font-black text-white">
                              {exercise.name}
                            </h4>

                            <div className="mt-3 space-y-2">
                              {exercise.sets.map((set, setIndex) => (
                                <div
                                  key={`${exercise.name}-${setIndex}`}
                                  className="grid grid-cols-[56px_1fr_1fr] gap-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-3 py-2.5"
                                >
                                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
                                    Set {setIndex + 1}
                                  </span>
                                  <span className="text-sm font-semibold text-white/80">
                                    {set.reps} reps
                                  </span>
                                  <span className="text-right text-sm font-semibold text-white/80">
                                    {set.weight} kg
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}