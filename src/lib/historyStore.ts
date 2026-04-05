export type WorkoutHistoryEntry = {
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
  completedAt: string;
};

const KEY = 'gymrat-history-store';

function readState(): WorkoutHistoryEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeState(entries: WorkoutHistoryEntry[]) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(KEY, JSON.stringify(entries));
  window.dispatchEvent(
    new CustomEvent('history-updated', {
      detail: entries,
    })
  );
}

export function getWorkoutHistory(): WorkoutHistoryEntry[] {
  return readState().sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
}

export function addWorkoutHistory(entry: WorkoutHistoryEntry) {
  const current = readState();
  writeState([entry, ...current]);
}

export function clearWorkoutHistory() {
  writeState([]);
}