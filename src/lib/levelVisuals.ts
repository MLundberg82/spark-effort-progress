import { RAT_MILESTONES, getRatMilestone, type RatMilestone } from '@/lib/gamificationStore';

export type LevelVisual = {
  tierLabel: string;
  title: string;
  subtitle: string;
  milestone: string;
};

function toLevelVisual(entry: RatMilestone): LevelVisual {
  return {
    tierLabel: entry.tierLabel,
    title: entry.title,
    subtitle: entry.subtitle,
    milestone: `LVL ${entry.level}`,
  };
}

const levelVisuals = RAT_MILESTONES.map(toLevelVisual);

export function getAllLevelVisuals(): LevelVisual[] {
  return [...levelVisuals];
}

export function getLevelVisual(level: number): LevelVisual {
  const match = getRatMilestone(level);
  return toLevelVisual(match);
}
