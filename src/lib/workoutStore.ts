import { MuscleGroup, exercises } from './exerciseData';

export interface WorkoutSet {
  weight: number;
  reps: number;
}

export interface WorkoutEntry {
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  entries: WorkoutEntry[];
}

const STORAGE_KEY = 'fitforge-workouts';

export function getWorkouts(): WorkoutLog[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveWorkout(workout: WorkoutLog): void {
  const workouts = getWorkouts();
  workouts.push(workout);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

export function getExerciseHistory(exerciseId: string): { date: string; maxWeight: number; totalVolume: number }[] {
  const workouts = getWorkouts();
  return workouts
    .filter(w => w.entries.some(e => e.exerciseId === exerciseId))
    .map(w => {
      const entry = w.entries.find(e => e.exerciseId === exerciseId)!;
      const maxWeight = Math.max(...entry.sets.map(s => s.weight));
      const totalVolume = entry.sets.reduce((acc, s) => acc + s.weight * s.reps, 0);
      return { date: w.date, maxWeight, totalVolume };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getMuscleGroupFrequency(): Record<MuscleGroup, number> {
  const workouts = getWorkouts();
  const lastTwoWeeks = workouts.filter(w => {
    const d = new Date(w.date);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    return d >= twoWeeksAgo;
  });

  const freq: Record<string, number> = { chest: 0, back: 0, shoulders: 0, legs: 0, arms: 0, core: 0, warmup: 0, stretching: 0 };

  lastTwoWeeks.forEach(w => {
    w.entries.forEach((e: WorkoutEntry) => {
      const ex = exercises.find(x => x.id === e.exerciseId);
      if (ex) freq[ex.muscleGroup]++;
    });
  });

  return freq as Record<MuscleGroup, number>;
}

export function getRecommendedMuscleGroups(): MuscleGroup[] {
  try {
    const freq = getMuscleGroupFrequency();
    const sorted = (Object.entries(freq) as [MuscleGroup, number][])
      .filter(([group]) => group !== 'warmup' && group !== 'stretching')
      .sort((a, b) => a[1] - b[1]);
    return sorted.slice(0, 2).map(([group]) => group);
  } catch {
    return ['chest', 'legs'];
  }
}
