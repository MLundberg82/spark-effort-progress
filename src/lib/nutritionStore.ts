export type WorkoutHistoryEntry = {
  id: string;
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
  completedAt: string;
};

const KEY = 'gymrat-history-store';

function read(): WorkoutHistoryEntry[] {
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

function write(entries: WorkoutHistoryEntry[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent('history-updated', { detail: entries }));
}

export function getWorkoutHistory(): WorkoutHistoryEntry[] {
  return read().sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
}

export function addWorkoutHistory(
  entry: Omit<WorkoutHistoryEntry, 'id'>
): WorkoutHistoryEntry {
  const next: WorkoutHistoryEntry = {
    id: crypto.randomUUID(),
    ...entry,
  };

  const current = read();
  write([next, ...current]);
  return next;
}

export function clearWorkoutHistory() {
  write([]);
}