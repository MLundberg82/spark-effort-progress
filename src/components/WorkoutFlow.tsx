import { useEffect, useState } from 'react';
import {
  addWorkoutHistory,
  detectPRs,
  getSuggestedWeight,
} from '@/lib/historyStore';
import { isPremium } from '@/lib/premiumStore';

import type {
  MuscleGroup,
  ExerciseEntry,
  PRResult,
} from '@/lib/historyStore';

type SetData = {
  reps: number;
  weight: number;
};

type Exercise = {
  name: string;
  sets: SetData[];
};

type Workout = {
  name: string;
  focus?: string;
  exercises: Exercise[];
};

type WorkoutFlowProps = {
  workout: Workout;
  onComplete?: (summary: {
    durationMinutes: number;
    exercisesCompleted: number;
    volume: number;
    prs: PRResult[];
  }) => void;
};

function mapExerciseToMuscle(name: string): MuscleGroup {
  const n = name.toLowerCase();

  if (n.includes('walk') || n.includes('treadmill')) return 'legs';
  if (n.includes('bench') || n.includes('press')) return 'chest';
  if (n.includes('row') || n.includes('pull')) return 'back';
  if (n.includes('curl') || n.includes('tricep')) return 'arms';
  if (n.includes('squat') || n.includes('leg')) return 'legs';
  if (n.includes('shoulder')) return 'shoulders';

  return 'core';
}

function isWalkExercise(name: string) {
  const n = name.toLowerCase();
  return n.includes('walk') || n.includes('treadmill');
}

export default function WorkoutFlow({
  workout,
  onComplete,
}: WorkoutFlowProps) {
  const [startTime] = useState(Date.now());
  const [localExercises, setLocalExercises] = useState(workout.exercises);

  const premium = isPremium();

  useEffect(() => {
    setLocalExercises(workout.exercises);
  }, [workout]);

  const updateSet = (
    exIndex: number,
    setIndex: number,
    field: 'reps' | 'weight',
    value: number
  ) => {
    setLocalExercises((prev) => {
      const updated = [...prev];
      updated[exIndex].sets[setIndex][field] = value;
      return updated;
    });
  };

  const handleFinishWorkout = () => {
    const durationMinutes = Math.max(
      1,
      Math.round((Date.now() - startTime) / 60000)
    );

    const exercises: ExerciseEntry[] = localExercises.map((ex) => ({
      name: ex.name,
      muscleGroup: mapExerciseToMuscle(ex.name),
      sets: ex.sets,
    }));

    const prs = detectPRs(
      exercises.filter((exercise) => !isWalkExercise(exercise.name))
    );

    const workoutEntry = {
      id: crypto.randomUUID(),
      workoutName: workout.name,
      exercises,
      durationMinutes,
      completedAt: new Date().toISOString(),
    };

    addWorkoutHistory(workoutEntry);

    const volume = exercises.reduce(
      (total, ex) =>
        total +
        ex.sets.reduce((sum, set) => sum + set.reps * set.weight, 0),
      0
    );

    onComplete?.({
      durationMinutes,
      exercisesCompleted: exercises.length,
      volume,
      prs,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 text-foreground">
      <h1 className="text-xl font-bold mb-4">{workout.name}</h1>

      <div className="space-y-6">
        {localExercises.map((exercise, exIndex) => {
          const walkMode = isWalkExercise(exercise.name);
          const suggested = premium && !walkMode
            ? getSuggestedWeight(exercise.name)
            : null;

          return (
            <div
              key={exIndex}
              className="bg-card p-4 rounded-2xl shadow"
            >
              <h2 className="font-semibold mb-1">
                {exercise.name}
              </h2>

              {premium && suggested && (
                <p className="text-xs text-primary mb-2">
                  Suggested: {suggested} kg
                </p>
              )}

              {!premium && !walkMode && (
                <p className="text-xs opacity-40 mb-2">
                  Upgrade to unlock smart progression
                </p>
              )}

              {walkMode && (
                <p className="text-xs text-primary mb-2">
                  Walk counts toward your streak too
                </p>
              )}

              {exercise.sets.map((set, setIndex) => (
                <div
                  key={setIndex}
                  className="flex gap-2 mb-2"
                >
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(
                        exIndex,
                        setIndex,
                        'reps',
                        Number(e.target.value)
                      )
                    }
                    className="w-24 p-2 bg-muted rounded"
                    placeholder={walkMode ? 'Minutes' : 'Reps'}
                  />

                  <input
                    type="number"
                    value={set.weight}
                    onChange={(e) =>
                      updateSet(
                        exIndex,
                        setIndex,
                        'weight',
                        Number(e.target.value)
                      )
                    }
                    className="w-24 p-2 bg-muted rounded"
                    placeholder={walkMode ? '0' : 'Weight'}
                    disabled={walkMode}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleFinishWorkout}
        className="fixed bottom-6 left-4 right-4 bg-primary py-4 rounded-2xl font-bold"
      >
        Finish Workout
      </button>
    </div>
  );
}