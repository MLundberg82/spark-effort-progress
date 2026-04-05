import { getRatImage } from '@/lib/assetRegistry';
import type { RatVariant } from '@/lib/assetTypes';

function getTierBucket(level: number) {
  if (level >= 100) return 100;
  if (level >= 90) return 90;
  if (level >= 80) return 80;
  if (level >= 70) return 70;
  if (level >= 60) return 60;
  if (level >= 50) return 50;
  if (level >= 40) return 40;
  if (level >= 35) return 35;
  if (level >= 30) return 30;
  if (level >= 25) return 25;
  if (level >= 20) return 20;
  if (level >= 15) return 15;
  if (level >= 10) return 10;
  if (level >= 5) return 5;
  return 1;
}

function getVariantAliases(variant: RatVariant) {
  if (variant === 'non-binary') {
    return ['non-binary', 'nonbinary', 'nb'];
  }

  return [variant];
}

function getCandidateIds(level: number, variant: RatVariant) {
  const bucket = getTierBucket(level);
  const padded = String(bucket).padStart(3, '0');
  const aliases = getVariantAliases(variant);

  const ids: string[] = [];

  for (const alias of aliases) {
    ids.push(`rat-lv-${padded}-${alias}`);
    ids.push(`rat-level-${bucket}-${alias}`);
    ids.push(`rat-${bucket}-${alias}`);
    ids.push(`rat-${alias}-${bucket}`);
    ids.push(`rat-${alias}-lv-${padded}`);
  }

  ids.push(`rat-lv-${padded}`);
  ids.push(`rat-level-${bucket}`);
  ids.push(`rat-${bucket}`);

  return ids;
}

export function getCurrentTierImage(
  level: number,
  variant: RatVariant = 'male'
): string | null {
  const candidates = getCandidateIds(level, variant);

  for (const candidate of candidates) {
    const hit = getRatImage(candidate);
    if (hit) return hit;
  }

  return null;
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