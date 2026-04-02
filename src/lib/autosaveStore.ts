/**
 * Autosave workout state — persists current in-progress workout
 * so it survives app close, crash, or navigation.
 */

import { WorkoutEntry } from './workoutStore';

const AUTOSAVE_KEY = 'gymrat-autosave-workout';

export interface AutosaveState {
  entries: WorkoutEntry[];
  currentExerciseIdx: number;
  startedAt: string; // ISO timestamp
  timerSeconds?: number;
}

export function saveAutosaveState(state: AutosaveState): void {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state));
  } catch {
    // Storage full
  }
}

export function getAutosaveState(): AutosaveState | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as AutosaveState;
    // Validate
    if (!state.entries || !Array.isArray(state.entries) || state.entries.length === 0) {
      clearAutosaveState();
      return null;
    }
    return state;
  } catch {
    clearAutosaveState();
    return null;
  }
}

export function clearAutosaveState(): void {
  localStorage.removeItem(AUTOSAVE_KEY);
}

export function hasAutosavedWorkout(): boolean {
  return getAutosaveState() !== null;
}
