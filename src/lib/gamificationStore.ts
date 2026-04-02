import { getWorkouts, WorkoutLog, WorkoutEntry } from './workoutStore';
import { exercises } from './exerciseData';
import { checkPremium } from './premiumStore';

const XP_KEY = 'gymrat-xp';
const LEVEL_KEY = 'gymrat-level';
const PB_KEY = 'gymrat-pbs';

// --- XP Thresholds ---
// Level 1-10: 50 XP each (hook phase)
// Level 11-50: 100 XP each (steady)
// Level 51-100: 200 XP each (grind)
export function xpForLevel(level: number): number {
  if (level <= 10) return level * 50;
  if (level <= 50) return 500 + (level - 10) * 100;
  return 500 + 4000 + (level - 50) * 200;
}

export function getLevelFromXP(totalXP: number): { level: number; currentXP: number; xpToNext: number; progress: number } {
  let level = 1;
  let xpUsed = 0;
  while (level < 100) {
    const needed = xpForLevel(level);
    if (xpUsed + needed > totalXP) {
      const currentXP = totalXP - xpUsed;
      return { level, currentXP, xpToNext: needed, progress: currentXP / needed };
    }
    xpUsed += needed;
    level++;
  }
  return { level: 100, currentXP: 0, xpToNext: 0, progress: 1 };
}

// --- Storage ---
export function getTotalXP(): number {
  return parseInt(localStorage.getItem(XP_KEY) || '0', 10);
}

export function addXP(amount: number): { totalXP: number; oldLevel: number; newLevel: number; leveledUp: boolean } {
  const oldXP = getTotalXP();
  const oldLevel = getLevelFromXP(oldXP).level;
  const newXP = oldXP + amount;
  localStorage.setItem(XP_KEY, String(newXP));
  const newLevel = getLevelFromXP(newXP).level;
  return { totalXP: newXP, oldLevel, newLevel, leveledUp: newLevel > oldLevel };
}

// --- Personal Bests ---
export interface PBRecord {
  exerciseId: string;
  maxWeight: number;
  maxReps: number;
  maxVolume: number;
}

export function getPBs(): Record<string, PBRecord> {
  const data = localStorage.getItem(PB_KEY);
  return data ? JSON.parse(data) : {};
}

function savePBs(pbs: Record<string, PBRecord>) {
  localStorage.setItem(PB_KEY, JSON.stringify(pbs));
}

export interface XPBreakdown {
  workoutComplete: number;
  newPBs: { exerciseId: string; type: 'weight' | 'reps' | 'volume' }[];
  repImprovements: number;
  streakBonus: number;
  total: number;
  premiumMultiplied?: boolean;
}

// --- Streak ---
export function getStreak(): number {
  const workouts = getWorkouts();
  if (workouts.length === 0) return 0;
  const sorted = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = new Date(sorted[0].date);
  lastDate.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) return 0;

  for (let i = 1; i < sorted.length; i++) {
    const curr = new Date(sorted[i - 1].date);
    curr.setHours(0, 0, 0, 0);
    const prev = new Date(sorted[i].date);
    prev.setHours(0, 0, 0, 0);
    const diff = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) streak++;
    else if (diff > 1) break;
  }
  return streak;
}

// --- Calculate XP for a workout ---
export function calculateWorkoutXP(workout: WorkoutLog): XPBreakdown {
  const pbs = getPBs();
  let total = 0;
  const newPBs: XPBreakdown['newPBs'] = [];
  let repImprovements = 0;

  // +10 for completing workout
  const workoutComplete = 10;
  total += workoutComplete;

  workout.entries.forEach(entry => {
    // Skip XP for exercises with no weight used
    const hasWeight = entry.sets.some(s => s.weight > 0);
    if (!hasWeight) return;

    const entryMaxWeight = Math.max(...entry.sets.map(s => s.weight), 0);
    const entryMaxReps = Math.max(...entry.sets.map(s => s.reps), 0);
    const entryVolume = entry.sets.reduce((acc, s) => acc + s.weight * s.reps, 0);

    const existing = pbs[entry.exerciseId];

    if (!existing) {
      // First time = automatic PB
      pbs[entry.exerciseId] = { exerciseId: entry.exerciseId, maxWeight: entryMaxWeight, maxReps: entryMaxReps, maxVolume: entryVolume };
      if (entryMaxWeight > 0) {
        newPBs.push({ exerciseId: entry.exerciseId, type: 'weight' });
        total += 20;
      }
    } else {
      if (entryMaxWeight > existing.maxWeight && entryMaxWeight > 0) {
        newPBs.push({ exerciseId: entry.exerciseId, type: 'weight' });
        existing.maxWeight = entryMaxWeight;
        total += 20;
      }
      if (entryMaxReps > existing.maxReps && entryMaxReps > 0) {
        repImprovements++;
        existing.maxReps = entryMaxReps;
        total += 5;
      }
      if (entryVolume > existing.maxVolume && entryVolume > 0) {
        newPBs.push({ exerciseId: entry.exerciseId, type: 'volume' });
        existing.maxVolume = entryVolume;
        total += 20;
      }
    }
  });

  // Streak bonus
  const streak = getStreak();
  const streakBonus = streak > 1 ? 5 : 0;
  total += streakBonus;

  savePBs(pbs);

  // Premium: Double XP
  if (isPremium()) {
    total *= 2;
  }

  return { workoutComplete, newPBs, repImprovements, streakBonus, total, premiumMultiplied: isPremium() };
}

