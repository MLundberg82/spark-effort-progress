export type LevelVisual = {
  milestone: number;
  tierLabel: string;
  title: string;
  subtitle: string;
};

const MILESTONES = [1, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 100];

function getMilestone(level: number) {
  let current = 1;

  for (const value of MILESTONES) {
    if (level >= value) current = value;
  }

  return current;
}

const VISUALS: Record<number, Omit<LevelVisual, 'milestone'>> = {
  1: {
    tierLabel: 'Underground',
    title: 'The Beginning',
    subtitle: 'Raw start. Low level, high hunger, zero excuses.',
  },
  5: {
    tierLabel: 'Regular',
    title: 'Routine Builder',
    subtitle: 'Momentum starts showing. You are not guessing anymore.',
  },
  10: {
    tierLabel: 'Rising',
    title: 'Visible Progress',
    subtitle: 'You look more locked in. Training has become part of identity.',
  },
  15: {
    tierLabel: 'Grind',
    title: 'Grind Mode',
    subtitle: 'Consistency is now stronger than motivation.',
  },
  20: {
    tierLabel: 'Strong',
    title: 'Solid Frame',
    subtitle: 'The rat looks tougher. Sessions are stacking into real change.',
  },
  25: {
    tierLabel: 'Buff',
    title: 'Built Different',
    subtitle: 'You are clearly leveling up. More mass, more presence, more aura.',
  },
  30: {
    tierLabel: 'Alpha',
    title: 'Alpha Presence',
    subtitle: 'The build gets sharper. You are starting to look like a problem.',
  },
  35: {
    tierLabel: 'Alpha+',
    title: 'Dominant Rhythm',
    subtitle: 'You move like somebody who does not negotiate with weakness.',
  },
  40: {
    tierLabel: 'Dominus',
    title: 'Dominus Form',
    subtitle: 'Premium identity starts to hit. Bigger silhouette, stronger vibe.',
  },
  50: {
    tierLabel: 'Apex',
    title: 'Apex Hunter',
    subtitle: 'Confident, controlled and visibly more advanced.',
  },
  60: {
    tierLabel: 'Elite',
    title: 'Elite Build',
    subtitle: 'This is no longer casual progress. This is a serious form.',
  },
  70: {
    tierLabel: 'Legend',
    title: 'Legend Energy',
    subtitle: 'Heavy status. High level. The rat now feels dangerous.',
  },
  80: {
    tierLabel: 'King',
    title: 'King Form',
    subtitle: 'Commanding presence with a premium, dominant finish.',
  },
  90: {
    tierLabel: 'Ascended',
    title: 'Ascended Beast',
    subtitle: 'Rare form. The build is dramatic and the aura is obvious.',
  },
  100: {
    tierLabel: 'Mythic',
    title: 'Mythic GymRat',
    subtitle: 'Top-tier evolution. Endgame energy.',
  },
};

export function getLevelVisual(level: number): LevelVisual {
  const milestone = getMilestone(level);
  const visual = VISUALS[milestone] ?? VISUALS[1];

  return {
    milestone,
    ...visual,
  };
}