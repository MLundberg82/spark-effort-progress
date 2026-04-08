export type LevelVisual = {
  milestone: number;
  tierLabel: string;
  title: string;
  subtitle: string;
};

export const MILESTONE_LEVELS = [1, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100] as const;
export type MilestoneLevel = (typeof MILESTONE_LEVELS)[number];

const VISUALS: Record<MilestoneLevel, Omit<LevelVisual, 'milestone'>> = {
  1: {
    tierLabel: 'Underground',
    title: 'Underground Rat',
    subtitle: 'Raw start. Low level, high hunger, zero excuses.',
  },
  5: {
    tierLabel: 'Grind',
    title: 'Grind Rat',
    subtitle: 'Momentum is visible now. The routine is becoming real.',
  },
  10: {
    tierLabel: 'Alpha',
    title: 'Alpha Rat',
    subtitle: 'Sharper frame, stronger aura, more intent in every session.',
  },
  15: {
    tierLabel: 'Elite',
    title: 'Elite Rat',
    subtitle: 'Consistency has teeth now. This form looks earned.',
  },
  20: {
    tierLabel: 'King',
    title: 'King Rat',
    subtitle: 'Bigger silhouette, heavier presence, premium confidence.',
  },
  25: {
    tierLabel: 'Apex',
    title: 'Apex Rat',
    subtitle: 'You look built for progression. More size, more control, more pressure.',
  },
  30: {
    tierLabel: 'Mythic',
    title: 'Mythic Rat',
    subtitle: 'The form starts feeling rare. You do not look casual anymore.',
  },
  40: {
    tierLabel: 'Warlord',
    title: 'Warlord Rat',
    subtitle: 'Thicker armor, heavier energy, a form that looks hard to ignore.',
  },
  50: {
    tierLabel: 'Titan',
    title: 'Titan Rat',
    subtitle: 'Mass, force and presence all step up together here.',
  },
  60: {
    tierLabel: 'Overlord',
    title: 'Overlord Rat',
    subtitle: 'This is no longer a gym phase. This is a built identity.',
  },
  70: {
    tierLabel: 'Ascended',
    title: 'Ascended Rat',
    subtitle: 'The aura grows louder. The form looks dangerous in the best way.',
  },
  80: {
    tierLabel: 'Legendary',
    title: 'Legendary Rat',
    subtitle: 'Commanding, polished and dominant. A real upper-tier reveal.',
  },
  90: {
    tierLabel: 'Immortal',
    title: 'Immortal Rat',
    subtitle: 'Rare form. Dramatic silhouette, dramatic presence.',
  },
  100: {
    tierLabel: 'Ascendant',
    title: 'Ascendant Rat',
    subtitle: 'Peak current evolution. Powerful now, expandable later.',
  },
};

export function getMilestone(level: number): MilestoneLevel {
  let current: MilestoneLevel = 1;

  for (const value of MILESTONE_LEVELS) {
    if (level >= value) {
      current = value;
    }
  }

  return current;
}

export function getLevelVisual(level: number): LevelVisual {
  const milestone = getMilestone(level);
  return {
    milestone,
    ...VISUALS[milestone],
  };
}
