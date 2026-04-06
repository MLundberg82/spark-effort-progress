import { useEffect, useState } from 'react';
import { Crown, Flame, Menu, Sparkles } from 'lucide-react';

import AppMenu from '@/components/AppMenu';
import DailyCheckInScreen from '@/components/DailyCheckInScreen';
import GymRatGallery from '@/components/GymRatGallery';
import GymRatStage from '@/components/GymRatStage';
import PremiumPaywall from '@/components/PremiumPaywall';
import RatShop from '@/components/RatShop';
import SettingsScreen from '@/components/SettingsScreen';
import WorkoutComplete from '@/components/WorkoutComplete';
import WorkoutFlow from '@/components/WorkoutFlow';

import { getAppState, setAppState } from '@/lib/appStore';
import {
  addXP,
  getLevelFromXP,
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
  hasCompletedOnboarding,
  getProfile,
  getRatVariant,
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

type OnboardingProfile = {
  height: string;
  weight: string;
  age: string;
  gender: ProfileGender;
  goal: FitnessGoal;
};

function getInitialPage(): AppPage {
  if (!hasCompletedOnboarding()) return 'settings';

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
      <div className="mx-auto max-w-xl rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/80 transition hover:bg-white/[0.08]"
        >
          ← Back
        </button>

        <div className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-lime-300/80">
          Production-safe placeholder
        </div>

        <h1 className="mt-3 text-3xl font-black tracking-tight">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-white/70">{body}</p>

        {premiumHint ? (
          <div className="mt-5 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-3 text-sm text-yellow-100">
            This section is premium-gated and now opens the paywall through the trigger layer.
          </div>
        ) : null}
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

  const [form, setForm] = useState<OnboardingProfile>({
    height: profile.height ? String(profile.height) : '',
    weight: profile.weight ? String(profile.weight) : '',
    age: profile.age ? String(profile.age) : '',
    gender: profile.gender,
    goal: profile.goal,
  });

  return (
    <div className="min-h-screen bg-black px-5 pb-8 pt-8 text-white">
      <div className="mx-auto max-w-xl rounded-[32px] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="text-xs font-black uppercase tracking-[0.22em] text-lime-300/80">
          GymRat setup
        </div>

        <h1 className="mt-3 text-4xl font-black tracking-tight">Build your rat</h1>
        <p className="mt-3 text-sm leading-6 text-white/70">
          First-time setup only. Keep it simple, save it clean, and get straight into the app.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-white/80">Height (cm)</span>
            <input
              value={form.height}
              onChange={(event) =>
                setForm((current) => ({ ...current, height: event.target.value }))
              }
              inputMode="numeric"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-lime-300"
              placeholder="180"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-white/80">Weight (kg)</span>
            <input
              value={form.weight}
              onChange={(event) =>
                setForm((current) => ({ ...current, weight: event.target.value }))
              }
              inputMode="numeric"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-lime-300"
              placeholder="80"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-white/80">Age</span>
            <input
              value={form.age}
              onChange={(event) =>
                setForm((current) => ({ ...current, age: event.target.value }))
              }
              inputMode="numeric"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-lime-300"
              placeholder="28"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-white/80">Gender</span>
            <select
              value={form.gender}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  gender: event.target.value as ProfileGender,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-lime-300"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
            </select>
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-bold text-white/80">Goal</span>
          <select
            value={form.goal}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                goal: event.target.value as FitnessGoal,
              }))
            }
            className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-lime-300"
          >
            <option value="gain">Build muscle</option>
            <option value="maintain">Maintain</option>
            <option value="lose">Lose fat</option>
          </select>
        </label>

        <button
          onClick={() => onComplete(form)}
          className="mt-6 inline-flex min-h-[56px] w-full items-center justify-center rounded-[24px] bg-lime-300 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.2)] transition hover:brightness-105"
        >
          Enter app
        </button>
      </div>
    </div>
  );
}

