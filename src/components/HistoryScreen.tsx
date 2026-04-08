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

function ScreenShell({
  eyebrow,
  title,
  subtitle,
  onBack,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(163,230,53,0.12),_transparent_35%),linear-gradient(180deg,#0b0b0b_0%,#050505_100%)] px-4 pb-6 pt-4 text-white">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <button
          onClick={onBack}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/82 transition hover:bg-white/[0.08] hover:text-white"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/56">
            <HistoryIcon className="h-3.5 w-3.5 text-lime-300" />
            {eyebrow}
          </div>
          <div>
            <h1 className="text-[30px] font-black leading-[1.02] tracking-[-0.03em] text-white">
              {title}
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/64">{subtitle}</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
}

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
    <section className="rounded-[22px] border border-white/10 bg-black/28 p-4">
      <div className="mb-3 flex items-center gap-2 text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-lime-300">
          {icon}
        </div>
        <h2 className="text-sm font-bold tracking-[-0.02em] text-white">{title}</h2>
      </div>
      {children}
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
    <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/48">
        <span className="text-lime-300">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-2 text-xl font-black tracking-[-0.03em] text-white">{value}</div>
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
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">{label}</span>
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
        const hasExercise = workout.exercises.some((exercise) => exercise.name === exerciseFilter);
        if (!hasExercise) return false;
      }

      return true;
    });
  }, [history, workoutFilter, exerciseFilter]);

  const totalVolume = useMemo(() => {
    return filteredHistory.reduce((sum, workout) => sum + calculateWorkoutVolume(workout), 0);
  }, [filteredHistory]);

  const totalMinutes = useMemo(() => {
    return filteredHistory.reduce((sum, workout) => sum + (workout.durationMinutes ?? 0), 0);
  }, [filteredHistory]);

  const totalExercises = useMemo(() => {
    return filteredHistory.reduce((sum, workout) => sum + workout.exercises.length, 0);
  }, [filteredHistory]);

  return (
    <ScreenShell
      eyebrow="History"
      title="Training archive"
      subtitle="Sessions, volume and consistency in one clean view."
      onBack={onBack}
    >
      <div className="space-y-4">
        <SectionCard title="Overview" icon={<TrendingUp className="h-4 w-4" />}>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<HistoryIcon className="h-4 w-4" />} label="Workouts" value={filteredHistory.length} />
            <StatCard icon={<Flame className="h-4 w-4" />} label="Volume" value={`${totalVolume} kg`} />
            <StatCard icon={<Timer className="h-4 w-4" />} label="Minutes" value={totalMinutes} />
            <StatCard icon={<Dumbbell className="h-4 w-4" />} label="Exercises" value={totalExercises} />
          </div>
        </SectionCard>

        <SectionCard title="Filters" icon={<Filter className="h-4 w-4" />}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FilterSelect
              label="Workouts"
              value={workoutFilter}
              onChange={setWorkoutFilter}
              options={workoutOptions}
            />
            <FilterSelect
              label="Exercises"
              value={exerciseFilter}
              onChange={setExerciseFilter}
              options={exerciseOptions}
            />
          </div>
        </SectionCard>

        <SectionCard title="Sessions" icon={<HistoryIcon className="h-4 w-4" />}>
          {filteredHistory.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm text-white/48">
              No workouts yet. Start your first one and the archive will come alive.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((workout) => {
                const volume = calculateWorkoutVolume(workout);
                const isOpen = expanded === workout.id;
                const workoutDate = new Date(workout.completedAt);

                return (
                  <div key={workout.id} className="overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.03]">
                    <button
                      onClick={() => setExpanded(isOpen ? null : workout.id)}
                      className="w-full px-3.5 py-3 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                            Workout log
                          </div>
                          <h3 className="mt-1 truncate text-base font-black tracking-[-0.03em] text-white">
                            {workout.workoutName}
                          </h3>
                          <div className="mt-1 text-xs text-white/48">{workoutDate.toLocaleDateString()}</div>
                        </div>
                        <div className="mt-1 text-white/54">
                          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded-2xl border border-white/8 bg-black/22 px-3 py-2">
                          <div className="text-white/40">Volume</div>
                          <div className="mt-1 font-bold text-white">{volume} kg</div>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-black/22 px-3 py-2">
                          <div className="text-white/40">Time</div>
                          <div className="mt-1 font-bold text-white">{workout.durationMinutes} min</div>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-black/22 px-3 py-2">
                          <div className="text-white/40">Exercises</div>
                          <div className="mt-1 font-bold text-white">{workout.exercises.length}</div>
                        </div>
                      </div>
                    </button>

                    {isOpen ? (
                      <div className="border-t border-white/8 px-3.5 py-3">
                        <div className="space-y-3">
                          {workout.exercises.map((exercise, index) => (
                            <div key={`${exercise.name}-${index}`} className="rounded-[18px] border border-white/8 bg-black/20 p-3">
                              <h4 className="text-sm font-bold text-white">{exercise.name}</h4>
                              <div className="mt-2 space-y-2">
                                {exercise.sets.map((set, setIndex) => (
                                  <div
                                    key={`${exercise.name}-set-${setIndex}`}
                                    className="rounded-2xl border border-white/8 bg-white/[0.02] px-3 py-2 text-sm text-white/72"
                                  >
                                    Set {setIndex + 1} · {set.reps} reps · {set.weight} kg
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
    </ScreenShell>
  );
}
