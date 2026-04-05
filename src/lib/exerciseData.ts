export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'core';

export type ExerciseDefinition = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  level: TrainingLevel;
  defaultSets: number;
  defaultReps: string;
  defaultWeight?: number;
};

export const exercises: ExerciseDefinition[] = [
  {
    id: 'pushups',
    name: 'Push-Ups',
    muscleGroup: 'chest',
    level: 'beginner',
    defaultSets: 3,
    defaultReps: '10-15',
    defaultWeight: 0,
  },
  {
    id: 'bench-press',
    name: 'Bench Press',
    muscleGroup: 'chest',
    level: 'beginner',
    defaultSets: 4,
    defaultReps: '6-10',
    defaultWeight: 40,
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'chest',
    level: 'intermediate',
    defaultSets: 3,
    defaultReps: '8-12',
    defaultWeight: 20,
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'back',
    level: 'beginner',
    defaultSets: 4,
    defaultReps: '8-12',
    defaultWeight: 35,
  },
  {
    id: 'barbell-row',
    name: 'Barbell Row',
    muscleGroup: 'back',
    level: 'intermediate',
    defaultSets: 4,
    defaultReps: '6-10',
    defaultWeight: 45,
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    muscleGroup: 'back',
    level: 'advanced',
    defaultSets: 4,
    defaultReps: '3-6',
    defaultWeight: 80,
  },
  {
    id: 'shoulder-press',
    name: 'Shoulder Press',
    muscleGroup: 'shoulders',
    level: 'beginner',
    defaultSets: 3,
    defaultReps: '8-12',
    defaultWeight: 20,
  },
  {
    id: 'lateral-raise',
    name: 'Lateral Raise',
    muscleGroup: 'shoulders',
    level: 'beginner',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultWeight: 8,
  },
  {
    id: 'rear-delt-fly',
    name: 'Rear Delt Fly',
    muscleGroup: 'shoulders',
    level: 'intermediate',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultWeight: 10,
  },
  {
    id: 'biceps-curl',
    name: 'Biceps Curl',
    muscleGroup: 'arms',
    level: 'beginner',
    defaultSets: 3,
    defaultReps: '10-15',
    defaultWeight: 10,
  },
  {
    id: 'triceps-pushdown',
    name: 'Triceps Pushdown',
    muscleGroup: 'arms',
    level: 'beginner',
    defaultSets: 3,
    defaultReps: '10-15',
    defaultWeight: 20,
  },
  {
    id: 'skull-crushers',
    name: 'Skull Crushers',
    muscleGroup: 'arms',
    level: 'intermediate',
    defaultSets: 3,
    defaultReps: '8-12',
    defaultWeight: 25,
  },
  {
    id: 'squat',
    name: 'Squat',
    muscleGroup: 'legs',
    level: 'beginner',
    defaultSets: 4,
    defaultReps: '5-8',
    defaultWeight: 50,
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    muscleGroup: 'legs',
    level: 'beginner',
    defaultSets: 4,
    defaultReps: '10-15',
    defaultWeight: 80,
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    muscleGroup: 'legs',
    level: 'intermediate',
    defaultSets: 4,
    defaultReps: '8-10',
    defaultWeight: 60,
  },
  {
    id: 'walking-lunges',
    name: 'Walking Lunges',
    muscleGroup: 'legs',
    level: 'intermediate',
    defaultSets: 3,
    defaultReps: '10-12 / leg',
    defaultWeight: 14,
  },
  {
    id: 'plank',
    name: 'Plank',
    muscleGroup: 'core',
    level: 'beginner',
    defaultSets: 3,
    defaultReps: '30-60 sec',
    defaultWeight: 0,
  },
  {
    id: 'cable-crunch',
    name: 'Cable Crunch',
    muscleGroup: 'core',
    level: 'intermediate',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultWeight: 25,
  },
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    muscleGroup: 'core',
    level: 'advanced',
    defaultSets: 3,
    defaultReps: '10-15',
    defaultWeight: 0,
  },
];