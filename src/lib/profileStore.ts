export type ProfileGender = 'male' | 'female' | 'non-binary';
export type FitnessGoal = 'lose' | 'maintain' | 'gain';
export type RatVariant = ProfileGender;

export type UserProfile = {
  height: number | null;
  weight: number | null;
  age: number | null;
  gender: ProfileGender;
  goal: FitnessGoal;
  onboardingComplete: boolean;
  updatedAt: string | null;
};

const STORAGE_KEY = 'gymrat-profile-store';
const EVENT_NAME = 'gymrat-profile-updated';

const DEFAULT_PROFILE: UserProfile = {
  height: null,
  weight: null,
  age: null,
  gender: 'male',
  goal: 'gain',
  onboardingComplete: false,
  updatedAt: null,
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function clampNumber(value: unknown, min: number, max: number): number | null {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return Math.max(min, Math.min(max, Math.round(numeric)));
}

function sanitizeGender(value: unknown): ProfileGender {
  if (value === 'female' || value === 'non-binary') {
    return value;
  }

  return 'male';
}

function sanitizeGoal(value: unknown): FitnessGoal {
  if (value === 'lose' || value === 'maintain') {
    return value;
  }

  return 'gain';
}

function sanitizeProfile(input: Partial<UserProfile> | null | undefined): UserProfile {
  return {
    height: clampNumber(input?.height, 100, 260),
    weight: clampNumber(input?.weight, 30, 300),
    age: clampNumber(input?.age, 13, 100),
    gender: sanitizeGender(input?.gender),
    goal: sanitizeGoal(input?.goal),
    onboardingComplete:
      typeof input?.onboardingComplete === 'boolean'
        ? input.onboardingComplete
        : DEFAULT_PROFILE.onboardingComplete,
    updatedAt:
      typeof input?.updatedAt === 'string' && input.updatedAt.trim().length > 0
        ? input.updatedAt
        : null,
  };
}

export function getProfile(): UserProfile {
  if (!isBrowser()) {
    return DEFAULT_PROFILE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PROFILE;
    }

    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return sanitizeProfile(parsed);
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(next: Partial<UserProfile>): UserProfile {
  const merged = sanitizeProfile({
    ...getProfile(),
    ...next,
    updatedAt: new Date().toISOString(),
  });

  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: merged }));
  }

  return merged;
}

export function completeOnboarding(next: Partial<UserProfile> = {}): UserProfile {
  return saveProfile({
    ...next,
    onboardingComplete: true,
  });
}

export function resetProfile(): UserProfile {
  if (isBrowser()) {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: DEFAULT_PROFILE }));
  }

  return DEFAULT_PROFILE;
}

export function hasCompletedOnboarding(): boolean {
  return getProfile().onboardingComplete;
}

export function getRatVariant(): RatVariant {
  return getProfile().gender;
}

export function subscribeProfile(listener: (profile: UserProfile) => void): () => void {
  if (!isBrowser()) {
    return () => undefined;
  }

  const emit = () => listener(getProfile());

  const onCustomUpdate = () => emit();
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === STORAGE_KEY) {
      emit();
    }
  };

  window.addEventListener(EVENT_NAME, onCustomUpdate as EventListener);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(EVENT_NAME, onCustomUpdate as EventListener);
    window.removeEventListener('storage', onStorage);
  };
}