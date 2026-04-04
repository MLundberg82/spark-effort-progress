export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'core';

export type EquipmentType =
  | 'bodyweight'
  | 'machine'
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'mixed';

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  level: TrainingLevel;
  equipment: EquipmentType;
  primaryMuscles: string[];
  instructions: string[];
};

export const exercises: Exercise[] = [
  {
    id: 'push-up',
    name: 'Push-Up',
    muscleGroup: 'chest',
    level: 'beginner',
    equipment: 'bodyweight',
    primaryMuscles: ['Chest', 'Front delts', 'Triceps'],
    instructions: [
      'Place hands slightly wider than shoulder width.',
      'Keep body straight from head to heel.',
      'Lower under control and press back up.',
    ],
  },
  {
    id: 'machine-chest-press',
    name: 'Machine Chest Press',
    muscleGroup: 'chest',
    level: 'beginner',
    equipment: 'machine',
    primaryMuscles: ['Chest', 'Triceps'],
    instructions: [
      'Set seat so handles are around mid-chest height.',
      'Press forward without locking harshly.',
      'Return slowly with control.',
    ],
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'chest',
    level: 'intermediate',
    equipment: 'dumbbell',
    primaryMuscles: ['Upper chest', 'Front delts', 'Triceps'],
    instructions: [
      'Set bench to a slight incline.',
      'Press dumbbells up and slightly inward.',
      'Lower with control to a deep stretch.',
    ],
  },
  {
    id: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    muscleGroup: 'chest',
    level: 'advanced',
    equipment: 'barbell',
    primaryMuscles: ['Chest', 'Front delts', 'Triceps'],
    instructions: [
      'Set shoulder blades and stable foot position.',
      'Lower bar to lower chest under control.',
      'Drive bar up while keeping upper back tight.',
    ],
  },

  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'back',
    level: 'beginner',
    equipment: 'machine',
    primaryMuscles: ['Lats', 'Upper back', 'Biceps'],
    instructions: [
      'Pull the bar toward upper chest.',
      'Keep chest proud and shoulders down.',
      'Control the stretch on the way up.',
    ],
  },
  {
    id: 'seated-row',
    name: 'Seated Cable Row',
    muscleGroup: 'back',
    level: 'beginner',
    equipment: 'cable',
    primaryMuscles: ['Mid-back', 'Lats', 'Biceps'],
    instructions: [
      'Keep torso stable and chest lifted.',
      'Pull elbows back close to the body.',
      'Squeeze shoulder blades together.',
    ],
  },
  {
    id: 'chest-supported-row',
    name: 'Chest Supported Row',
    muscleGroup: 'back',
    level: 'intermediate',
    equipment: 'dumbbell',
    primaryMuscles: ['Mid-back', 'Lats', 'Rear delts'],
    instructions: [
      'Support chest on the bench.',
      'Row elbows back and slightly out.',
      'Control both top squeeze and bottom stretch.',
    ],
  },
  {
    id: 'barbell-row',
    name: 'Barbell Row',
    muscleGroup: 'back',
    level: 'advanced',
    equipment: 'barbell',
    primaryMuscles: ['Lats', 'Mid-back', 'Rear delts'],
    instructions: [
      'Hinge at the hips and brace hard.',
      'Row bar toward lower torso.',
      'Keep torso stable throughout the set.',
    ],
  },

  {
    id: 'machine-shoulder-press',
    name: 'Machine Shoulder Press',
    muscleGroup: 'shoulders',
    level: 'beginner',
    equipment: 'machine',
    primaryMuscles: ['Delts', 'Triceps'],
    instructions: [
      'Start with handles just below shoulder height.',
      'Press overhead without shrugging excessively.',
      'Lower slowly and stay stable.',
    ],
  },
  {
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    muscleGroup: 'shoulders',
    level: 'intermediate',
    equipment: 'dumbbell',
    primaryMuscles: ['Delts', 'Triceps', 'Upper chest'],
    instructions: [
      'Keep core braced and elbows under wrists.',
      'Press overhead in a smooth arc.',
      'Control the lowering phase.',
    ],
  },
  {
    id: 'lateral-raise',
    name: 'Lateral Raise',
    muscleGroup: 'shoulders',
    level: 'beginner',
    equipment: 'dumbbell',
    primaryMuscles: ['Side delts'],
    instructions: [
      'Raise arms out to the sides with soft elbows.',
      'Stop around shoulder height.',
      'Avoid swinging the weight.',
    ],
  },
  {
    id: 'cable-lateral-raise',
    name: 'Cable Lateral Raise',
    muscleGroup: 'shoulders',
    level: 'advanced',
    equipment: 'cable',
    primaryMuscles: ['Side delts'],
    instructions: [
      'Set cable low and move slightly away from stack.',
      'Lift outward under full control.',
      'Hold tension at the top briefly.',
    ],
  },

  {
    id: 'rope-pushdown',
    name: 'Rope Pushdown',
    muscleGroup: 'arms',
    level: 'beginner',
    equipment: 'cable',
    primaryMuscles: ['Triceps'],
    instructions: [
      'Keep elbows pinned near your sides.',
      'Extend fully and separate rope at the bottom.',
      'Return slowly without shoulder movement.',
    ],
  },
  {
    id: 'dumbbell-curl',
    name: 'Dumbbell Curl',
    muscleGroup: 'arms',
    level: 'beginner',
    equipment: 'dumbbell',
    primaryMuscles: ['Biceps'],
    instructions: [
      'Curl without swinging torso.',
      'Squeeze at the top.',
      'Lower slowly for full control.',
    ],
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    muscleGroup: 'arms',
    level: 'intermediate',
    equipment: 'dumbbell',
    primaryMuscles: ['Brachialis', 'Biceps', 'Forearms'],
    instructions: [
      'Keep palms facing inward the whole set.',
      'Lift with elbows stable.',
      'Lower fully without losing tension.',
    ],
  },
  {
    id: 'skull-crusher',
    name: 'Skull Crusher',
    muscleGroup: 'arms',
    level: 'advanced',
    equipment: 'barbell',
    primaryMuscles: ['Triceps'],
    instructions: [
      'Keep upper arms mostly fixed.',
      'Lower toward forehead or behind head.',
      'Extend back to lockout with control.',
    ],
  },

  {
    id: 'goblet-squat',
    name: 'Goblet Squat',
    muscleGroup: 'legs',
    level: 'beginner',
    equipment: 'dumbbell',
    primaryMuscles: ['Quads', 'Glutes', 'Core'],
    instructions: [
      'Hold weight close to chest.',
      'Sit down between the hips.',
      'Drive up through midfoot.',
    ],
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    muscleGroup: 'legs',
    level: 'beginner',
    equipment: 'machine',
    primaryMuscles: ['Quads', 'Glutes'],
    instructions: [
      'Place feet shoulder width apart.',
      'Lower with control to comfortable depth.',
      'Press without bouncing at the bottom.',
    ],
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    muscleGroup: 'legs',
    level: 'intermediate',
    equipment: 'barbell',
    primaryMuscles: ['Hamstrings', 'Glutes', 'Lower back'],
    instructions: [
      'Push hips back while keeping bar close.',
      'Maintain a neutral spine.',
      'Stand tall by driving hips through.',
    ],
  },
  {
    id: 'barbell-back-squat',
    name: 'Barbell Back Squat',
    muscleGroup: 'legs',
    level: 'advanced',
    equipment: 'barbell',
    primaryMuscles: ['Quads', 'Glutes', 'Core'],
    instructions: [
      'Brace before each rep.',
      'Sit down and slightly back under control.',
      'Drive up while keeping chest and hips together.',
    ],
  },
  {
    id: 'walking-lunge',
    name: 'Walking Lunge',
    muscleGroup: 'legs',
    level: 'intermediate',
    equipment: 'dumbbell',
    primaryMuscles: ['Quads', 'Glutes', 'Adductors'],
    instructions: [
      'Step long enough to keep balance.',
      'Lower rear knee toward the floor.',
      'Push through front foot into the next step.',
    ],
  },
  {
    id: 'leg-curl',
    name: 'Leg Curl',
    muscleGroup: 'legs',
    level: 'beginner',
    equipment: 'machine',
    primaryMuscles: ['Hamstrings'],
    instructions: [
      'Set machine axis in line with knee joint.',
      'Curl smoothly to full contraction.',
      'Lower with control.',
    ],
  },

  {
    id: 'dead-bug',
    name: 'Dead Bug',
    muscleGroup: 'core',
    level: 'beginner',
    equipment: 'bodyweight',
    primaryMuscles: ['Abs', 'Deep core'],
    instructions: [
      'Press low back gently into floor.',
      'Extend opposite arm and leg slowly.',
      'Return and alternate sides.',
    ],
  },
  {
    id: 'plank',
    name: 'Plank',
    muscleGroup: 'core',
    level: 'beginner',
    equipment: 'bodyweight',
    primaryMuscles: ['Abs', 'Obliques', 'Glutes'],
    instructions: [
      'Keep body straight and glutes active.',
      'Avoid sagging through lower back.',
      'Breathe steadily while holding.',
    ],
  },
  {
    id: 'hanging-knee-raise',
    name: 'Hanging Knee Raise',
    muscleGroup: 'core',
    level: 'intermediate',
    equipment: 'bodyweight',
    primaryMuscles: ['Lower abs', 'Hip flexors'],
    instructions: [
      'Hang with shoulders active.',
      'Lift knees under control.',
      'Avoid excessive swinging.',
    ],
  },
  {
    id: 'ab-wheel',
    name: 'Ab Wheel Rollout',
    muscleGroup: 'core',
    level: 'advanced',
    equipment: 'mixed',
    primaryMuscles: ['Abs', 'Deep core', 'Lats'],
    instructions: [
      'Brace hard before rolling forward.',
      'Go only as far as you can control.',
      'Pull back without collapsing hips.',
    ],
  },
];

export function getExercisesByMuscleGroup(
  muscleGroup: MuscleGroup,
  level?: TrainingLevel
): Exercise[] {
  return exercises.filter((exercise) => {
    if (exercise.muscleGroup !== muscleGroup) return false;
    if (!level) return true;

    const order: TrainingLevel[] = ['beginner', 'intermediate', 'advanced'];
    return order.indexOf(exercise.level) <= order.indexOf(level);
  });
}