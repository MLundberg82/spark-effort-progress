export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'arms'
  | 'legs'
  | 'shoulders'
  | 'core';

export type ExerciseSet = {
  reps: number;
  weight: number;
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

export type PRResult = {
  exercise: string;
  newWeight: number;
  previousBest: number;
};

export type PRProximity = {
  exercise: string;
  currentBest: number;
  lastWeight: number;
  diff: number;
};

const STORAGE_KEY = 'gymrat-workout-history';
const EVENT_NAME = 'history-updated';

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function sanitizeSet(value: unknown): ExerciseSet | null {
  if (!value || typeof value !== 'object') return null;

  const reps = Number((value as ExerciseSet).reps);
  const weight = Number((value as ExerciseSet).weight);

  return {
    reps: Number.isFinite(reps) ? Math.max(0, Math.round(reps)) : 0,
    weight: Number.isFinite(weight) ? Math.max(0, weight) : 0,
  };
}

function sanitizeMuscleGroup(value: unknown): MuscleGroup {
  if (
    value === 'chest' ||
    value === 'back' ||
    value === 'arms' ||
    value === 'legs' ||
    value === 'shoulders' ||
    value === 'core'
  ) {
    return value;
  }

  return 'core';
}

function sanitizeExercise(value: unknown): ExerciseEntry | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Partial<ExerciseEntry>;
  const name = typeof raw.name === 'string' && raw.name.trim().length > 0 ? raw.name : null;
  const sets = Array.isArray(raw.sets)
    ? raw.sets.map(sanitizeSet).filter((set): set is ExerciseSet => Boolean(set))
    : [];

  if (!name || sets.length === 0) {
    return null;
  }

  return {
    name,
    muscleGroup: sanitizeMuscleGroup(raw.muscleGroup),
    sets,
  };
}

function sanitizeWorkout(value: unknown): WorkoutEntry | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Partial<WorkoutEntry>;
  const workoutName =
    typeof raw.workoutName === 'string' && raw.workoutName.trim().length > 0
      ? raw.workoutName
      : null;

  const completedAt =
    typeof raw.completedAt === 'string' && raw.completedAt.trim().length > 0
      ? raw.completedAt
      : null;

  const exercises = Array.isArray(raw.exercises)
    ? raw.exercises
        .map(sanitizeExercise)
        .filter((exercise): exercise is ExerciseEntry => Boolean(exercise))
    : [];

  if (!workoutName || !completedAt || exercises.length === 0) {
    return null;
  }

  const durationMinutes = Number(raw.durationMinutes);

  return {
    id:
      typeof raw.id === 'string' && raw.id.trim().length > 0
        ? raw.id
        : `workout-${Date.now()}`,
    workoutName,
    exercises,
    durationMinutes: Number.isFinite(durationMinutes)
      ? Math.max(1, Math.round(durationMinutes))
      : 1,
    completedAt,
  };
}

function readHistory(): WorkoutEntry[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(sanitizeWorkout)
      .filter((entry): entry is WorkoutEntry => Boolean(entry))
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      );
  } catch {
    return [];
  }
}

function writeHistory(history: WorkoutEntry[]) {
  if (!isBrowser()) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: history }));
}

