import { exercises, type Exercise, type MuscleGroup, type TrainingLevel } from '@/lib/exerciseData';

export type WorkoutDay = {
  label: string;
  muscleGroups: MuscleGroup[];
};

export type WorkoutPlan = {
  name: string;
  description: string;
  days: WorkoutDay[];
};

const TRAINING_LEVEL_KEY = 'gymrat-training-level';
const PLAN_INDEX_KEY = 'gymrat-selected-plan-index';
const LAST_WORKOUT_SUMMARY_KEY = 'gymrat-last-workout-summary';

export type WorkoutSummary = {
  completedAt: string;
  durationMinutes: number;
  exercisesCompleted: number;
  planName: string;
  xpEarned: number;
};

export function getTrainingLevel(): TrainingLevel {
  const stored = localStorage.getItem(TRAINING_LEVEL_KEY);
  if (stored === 'beginner' || stored === 'intermediate' || stored === 'advanced') {
    return stored;
  }
  return 'beginner';
}

export function setTrainingLevel(level: TrainingLevel): void {
  localStorage.setItem(TRAINING_LEVEL_KEY, level);
}

export function getSelectedPlanIndex(): number {
  const raw = localStorage.getItem(PLAN_INDEX_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function setSelectedPlanIndex(index: number): void {
  localStorage.setItem(PLAN_INDEX_KEY, String(index));
}

export function getPlansForLevel(level: TrainingLevel): WorkoutPlan[] {
  if (level === 'beginner') {
    return [
      {
        name: 'Full Body Foundation',
        description: 'Three simple full body sessions focused on consistency and technique.',
        days: [
          { label: 'Day A', muscleGroups: ['chest', 'back', 'legs', 'core'] },
          { label: 'Day B', muscleGroups: ['shoulders', 'arms', 'legs', 'core'] },
          { label: 'Day C', muscleGroups: ['chest', 'back', 'shoulders', 'core'] },
        ],
      },
      {
        name: '3-Day Split',
        description: 'A little more focused while still staying beginner-friendly.',
        days: [
          { label: 'Day 1', muscleGroups: ['chest', 'arms'] },
          { label: 'Day 2', muscleGroups: ['back', 'shoulders'] },
          { label: 'Day 3', muscleGroups: ['legs', 'core'] },
        ],
      },
      {
        name: 'A/B Full Body',
        description: 'Minimal setup with two alternating full body workouts.',
        days: [
          { label: 'Day A', muscleGroups: ['chest', 'back', 'legs'] },
          { label: 'Day B', muscleGroups: ['shoulders', 'arms', 'core'] },
        ],
      },
    ];
  }

  if (level === 'intermediate') {
    return [
      {
        name: 'Upper / Lower',
        description: 'A strong classic split for growth and progression.',
        days: [
          { label: 'Upper A', muscleGroups: ['chest', 'back', 'shoulders'] },
          { label: 'Lower A', muscleGroups: ['legs', 'core'] },
          { label: 'Upper B', muscleGroups: ['chest', 'back', 'arms'] },
          { label: 'Lower B', muscleGroups: ['legs', 'core'] },
        ],
      },
      {
        name: 'PHUL',
        description: 'Power + hypertrophy structure for size and strength together.',
        days: [
          { label: 'Power Upper', muscleGroups: ['chest', 'back', 'shoulders'] },
          { label: 'Power Lower', muscleGroups: ['legs', 'core'] },
          { label: 'Hyper Upper', muscleGroups: ['chest', 'back', 'arms'] },
          { label: 'Hyper Lower', muscleGroups: ['legs', 'core'] },
        ],
      },
      {
        name: 'Bro Split',
        description: 'Higher focus and volume on fewer muscle groups each day.',
        days: [
          { label: 'Chest', muscleGroups: ['chest'] },
          { label: 'Back', muscleGroups: ['back'] },
          { label: 'Shoulders', muscleGroups: ['shoulders'] },
          { label: 'Legs', muscleGroups: ['legs'] },
          { label: 'Arms & Core', muscleGroups: ['arms', 'core'] },
        ],
      },
    ];
  }

  return [
    {
      name: 'Push / Pull / Legs',
      description: 'High-frequency classic split built for serious progression.',
      days: [
        { label: 'Push', muscleGroups: ['chest', 'shoulders', 'arms'] },
        { label: 'Pull', muscleGroups: ['back', 'arms'] },
        { label: 'Legs', muscleGroups: ['legs', 'core'] },
        { label: 'Push 2', muscleGroups: ['chest', 'shoulders', 'arms'] },
        { label: 'Pull 2', muscleGroups: ['back', 'arms'] },
        { label: 'Legs 2', muscleGroups: ['legs', 'core'] },
      ],
    },
    {
      name: 'Arnold Split',
      description: 'Old-school bodybuilding split with premium gym-rat energy.',
      days: [
        { label: 'Chest & Back', muscleGroups: ['chest', 'back'] },
        { label: 'Shoulders & Arms', muscleGroups: ['shoulders', 'arms'] },
        { label: 'Legs & Core', muscleGroups: ['legs', 'core'] },
        { label: 'Chest & Back 2', muscleGroups: ['chest', 'back'] },
        { label: 'Shoulders & Arms 2', muscleGroups: ['shoulders', 'arms'] },
        { label: 'Legs & Core 2', muscleGroups: ['legs', 'core'] },
      ],
    },
    {
      name: 'Bro Split Pro',
      description: 'Maximum focus per day with a pure bodybuilding feel.',
      days: [
        { label: 'Chest', muscleGroups: ['chest'] },
        { label: 'Back', muscleGroups: ['back'] },
        { label: 'Shoulders', muscleGroups: ['shoulders'] },
        { label: 'Arms', muscleGroups: ['arms'] },
        { label: 'Legs', muscleGroups: ['legs'] },
        { label: 'Core & Weak Points', muscleGroups: ['core'] },
      ],
    },
  ];
}

export function getRecommendedPlan(level: TrainingLevel): WorkoutPlan {
  const plans = getPlansForLevel(level);
  const idx = getSelectedPlanIndex();
  return plans[Math.min(idx, plans.length - 1)];
}

export function getExercisesForLevel(level: TrainingLevel): Exercise[] {
  const order: TrainingLevel[] = ['beginner', 'intermediate', 'advanced'];
  const levelIndex = order.indexOf(level);

  return exercises.filter((exercise) => order.indexOf(exercise.level) <= levelIndex);
}

export function getExercisesForWorkoutDay(day: WorkoutDay, level: TrainingLevel): Exercise[] {
  const available = getExercisesForLevel(level);

  return day.muscleGroups.flatMap((group) => {
    const matches = available.filter((exercise) => exercise.muscleGroup === group);
    return matches.slice(0, 2);
  });
}

export function saveLastWorkoutSummary(summary: WorkoutSummary): void {
  localStorage.setItem(LAST_WORKOUT_SUMMARY_KEY, JSON.stringify(summary));
}

export function getLastWorkoutSummary(): WorkoutSummary | null {
  try {
    const raw = localStorage.getItem(LAST_WORKOUT_SUMMARY_KEY);
    return raw ? (JSON.parse(raw) as WorkoutSummary) : null;
  } catch {
    return null;
  }
}
const WORKOUT_HISTORY_KEY = 'gymrat-workout-history';

export function appendWorkoutHistory(summary: WorkoutSummary): void {
  try {
    const raw = localStorage.getItem(WORKOUT_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const history = Array.isArray(parsed) ? parsed : [];
    history.unshift(summary);
    localStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
  } catch {
    localStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify([summary]));
  }
}

export function getWorkoutHistory(): WorkoutSummary[] {
  try {
    const raw = localStorage.getItem(WORKOUT_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}