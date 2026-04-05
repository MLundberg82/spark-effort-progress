export type LevelVisual = {
  tierLabel: string;
  title: string;
  subtitle: string;
  milestone: string;
};

const milestones = [
  { min: 100, tierLabel: 'Mythic', title: 'Mythic Rat', subtitle: 'Peak form. Fully ascended.', milestone: 'LVL 100' },
  { min: 90, tierLabel: 'Legend', title: 'Legend Rat', subtitle: 'Elite presence with undeniable aura.', milestone: 'LVL 90' },
  { min: 80, tierLabel: 'King', title: 'King Rat', subtitle: 'You own the room and the grind.', milestone: 'LVL 80' },
  { min: 70, tierLabel: 'Dominus', title: 'Dominus Rat', subtitle: 'Dominant, advanced, relentless.', milestone: 'LVL 70' },
  { min: 60, tierLabel: 'Elite', title: 'Elite Rat', subtitle: 'Sharper look. Stronger identity.', milestone: 'LVL 60' },
  { min: 50, tierLabel: 'Alpha', title: 'Alpha Rat', subtitle: 'Clear progression. Clear presence.', milestone: 'LVL 50' },
  { min: 40, tierLabel: 'Beast', title: 'Beast Rat', subtitle: 'Heavy work starts to show.', milestone: 'LVL 40' },
  { min: 35, tierLabel: 'Advanced', title: 'Advanced Rat', subtitle: 'You are not dabbling anymore.', milestone: 'LVL 35' },
  { min: 30, tierLabel: 'Strong', title: 'Strong Rat', subtitle: 'Momentum is visible now.', milestone: 'LVL 30' },
  { min: 25, tierLabel: 'Built', title: 'Built Rat', subtitle: 'More size. More confidence.', milestone: 'LVL 25' },
  { min: 20, tierLabel: 'Rising', title: 'Rising Rat', subtitle: 'A real base is forming.', milestone: 'LVL 20' },
  { min: 15, tierLabel: 'Solid', title: 'Solid Rat', subtitle: 'Consistency is paying off.', milestone: 'LVL 15' },
  { min: 10, tierLabel: 'Rookie+', title: 'Rookie Plus', subtitle: 'Past the beginner energy.', milestone: 'LVL 10' },
  { min: 5, tierLabel: 'Rookie', title: 'Rookie Rat', subtitle: 'The grind has started to stick.', milestone: 'LVL 5' },
  { min: 1, tierLabel: 'Starter', title: 'Starter Rat', subtitle: 'Every level begins with one session.', milestone: 'LVL 1' },
];

export function getLevelVisual(level: number): LevelVisual {
  const safeLevel = Math.max(1, Math.floor(level || 1));
  const match = milestones.find((entry) => safeLevel >= entry.min);

  return (
    match ?? {
      tierLabel: 'Starter',
      title: 'Starter Rat',
      subtitle: 'Every level begins with one session.',
      milestone: 'LVL 1',
    }
  );
}