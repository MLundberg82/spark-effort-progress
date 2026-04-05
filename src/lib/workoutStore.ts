export type WorkoutDraft = {
  startedAt: string;
  updatedAt?: string;
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
      updatedAt:
        typeof parsed.updatedAt === 'string' && parsed.updatedAt.length > 0
          ? parsed.updatedAt
          : parsed.startedAt,
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
    }),
  );
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
