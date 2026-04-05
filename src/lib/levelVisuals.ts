export type LevelVisual = {
  tierLabel: string;
  auraClass: string;
  glowClass: string;
};

export function getLevelVisual(level: number): LevelVisual {
  if (level >= 100) {
    return {
      tierLabel: 'Legend',
      auraClass:
        'bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.30),rgba(99,102,241,0.14),transparent_72%)]',
      glowClass: 'shadow-[0_0_90px_rgba(192,38,211,0.32)]',
    };
  }

  if (level >= 80) {
    return {
      tierLabel: 'Mythic',
      auraClass:
        'bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.26),rgba(59,130,246,0.14),transparent_72%)]',
      glowClass: 'shadow-[0_0_85px_rgba(168,85,247,0.28)]',
    };
  }

  if (level >= 60) {
    return {
      tierLabel: 'King',
      auraClass:
        'bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.24),rgba(245,158,11,0.14),transparent_72%)]',
      glowClass: 'shadow-[0_0_80px_rgba(245,158,11,0.28)]',
    };
  }

  if (level >= 40) {
    return {
      tierLabel: 'Elite',
      auraClass:
        'bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.24),rgba(59,130,246,0.14),transparent_72%)]',
      glowClass: 'shadow-[0_0_80px_rgba(34,211,238,0.24)]',
    };
  }

  if (level >= 25) {
    return {
      tierLabel: 'Alpha',
      auraClass:
        'bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.24),rgba(52,211,153,0.14),transparent_72%)]',
      glowClass: 'shadow-[0_0_75px_rgba(16,185,129,0.24)]',
    };
  }

  if (level >= 10) {
    return {
      tierLabel: 'Grind',
      auraClass:
        'bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.20),rgba(168,85,247,0.10),transparent_72%)]',
      glowClass: 'shadow-[0_0_70px_rgba(244,114,182,0.18)]',
    };
  }

  return {
    tierLabel: 'Rookie',
    auraClass:
      'bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.20),rgba(255,255,255,0.06),transparent_72%)]',
    glowClass: 'shadow-[0_0_60px_rgba(74,222,128,0.16)]',
  };
}