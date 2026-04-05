import { useEffect, useState } from 'react';
import {
  getWorkoutHistory,
  calculateWorkoutVolume,
  getWorkoutNameOptions,
  getExerciseNameOptions,
} from '@/lib/historyStore';

type WorkoutEntry = ReturnType<typeof getWorkoutHistory>[0];

type Props = {
  onBack: () => void;
};

export default function HistoryScreen({ onBack }: Props) {
  const [history, setHistory] = useState<WorkoutEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [workoutFilter, setWorkoutFilter] = useState<string>('all');
  const [exerciseFilter, setExerciseFilter] = useState<string>('all');

  const [workoutOptions, setWorkoutOptions] = useState<string[]>([]);
  const [exerciseOptions, setExerciseOptions] = useState<string[]>([]);

  useEffect(() => {
    const data = getWorkoutHistory();
    setHistory(data);

    setWorkoutOptions(getWorkoutNameOptions());
    setExerciseOptions(getExerciseNameOptions());
  }, []);

  const filteredHistory = history.filter((w) => {
    if (workoutFilter !== 'all' && w.workoutName !== workoutFilter) {
      return false;
    }

    if (exerciseFilter !== 'all') {
      const hasExercise = w.exercises.some(
        (ex) => ex.name === exerciseFilter
      );
      if (!hasExercise) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-4">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack}>←</button>
        <h1 className="text-lg font-bold">History</h1>
        <div />
      </div>

      {/* FILTERS */}
      <div className="mb-4 space-y-2">

        <select
          value={workoutFilter}
          onChange={(e) => setWorkoutFilter(e.target.value)}
          className="w-full p-2 rounded bg-muted"
        >
          <option value="all">All Workouts</option>
          {workoutOptions.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>

        <select
          value={exerciseFilter}
          onChange={(e) => setExerciseFilter(e.target.value)}
          className="w-full p-2 rounded bg-muted"
        >
          <option value="all">All Exercises</option>
          {exerciseOptions.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      {/* LIST */}
      <div className="space-y-3">

        {filteredHistory.map((workout) => {
          const volume = calculateWorkoutVolume(workout);
          const isOpen = expanded === workout.id;

          return (
            <div
              key={workout.id}
              className="bg-card p-4 rounded-2xl shadow"
            >
              {/* TOP */}
              <div
                onClick={() =>
                  setExpanded(isOpen ? null : workout.id)
                }
                className="cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold">
                    {workout.workoutName}
                  </h2>
                  <span className="text-xs opacity-60">
                    {new Date(
                      workout.completedAt
                    ).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-4 mt-2 text-xs opacity-70">
                  <span>💪 {volume} kg</span>
                  <span>⏱ {workout.durationMinutes} min</span>
                  <span>🏋️ {workout.exercises.length}</span>
                </div>
              </div>

              {/* EXPANDED */}
              {isOpen && (
                <div className="mt-4 space-y-3">
                  {workout.exercises.map((ex, i) => (
                    <div
                      key={i}
                      className="bg-muted p-3 rounded-xl"
                    >
                      <p className="font-medium mb-2">
                        {ex.name}
                      </p>

                      <div className="space-y-1 text-sm">
                        {ex.sets.map((set, si) => (
                          <div
                            key={si}
                            className="flex justify-between"
                          >
                            <span>Set {si + 1}</span>
                            <span>
                              {set.reps} reps × {set.weight} kg
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredHistory.length === 0 && (
          <p className="text-center text-sm opacity-60 mt-10">
            No workouts yet — start your first one 💪
          </p>
        )}
      </div>
    </div>
  );
}