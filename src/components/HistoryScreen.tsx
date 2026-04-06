import { useMemo, useState } from "react";
import {
  calculateWorkoutVolume,
  getExerciseNameOptions,
  getWorkoutHistory,
  getWorkoutNameOptions,
} from "@/lib/historyStore";

type WorkoutEntry = ReturnType<typeof getWorkoutHistory>[number];

type Props = {
  onBack: () => void;
};

export default function HistoryScreen({ onBack }: Props) {
  const [history] = useState<WorkoutEntry[]>(() => getWorkoutHistory());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [workoutFilter, setWorkoutFilter] = useState("all");
  const [exerciseFilter, setExerciseFilter] = useState("all");
  const [workoutOptions] = useState<string[]>(() => getWorkoutNameOptions());
  const [exerciseOptions] = useState<string[]>(() => getExerciseNameOptions());

  const filteredHistory = useMemo(() => {
    return history.filter((workout) => {
      if (workoutFilter !== "all" && workout.workoutName !== workoutFilter) {
        return false;
      }

      if (exerciseFilter !== "all") {
        const hasExercise = workout.exercises.some(
          (exercise) => exercise.name === exerciseFilter,
        );

        if (!hasExercise) {
          return false;
        }
      }

      return true;
    });
  }, [exerciseFilter, history, workoutFilter]);

  return (
    <div className="min-h-screen bg-background p-4 text-foreground">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onBack}>←</button>
        <h1 className="text-lg font-bold">History</h1>
        <div />
      </div>

      <div className="mb-4 space-y-2">
        <select
          value={workoutFilter}
          onChange={(event) => setWorkoutFilter(event.target.value)}
          className="w-full rounded bg-muted p-2"
        >
          <option value="all">All Workouts</option>
          {workoutOptions.map((workoutName) => (
            <option key={workoutName} value={workoutName}>
              {workoutName}
            </option>
          ))}
        </select>

        <select
          value={exerciseFilter}
          onChange={(event) => setExerciseFilter(event.target.value)}
          className="w-full rounded bg-muted p-2"
        >
          <option value="all">All Exercises</option>
          {exerciseOptions.map((exerciseName) => (
            <option key={exerciseName} value={exerciseName}>
              {exerciseName}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filteredHistory.map((workout) => {
          const volume = calculateWorkoutVolume(workout);
          const isOpen = expanded === workout.id;

          return (
            <div key={workout.id} className="rounded-2xl bg-card p-4 shadow">
              <div
                onClick={() => setExpanded(isOpen ? null : workout.id)}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{workout.workoutName}</h2>
                  <span className="text-xs opacity-60">
                    {new Date(workout.completedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-2 flex gap-4 text-xs opacity-70">
                  <span>💪 {volume} kg</span>
                  <span>⏱ {workout.durationMinutes} min</span>
                  <span>🏋️ {workout.exercises.length}</span>
                </div>
              </div>

              {isOpen ? (
                <div className="mt-4 space-y-3">
                  {workout.exercises.map((exercise, exerciseIndex) => (
                    <div
                      key={`${exercise.name}-${exerciseIndex}`}
                      className="rounded-xl bg-muted p-3"
                    >
                      <p className="mb-2 font-medium">{exercise.name}</p>

                      <div className="space-y-1 text-sm">
                        {exercise.sets.map((setItem, setIndex) => (
                          <div
                            key={`${exercise.name}-${setIndex}`}
                            className="flex justify-between"
                          >
                            <span>Set {setIndex + 1}</span>
                            <span>
                              {setItem.reps} reps × {setItem.weight} kg
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

        {filteredHistory.length === 0 ? (
          <p className="mt-10 text-center text-sm opacity-60">
            No workouts yet — start your first one 💪
          </p>
        ) : null}
      </div>
    </div>
  );
}