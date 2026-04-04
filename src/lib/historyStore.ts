export type WorkoutHistoryItem = {
  id: string;
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
  completedAt: string;
};

const KEY = 'gymrat-history-store';

function read(): WorkoutHistoryItem[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as WorkoutHistoryItem[];
  } catch {
    return [];
  }
}

function write(items: WorkoutHistoryItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getWorkoutHistory() {
  return read().sort((a, b) => +new Date(b.completedAt) - +new Date(a.completedAt));
}

export function addWorkoutHistory(item: Omit<WorkoutHistoryItem, 'id'>) {
  const current = read();
  const next: WorkoutHistoryItem = {
    id: crypto.randomUUID(),
    ...item,
  };
  write([next, ...current]);
}