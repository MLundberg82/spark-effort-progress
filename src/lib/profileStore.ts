export type UserGender = 'male' | 'female' | 'non-binary';
export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';
export type TrainingGoal = 'lose' | 'maintain' | 'build';

export type UserProfile = {
  age: number;
  height: number;
  weight: number;
  gender: UserGender;
  goal: TrainingGoal;
  trainingLevel: TrainingLevel;
};

type ProfileState = {
  onboardingComplete: boolean;
  profile: UserProfile | null;
};

const KEY = 'gymrat-profile-store';

const DEFAULT_PROFILE: UserProfile = {
  age: 25,
  height: 180,
  weight: 75,
  gender: 'male',
  goal: 'maintain',
  trainingLevel: 'beginner',
};

function migrateLegacyProfile(input: any): UserProfile | null {
  if (!input || typeof input !== 'object') return null;

  return {
    age: typeof input.age === 'number' ? input.age : DEFAULT_PROFILE.age,
    height: typeof input.height === 'number' ? input.height : DEFAULT_PROFILE.height,
    weight: typeof input.weight === 'number' ? input.weight : DEFAULT_PROFILE.weight,
    gender:
      input.gender === 'female' || input.gender === 'non-binary' || input.gender === 'male'
        ? input.gender
        : DEFAULT_PROFILE.gender,
    goal:
      input.goal === 'lose' || input.goal === 'maintain' || input.goal === 'build'
        ? input.goal
        : DEFAULT_PROFILE.goal,
    trainingLevel:
      input.trainingLevel === 'intermediate' ||
      input.trainingLevel === 'advanced' ||
      input.trainingLevel === 'beginner'
        ? input.trainingLevel
        : DEFAULT_PROFILE.trainingLevel,
  };
}

function read(): ProfileState {
  if (typeof window === 'undefined') {
    return { onboardingComplete: false, profile: null };
  }

  const raw = localStorage.getItem(KEY);

  if (!raw) {
    return { onboardingComplete: false, profile: null };
  }

  try {
    const parsed = JSON.parse(raw) ?? {};
    return {
      onboardingComplete: parsed.onboardingComplete === true,
      profile: migrateLegacyProfile(parsed.profile),
    };
  } catch {
    return { onboardingComplete: false, profile: null };
  }
}

function write(state: ProfileState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('profile-updated', { detail: state }));
}

export function getProfile() {
  return read().profile;
}

export function saveProfile(profile: UserProfile) {
  const state = read();
  write({
    ...state,
    profile: migrateLegacyProfile(profile),
  });
}

export function updateProfile(partial: Partial<UserProfile>) {
  const state = read();
  const current = state.profile ?? DEFAULT_PROFILE;

  write({
    ...state,
    profile: migrateLegacyProfile({
      ...current,
      ...partial,
    }),
  });
}

export function completeOnboarding() {
  const state = read();
  write({ ...state, onboardingComplete: true });
}

export function isOnboardingComplete() {
  return read().onboardingComplete;
}

export function resetProfile() {
  write({
    onboardingComplete: false,
    profile: null,
  });
}

export function getNutritionTargets(profile: UserProfile | null) {
  const current = profile ?? DEFAULT_PROFILE;
  const weight = Math.max(40, current.weight);

  const protein =
    current.goal === 'build'
      ? Math.round(weight * 2.2)
      : current.goal === 'lose'
      ? Math.round(weight * 2.4)
      : Math.round(weight * 2.0);

  const calories =
    current.goal === 'build'
      ? Math.round(weight * 33)
      : current.goal === 'lose'
      ? Math.round(weight * 27)
      : Math.round(weight * 30);

  return {
    protein,
    calories,
  };
}