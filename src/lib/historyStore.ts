export type FocusArea = 'chest' | 'back' | 'arms' | 'legs';

export type WorkoutExerciseDetail = {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  volume: number;
};

export type WorkoutHistoryEntry = {
  id: string;
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
  completedAt: string;
  focusArea: FocusArea;
  details: WorkoutExerciseDetail[];
};

const KEY = 'gymrat-history-store';
const HISTORY_UPDATED_EVENT = 'history-updated';

const FOCUS_AREAS: FocusArea[] = ['chest', 'back', 'arms', 'legs'];

const EXERCISE_TO_FOCUS: Record<string, FocusArea> = {
  'bench press': 'chest',
  'incline dumbbell press': 'chest',
  'chest fly': 'chest',
  'push up': 'chest',
  'dip': 'chest',

  'lat pulldown': 'back',
  'pull up': 'back',
  'chin up': 'back',
  'barbell row': 'back',
  'seated cable row': 'back',
  'deadlift': 'back',
  'romanian deadlift': 'back',

  'shoulder press': 'arms',
  'lateral raise': 'arms',
  'rear delt fly': 'arms',
  'barbell curl': 'arms',
  'hammer curl': 'arms',
  'triceps pushdown': 'arms',
  'overhead extension': 'arms',
  'skull crusher': 'arms',

  'squat': 'legs',
  'leg press': 'legs',
  'leg curl': 'legs',
  'leg extension': 'legs',
  'calf raise': 'legs',
  'lunge': 'legs',
  'bulgarian split squat': 'legs',
  'hip thrust': 'legs',
};

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeDetail(input: unknown): WorkoutExerciseDetail | null {
  if (!input || typeof input !== 'object') return null;

  const value = input as Partial<WorkoutExerciseDetail>;

  const exercise =
    typeof value.exercise === 'string' && value.exercise.trim().length > 0
      ? value.exercise.trim()
      : '';

  const sets = Number.isFinite(value.sets) ? Math.max(0, Math.round(value.sets as number)) : 0;
  const reps = Number.isFinite(value.reps) ? Math.max(0, Math.round(value.reps as number)) : 0;
  const weight = Number.isFinite(value.weight) ? Math.max(0, Number(value.weight)) : 0;

  const volume =
    Number.isFinite(value.volume) && Number(value.volume) >= 0
      ? Number(value.volume)
      : sets * reps * weight;

  if (!exercise) return null;

  return {
    exercise,
    sets,
    reps,
    weight,
    volume,
  };
}

function inferFocusAreaFromDetails(details: WorkoutExerciseDetail[]): FocusArea {
  const score: Record<FocusArea, number> = {
    chest: 0,
    back: 0,
    arms: 0,
    legs: 0,
  };

  for (const detail of details) {
    const key = detail.exercise.trim().toLowerCase();
    const mapped = EXERCISE_TO_FOCUS[key];
    if (!mapped) continue;

    score[mapped] += Math.max(1, detail.sets) * Math.max(1, detail.reps);
  }

  const ranked = FOCUS_AREAS
    .map((area) => ({ area, value: score[area] }))
    .sort((a, b) => b.value - a.value);

  if (ranked[0]?.value > 0) {
    return ranked[0].area;
  }

  return 'chest';
}

function inferFocusAreaFromWorkoutName(name: string): FocusArea {
  const lower = name.trim().toLowerCase();

  if (
    lower.includes('back') ||
    lower.includes('pull') ||
    lower.includes('row') ||
    lower.includes('lat')
  ) {
    return 'back';
  }

  if (
    lower.includes('leg') ||
    lower.includes('lower') ||
    lower.includes('squat') ||
    lower.includes('hamstring') ||
    lower.includes('quad')
  ) {
    return 'legs';
  }

  if (
    lower.includes('arm') ||
    lower.includes('shoulder') ||
    lower.includes('biceps') ||
    lower.includes('triceps')
  ) {
    return 'arms';
  }

  return 'chest';
}

function inferFocusArea(
  details: WorkoutExerciseDetail[],
  provided?: FocusArea,
  workoutName?: string,
): FocusArea {
  if (provided && FOCUS_AREAS.includes(provided)) {
    return provided;
  }

  if (details.length > 0) {
    return inferFocusAreaFromDetails(details);
  }

  return inferFocusAreaFromWorkoutName(workoutName ?? '');
}

