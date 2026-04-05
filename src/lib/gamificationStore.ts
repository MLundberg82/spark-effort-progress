const XP_PER_LEVEL = 250;

export function getTotalXP(): number {
  if (typeof window === 'undefined') return 0;

  try {
    const raw = localStorage.getItem('gymrat-app-store');
    if (!raw) return 0;

    const parsed = JSON.parse(raw);
    return typeof parsed?.xp === 'number' ? parsed.xp : 0;
  } catch {
    return 0;
  }
}

export function getLevelFromXP(xp: number): number {
  return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
}

export function getCurrentLevelXP(xp: number): number {
  const level = getLevelFromXP(xp);
  const levelStartXP = (level - 1) * XP_PER_LEVEL;
  return Math.max(0, xp - levelStartXP);
}

export function getNextLevelXP(): number {
  return XP_PER_LEVEL;
}

export function getRatTier(level: number): string {
  if (level >= 100) return 'mythic';
  if (level >= 80) return 'king';
  if (level >= 60) return 'legend';
  if (level >= 40) return 'beast';
  if (level >= 25) return 'buff';
  if (level >= 15) return 'strong';
  if (level >= 8) return 'regular';
  if (level >= 3) return 'rookie';
  return 'baby';
}

export function getStreak(): number {
  if (typeof window === 'undefined') return 0;

  try {
    const raw = localStorage.getItem('gymrat-history-store');
    if (!raw) return 0;

    const parsed = JSON.parse(raw);
    const workouts = Array.isArray(parsed) ? parsed : [];
    if (!workouts.length) return 0;

    const uniqueDays = new Set(
      workouts
        .map((entry: { completedAt?: string }) => {
          if (!entry?.completedAt) return null;
          const date = new Date(entry.completedAt);
          if (Number.isNaN(date.getTime())) return null;
          return date.toISOString().slice(0, 10);
        })
        .filter(Boolean)
    );

    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    while (true) {
      const iso = cursor.toISOString().slice(0, 10);
      if (!uniqueDays.has(iso)) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  } catch {
    return 0;
  }
}