// --- Premium ---
// --- Premium ---
export const isPremium = (): boolean => {
  return checkPremium();
};

export const setPremium = (value: boolean): void => {
  if (value) {
    localStorage.setItem('gymrat-premium', 'true');
    localStorage.setItem('gymrat-premium-source', 'manual');
    localStorage.setItem('gymrat-premium-expiry', 'lifetime');
    localStorage.setItem('gymrat-premium-plan', 'lifetime');
  } else {
    localStorage.removeItem('gymrat-premium');
    localStorage.removeItem('gymrat-premium-source');
    localStorage.removeItem('gymrat-premium-expiry');
    localStorage.removeItem('gymrat-premium-plan');
  }

  window.dispatchEvent(new CustomEvent('premium-updated', { detail: value }));
};

// --- Rat evolution tiers ---
export type RatTier = 'baby' | 'rookie' | 'regular' | 'strong' | 'buff' | 'beast' | 'legend' | 'mythic';

export function getRatTier(level: number): { tier: RatTier; label: string; emoji: string; size: number } {
  if (level < 5) return { tier: 'baby', label: 'Baby Rat', emoji: '🐭', size: 1 };
  if (level < 15) return { tier: 'rookie', label: 'Rookie Rat', emoji: '🐭', size: 1.2 };
  if (level < 25) return { tier: 'regular', label: 'Gym Rat', emoji: '🐀', size: 1.4 };
  if (level < 40) return { tier: 'strong', label: 'Strong Rat', emoji: '🐀', size: 1.6 };
  if (level < 55) return { tier: 'buff', label: 'Buff Rat', emoji: '🐀', size: 1.8 };
  if (level < 70) return { tier: 'beast', label: 'Beast Rat', emoji: '🐀', size: 2 };
  if (level < 90) return { tier: 'legend', label: 'Legend Rat', emoji: '🐀', size: 2.2 };
  return { tier: 'mythic', label: 'Mythic Rat', emoji: '🐀', size: 2.4 };
}

// --- Milestone rewards ---
export interface Milestone {
  level: number;
  title: string;
  reward: string;
  icon: string;
}

export const milestones: Milestone[] = [
  { level: 5, title: 'First Steps', reward: 'Rookie Badge', icon: '🏅' },
  { level: 10, title: 'Getting Serious', reward: 'Glow Effect Unlocked', icon: '✨' },
  { level: 15, title: 'Rat Evolution', reward: 'New Rat Form', icon: '🐀' },
  { level: 25, title: 'Quarter Century', reward: 'Gold Border', icon: '🥇' },
  { level: 35, title: 'Iron Will', reward: 'Fire Trail', icon: '🔥' },
  { level: 50, title: 'Half Way', reward: 'Crown Unlocked', icon: '👑' },
  { level: 65, title: 'Legendary', reward: 'Lightning Aura', icon: '⚡' },
  { level: 75, title: 'Diamond', reward: 'Diamond Badge', icon: '💎' },
  { level: 90, title: 'Mythic', reward: 'Mythic Aura', icon: '🌟' },
  { level: 100, title: 'GymRat God', reward: 'Max Prestige', icon: '🏆' },
];

export function getNextMilestone(level: number): Milestone | null {
  return milestones.find(m => m.level > level) || null;
}

export function getReachedMilestones(level: number): Milestone[] {
  return milestones.filter(m => m.level <= level);
}
