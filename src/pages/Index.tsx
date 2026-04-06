import { useEffect, useMemo, useState } from 'react';
import { Crown, Flame, Menu, Sparkles } from 'lucide-react';

import AppMenu from '@/components/AppMenu';
import DailyCheckInScreen from '@/components/DailyCheckInScreen';
import GymRatGallery from '@/components/GymRatGallery';
import GymRatStage from '@/components/GymRatStage';
import NutritionScreen from '@/components/NutritionScreen';
import PremiumPaywall from '@/components/PremiumPaywall';
import RatShop from '@/components/RatShop';
import SettingsScreen from '@/components/SettingsScreen';
import WorkoutComplete from '@/components/WorkoutComplete';
import WorkoutFlow from '@/components/WorkoutFlow';

import { getAppState, setAppState } from '@/lib/appStore';
import {
  addXP,
  getCurrentLevelXP,
  getLevelFromXP,
  getNextLevelXP,
  getProgressPercent,
  getTotalXP,
} from '@/lib/gamificationStore';
import {
  addWorkoutHistory,
  detectPRs,
  type ExerciseEntry,
  type MuscleGroup,
} from '@/lib/historyStore';
import {
  refreshSmartNotifications,
  setupDailyReminder,
} from '@/lib/notifications';
import {
  getProfile,
  getRatVariant,
  hasCompletedOnboarding,
  saveProfile,
  type FitnessGoal,
  type ProfileGender,
} from '@/lib/profileStore';
import {
  maybeOpenHistoryPaywall,
  maybeOpenNutritionPaywall,
  maybeOpenPRPaywall,
  openManualPaywall,
} from '@/lib/paywallTriggers';
import { checkPremium } from '@/lib/premiumStore';
import { logStreakActivity } from '@/lib/streakStore';
import {
  getPlansForLevel,
  getSelectedPlanIndex,
  getTrainingLevel,
  setSelectedPlanIndex,
  setTrainingLevel,
} from '@/lib/trainingStore';

type AppPage =
  | 'home'
  | 'daily'
  | 'workout'
  | 'complete'
  | 'gallery'
  | 'shop'
  | 'history'
  | 'nutrition'
  | 'settings';

type ReturnTarget = 'home' | 'menu';

type SupportedFocusArea = Extract<MuscleGroup, 'chest' | 'back' | 'arms' | 'legs'>;

type WorkoutExerciseDetail = {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  volume: number;
};

type WorkoutCompleteResult = {
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
  focusArea: SupportedFocusArea;
  details: WorkoutExerciseDetail[];
};

type WorkoutCompleteSummary = WorkoutCompleteResult & {
  earnedXP: number;
  prs: Array<{
    exercise: string;
    newWeight: number;
    previousBest: number;
  }>;
};

type PlaceholderScreenProps = {
  title: string;
  body: string;
  onBack: () => void;
  premiumHint?: boolean;
};

type OnboardingTrainingLevel = 'beginner' | 'intermediate' | 'advanced';

type OnboardingProfile = {
  height: string;
  weight: string;
  age: string;
  gender: ProfileGender;
  goal: FitnessGoal;
  trainingLevel: OnboardingTrainingLevel;
  planIndex: number;
};

const trainingLevelCards: Array<{
  value: OnboardingTrainingLevel;
  title: string;
  subtitle: string;
}> = [
  {
    value: 'beginner',
    title: 'Beginner',
    subtitle: 'Simple structure, lower friction and easy consistency.',
  },
  {
    value: 'intermediate',
    title: 'Intermediate',
    subtitle: 'More focused volume and a stronger split structure.',
  },
  {
    value: 'advanced',
    title: 'Advanced',
    subtitle: 'Higher workload, deeper split and faster progression pace.',
  },
];

function getInitialPage(): AppPage {
  if (!hasCompletedOnboarding()) {
    return 'settings';
  }

  const state = getAppState();
  return state.page === 'daily' ? 'home' : state.page;
}

function getInitialOverlay() {
  const state = getAppState();

  return {
    menuOpen: state.overlay === 'menu',
    paywallOpen: state.overlay === 'paywall',
  };
}

