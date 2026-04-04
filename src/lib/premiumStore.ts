const KEY = 'gymrat-premium-store';

type PremiumState = {
  unlocked: boolean;
};

function read(): PremiumState {
  if (typeof window === 'undefined') return { unlocked: false };
  const raw = localStorage.getItem(KEY);
  if (!raw) return { unlocked: false };

  try {
    return { unlocked: false, ...JSON.parse(raw) } as PremiumState;
  } catch {
    return { unlocked: false };
  }
}

function write(state: PremiumState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function isPremiumUnlocked() {
  return read().unlocked;
}

export function unlockPremiumPreview() {
  write({ unlocked: true });
}

export function lockPremium() {
  write({ unlocked: false });
}