export type PremiumSource = 'manual' | 'revenuecat' | 'promo' | 'test' | 'unknown';

export type PremiumState = {
  isActive: boolean;
  source: PremiumSource;
  activatedAt: string | null;
  expiresAt: string | null;
};

const KEY = 'gymrat-premium-store';

const DEFAULT_STATE: PremiumState = {
  isActive: false,
  source: 'unknown',
  activatedAt: null,
  expiresAt: null,
};

function readState(): PremiumState {
  if (typeof window === 'undefined') return DEFAULT_STATE;

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;

    const parsed = JSON.parse(raw) as Partial<PremiumState>;

    const expiresAt =
      typeof parsed.expiresAt === 'string' && parsed.expiresAt.length > 0
        ? parsed.expiresAt
        : null;

    const isExpired =
      expiresAt !== null && new Date(expiresAt).getTime() < Date.now();

    if (isExpired) {
      const expiredState: PremiumState = {
        ...DEFAULT_STATE,
      };
      localStorage.setItem(KEY, JSON.stringify(expiredState));
      return expiredState;
    }

    return {
      isActive: parsed.isActive === true,
      source:
        parsed.source === 'manual' ||
        parsed.source === 'revenuecat' ||
        parsed.source === 'promo' ||
        parsed.source === 'test' ||
        parsed.source === 'unknown'
          ? parsed.source
          : 'unknown',
      activatedAt:
        typeof parsed.activatedAt === 'string' ? parsed.activatedAt : null,
      expiresAt,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(state: PremiumState) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(
    new CustomEvent('premium-updated', {
      detail: state,
    })
  );
}

export function checkPremium(): PremiumState {
  return readState();
}

export function isPremiumUnlocked(): boolean {
  return readState().isActive;
}

export function subscribePremium(callback: (state: PremiumState) => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handler = () => {
    callback(readState());
  };

  window.addEventListener('premium-updated', handler);
  window.addEventListener('storage', handler);

  callback(readState());

  return () => {
    window.removeEventListener('premium-updated', handler);
    window.removeEventListener('storage', handler);
  };
}

export function activatePremium(options?: {
  source?: PremiumSource;
  expiresAt?: string | null;
}) {
  const nextState: PremiumState = {
    isActive: true,
    source: options?.source ?? 'manual',
    activatedAt: new Date().toISOString(),
    expiresAt: options?.expiresAt ?? null,
  };

  writeState(nextState);
}

export function deactivatePremium() {
  writeState(DEFAULT_STATE);
}

export function restorePremium() {
  return readState();
}