function buildXPReward(result: WorkoutCompleteResult) {
  const baseXP = 40;
  const exerciseXP = result.exercisesCompleted * 8;
  const volumeXP = Math.min(120, Math.round(result.volume / 250));
  const durationXP = Math.min(40, result.durationMinutes);

  return baseXP + exerciseXP + volumeXP + durationXP;
}

function mapDetailsToHistoryExercises(
  details: WorkoutExerciseDetail[],
  focusArea: SupportedFocusArea,
): ExerciseEntry[] {
  return details.map((detail) => ({
    name: detail.exercise,
    muscleGroup: focusArea,
    sets: Array.from({ length: Math.max(1, detail.sets) }, () => ({
      reps: detail.reps,
      weight: detail.weight,
    })),
  }));
}

function PlaceholderScreen({
  title,
  body,
  onBack,
  premiumHint = false,
}: PlaceholderScreenProps) {
  return (
    <div className="min-h-screen bg-black px-5 pb-8 pt-6 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-xl flex-col rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div className="text-xs font-black uppercase tracking-[0.22em] text-lime-300/80">
          GymRat
        </div>

        <h1 className="mt-3 text-3xl font-black tracking-tight">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-white/70">{body}</p>

        {premiumHint ? (
          <div className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-3 text-sm text-yellow-100">
            This section is premium-gated and wired into the paywall trigger layer.
          </div>
        ) : null}

        <div className="mt-auto flex justify-end pt-6">
          <button
            onClick={onBack}
            className="inline-flex min-h-[48px] items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.05] px-5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
          >
            Back to menu
          </button>
        </div>
      </div>
    </div>
  );
}

