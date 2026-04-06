export type DraftSet = {
  reps: number;
  weight: number;
};

export type DraftExercise = {
  name: string;
  muscleGroup?: string;
  sets: DraftSet[];
};

export type WorkoutDraft = {
  startedAt: string;
  updatedAt?: string;
  workoutName?: string;
  notes?: string;
  planName?: string;
  dayLabel?: string;
  isCustom?: boolean;
  exercises?: DraftExercise[];
};

const KEY = 'gymrat-workout-draft';
const EVENT_NAME = 'workout-draft-updated';

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function sanitizeSet(value: unknown): DraftSet | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Partial<DraftSet>;
  const reps = Number(raw.reps);
  const weight = Number(raw.weight);

  return {
    reps: Number.isFinite(reps) ? Math.max(0, Math.round(reps)) : 0,
    weight: Number.isFinite(weight) ? Math.max(0, weight) : 0,
  };
}

function sanitizeExercise(value: unknown): DraftExercise | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Partial<DraftExercise>;
  const name =
    typeof raw.name === 'string' && raw.name.trim().length > 0
      ? raw.name.trim()
      : null;

  const sets = Array.isArray(raw.sets)
    ? raw.sets.map(sanitizeSet).filter((set): set is DraftSet => Boolean(set))
    : [];

  if (!name || sets.length === 0) return null;

  return {
    name,
    muscleGroup:
      typeof raw.muscleGroup === 'string' && raw.muscleGroup.trim().length > 0
        ? raw.muscleGroup
        : undefined,
    sets,
  };
}

function sanitizeDraft(value: unknown): WorkoutDraft | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Partial<WorkoutDraft>;

  if (typeof raw.startedAt !== 'string' || raw.startedAt.trim().length === 0) {
    return null;
  }

  const exercises = Array.isArray(raw.exercises)
    ? raw.exercises
        .map(sanitizeExercise)
        .filter((exercise): exercise is DraftExercise => Boolean(exercise))
    : undefined;

  return {
    startedAt: raw.startedAt,
    updatedAt:
      typeof raw.updatedAt === 'string' && raw.updatedAt.trim().length > 0
        ? raw.updatedAt
        : raw.startedAt,
    workoutName:
      typeof raw.workoutName === 'string' ? raw.workoutName : undefined,
    notes: typeof raw.notes === 'string' ? raw.notes : undefined,
    planName: typeof raw.planName === 'string' ? raw.planName : undefined,
    dayLabel: typeof raw.dayLabel === 'string' ? raw.dayLabel : undefined,
    isCustom: typeof raw.isCustom === 'boolean' ? raw.isCustom : undefined,
    exercises,
  };
}

function writeDraft(draft: WorkoutDraft | null) {
  if (!isBrowser()) return;

  if (draft === null) {
    localStorage.removeItem(KEY);
  } else {
    localStorage.setItem(KEY, JSON.stringify(draft));
  }

  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: draft }));
}

function readDraft(): WorkoutDraft | null {
  if (!isBrowser()) return null;

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;

    return sanitizeDraft(JSON.parse(raw));
  } catch {
    return null;
  }
}

function formatRelativeTime(dateString: string) {
  const timestamp = new Date(dateString).getTime();
  if (!Number.isFinite(timestamp)) return 'Saved recently';

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return 'Saved just now';
  if (diffMinutes === 1) return 'Saved 1 minute ago';
  if (diffMinutes < 60) return `Saved ${diffMinutes} minutes ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return 'Saved 1 hour ago';
  if (diffHours < 24) return `Saved ${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Saved 1 day ago';
  return `Saved ${diffDays} days ago`;
}

export function getWorkoutDraft() {
  return readDraft();
}

export function hasWorkoutDraft() {
  return Boolean(readDraft());
}

export function saveWorkoutDraft(draft: WorkoutDraft) {
  const nextDraft: WorkoutDraft = {
    ...draft,
    updatedAt: new Date().toISOString(),
  };

  writeDraft(nextDraft);
  return nextDraft;
}

export function touchWorkoutDraft() {
  const current = readDraft();
  if (!current) return null;

  return saveWorkoutDraft(current);
}

export function clearWorkoutDraft() {
  writeDraft(null);
}

export function getWorkoutDraftUpdatedAtLabel() {
  const draft = readDraft();
  if (!draft?.updatedAt) return 'Saved recently';

  return formatRelativeTime(draft.updatedAt);
}

export function subscribeWorkoutDraft(callback: () => void) {
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