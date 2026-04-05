export type WorkoutDraft = {
  startedAt: string;
  workoutName?: string;
  notes?: string;
  planName?: string;
  dayLabel?: string;
  isCustom?: boolean;
};

const KEY = 'gymrat-workout-draft';

function readDraft(): WorkoutDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<WorkoutDraft>;

    if (typeof parsed.startedAt !== 'string' || parsed.startedAt.length === 0) {
      return null;
    }

    return {
      startedAt: parsed.startedAt,
      workoutName:
        typeof parsed.workoutName === 'string' ? parsed.workoutName : undefined,
      notes: typeof parsed.notes === 'string' ? parsed.notes : undefined,
      planName: typeof parsed.planName === 'string' ? parsed.planName : undefined,
      dayLabel: typeof parsed.dayLabel === 'string' ? parsed.dayLabel : undefined,
      isCustom: typeof parsed.isCustom === 'boolean' ? parsed.isCustom : undefined,
    };
  } catch {
    return null;
  }
}

function writeDraft(draft: WorkoutDraft | null) {
  if (typeof window === 'undefined') return;

  if (draft === null) {
    localStorage.removeItem(KEY);
  } else {
    localStorage.setItem(KEY, JSON.stringify(draft));
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
  return draft;
}

export function clearWorkoutDraft() {
  writeDraft(null);
}