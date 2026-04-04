type WorkoutDraft = {
  startedAt: string | null;
};

const KEY = 'gymrat-workout-store';

function read(): WorkoutDraft {
  if (typeof window === 'undefined') return { startedAt: null };
  const raw = localStorage.getItem(KEY);
  if (!raw) return { startedAt: null };

  try {
    return { startedAt: null, ...JSON.parse(raw) } as WorkoutDraft;
  } catch {
    return { startedAt: null };
  }
}

function write(state: WorkoutDraft) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getWorkoutDraft() {
  return read();
}

export function saveWorkoutDraft(draft: WorkoutDraft) {
  write(draft);
}

export function clearWorkoutDraft() {
  write({ startedAt: null });
}