export function subscribeHistory(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handler = () => callback();

  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

export function getWorkoutHistory(): WorkoutEntry[] {
  return readHistory();
}

export function addWorkoutHistory(entry: WorkoutEntry) {
  const history = readHistory();
  const next = [sanitizeWorkout(entry), ...history].filter(
    (item): item is WorkoutEntry => Boolean(item),
  );

  writeHistory(next);
  return next;
}

export function clearWorkoutHistory() {
  writeHistory([]);
}

export function calculateWorkoutVolume(entry: WorkoutEntry): number {
  return entry.exercises.reduce((total, exercise) => {
    return (
      total +
      exercise.sets.reduce((sum, set) => sum + set.reps * set.weight, 0)
    );
  }, 0);
}

export function getWorkoutFocusBreakdown(
  limit: number = 10,
): Record<MuscleGroup, number> {
  const history = readHistory().slice(0, Math.max(1, Math.floor(limit)));

  const breakdown: Record<MuscleGroup, number> = {
    chest: 0,
    back: 0,
    arms: 0,
    legs: 0,
    shoulders: 0,
    core: 0,
  };

  for (const workout of history) {
    for (const exercise of workout.exercises) {
      breakdown[exercise.muscleGroup] += exercise.sets.reduce(
        (sum, set) => sum + set.reps * set.weight,
        0,
      );
    }
  }

  return breakdown;
}

export function getRecommendedNextFocusArea(): MuscleGroup {
  const breakdown = getWorkoutFocusBreakdown(10);

  let lowest: MuscleGroup = 'chest';
  let lowestValue = Number.POSITIVE_INFINITY;

  for (const group of Object.keys(breakdown) as MuscleGroup[]) {
    if (breakdown[group] < lowestValue) {
      lowest = group;
      lowestValue = breakdown[group];
    }
  }

  return lowest;
}

export function getExerciseHistory(exerciseName: string) {
  return readHistory().flatMap((workout) =>
    workout.exercises
      .filter((exercise) => exercise.name === exerciseName)
      .map((exercise) => ({
        date: workout.completedAt,
        sets: exercise.sets,
      })),
  );
}

export function getExerciseNameOptions(): string[] {
  const names = new Set<string>();

  for (const workout of readHistory()) {
    for (const exercise of workout.exercises) {
      names.add(exercise.name);
    }
  }

  return Array.from(names).sort((a, b) => a.localeCompare(b));
}

export function getWorkoutNameOptions(): string[] {
  const names = new Set<string>();

  for (const workout of readHistory()) {
    names.add(workout.workoutName);
  }

  return Array.from(names).sort((a, b) => a.localeCompare(b));
}

export function getAllTimeBestWeight(exerciseName: string): number {
  let best = 0;

  for (const workout of readHistory()) {
    for (const exercise of workout.exercises) {
      if (exercise.name !== exerciseName) continue;

      for (const set of exercise.sets) {
        if (set.weight > best) {
          best = set.weight;
        }
      }
    }
  }

  return best;
}

export function detectPRs(exercises: ExerciseEntry[]): PRResult[] {
  const prs: PRResult[] = [];

  for (const exercise of exercises) {
    const previousBest = getAllTimeBestWeight(exercise.name);
    const newWeight = Math.max(...exercise.sets.map((set) => set.weight), 0);

    if (newWeight > previousBest) {
      prs.push({
        exercise: exercise.name,
        newWeight,
        previousBest,
      });
    }
  }

  return prs;
}

export function getLastWorkoutForExercise(exerciseName: string): ExerciseEntry | null {
  for (const workout of readHistory()) {
    const found = workout.exercises.find(
      (exercise) => exercise.name === exerciseName,
    );

    if (found) return found;
  }

  return null;
}

export function getSuggestedWeight(exerciseName: string): number | null {
  const last = getLastWorkoutForExercise(exerciseName);
  if (!last) return null;

  const lastTopWeight = Math.max(...last.sets.map((set) => set.weight), 0);
  const increment = lastTopWeight >= 100 ? 5 : 2.5;

  return Math.max(0, lastTopWeight + increment);
}

export function getPRProximity(): PRProximity[] {
  const result: PRProximity[] = [];
  const seen = new Set<string>();

  for (const workout of readHistory()) {
    for (const exercise of workout.exercises) {
      if (seen.has(exercise.name)) continue;

      const currentBest = getAllTimeBestWeight(exercise.name);
      const lastWeight = exercise.sets[exercise.sets.length - 1]?.weight ?? 0;
      const diff = currentBest - lastWeight;

      if (diff > 0 && diff <= 5) {
        result.push({
          exercise: exercise.name,
          currentBest,
          lastWeight,
          diff,
        });
      }

      seen.add(exercise.name);
    }
  }

  return result.sort((a, b) => a.diff - b.diff);
}