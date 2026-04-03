import type { RatTier } from './gamificationStore';
import { getUserProfile } from '@/components/TrainingLevelSelector';
import { getLevelVisual } from './levelVisuals';

export type GenderKey = 'male' | 'female' | 'nonbinary';

const TIER_TO_LEVEL: Record<RatTier, number> = {
  baby: 1,
  rookie: 5,
  regular: 20,
  strong: 35,
  buff: 50,
  beast: 70,
  legend: 90,
  mythic: 100,
};

export function getGenderKey(): GenderKey {
  const profile = getUserProfile();

  if (!profile) return 'male';
  if (profile.gender === 'female') return 'female';
  if (profile.gender === 'non-binary') return 'nonbinary';

  return 'male';
}

export function getCurrentLevelImage(level: number, gender?: GenderKey): string {
  const visual = getLevelVisual(level);
  const key = gender ?? getGenderKey();
  return visual.ratAssets[key];
}

export function getTierImagesForGender(gender?: GenderKey): Record<RatTier, string> {
  const key = gender ?? getGenderKey();

  return {
    baby: getLevelVisual(1).ratAssets[key],
    rookie: getLevelVisual(5).ratAssets[key],
    regular: getLevelVisual(20).ratAssets[key],
    strong: getLevelVisual(35).ratAssets[key],
    buff: getLevelVisual(50).ratAssets[key],
    beast: getLevelVisual(70).ratAssets[key],
    legend: getLevelVisual(90).ratAssets[key],
    mythic: getLevelVisual(100).ratAssets[key],
  };
}

export function getCurrentTierImage(tier: RatTier): string {
  const level = TIER_TO_LEVEL[tier] ?? 1;
  return getCurrentLevelImage(level);
}