function normalizeEntry(input: unknown): WorkoutHistoryEntry | null {
  if (!input || typeof input !== 'object') return null;

  const value = input as Partial<WorkoutHistoryEntry>;
  const workoutName =
    typeof value.workoutName === 'string' && value.workoutName.trim().length > 0
      ? value.workoutName.trim()
      : 'Workout';

  const durationMinutes = Number.isFinite(value.durationMinutes)
    ? Math.max(0, Math.round(value.durationMinutes as number))
    : 0;

  const exercisesCompleted = Number.isFinite(value.exercisesCompleted)
    ? Math.max(0, Math.round(value.exercisesCompleted as number))
    : 0;

  const details = Array.isArray(value.details)
    ? value.details.map(normalizeDetail).filter((entry): entry is WorkoutExerciseDetail => entry !== null)
    : [];

  const calculatedVolumeFromDetails = details.reduce((sum, detail) => sum + detail.volume, 0);

  const volume =
    Number.isFinite(value.volume) && Number(value.volume) >= 0
      ? Number(value.volume)
      : calculatedVolumeFromDetails;

  const completedAt =
    typeof value.completedAt === 'string' && value.completedAt.length > 0
      ? value.completedAt
      : new Date().toISOString();

  const focusArea = inferFocusArea(details, value.focusArea, workoutName);

  return {
    id: typeof value.id === 'string' && value.id.length > 0 ? value.id : createId(),
    workoutName,
    durationMinutes,
    exercisesCompleted: exercisesCompleted || details.length,
    volume,
    completedAt,
    focusArea,
    details,
  };
}

function read(): WorkoutHistoryEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeEntry)
      .filter((entry): entry is WorkoutHistoryEntry => entry !== null);
  } catch {
    return [];
  }
}

function write(entries: WorkoutHistoryEntry[]) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(KEY, JSON.stringify(entries));
  window.dispatchEvent(
    new CustomEvent(HISTORY_UPDATED_EVENT, {
      detail: entries,
    }),
  );
}

export function getWorkoutHistory(): WorkoutHistoryEntry[] {
  return read().sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

export function addWorkoutHistory(
  entry: Omit<WorkoutHistoryEntry, 'id' | 'focusArea'> & { focusArea?: FocusArea },
): WorkoutHistoryEntry {
  const normalizedDetails = Array.isArray(entry.details)
    ? entry.details
        .map(normalizeDetail)
        .filter((detail): detail is WorkoutExerciseDetail => detail !== null)
    : [];

  const next: WorkoutHistoryEntry = {
    id: createId(),
    workoutName: entry.workoutName.trim() || 'Workout',
    durationMinutes: Math.max(0, Math.round(entry.durationMinutes)),
    exercisesCompleted: Math.max(
      0,
      Math.round(entry.exercisesCompleted || normalizedDetails.length),
    ),
    volume:
      Number.isFinite(entry.volume) && entry.volume >= 0
        ? entry.volume
        : normalizedDetails.reduce((sum, detail) => sum + detail.volume, 0),
    completedAt: entry.completedAt || new Date().toISOString(),
    focusArea: inferFocusArea(normalizedDetails, entry.focusArea, entry.workoutName),
    details: normalizedDetails,
  };

  const current = read();
  write([next, ...current]);
  return next;
}

export function clearWorkoutHistory() {
  write([]);
}

export function getWorkoutFocusBreakdown(): Record<FocusArea, number> {
  const history = getWorkoutHistory();

  return history.reduce<Record<FocusArea, number>>(
    (acc, entry) => {
      acc[entry.focusArea] += 1;
      return acc;
    },
    {
      chest: 0,
      back: 0,
      arms: 0,
      legs: 0,
    },
  );
}

export function getLastCompletedAtForFocusArea(
  focusArea: FocusArea,
): string | null {
  const history = getWorkoutHistory();
  const match = history.find((entry) => entry.focusArea === focusArea);

  return match?.completedAt ?? null;
}

export function getRecommendedNextFocusArea(): FocusArea {
  const history = getWorkoutHistory();

  if (history.length === 0) {
    return 'chest';
  }

  const lastSeenByArea = new Map<FocusArea, number>();

  for (const area of FOCUS_AREAS) {
    lastSeenByArea.set(area, Number.NEGATIVE_INFINITY);
  }

  history.forEach((entry, index) => {
    if (!lastSeenByArea.has(entry.focusArea)) return;
    if (lastSeenByArea.get(entry.focusArea) === Number.NEGATIVE_INFINITY) {
      lastSeenByArea.set(entry.focusArea, index);
    }
  });

  const ranked = FOCUS_AREAS.map((area) => ({
    area,
    index: lastSeenByArea.get(area) ?? Number.NEGATIVE_INFINITY,
  })).sort((a, b) => a.index - b.index);

  return ranked[0]?.area ?? 'chest';
}

export function getWorkoutNameOptions(): string[] {
  return Array.from(
    new Set(
      getWorkoutHistory()
        .map((entry) => entry.workoutName.trim())
        .filter(Boolean),
    ),
  );
}

export function getExerciseNameOptions(): string[] {
  return Array.from(
    new Set(
      getWorkoutHistory()
        .flatMap((entry) => entry.details.map((detail) => detail.exercise.trim()))
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

export function getExerciseHistory(exerciseName: string) {
  const normalized = exerciseName.trim().toLowerCase();

  return getWorkoutHistory()
    .flatMap((entry) =>
      entry.details
        .filter((detail) => detail.exercise.trim().toLowerCase() === normalized)
        .map((detail) => ({
          completedAt: entry.completedAt,
          workoutName: entry.workoutName,
          focusArea: entry.focusArea,
          sets: detail.sets,
          reps: detail.reps,
          weight: detail.weight,
          volume: detail.volume,
        })),
    )
    .sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
    );
}