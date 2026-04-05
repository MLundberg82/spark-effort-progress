import {
  getRecommendedPlan,
  getTrainingLevel,
  type WorkoutPlan,
} from '@/lib/trainingStore';
import { getRecommendedNextFocusArea, type MuscleGroup } from '@/lib/historyStore';

export type AdaptiveWorkoutSuggestion = {
  title: string;
  subtitle: string;
  focusArea: MuscleGroup;
  plan: WorkoutPlan;
  reason: string;
};

function toTitle(group: MuscleGroup) {
  switch (group) {
    case 'back':
      return 'Back day';
    case 'arms':
      return 'Arms day';
    case 'legs':
      return 'Leg day';
    case 'shoulders':
      return 'Shoulder day';
    case 'core':
      return 'Core day';
    case 'chest':
    default:
      return 'Chest day';
  }
}

export function getAdaptiveWorkoutSuggestion(): AdaptiveWorkoutSuggestion {
  const focusArea = getRecommendedNextFocusArea();
  const plan = getRecommendedPlan(getTrainingLevel());

  return {
    title: toTitle(focusArea),
    subtitle: `Recommended next focus: ${focusArea}`,
    focusArea,
    plan,
    reason:
      'This is based on what you have trained the least in your recent logged workouts.',
  };
}