export default function Index() {
  const initialOverlay = getInitialOverlay();

  const [page, setPage] = useState<AppPage>(getInitialPage);
  const [previousPage, setPreviousPage] = useState<AppPage>('home');
  const [menuOpen, setMenuOpen] = useState(initialOverlay.menuOpen);
  const [paywallOpen, setPaywallOpen] = useState(initialOverlay.paywallOpen);
  const [lastSummary, setLastSummary] = useState<WorkoutCompleteSummary | null>(null);
  const [, setProfileVersion] = useState(0);
  const [, setPremiumVersion] = useState(0);
  const [pendingWorkoutFocus, setPendingWorkoutFocus] = useState<
    SupportedFocusArea | undefined
  >(undefined);

  const totalXP = getTotalXP();
  const level = getLevelFromXP(totalXP);
  const progressPercent = Math.round(getProgressPercent(totalXP));
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

    return () => {
      window.removeEventListener('storage', syncPremium);
      window.removeEventListener('focus', syncPremium);
      window.removeEventListener('premium-updated', syncPremium as EventListener);
      window.removeEventListener(
        'gymrat-profile-updated',
        syncProfile as EventListener,
      );
    };
  }, []);

  const closeAllOverlays = () => {
    setMenuOpen(false);
    setPaywallOpen(false);
  };

  const navigateTo = (nextPage: AppPage) => {
    setPage((currentPage) => {
      if (currentPage !== nextPage) {
        setPreviousPage(currentPage);
      }
      return nextPage;
    });
  };

  const goBack = () => {
    closeAllOverlays();
    setPage((currentPage) => {
      if (currentPage === 'home') return 'home';
      return previousPage || 'home';
    });
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
    saveProfile({
      height: values.height ? Number(values.height) : null,
      weight: values.weight ? Number(values.weight) : null,
      age: values.age ? Number(values.age) : null,
      gender: values.gender,
      goal: values.goal,
      onboardingComplete: true,
    });

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
          body="Workout history is connected through the new premium trigger layer and ready for the next production-safe pass."
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
        <PlaceholderScreen
          title="Nutrition"
          body="Nutrition remains available through the premium trigger flow and is ready for the next compact production-safe screen."
          onBack={goBack}
          premiumHint
        />
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
        <DailyCheckInScreen
          onClose={goBack}
          onStartWorkout={handleStartWorkout}
        />
        <PremiumPaywall isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black px-5 pb-8 pt-6 text-white">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-300/80">
                Current form
              </div>
              <div className="mt-2 flex items-center gap-2 text-white">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm font-black">
                  <Flame className="h-4 w-4" />
                  LVL {level}
                </span>
                {premiumActive ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-yellow-100">
                    <Crown className="h-3.5 w-3.5" />
                    Premium
                  </span>
                ) : null}
              </div>
            </div>

            <button
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] transition hover:bg-white/[0.09]"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5">
            <GymRatStage
              level={level}
              variant={variant}
              showMeta={false}
              className="w-full"
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                XP progress
              </div>
              <div className="mt-2 text-3xl font-black tracking-tight">
                {progressPercent}%
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-lime-300 transition-[width] duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                Total XP
              </div>
              <div className="mt-2 text-3xl font-black tracking-tight">{totalXP}</div>
              <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-white/55">
                <Sparkles className="h-3.5 w-3.5" />
                {premiumActive ? 'Premium unlocked' : 'Ready to upgrade'}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <button
              onClick={() => handleStartWorkout()}
              className="inline-flex min-h-[58px] items-center justify-center rounded-[26px] bg-lime-300 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.2)] transition hover:brightness-105"
            >
              Start workout
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigateTo('gallery')}
                className="inline-flex min-h-[52px] items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/[0.08]"
              >
                Level gallery
              </button>

              <button
                onClick={() => navigateTo('shop')}
                className="inline-flex min-h-[52px] items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/[0.08]"
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
          onOpenDaily={() => {
            setMenuOpen(false);
            navigateTo('daily');
          }}
          onOpenHistory={() => {
            maybeOpenHistoryPaywall({
              onOpened: () => {
                setMenuOpen(false);
                setPaywallOpen(true);
              },
              onAllowed: () => {
                setMenuOpen(false);
                navigateTo('history');
              },
            });
          }}
          onOpenNutrition={() => {
            maybeOpenNutritionPaywall({
              onOpened: () => {
                setMenuOpen(false);
                setPaywallOpen(true);
              },
              onAllowed: () => {
                setMenuOpen(false);
                navigateTo('nutrition');
              },
            });
          }}
          onOpenGallery={() => {
            setMenuOpen(false);
            navigateTo('gallery');
          }}
          onOpenShop={() => {
            setMenuOpen(false);
            navigateTo('shop');
          }}
          onOpenSettings={() => {
            setMenuOpen(false);
            navigateTo('settings');
          }}
          onOpenPremium={openPremium}
        />
      ) : null}

      <PremiumPaywall isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </>
  );
}