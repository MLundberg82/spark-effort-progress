export type UserGender = 'male' | 'female' | 'non-binary';
export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';

export type UserProfile = {
  age: number;
  weight: number;
  gender: UserGender;
  trainingLevel: TrainingLevel;
};

type ProfileState = {
  onboardingComplete: boolean;
  profile: UserProfile | null;
};

const KEY = 'gymrat-profile-store';

function read(): ProfileState {
  if (typeof window === 'undefined') {
    return { onboardingComplete: false, profile: null };
  }

  const raw = localStorage.getItem(KEY);
  if (!raw) {
    return { onboardingComplete: false, profile: null };
  }

  try {
    return {
      onboardingComplete: false,
      profile: null,
      ...JSON.parse(raw),
    } as ProfileState;
  } catch {
    return { onboardingComplete: false, profile: null };
  }
}

function write(state: ProfileState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getProfile() {
  return read().profile;
}

export function saveProfile(profile: UserProfile) {
  const state = read();
  write({ ...state, profile });
}

export function completeOnboarding() {
  const state = read();
  write({ ...state, onboardingComplete: true });
}

export function isOnboardingComplete() {
  return read().onboardingComplete;
}