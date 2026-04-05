export type UserGender = 'male' | 'female' | 'non-binary';
export type TrainingGoal = 'lose' | 'maintain' | 'build';
export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';

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

const defaultState: ProfileState = {
  onboardingComplete: false,
  profile: null,
};

function safeNumber(value: unknown, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function read(): ProfileState {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  const raw = localStorage.getItem(KEY);
  if (!raw) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ProfileState> & {
      profile?: Partial<UserProfile> | null;
    };

    const incomingProfile = parsed.profile;
    const profile =
      incomingProfile && typeof incomingProfile === 'object'
        ? {
            age: safeNumber(incomingProfile.age),
            height: safeNumber(incomingProfile.height),
            weight: safeNumber(incomingProfile.weight),
            gender: (incomingProfile.gender ?? 'male') as UserGender,
            goal: (incomingProfile.goal ?? 'maintain') as TrainingGoal,
            trainingLevel: (incomingProfile.trainingLevel ?? 'beginner') as TrainingLevel,
          }
        : null;

    return {
      onboardingComplete: Boolean(parsed.onboardingComplete),
      profile,
    };
  } catch {
    return defaultState;
  }
}

function write(state: ProfileState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getProfile(): UserProfile | null {
  return read().profile;
}

export function saveProfile(profile: UserProfile) {
  const state = read();

  write({
    ...state,
    profile: {
      age: safeNumber(profile.age),
      height: safeNumber(profile.height),
      weight: safeNumber(profile.weight),
      gender: profile.gender,
      goal: profile.goal,
      trainingLevel: profile.trainingLevel,
    },
  });
}

export function updateProfile(patch: Partial<UserProfile>) {
  const current = getProfile();

  const next: UserProfile = {
    age: safeNumber(patch.age ?? current?.age ?? 0),
    height: safeNumber(patch.height ?? current?.height ?? 0),
    weight: safeNumber(patch.weight ?? current?.weight ?? 0),
    gender: (patch.gender ?? current?.gender ?? 'male') as UserGender,
    goal: (patch.goal ?? current?.goal ?? 'maintain') as TrainingGoal,
    trainingLevel: (patch.trainingLevel ?? current?.trainingLevel ?? 'beginner') as TrainingLevel,
  };

  saveProfile(next);
}

export function completeOnboarding() {
  const state = read();
  write({
    ...state,
    onboardingComplete: true,
  });
}

export function resetOnboarding() {
  const state = read();
  write({
    ...state,
    onboardingComplete: false,
  });
}

export function isOnboardingComplete() {
  const state = read();
  return state.onboardingComplete && Boolean(state.profile);
}

export function clearProfileStore() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}

export function getNutritionTargets(profile?: UserProfile | null) {
  const activeProfile = profile ?? getProfile();

  if (!activeProfile) {
    return {
      calories: 2400,
      protein: 170,
      carbs: 250,
      fat: 75,
    };
  }

  const weight = Math.max(40, safeNumber(activeProfile.weight, 75));

  let caloriesPerKg = 31;
  if (activeProfile.goal === 'lose') caloriesPerKg = 27;
  if (activeProfile.goal === 'maintain') caloriesPerKg = 31;
  if (activeProfile.goal === 'build') caloriesPerKg = 35;

  let proteinPerKg = 2.0;
  if (activeProfile.goal === 'lose') proteinPerKg = 2.2;
  if (activeProfile.goal === 'maintain') proteinPerKg = 2.0;
  if (activeProfile.goal === 'build') proteinPerKg = 2.1;

  const calories = Math.round(weight * caloriesPerKg);
  const protein = Math.round(weight * proteinPerKg);
  const fat = Math.max(50, Math.round(weight * 0.9));
  const remainingCalories = calories - protein * 4 - fat * 9;
  const carbs = Math.max(80, Math.round(remainingCalories / 4));

  return {
    calories,
    protein,
    carbs,
    fat,
  };
}