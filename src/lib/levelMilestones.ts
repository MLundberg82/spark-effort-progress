import type { LevelMilestone } from './assetTypes';

export const LEVEL_MILESTONES: LevelMilestone[] = [
  1, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 100,
];

export function getUnlockedMilestone(level: number): LevelMilestone {
  let current: LevelMilestone = 1;

  for (const milestone of LEVEL_MILESTONES) {
    if (level >= milestone) {
      current = milestone;
    } else {
      break;
    }
  }

  return current;
}

export function getNextMilestone(level: number): LevelMilestone | null {
  for (const milestone of LEVEL_MILESTONES) {
    if (milestone > level) return milestone;
  }
  return null;
}

export function getMilestoneProgress(level: number) {
  const current = getUnlockedMilestone(level);
  const next = getNextMilestone(level);

  if (!next) {
    return {
      current,
      next: null,
      progress: 1,
    };
  }

  const span = next - current;
  const progress = span <= 0 ? 1 : (level - current) / span;

  return {
    current,
    next,
    progress: Math.max(0, Math.min(1, progress)),
  };
}