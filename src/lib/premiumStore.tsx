export type PremiumSource =
  | 'revenuecat'
  | 'promo'
  | 'manual'
  | 'restore'
  | 'trial'
  | 'unknown';

export type PremiumState = {
  isActive: boolean;
  source: PremiumSource;
  expiresAt: string | null;
  entitlementId: string | null;
  updatedAt: string | null;
};

const STORAGE_KEY = 'gymrat-premium-state';
const EVENT_NAME = 'premium-updated';

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function getDefaultState(): PremiumState {
  return {
    isActive: false,
    source: 'unknown',
    expiresAt: null,
    entitlementId: null,
    updatedAt: null,
  };
}

function sanitizeSource(value: unknown): PremiumSource {
  if (
    value === 'revenuecat' ||
    value === 'promo' ||
    value === 'manual' ||
    value === 'restore' ||
    value === 'trial'
  ) {
    return value;
  }

  return 'unknown';
}

function isFutureDate(value: string | null) {
  if (!value) return false;

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp > Date.now();
}

function sanitizeState(value: unknown): PremiumState {
  if (!value || typeof value !== 'object') {
    return getDefaultState();
  }

  const raw = value as Partial<PremiumState>;

  const expiresAt =
    typeof raw.expiresAt === 'string' && raw.expiresAt.trim().length > 0
      ? raw.expiresAt
      : null;

  const isActive =
    raw.isActive === true &&
    (expiresAt === null || isFutureDate(expiresAt));

  return {
    isActive,
    source: sanitizeSource(raw.source),
    expiresAt,
    entitlementId:
      typeof raw.entitlementId === 'string' && raw.entitlementId.trim().length > 0
        ? raw.entitlementId
        : null,
    updatedAt:
      typeof raw.updatedAt === 'string' && raw.updatedAt.trim().length > 0
        ? raw.updatedAt
        : null,
  };
}

function readState(): PremiumState {
  if (!isBrowser()) return getDefaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();

    return sanitizeState(JSON.parse(raw));
  } catch {
    return getDefaultState();
  }
}

function writeState(next: PremiumState) {
  if (!isBrowser()) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
}

function persistState(partial: Partial<PremiumState>) {
  const current = readState();

  const next = sanitizeState({
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  });

  writeState(next);
  return next;
}

export function getPremiumState() {
  return readState();
}

export function checkPremium() {
  const state = readState();

  if (state.isActive) {
    return state;
  }

  if (state.expiresAt && !isFutureDate(state.expiresAt)) {
    const expiredState = {
      ...state,
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    writeState(expiredState);
    return expiredState;
  }

  return state;
}

export function setPremiumActive(options?: {
  source?: PremiumSource;
  expiresAt?: string | null;
  entitlementId?: string | null;
}) {
  return persistState({
    isActive: true,
    source: sanitizeSource(options?.source),
    expiresAt:
      typeof options?.expiresAt === 'string' ? options.expiresAt : null,
    entitlementId:
      typeof options?.entitlementId === 'string'
        ? options.entitlementId
        : null,
  });
}

export function activatePremium(source: PremiumSource = 'manual') {
  return setPremiumActive({ source });
}

export function setPremiumFromRevenueCat(payload: {
  isActive: boolean;
  expiresAt?: string | null;
  entitlementId?: string | null;
}) {
  if (!payload.isActive) {
    return revokePremium('revenuecat');
  }

  return setPremiumActive({
    source: 'revenuecat',
    expiresAt:
      typeof payload.expiresAt === 'string' ? payload.expiresAt : null,
    entitlementId:
      typeof payload.entitlementId === 'string'
        ? payload.entitlementId
        : null,
  });
}

export function revokePremium(source: PremiumSource = 'unknown') {
  return persistState({
    isActive: false,
    source,
    expiresAt: null,
    entitlementId: null,
  });
}

export function restorePremium(options?: {
  expiresAt?: string | null;
  entitlementId?: string | null;
}) {
  return setPremiumActive({
    source: 'restore',
    expiresAt:
      typeof options?.expiresAt === 'string' ? options.expiresAt : null,
    entitlementId:
      typeof options?.entitlementId === 'string'
        ? options.entitlementId
        : null,
  });
}

export function hasPremiumAccess() {
  return checkPremium().isActive;
}

export function getPremiumExpiryLabel() {
  const state = checkPremium();

  if (!state.isActive) return 'Free';
  if (!state.expiresAt) return 'Active';

  const date = new Date(state.expiresAt);
  if (!Number.isFinite(date.getTime())) return 'Active';

  return `Active until ${date.toLocaleDateString()}`;
}

export function subscribePremium(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handler = () => callback();

  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}