export type WorkoutDraft = {
  startedAt: string;
  workoutName?: string;
  notes?: string;
};

export type WorkoutExerciseLog = {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  weight: number;
  completed: boolean;
};

export type WorkoutSummary = {
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  totalExercises: number;
  totalSets: number;
  totalVolume: number;
  xpEarned: number;
  completedAt: string;
};

const DRAFT_KEY = 'gymrat-workout-draft';
const SUMMARY_KEY = 'gymrat-last-workout-summary';

function readDraft(): WorkoutDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<WorkoutDraft>;
    if (typeof parsed.startedAt !== 'string' || parsed.startedAt.length === 0) {
      return null;
    }

    return {
      startedAt: parsed.startedAt,
      workoutName: typeof parsed.workoutName === 'string' ? parsed.workoutName : undefined,
      notes: typeof parsed.notes === 'string' ? parsed.notes : undefined,
    };
  } catch {
    return null;
  }
}

function writeDraft(draft: WorkoutDraft | null) {
  if (typeof window === 'undefined') return;

  if (draft === null) {
    localStorage.removeItem(DRAFT_KEY);
  } else {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }

  window.dispatchEvent(
    new CustomEvent('workout-draft-updated', {
      detail: draft,
    })
  );
}

export function getWorkoutDraft() {
  return readDraft();
}

export function saveWorkoutDraft(draft: WorkoutDraft) {
  writeDraft(draft);
}

export function clearWorkoutDraft() {
  writeDraft(null);
}

export function saveLastWorkoutSummary(summary: WorkoutSummary) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SUMMARY_KEY, JSON.stringify(summary));
}

export function getLastWorkoutSummary(): WorkoutSummary | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(SUMMARY_KEY);
    if (!raw) return null;

    return JSON.parse(raw) as WorkoutSummary;
  } catch {
    return null;
  }
}