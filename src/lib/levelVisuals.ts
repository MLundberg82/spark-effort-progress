import type { BackgroundAsset, LevelVisualConfig } from './assetTypes';
import { backgroundImports, ratImports } from './assetImports';

export const BACKGROUND_ASSETS: Record<string, BackgroundAsset> = {
  'bg-underground-1': {
    id: 'bg-underground-1',
    image: backgroundImports.bgUnderground1,
    stageScale: 1,
    characterOffsetY: 0,
    overlayGlow: 'from-white/0 via-white/0 to-transparent',
  },
  'bg-underground-2': {
    id: 'bg-underground-2',
    image: backgroundImports.bgUnderground2,
    stageScale: 1,
    characterOffsetY: 0,
    overlayGlow: 'from-zinc-500/10 via-transparent to-transparent',
  },
  'bg-grind-1': {
    id: 'bg-grind-1',
    image: backgroundImports.bgGrind1,
    stageScale: 1,
    characterOffsetY: 2,
    overlayGlow: 'from-fuchsia-500/10 via-transparent to-transparent',
  },
  'bg-grind-2': {
    id: 'bg-grind-2',
    image: backgroundImports.bgGrind2,
    stageScale: 1,
    characterOffsetY: 4,
    overlayGlow: 'from-violet-500/10 via-transparent to-transparent',
  },
  'bg-grind-3': {
    id: 'bg-grind-3',
    image: backgroundImports.bgGrind3,
    stageScale: 1,
    characterOffsetY: 4,
    overlayGlow: 'from-purple-500/10 via-transparent to-transparent',
  },
  'bg-alpha-1': {
    id: 'bg-alpha-1',
    image: backgroundImports.bgAlpha1,
    stageScale: 1,
    characterOffsetY: 6,
    overlayGlow: 'from-amber-400/10 via-transparent to-transparent',
  },
  'bg-alpha-2': {
    id: 'bg-alpha-2',
    image: backgroundImports.bgAlpha2,
    stageScale: 1,
    characterOffsetY: 8,
    overlayGlow: 'from-yellow-400/10 via-transparent to-transparent',
  },
  'bg-elite-1': {
    id: 'bg-elite-1',
    image: backgroundImports.bgElite1,
    stageScale: 1,
    characterOffsetY: 8,
    overlayGlow: 'from-cyan-400/10 via-transparent to-transparent',
  },
  'bg-elite-2': {
    id: 'bg-elite-2',
    image: backgroundImports.bgElite2,
    stageScale: 1,
    characterOffsetY: 10,
    overlayGlow: 'from-sky-400/10 via-transparent to-transparent',
  },
  'bg-king-1': {
    id: 'bg-king-1',
    image: backgroundImports.bgKing1,
    stageScale: 1,
    characterOffsetY: 12,
    overlayGlow: 'from-indigo-400/10 via-transparent to-transparent',
  },
  'bg-mythic-1': {
    id: 'bg-mythic-1',
    image: backgroundImports.bgMythic1,
    stageScale: 1,
    characterOffsetY: 14,
    overlayGlow: 'from-violet-400/15 via-transparent to-transparent',
  },
  'bg-legend-1': {
    id: 'bg-legend-1',
    image: backgroundImports.bgLegend1,
    stageScale: 1,
    characterOffsetY: 14,
    overlayGlow: 'from-fuchsia-400/15 via-transparent to-transparent',
  },
};

