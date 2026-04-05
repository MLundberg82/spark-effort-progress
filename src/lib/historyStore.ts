// src/lib/historyStore.ts

export type MuscleGroup = 'chest' | 'back' | 'arms' | 'legs' | 'shoulders' | 'core';

export type ExerciseSet = {
  reps: number;
  weight: number; // kg
};

export type ExerciseEntry = {
  name: string;
  muscleGroup: MuscleGroup;
  sets: ExerciseSet[];
};

export type WorkoutEntry = {
  id: string;
  workoutName: string;
  exercises: ExerciseEntry[];
  durationMinutes: number;
  completedAt: string;
};

// ---------- STORAGE ----------

const STORAGE_KEY = 'gymrat-workout-history';

function load(): WorkoutEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(data: WorkoutEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ---------- CORE API ----------

export function getWorkoutHistory(): WorkoutEntry[] {
  return load().sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
}

export function addWorkoutHistory(entry: WorkoutEntry) {
  const current = load();
  current.push(entry);
  save(current);
}

export function clearWorkoutHistory() {
  save([]);
}

// ---------- HELPERS ----------

export function calculateWorkoutVolume(entry: WorkoutEntry): number {
  return entry.exercises.reduce((total, ex) => {
    const exVolume = ex.sets.reduce(
      (sum, set) => sum + set.reps * set.weight,
      0
    );
    return total + exVolume;
  }, 0);
}

// ---------- ANALYTICS ----------

// Hur mycket varje muskelgrupp tränats senaste passen
export function getWorkoutFocusBreakdown(
  limit: number = 10
): Record<MuscleGroup, number> {
  const history = getWorkoutHistory().slice(0, limit);

  const breakdown: Record<MuscleGroup, number> = {
    chest: 0,
    back: 0,
    arms: 0,
    legs: 0,
    shoulders: 0,
    core: 0,
  };

  history.forEach((workout) => {
    workout.exercises.forEach((ex) => {
      const volume = ex.sets.reduce(
        (sum, set) => sum + set.reps * set.weight,
        0
      );

      breakdown[ex.muscleGroup] += volume;
    });
  });

  return breakdown;
}

// Rekommendera vad användaren ska träna härnäst
export function getRecommendedNextFocusArea(): MuscleGroup {
  const breakdown = getWorkoutFocusBreakdown(10);

  let lowest: MuscleGroup = 'chest';
  let lowestValue = Infinity;

  (Object.keys(breakdown) as MuscleGroup[]).forEach((group) => {
    if (breakdown[group] < lowestValue) {
      lowestValue = breakdown[group];
      lowest = group;
    }
  });

  return lowest;
}

// ---------- HISTORY HELPERS ----------

export function getExerciseHistory(exerciseName: string) {
  const history = getWorkoutHistory();

  return history.flatMap((workout) =>
    workout.exercises
      .filter((ex) => ex.name === exerciseName)
      .map((ex) => ({
        date: workout.completedAt,
        sets: ex.sets,
      }))
  );
}

export function getExerciseNameOptions(): string[] {
  const history = getWorkoutHistory();

  const names = new Set<string>();

  history.forEach((w) =>
    w.exercises.forEach((ex) => names.add(ex.name))
  );

  return Array.from(names);
}

export function getWorkoutNameOptions(): string[] {
  const history = getWorkoutHistory();

  const names = new Set<string>();

  history.forEach((w) => names.add(w.workoutName));

  return Array.from(names);
}
// ---------- PR SYSTEM ----------

export function getAllTimeBestWeight(exerciseName: string): number {
  const history = getWorkoutHistory();

  let best = 0;

  history.forEach((workout) => {
    workout.exercises.forEach((ex) => {
      if (ex.name === exerciseName) {
        ex.sets.forEach((set) => {
          if (set.weight > best) {
            best = set.weight;
          }
        });
      }
    });
  });

  return best;
}

export type PRResult = {
  exercise: string;
  newWeight: number;
  previousBest: number;
};

export function detectPRs(
  exercises: ExerciseEntry[]
): PRResult[] {
  const prs: PRResult[] = [];

  exercises.forEach((ex) => {
    const bestBefore = getAllTimeBestWeight(ex.name);

    const bestNow = Math.max(
      ...ex.sets.map((s) => s.weight)
    );

    if (bestNow > bestBefore) {
      prs.push({
        exercise: ex.name,
        newWeight: bestNow,
        previousBest: bestBefore,
      });
    }
  });

  return prs;
}
// ---------- SMART PROGRESSION ----------

export function getLastWorkoutForExercise(exerciseName: string) {
  const history = getWorkoutHistory();

  for (const workout of history) {
    const found = workout.exercises.find(
      (ex) => ex.name === exerciseName
    );

    if (found) {
      return found;
    }
  }

  return null;
}

export function getSuggestedWeight(
  exerciseName: string
): number | null {
  const last = getLastWorkoutForExercise(exerciseName);

  if (!last) return null;

  const lastTopWeight = Math.max(
    ...last.sets.map((s) => s.weight)
  );

  // 🔥 progression rule
  const increment = lastTopWeight >= 100 ? 5 : 2.5;

  return lastTopWeight + increment;
}
// ---------- PR PROXIMITY ----------

export type PRProximity = {
  exercise: string;
  currentBest: number;
  lastWeight: number;
  diff: number;
};

export function getPRProximity(): PRProximity[] {
  const history = getWorkoutHistory();

  const result: PRProximity[] = [];

  const seen = new Set<string>();

  history.forEach((workout) => {
    workout.exercises.forEach((ex) => {
      if (seen.has(ex.name)) return;

      const best = getAllTimeBestWeight(ex.name);

      const lastSet = ex.sets[ex.sets.length - 1];
      const lastWeight = lastSet?.weight ?? 0;

      const diff = best - lastWeight;

      // 🔥 nära PR (inom 5kg)
      if (diff > 0 && diff <= 5) {
        result.push({
          exercise: ex.name,
          currentBest: best,
          lastWeight,
          diff,
        });
      }

      seen.add(ex.name);
    });
  });

  return result;
}