function OnboardingScreen({
  onComplete,
}: {
  onComplete: (values: OnboardingProfile) => void;
}) {
  const profile = getProfile();
  const [step, setStep] = useState(0);
  const initialTrainingLevel = getTrainingLevel() as OnboardingTrainingLevel;

  const [form, setForm] = useState<OnboardingProfile>({
    height: profile.height ? String(profile.height) : '',
    weight: profile.weight ? String(profile.weight) : '',
    age: profile.age ? String(profile.age) : '',
    gender: profile.gender ?? 'male',
    goal: profile.goal ?? 'gain',
    trainingLevel: initialTrainingLevel,
    planIndex: getSelectedPlanIndex(),
  });

  const plans = useMemo(
    () => getPlansForLevel(form.trainingLevel).slice(0, 3),
    [form.trainingLevel],
  );

  useEffect(() => {
    setForm((current) => ({
      ...current,
      planIndex: Math.min(current.planIndex, Math.max(0, plans.length - 1)),
    }));
  }, [plans.length]);

  const canContinueProfile =
    form.age.trim().length > 0 &&
    form.height.trim().length > 0 &&
    form.weight.trim().length > 0;

  return (
    <div className="min-h-screen bg-black px-4 pb-6 pt-5 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-2.75rem)] max-w-xl flex-col rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-lime-300/80">
              Onboarding
            </div>
            <h1 className="mt-1 text-[28px] font-black tracking-tight">Build your rat</h1>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white/75">
            {step + 1} / 3
          </div>
        </div>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-lime-300 transition-all duration-300"
            style={{ width: `${((step + 1) / 3) * 100}%` }}
          />
        </div>

        <div className="mt-4 rounded-[24px] border border-white/10 bg-black/30 p-4">
          {step === 0 ? (
            <>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                Profile
              </div>
              <p className="mt-2 text-sm leading-5 text-white/68">
                Age, height, gender and weight first. Compact and fast.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-white/60">
                    Age
                  </span>
                  <input
                    value={form.age}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, age: event.target.value }))
                    }
                    inputMode="numeric"
                    className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-white outline-none transition focus:border-lime-300"
                    placeholder="28"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-white/60">
                    Height
                  </span>
                  <input
                    value={form.height}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, height: event.target.value }))
                    }
                    inputMode="numeric"
                    className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-white outline-none transition focus:border-lime-300"
                    placeholder="180"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-white/60">
                    Weight
                  </span>
                  <input
                    value={form.weight}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, weight: event.target.value }))
                    }
                    inputMode="numeric"
                    className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-white outline-none transition focus:border-lime-300"
                    placeholder="80"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-white/60">
                    Gender
                  </span>
                  <select
                    value={form.gender}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        gender: event.target.value as ProfileGender,
                      }))
                    }
                    className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-white outline-none transition focus:border-lime-300"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                </label>
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                Training level
              </div>
              <p className="mt-2 text-sm leading-5 text-white/68">
                Pick the level that matches where you are right now.
              </p>

              <div className="mt-4 grid gap-3">
                {trainingLevelCards.map((option) => {
                  const active = form.trainingLevel === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          trainingLevel: option.value,
                          planIndex: 0,
                        }))
                      }
                      className={`rounded-[22px] border px-4 py-3 text-left transition ${
                        active
                          ? 'border-lime-400/35 bg-lime-400/12 text-white shadow-[0_0_0_1px_rgba(163,230,53,0.08)]'
                          : 'border-white/10 bg-white/[0.04] text-white/75 hover:border-white/20 hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="text-sm font-black uppercase tracking-[0.14em]">
                        {option.title}
                      </div>
                      <div className="mt-1 text-xs leading-5 text-white/60">
                        {option.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                Training plan
              </div>
              <p className="mt-2 text-sm leading-5 text-white/68">
                Choose the structure you want to follow from the start.
              </p>

              <div className="mt-4 grid gap-3">
                {plans.map((plan, index) => {
                  const active = form.planIndex === index;

                  return (
                    <button
                      key={`${plan.name}-${index}`}
                      onClick={() =>
                        setForm((current) => ({ ...current, planIndex: index }))
                      }
                      className={`rounded-[22px] border px-4 py-3 text-left transition ${
                        active
                          ? 'border-lime-400/35 bg-lime-400/12 text-white shadow-[0_0_0_1px_rgba(163,230,53,0.08)]'
                          : 'border-white/10 bg-white/[0.04] text-white/75 hover:border-white/20 hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="text-sm font-black uppercase tracking-[0.14em]">
                        {plan.name}
                      </div>
                      <div className="mt-1 text-xs leading-5 text-white/60">
                        {plan.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-auto flex items-center gap-3 pt-5">
          <button
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.05] text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>

          {step < 2 ? (
            <button
              onClick={() => setStep((current) => Math.min(2, current + 1))}
              disabled={step === 0 && !canContinueProfile}
              className="inline-flex h-12 flex-[1.3] items-center justify-center rounded-[18px] bg-lime-300 px-5 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={() => onComplete(form)}
              className="inline-flex h-12 flex-[1.3] items-center justify-center rounded-[18px] bg-lime-300 px-5 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:brightness-105"
            >
              Enter app
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const initialOverlay = getInitialOverlay();

  const [page, setPage] = useState<AppPage>(getInitialPage);
  const [menuOpen, setMenuOpen] = useState(initialOverlay.menuOpen);
  const [paywallOpen, setPaywallOpen] = useState(initialOverlay.paywallOpen);
  const [returnTarget, setReturnTarget] = useState<ReturnTarget>('home');
  const [lastSummary, setLastSummary] = useState<WorkoutCompleteSummary | null>(null);
  const [, setProfileVersion] = useState(0);
  const [, setPremiumVersion] = useState(0);
  const [pendingWorkoutFocus, setPendingWorkoutFocus] = useState<
    SupportedFocusArea | undefined
  >(undefined);

  const totalXP = getTotalXP();
  const level = getLevelFromXP(totalXP);
  const progressPercent = Math.round(getProgressPercent(totalXP));
  const currentLevelXP = getCurrentLevelXP(totalXP);
  const nextLevelXP = getNextLevelXP(totalXP);
  const premiumActive = checkPremium().isActive;
  const variant = getRatVariant();

  useEffect(() => {
    void setupDailyReminder();
    void refreshSmartNotifications();
  }, []);

  useEffect(() => {
    setAppState({
      page,
      overlay: menuOpen ? 'menu' : paywallOpen ? 'paywall' : 'none',
      showDailyCheckIn: false,
    });
  }, [page, menuOpen, paywallOpen]);

  useEffect(() => {
    const syncPremium = () => setPremiumVersion((value) => value + 1);
    const syncProfile = () => setProfileVersion((value) => value + 1);

    window.addEventListener('storage', syncPremium);
    window.addEventListener('focus', syncPremium);
    window.addEventListener('premium-updated', syncPremium as EventListener);
    window.addEventListener('gymrat-profile-updated', syncProfile as EventListener);
    window.addEventListener('profile-updated', syncProfile as EventListener);

    return () => {
      window.removeEventListener('storage', syncPremium);
      window.removeEventListener('focus', syncPremium);
      window.removeEventListener('premium-updated', syncPremium as EventListener);
      window.removeEventListener('gymrat-profile-updated', syncProfile as EventListener);
      window.removeEventListener('profile-updated', syncProfile as EventListener);
    };
  }, []);

  const closeAllOverlays = () => {
    setMenuOpen(false);
    setPaywallOpen(false);
  };

  const navigateTo = (nextPage: AppPage, target: ReturnTarget = 'home') => {
    setReturnTarget(target);
    setPage(nextPage);
    setMenuOpen(false);
  };

  const goBack = () => {
    setPaywallOpen(false);

    if (returnTarget === 'menu') {
      setPage('home');
      setMenuOpen(true);
      return;
    }

    setMenuOpen(false);
    setPage('home');
  };

  const openPremium = () => {
    openManualPaywall({
      onOpened: () => {
        setMenuOpen(false);
        setPaywallOpen(true);
      },
    });
  };

  const handleOnboardingComplete = (values: OnboardingProfile) => {
    setTrainingLevel(values.trainingLevel);
    setSelectedPlanIndex(values.planIndex);

    saveProfile({
      height: values.height ? Number(values.height) : null,
      weight: values.weight ? Number(values.weight) : null,
      age: values.age ? Number(values.age) : null,
      gender: values.gender,
      goal: values.goal,
      onboardingComplete: true,
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gymrat-profile-updated'));
      window.dispatchEvent(new CustomEvent('profile-updated'));
    }

    navigateTo('home');
  };

  const handleStartWorkout = (focus?: MuscleGroup) => {
    closeAllOverlays();

    if (focus === 'chest' || focus === 'back' || focus === 'arms' || focus === 'legs') {
      setPendingWorkoutFocus(focus);
    } else {
      setPendingWorkoutFocus(undefined);
    }

    navigateTo('workout');
  };

  const handleCompleteWorkout = async (result: WorkoutCompleteResult) => {
    const exercises = mapDetailsToHistoryExercises(result.details, result.focusArea);
    const prs = detectPRs(exercises);
    const earnedXP = buildXPReward(result);

    addWorkoutHistory({
      id:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `workout-${Date.now()}`,
      workoutName: result.workoutName,
      exercises,
      durationMinutes: result.durationMinutes,
      completedAt: new Date().toISOString(),
    });

    addXP(earnedXP);
    logStreakActivity();

    setLastSummary({
      ...result,
      earnedXP,
      prs,
    });

    navigateTo('complete');
    setPremiumVersion((value) => value + 1);
    setPendingWorkoutFocus(undefined);

    await refreshSmartNotifications();

    if (prs.length > 0 && !checkPremium().isActive) {
      maybeOpenPRPaywall({
        onOpened: () => setPaywallOpen(true),
      });
    }
  };

  if (!hasCompletedOnboarding()) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (page === 'workout') {
    return (
      <>
        <WorkoutFlow
          onBack={goBack}
          onComplete={handleCompleteWorkout}
          initialFocus={pendingWorkoutFocus}
        />
        <PremiumPaywall isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
      </>
    );
  }

  if (page === 'complete' && lastSummary) {
    return (
      <>
        <WorkoutComplete
          summary={{
            durationMinutes: lastSummary.durationMinutes,
            exercisesCompleted: lastSummary.exercisesCompleted,
            volume: lastSummary.volume,
            prs: lastSummary.prs,
          }}
          onContinue={goBack}
        />
        <PremiumPaywall isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
      </>
    );
  }

  if (page === 'gallery') {
    return (
      <>
        <GymRatGallery onBack={goBack} />
        <PremiumPaywall isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
      </>
    );
  }

  if (page === 'shop') {
    return (
      <>
        <RatShop onBack={goBack} onOpenPremium={openPremium} />
        <PremiumPaywall isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
      </>
    );
  }

  if (page === 'history') {
    return (
      <>
        <PlaceholderScreen
          title="History"
          body="Workout history is still wired through the premium trigger layer and now returns to the menu instead of dropping you back home."
          onBack={goBack}
          premiumHint
        />
        <PremiumPaywall isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
      </>
    );
  }

  if (page === 'nutrition') {
    return (
      <>
        <NutritionScreen onBack={goBack} onOpenPaywall={openPremium} />
        <PremiumPaywall isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
      </>
    );
  }

  if (page === 'settings') {
    return (
      <>
        <SettingsScreen onBack={goBack} />
        <PremiumPaywall isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
      </>
    );
  }

  if (page === 'daily') {
    return (
      <>
        <DailyCheckInScreen onClose={goBack} onStartWorkout={handleStartWorkout} />
        <PremiumPaywall isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black px-4 pb-6 pt-4 text-white">
        <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-2xl flex-col">
          <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-3 pt-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/[0.04] to-transparent" />

            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="rounded-[20px] border border-white/10 bg-black/35 px-3.5 py-2.5 backdrop-blur-sm">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-lime-300/80">
                  Current level
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm font-black text-white">
                  <Flame className="h-4 w-4 text-lime-300" />
                  LVL {level}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {premiumActive ? (
                  <div className="inline-flex h-11 items-center gap-2 rounded-[18px] border border-yellow-300/20 bg-yellow-300/10 px-3 text-[11px] font-black uppercase tracking-[0.14em] text-yellow-100 backdrop-blur-sm">
                    <Crown className="h-3.5 w-3.5" />
                    Premium
                  </div>
                ) : null}

                <button
                  onClick={() => setMenuOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-black/35 backdrop-blur-sm transition hover:bg-white/[0.09]"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="relative z-0 -mt-2 px-2 pb-2">
              <GymRatStage
                level={level}
                variant={variant}
                showMeta={false}
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-3 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                  XP progress
                </div>
                <div className="mt-1 text-sm font-bold text-white/80">
                  {currentLevelXP} / {nextLevelXP} XP
                </div>
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-bold text-white/55">
                <Sparkles className="h-3.5 w-3.5" />
                {progressPercent}%
              </div>
            </div>

            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-lime-300 transition-[width] duration-500"
                style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
              />
            </div>
          </div>

          <div className="mt-auto grid gap-3 pt-4">
            <button
              onClick={() => handleStartWorkout()}
              className="inline-flex min-h-[56px] items-center justify-center rounded-[24px] bg-lime-300 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.2)] transition hover:brightness-105"
            >
              Start workout
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigateTo('gallery', 'home')}
                className="inline-flex min-h-[50px] items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/[0.08]"
              >
                Level gallery
              </button>

              <button
                onClick={() => navigateTo('shop', 'home')}
                className="inline-flex min-h-[50px] items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/[0.08]"
              >
                Shop
              </button>
            </div>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <AppMenu
          isPremium={premiumActive}
          onClose={() => setMenuOpen(false)}
          onOpenDaily={() => navigateTo('daily', 'menu')}
          onOpenHistory={() => {
            maybeOpenHistoryPaywall({
              onOpened: () => {
                setMenuOpen(false);
                setPaywallOpen(true);
              },
              onAllowed: () => navigateTo('history', 'menu'),
            });
          }}
          onOpenNutrition={() => {
            maybeOpenNutritionPaywall({
              onOpened: () => {
                setMenuOpen(false);
                setPaywallOpen(true);
              },
              onAllowed: () => navigateTo('nutrition', 'menu'),
            });
          }}
          onOpenGallery={() => navigateTo('gallery', 'menu')}
          onOpenShop={() => navigateTo('shop', 'menu')}
          onOpenSettings={() => navigateTo('settings', 'menu')}
          onOpenPremium={openPremium}
        />
      ) : null}

      <PremiumPaywall isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </>
  );
}