export const LEVEL_VISUALS: Record<number, LevelVisualConfig> = {
  1: {
    level: 1,
    tierName: 'Rookie',
    ratScale: 0.82,
    backgroundId: 'bg-underground-1',
    ratAssets: {
      male: ratImports.male[1],
      female: ratImports.female[1],
      nonbinary: ratImports.nonbinary[1],
    },
    difficultyWeight: 1,
    unlockXpTarget: 0,
    lighting: 'dim',
  },
  5: {
    level: 5,
    tierName: 'Starter',
    ratScale: 0.86,
    backgroundId: 'bg-underground-1',
    ratAssets: {
      male: ratImports.male[5],
      female: ratImports.female[5],
      nonbinary: ratImports.nonbinary[5],
    },
    difficultyWeight: 1.1,
    unlockXpTarget: 250,
    lighting: 'dim',
  },
  10: {
    level: 10,
    tierName: 'Trainee',
    ratScale: 0.9,
    backgroundId: 'bg-underground-2',
    ratAssets: {
      male: ratImports.male[10],
      female: ratImports.female[10],
      nonbinary: ratImports.nonbinary[10],
    },
    difficultyWeight: 1.2,
    unlockXpTarget: 600,
    lighting: 'moody',
  },
  15: {
    level: 15,
    tierName: 'Built',
    ratScale: 0.95,
    backgroundId: 'bg-underground-2',
    ratAssets: {
      male: ratImports.male[15],
      female: ratImports.female[15],
      nonbinary: ratImports.nonbinary[15],
    },
    difficultyWeight: 1.35,
    unlockXpTarget: 1000,
    lighting: 'moody',
  },
  20: {
    level: 20,
    tierName: 'Grinder',
    ratScale: 1,
    backgroundId: 'bg-grind-1',
    ratAssets: {
      male: ratImports.male[20],
      female: ratImports.female[20],
      nonbinary: ratImports.nonbinary[20],
    },
    difficultyWeight: 1.5,
    unlockXpTarget: 1500,
    lighting: 'neon',
  },
  25: {
    level: 25,
    tierName: 'Savage',
    ratScale: 1.05,
    backgroundId: 'bg-grind-2',
    ratAssets: {
      male: ratImports.male[25],
      female: ratImports.female[25],
      nonbinary: ratImports.nonbinary[25],
    },
    difficultyWeight: 1.7,
    unlockXpTarget: 2200,
    lighting: 'neon',
  },
  30: {
    level: 30,
    tierName: 'Heavy',
    ratScale: 1.1,
    backgroundId: 'bg-grind-3',
    ratAssets: {
      male: ratImports.male[30],
      female: ratImports.female[30],
      nonbinary: ratImports.nonbinary[30],
    },
    difficultyWeight: 1.9,
    unlockXpTarget: 3000,
    lighting: 'neon',
  },
  35: {
    level: 35,
    tierName: 'Alpha',
    ratScale: 1.16,
    backgroundId: 'bg-alpha-1',
    ratAssets: {
      male: ratImports.male[35],
      female: ratImports.female[35],
      nonbinary: ratImports.nonbinary[35],
    },
    difficultyWeight: 2.15,
    unlockXpTarget: 4100,
    lighting: 'elite',
  },
  40: {
    level: 40,
    tierName: 'Titan',
    ratScale: 1.22,
    backgroundId: 'bg-alpha-2',
    ratAssets: {
      male: ratImports.male[40],
      female: ratImports.female[40],
      nonbinary: ratImports.nonbinary[40],
    },
    difficultyWeight: 2.35,
    unlockXpTarget: 5400,
    lighting: 'elite',
  },
  50: {
    level: 50,
    tierName: 'Beast',
    ratScale: 1.28,
    backgroundId: 'bg-elite-1',
    ratAssets: {
      male: ratImports.male[50],
      female: ratImports.female[50],
      nonbinary: ratImports.nonbinary[50],
    },
    difficultyWeight: 2.7,
    unlockXpTarget: 7600,
    lighting: 'elite',
  },
  60: {
    level: 60,
    tierName: 'Monster',
    ratScale: 1.35,
    backgroundId: 'bg-elite-2',
    ratAssets: {
      male: ratImports.male[60],
      female: ratImports.female[60],
      nonbinary: ratImports.nonbinary[60],
    },
    difficultyWeight: 3,
    unlockXpTarget: 10200,
    lighting: 'elite',
  },
  70: {
    level: 70,
    tierName: 'Kingpin',
    ratScale: 1.42,
    backgroundId: 'bg-king-1',
    ratAssets: {
      male: ratImports.male[70],
      female: ratImports.female[70],
      nonbinary: ratImports.nonbinary[70],
    },
    difficultyWeight: 3.45,
    unlockXpTarget: 13300,
    lighting: 'legend',
  },
  80: {
    level: 80,
    tierName: 'Elite',
    ratScale: 1.48,
    backgroundId: 'bg-mythic-1',
    ratAssets: {
      male: ratImports.male[80],
      female: ratImports.female[80],
      nonbinary: ratImports.nonbinary[80],
    },
    difficultyWeight: 3.85,
    unlockXpTarget: 17000,
    lighting: 'legend',
  },
  90: {
    level: 90,
    tierName: 'Mythic',
    ratScale: 1.54,
    backgroundId: 'bg-mythic-1',
    ratAssets: {
      male: ratImports.male[90],
      female: ratImports.female[90],
      nonbinary: ratImports.nonbinary[90],
    },
    difficultyWeight: 4.2,
    unlockXpTarget: 21300,
    lighting: 'legend',
  },
  100: {
    level: 100,
    tierName: 'Legend',
    ratScale: 1.6,
    backgroundId: 'bg-legend-1',
    ratAssets: {
      male: ratImports.male[100],
      female: ratImports.female[100],
      nonbinary: ratImports.nonbinary[100],
    },
    difficultyWeight: 4.6,
    unlockXpTarget: 26000,
    lighting: 'legend',
  },
};

export function getLevelVisual(level: number) {
  const keys = Object.keys(LEVEL_VISUALS).map(Number).sort((a, b) => a - b);
  let current = LEVEL_VISUALS[1];

  for (const key of keys) {
    if (level >= key) current = LEVEL_VISUALS[key];
    else break;
  }

  return current;
}

export function getBackgroundAsset(backgroundId: string) {
  return BACKGROUND_ASSETS[backgroundId];
}