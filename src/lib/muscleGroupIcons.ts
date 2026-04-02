import { Dumbbell } from 'lucide-react';
import { MuscleGroup } from './exerciseData';

// Unified strong icon for all muscle groups
export const muscleGroupIconMap: Record<MuscleGroup, typeof Dumbbell> = {
  warmup: Dumbbell,
  chest: Dumbbell,
  back: Dumbbell,
  shoulders: Dumbbell,
  legs: Dumbbell,
  arms: Dumbbell,
  core: Dumbbell,
  stretching: Dumbbell,
};
