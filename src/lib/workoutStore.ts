import {
  exercises,
  type ExerciseDefinition,
  type MuscleGroup,
  type TrainingLevel,
} from '@/lib/exerciseData';

export type WorkoutDay = {
  label: string;
  muscleGroups: MuscleGroup[];
};

export type WorkoutPlan = {
  name: string;
  description: string;
  days: WorkoutDay[];
};

const LEVEL_KEY = 'gymrat-training-level';
const PLAN_INDEX_KEY = 'gymrat-selected-plan-index';

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function clampIndex(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}

function isTrainingLevel(value: unknown): value is TrainingLevel {
  return value === 'beginner' || value === 'intermediate' || value === 'advanced';
}

export function getTrainingLevel(): TrainingLevel {
  if (!isBrowser()) return 'beginner';

  const raw = localStorage.getItem(LEVEL_KEY);
  return isTrainingLevel(raw) ? raw : 'beginner';
}

export function setTrainingLevel(level: TrainingLevel) {
  if (!isBrowser()) return;
  localStorage.setItem(LEVEL_KEY, level);
}

export function getSelectedPlanIndex(): number {
  if (!isBrowser()) return 0;
  return clampIndex(localStorage.getItem(PLAN_INDEX_KEY));
}

export function setSelectedPlanIndex(index: number) {
  if (!isBrowser()) return;
  localStorage.setItem(PLAN_INDEX_KEY, String(clampIndex(index)));
}

export function getPlansForLevel(level: TrainingLevel): WorkoutPlan[] {
  if (level === 'beginner') {
    return [
      {
        name: 'Full Body Foundation',
        description: 'Perfect for building consistency and learning the basics.',
        days: [
          { label: 'Day A', muscleGroups: ['chest', 'back', 'legs', 'core'] },
          { label: 'Day B', muscleGroups: ['shoulders', 'arms', 'legs', 'core'] },
          { label: 'Day C', muscleGroups: ['chest', 'back', 'shoulders', 'core'] },
        ],
      },
      {
        name: '2-Day A/B Split',
        description: 'Simple and effective if you want fewer weekly sessions.',
        days: [
          { label: 'Day A', muscleGroups: ['chest', 'back', 'legs'] },
          { label: 'Day B', muscleGroups: ['shoulders', 'arms', 'core'] },
        ],
      },
      {
        name: 'Walk + Lift',
        description: 'A lower-pressure setup with walking included to keep momentum alive.',
        days: [
          { label: 'Walk Day', muscleGroups: ['legs', 'core'] },
          { label: 'Upper Day', muscleGroups: ['chest', 'back', 'arms', 'shoulders'] },
          { label: 'Lower Day', muscleGroups: ['legs', 'core'] },
        ],
      },
    ];
  }

  if (level === 'intermediate') {
    return [
      {
        name: 'Upper / Lower',
        description: 'Balanced volume with room to push progression.',
        days: [
          { label: 'Upper A', muscleGroups: ['chest', 'back', 'shoulders'] },
          { label: 'Lower A', muscleGroups: ['legs', 'core'] },
          { label: 'Upper B', muscleGroups: ['chest', 'back', 'arms'] },
          { label: 'Lower B', muscleGroups: ['legs', 'core'] },
        ],
      },
      {
        name: 'PHUL',
        description: 'Blend of strength focus and hypertrophy work.',
        days: [
          { label: 'Power Upper', muscleGroups: ['chest', 'back', 'shoulders'] },
          { label: 'Power Lower', muscleGroups: ['legs', 'core'] },
          { label: 'Hyper Upper', muscleGroups: ['chest', 'back', 'arms'] },
          { label: 'Hyper Lower', muscleGroups: ['legs', 'core'] },
        ],
      },
      {
        name: 'Walk + Lift Hybrid',
        description: 'Keeps intensity but gives a recovery-friendly fallback day.',
        days: [
          { label: 'Push', muscleGroups: ['chest', 'shoulders', 'arms'] },
          { label: 'Pull', muscleGroups: ['back', 'arms'] },
          { label: 'Walk / Core', muscleGroups: ['legs', 'core'] },
          { label: 'Legs', muscleGroups: ['legs', 'core'] },
        ],
      },
    ];
  }

  return [
    {
      name: 'Push / Pull / Legs',
      description: 'High frequency progression with dedicated focus days.',
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
      description: 'Old school volume with high output and high reward.',
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
      name: 'Hybrid Performance',
      description: 'Heavy training with walking fallback built into the week.',
      days: [
        { label: 'Upper Power', muscleGroups: ['chest', 'back', 'shoulders'] },
        { label: 'Walk Reset', muscleGroups: ['legs', 'core'] },
        { label: 'Pull Strength', muscleGroups: ['back', 'arms'] },
        { label: 'Legs', muscleGroups: ['legs', 'core'] },
        { label: 'Push Volume', muscleGroups: ['chest', 'shoulders', 'arms'] },
      ],
    },
  ];
}

export function getRecommendedPlan(level: TrainingLevel): WorkoutPlan {
  const plans = getPlansForLevel(level);
  const selectedIndex = getSelectedPlanIndex();

  return plans[Math.min(selectedIndex, plans.length - 1)] ?? plans[0];
}

export function getExercisesForLevel(level: TrainingLevel): ExerciseDefinition[] {
  const order: TrainingLevel[] = ['beginner', 'intermediate', 'advanced'];
  const currentIndex = order.indexOf(level);

  return exercises.filter(
    (exercise) => order.indexOf(exercise.level) <= currentIndex,
  );
}

export function getExercisesForWorkoutDay(
  level: TrainingLevel,
  muscleGroups: MuscleGroup[],
): ExerciseDefinition[] {
  const available = getExercisesForLevel(level);

  return available.filter((exercise) =>
    muscleGroups.includes(exercise.muscleGroup),
  );
}