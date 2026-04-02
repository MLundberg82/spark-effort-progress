import { TrainingLevel, MuscleGroup, exercises } from './exerciseData';
import { getRecommendedMuscleGroups } from './workoutStore';

const TRAINING_LEVEL_KEY = 'fitforge-training-level';
const SELECTED_PLAN_KEY = 'fitforge-selected-plan';

export function getTrainingLevel(): TrainingLevel | null {
  return localStorage.getItem(TRAINING_LEVEL_KEY) as TrainingLevel | null;
}

export function setTrainingLevel(level: TrainingLevel): void {
  localStorage.setItem(TRAINING_LEVEL_KEY, level);
}

export function getSelectedPlanIndex(): number {
  return parseInt(localStorage.getItem(SELECTED_PLAN_KEY) || '0', 10);
}

export function setSelectedPlanIndex(index: number): void {
  localStorage.setItem(SELECTED_PLAN_KEY, String(index));
}

export interface WorkoutPlan {
  name: string;
  description: string;
  days: { label: string; muscleGroups: MuscleGroup[] }[];
}

export function getPlansForLevel(level: TrainingLevel): WorkoutPlan[] {
  if (level === 'beginner') {
    return [
      {
        name: 'Full Body (3x/week)',
        description: 'Train your entire body each session. Perfect for building a foundation.',
        days: [
          { label: 'Day A', muscleGroups: ['chest', 'back', 'legs', 'core'] },
          { label: 'Day B', muscleGroups: ['shoulders', 'arms', 'legs', 'core'] },
          { label: 'Day C', muscleGroups: ['chest', 'back', 'shoulders', 'core'] },
        ],
      },
      {
        name: '3-Day Split',
        description: 'Each day targets different muscle groups for more focused sessions.',
        days: [
          { label: 'Day 1', muscleGroups: ['chest', 'arms'] },
          { label: 'Day 2', muscleGroups: ['back', 'shoulders'] },
          { label: 'Day 3', muscleGroups: ['legs', 'core'] },
        ],
      },
      {
        name: 'A/B Full Body (2x/week)',
        description: 'Minimal time commitment, alternating two full body routines.',
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
        name: 'Upper / Lower (4x/week)',
        description: 'Alternate upper and lower body days for more volume per muscle.',
        days: [
          { label: 'Upper A', muscleGroups: ['chest', 'back', 'shoulders'] },
          { label: 'Lower A', muscleGroups: ['legs', 'core'] },
          { label: 'Upper B', muscleGroups: ['chest', 'back', 'arms'] },
          { label: 'Lower B', muscleGroups: ['legs', 'core'] },
        ],
      },
      {
        name: 'Bro Split (5x/week)',
        description: 'One muscle group per day for maximum volume and recovery.',
        days: [
          { label: 'Chest', muscleGroups: ['chest'] },
          { label: 'Back', muscleGroups: ['back'] },
          { label: 'Shoulders', muscleGroups: ['shoulders'] },
          { label: 'Legs', muscleGroups: ['legs'] },
          { label: 'Arms & Core', muscleGroups: ['arms', 'core'] },
        ],
      },
      {
        name: 'PHUL (4x/week)',
        description: 'Power & Hypertrophy Upper/Lower for strength and size.',
        days: [
          { label: 'Power Upper', muscleGroups: ['chest', 'back', 'shoulders'] },
          { label: 'Power Lower', muscleGroups: ['legs', 'core'] },
          { label: 'Hyper Upper', muscleGroups: ['chest', 'back', 'arms'] },
          { label: 'Hyper Lower', muscleGroups: ['legs', 'core'] },
        ],
      },
    ];
  }

  // advanced
  return [
    {
      name: 'Push / Pull / Legs (6x/week)',
      description: 'Maximum volume per muscle group with dedicated training days.',
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
      name: 'Arnold Split (6x/week)',
      description: 'Classic Arnold Schwarzenegger split pairing complementary muscle groups.',
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
      name: 'Bro Split (6x/week)',
      description: 'Dedicated day for every muscle group with maximum isolation.',
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

export function getExercisesForLevel(level: TrainingLevel) {
  const levelOrder: TrainingLevel[] = ['beginner', 'intermediate', 'advanced'];
  const levelIdx = levelOrder.indexOf(level);
  return exercises.filter(ex => {
    if (!ex.level) return true;
    return levelOrder.indexOf(ex.level) <= levelIdx;
  });
}
