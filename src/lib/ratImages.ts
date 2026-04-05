import { getRatImageForLevel, getNearestMilestone } from '@/lib/assetRegistry';
import type { RatVariant } from '@/lib/assetTypes';

function getTierBucket(level: number): number {
  return getNearestMilestone(level);
}

export function getCurrentTierImage(
  level: number,
  variant: RatVariant = 'male',
): string | null {
  return getRatImageForLevel(level, variant);
}

export function getRatTier(level: number) {
  const bucket = getTierBucket(level);

  if (bucket >= 100) return 'mythic';
  if (bucket >= 80) return 'king';
  if (bucket >= 60) return 'legend';
  if (bucket >= 40) return 'elite';
  if (bucket >= 25) return 'alpha';
  if (bucket >= 15) return 'grind';
  if (bucket >= 5) return 'regular';
  return 'underground';
}

export function getTierLabel(level: number) {
  const bucket = getTierBucket(level);

  if (bucket >= 100) return 'Mythic';
  if (bucket >= 90) return 'Ascended';
  if (bucket >= 80) return 'King';
  if (bucket >= 70) return 'Legend';
  if (bucket >= 60) return 'Elite';
  if (bucket >= 50) return 'Apex';
  if (bucket >= 40) return 'Dominus';
  if (bucket >= 35) return 'Alpha+';
  if (bucket >= 30) return 'Alpha';
  if (bucket >= 25) return 'Buff';
  if (bucket >= 20) return 'Strong';
  if (bucket >= 15) return 'Grind';
  if (bucket >= 10) return 'Rising';
  if (bucket >= 5) return 'Regular';
  return 'Underground';
}

export function getTierMilestone(level: number) {
  return getTierBucket(level);
}