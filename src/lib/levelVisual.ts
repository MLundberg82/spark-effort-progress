import { getTierLabel, getTierMilestone, getRatTier } from '@/lib/ratImages';

export type LevelVisual = {
  milestone: number;
  tierKey: string;
  tierLabel: string;
  title: string;
  subtitle: string;
  accentClass: string;
  glowClass: string;
  backgroundClass: string;
};

export function getLevelVisual(level: number): LevelVisual {
  const milestone = getTierMilestone(level);
  const tierKey = getRatTier(level);
  const tierLabel = getTierLabel(level);

  if (milestone >= 100) {
    return {
      milestone,
      tierKey,
      tierLabel,
      title: 'Mythic Form',
      subtitle: 'Peak evolution. Maximum identity. Built through real work.',
      accentClass: 'text-fuchsia-300',
      glowClass: 'shadow-[0_0_40px_rgba(217,70,239,0.35)]',
      backgroundClass:
        'bg-[radial-gradient(circle_at_top,rgba(217,70,239,0.22),transparent_28%),linear-gradient(180deg,#140818_0%,#0a0b14_100%)]',
    };
  }

  if (milestone >= 90) {
    return {
      milestone,
      tierKey,
      tierLabel,
      title: 'Ascended Form',
      subtitle: 'You are no longer just progressing. You are becoming rare.',
      accentClass: 'text-violet-300',
      glowClass: 'shadow-[0_0_36px_rgba(139,92,246,0.35)]',
      backgroundClass:
        'bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.20),transparent_30%),linear-gradient(180deg,#0d0a18_0%,#090b12_100%)]',
    };
  }

  if (milestone >= 80) {
    return {
      milestone,
      tierKey,
      tierLabel,
      title: 'King Form',
      subtitle: 'Dominant presence. High status. Hard-earned authority.',
      accentClass: 'text-yellow-300',
      glowClass: 'shadow-[0_0_34px_rgba(250,204,21,0.30)]',
      backgroundClass:
        'bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.18),transparent_30%),linear-gradient(180deg,#17120a_0%,#0c0b08_100%)]',
    };
  }

  if (milestone >= 70) {
    return {
      milestone,
      tierKey,
      tierLabel,
      title: 'Legend Form',
      subtitle: 'Your consistency is visible now. This is no longer beginner energy.',
      accentClass: 'text-amber-300',
      glowClass: 'shadow-[0_0_32px_rgba(251,191,36,0.28)]',
      backgroundClass:
        'bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_30%),linear-gradient(180deg,#15110a_0%,#0b0a08_100%)]',
    };
  }

  if (milestone >= 60) {
    return {
      milestone,
      tierKey,
      tierLabel,
      title: 'Elite Form',
      subtitle: 'Sharp, focused and dangerous. The grind is paying off.',
      accentClass: 'text-cyan-300',
      glowClass: 'shadow-[0_0_32px_rgba(34,211,238,0.28)]',
      backgroundClass:
        'bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_30%),linear-gradient(180deg,#07141a_0%,#080c10_100%)]',
    };
  }

  if (milestone >= 50) {
    return {
      milestone,
      tierKey,
      tierLabel,
      title: 'Apex Form',
      subtitle: 'High momentum. Strong aura. Built through repeated wins.',
      accentClass: 'text-sky-300',
      glowClass: 'shadow-[0_0_30px_rgba(56,189,248,0.26)]',
      backgroundClass:
        'bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.15),transparent_30%),linear-gradient(180deg,#07131a_0%,#070b10_100%)]',
    };
  }

  if (milestone >= 40) {
    return {
      milestone,
      tierKey,
      tierLabel,
      title: 'Dominus Form',
      subtitle: 'Real structure. Real power. Your GymRat identity is forming.',
      accentClass: 'text-blue-300',
      glowClass: 'shadow-[0_0_30px_rgba(96,165,250,0.25)]',
      backgroundClass:
        'bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.15),transparent_30%),linear-gradient(180deg,#07111a_0%,#080b10_100%)]',
    };
  }

  if (milestone >= 35) {
    return {
      milestone,
      tierKey,
      tierLabel,
      title: 'Alpha Plus',
      subtitle: 'You are standing out now. More presence. More control.',
      accentClass: 'text-lime-300',
      glowClass: 'shadow-[0_0_28px_rgba(163,230,53,0.25)]',
      backgroundClass:
        'bg-[radial-gradient(circle_at_top,rgba(163,230,53,0.15),transparent_30%),linear-gradient(180deg,#0c1408_0%,#090d08_100%)]',
    };
  }

  if (milestone >= 30) {
    return {
      milestone,
      tierKey,
      tierLabel,
      title: 'Alpha Form',
      subtitle: 'Noticeable progress. Stronger identity. Better presence.',
      accentClass: 'text-emerald-300',
      glowClass: 'shadow-[0_0_28px_rgba(52,211,153,0.24)]',
      backgroundClass:
        'bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.15),transparent_30%),linear-gradient(180deg,#07140f_0%,#060a08_100%)]',
    };
  }

  if (milestone >= 25) {
    return {
      milestone,
      tierKey,
      tierLabel,
      title: 'Buff Form',
      subtitle: 'The work is showing. You are no longer in the early phase.',
      accentClass: 'text-green-300',
      glowClass: 'shadow-[0_0_26px_rgba(74,222,128,0.22)]',
      backgroundClass:
        'bg-[radial-gradient(circle_at_top,rgba(74,222,128,0.14),transparent_30%),linear-gradient(180deg,#07120d_0%,#060908_100%)]',
    };
  }

  if (milestone >= 20) {
    return {
      milestone,
      tierKey,
      tierLabel,
      title: 'Strong Form',
      subtitle: 'You have momentum now. Sessions are stacking into identity.',
      accentClass: 'text-teal-300',
      glowClass: 'shadow-[0_0_24px_rgba(45,212,191,0.20)]',
      backgroundClass:
        'bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.14),transparent_30%),linear-gradient(180deg,#07120f_0%,#060908_100%)]',
    };
  }

  if (milestone >= 15) {
    return {
      milestone,
      tierKey,
      tierLabel,
      title: 'Grind Form',
      subtitle: 'You are proving this is more than motivation.',
      accentClass: 'text-orange-300',
      glowClass: 'shadow-[0_0_22px_rgba(253,186,116,0.20)]',
      backgroundClass:
        'bg-[radial-gradient(circle_at_top,rgba(253,186,116,0.14),transparent_30%),linear-gradient(180deg,#141008_0%,#090806_100%)]',
    };
  }

  if (milestone >= 10) {
    return {
      milestone,
      tierKey,
      tierLabel,
      title: 'Rising Form',
      subtitle: 'The early grind is starting to turn into visible progress.',
      accentClass: 'text-orange-200',
      glowClass: 'shadow-[0_0_20px_rgba(253,186,116,0.18)]',
      backgroundClass:
        'bg-[radial-gradient(circle_at_top,rgba(253,186,116,0.12),transparent_30%),linear-gradient(180deg,#12100b_0%,#090807_100%)]',
    };
  }

  if (milestone >= 5) {
    return {
      milestone,
      tierKey,
      tierLabel,
      title: 'Regular Form',
      subtitle: 'You have started. Now the game is consistency.',
      accentClass: 'text-zinc-200',
      glowClass: 'shadow-[0_0_18px_rgba(255,255,255,0.10)]',
      backgroundClass:
        'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_30%),linear-gradient(180deg,#111214_0%,#090909_100%)]',
    };
  }

  return {
    milestone,
    tierKey,
    tierLabel,
    title: 'Underground Form',
    subtitle: 'Every serious run starts here. Build the base first.',
    accentClass: 'text-white',
    glowClass: 'shadow-[0_0_16px_rgba(255,255,255,0.08)]',
    backgroundClass:
      'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_30%),linear-gradient(180deg,#101112_0%,#080808_100%)]',
  };
}