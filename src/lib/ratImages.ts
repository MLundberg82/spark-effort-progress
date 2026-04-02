import { RatTier } from './gamificationStore';
import { getUserProfile } from '@/components/TrainingLevelSelector';

// Male (default) rat tier images
import mTier1 from '@/assets/rats/tier-1-baby.png';
import mTier2 from '@/assets/rats/tier-2-rookie.png';
import mTier3 from '@/assets/rats/tier-3-regular.png';
import mTier4 from '@/assets/rats/tier-4-strong.png';
import mTier5 from '@/assets/rats/tier-5-buff.png';
import mTier6 from '@/assets/rats/tier-6-beast.png';
import mTier7 from '@/assets/rats/tier-7-legend.png';
import mTier8 from '@/assets/rats/tier-8-mythic.png';

// Female rat tier images
import fTier1 from '@/assets/rats/female/tier-1-baby.png';
import fTier2 from '@/assets/rats/female/tier-2-rookie.png';
import fTier3 from '@/assets/rats/female/tier-3-regular.png';
import fTier4 from '@/assets/rats/female/tier-4-strong.png';
import fTier5 from '@/assets/rats/female/tier-5-buff.png';
import fTier6 from '@/assets/rats/female/tier-6-beast.png';
import fTier7 from '@/assets/rats/female/tier-7-legend.png';
import fTier8 from '@/assets/rats/female/tier-8-mythic.png';

// Non-binary rat tier images
import nbTier1 from '@/assets/rats/nonbinary/tier-1-baby.png';
import nbTier2 from '@/assets/rats/nonbinary/tier-2-rookie.png';
import nbTier3 from '@/assets/rats/nonbinary/tier-3-regular.png';
import nbTier4 from '@/assets/rats/nonbinary/tier-4-strong.png';
import nbTier5 from '@/assets/rats/nonbinary/tier-5-buff.png';
import nbTier6 from '@/assets/rats/nonbinary/tier-6-beast.png';
import nbTier7 from '@/assets/rats/nonbinary/tier-7-legend.png';
import nbTier8 from '@/assets/rats/nonbinary/tier-8-mythic.png';

type GenderKey = 'male' | 'female' | 'nonbinary';

const allTierImages: Record<GenderKey, Record<RatTier, string>> = {
  male: {
    baby: mTier1, rookie: mTier2, regular: mTier3, strong: mTier4,
    buff: mTier5, beast: mTier6, legend: mTier7, mythic: mTier8,
  },
  female: {
    baby: fTier1, rookie: fTier2, regular: fTier3, strong: fTier4,
    buff: fTier5, beast: fTier6, legend: fTier7, mythic: fTier8,
  },
  nonbinary: {
    baby: nbTier1, rookie: nbTier2, regular: nbTier3, strong: nbTier4,
    buff: nbTier5, beast: nbTier6, legend: nbTier7, mythic: nbTier8,
  },
};

export function getGenderKey(): GenderKey {
  const profile = getUserProfile();
  if (!profile) return 'male';
  if (profile.gender === 'female') return 'female';
  if (profile.gender === 'non-binary') return 'nonbinary';
  return 'male'; // male + prefer-not-to-say default to male
}

export function getTierImagesForGender(gender?: GenderKey): Record<RatTier, string> {
  const key = gender || getGenderKey();
  return allTierImages[key];
}

export function getCurrentTierImage(tier: RatTier): string {
  return getTierImagesForGender()[tier];
}
