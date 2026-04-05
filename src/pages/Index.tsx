import { useEffect, useMemo, useState } from 'react';
import { Crown, Flame, Menu, Sparkles } from 'lucide-react';

import AppMenu from '@/components/AppMenu';
import DailyCheckInScreen from '@/components/DailyCheckInScreen';
import GymRatGallery from '@/components/GymRatGallery';
import GymRatStage from '@/components/GymRatStage';
import RatShop from '@/components/RatShop';
import WorkoutComplete from '@/components/WorkoutComplete';
import WorkoutFlow from '@/components/WorkoutFlow';

import PremiumPaywall from '@/components/PremiumPaywall';
import { getAppState, setAppState } from '@/lib/appStore';
import { addXP, getLevelFromXP, getProgressPercent, getTotalXP } from '@/lib/gamificationStore';
import { addWorkoutHistory, detectPRs, type ExerciseEntry, type MuscleGroup } from '@/lib/historyStore';
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
  maybeOpenNutritionPaywall,
  maybeOpenHistoryPaywall,
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
  focusArea: Extract<MuscleGroup, 'chest' | 'back' | 'arms' | 'legs'>;
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

const DAILY_CHECKIN_DISMISS_KEY = 'gymrat-daily-checkin-dismissed-date';

function isBrowser() {
  return typeof window !== 'undefined';
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function shouldShowDailyCheckIn(): boolean {
  if (!isBrowser()) return false;
  return localStorage.getItem(DAILY_CHECKIN_DISMISS_KEY) !== getTodayKey();
}

function dismissDailyCheckInToday() {
  if (!isBrowser()) return;
  localStorage.setItem(DAILY_CHECKIN_DISMISS_KEY, getTodayKey());
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
  focusArea: WorkoutCompleteResult['focusArea'],
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
    <div className="min-h-screen bg-black px-5 py-6 text-white">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold"
      >
        ← Back
      </button>

      <div className="rounded-[32px] border border-white/10 bg-zinc-950/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-lime-200">
          <Sparkles className="h-3.5 w-3.5" />
          Production-safe placeholder
        </div>

        <h1 className="text-2xl font-black tracking-tight">{title}</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-zinc-300">{body}</p>

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
    <div className="min-h-screen bg-black px-5 py-6 text-white">
      <div className="mx-auto max-w-md rounded-[32px] border border-white/10 bg-zinc-950/90 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.48)]">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-lime-200">
          <Flame className="h-3.5 w-3.5" />
          GymRat setup
        </div>

        <h1 className="text-3xl font-black tracking-tight">Build your rat</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-300">
          First-time setup only. Keep it simple, save it clean, and get straight into the app.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-zinc-200">Height (cm)</label>
            <input
              value={form.height}
              onChange={(event) => setForm((current) => ({ ...current, height: event.target.value }))}
              inputMode="numeric"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-lime-300"
              placeholder="180"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-zinc-200">Weight (kg)</label>
            <input
              value={form.weight}
              onChange={(event) => setForm((current) => ({ ...current, weight: event.target.value }))}
              inputMode="numeric"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-lime-300"
              placeholder="80"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-zinc-200">Age</label>
            <input
              value={form.age}
              onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))}
              inputMode="numeric"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-lime-300"
              placeholder="28"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-zinc-200">Gender</label>
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
          </div>

          <div>
            <label className="text-sm font-semibold text-zinc-200">Goal</label>
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
          </div>
        </div>

        <button
          type="button"
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
  const initialAppState = useMemo(() => getAppState(), []);
  const [page, setPage] = useState<AppPage>(
    hasCompletedOnboarding() ? initialAppState.page : 'settings',
  );
  const [menuOpen, setMenuOpen] = useState(initialAppState.overlay === 'menu');
  const [paywallOpen, setPaywallOpen] = useState(initialAppState.overlay === 'paywall');
  const [showDaily, setShowDaily] = useState(
    initialAppState.showDailyCheckIn && hasCompletedOnboarding(),
  );
  const [lastSummary, setLastSummary] = useState<WorkoutCompleteSummary | null>(null);
  const [profileVersion, setProfileVersion] = useState(0);
  const [premiumVersion, setPremiumVersion] = useState(0);

  const totalXP = useMemo(() => getTotalXP(), [lastSummary, profileVersion]);
  const level = useMemo(() => getLevelFromXP(totalXP), [totalXP]);
  const progressPercent = useMemo(() => getProgressPercent(totalXP), [totalXP]);
  const premiumActive = useMemo(() => checkPremium().isActive, [premiumVersion]);
  const variant = useMemo(() => getRatVariant(), [profileVersion]);

  useEffect(() => {
    void setupDailyReminder();
    void refreshSmartNotifications();

    if (!hasCompletedOnboarding()) {
      setPage('settings');
      setShowDaily(false);
      return;
    }

    if (shouldShowDailyCheckIn()) {
      setShowDaily(true);
      setAppState({ page: 'daily', showDailyCheckIn: true, overlay: 'none' });
      setPage('daily');
    } else {
      setShowDaily(false);
      setAppState({ page: 'home', showDailyCheckIn: false, overlay: 'none' });
      setPage('home');
    }
  }, []);

  useEffect(() => {
    setAppState({
      page,
      overlay: menuOpen ? 'menu' : paywallOpen ? 'paywall' : 'none',
      showDailyCheckIn: showDaily,
    });
  }, [page, menuOpen, paywallOpen, showDaily]);

  useEffect(() => {
    const syncPremium = () => setPremiumVersion((value) => value + 1);

    window.addEventListener('storage', syncPremium);
    window.addEventListener('focus', syncPremium);
    window.addEventListener('premium-updated', syncPremium as EventListener);

    return () => {
      window.removeEventListener('storage', syncPremium);
      window.removeEventListener('focus', syncPremium);
      window.removeEventListener('premium-updated', syncPremium as EventListener);
    };
  }, []);

  const closeAllOverlays = () => {
    setMenuOpen(false);
    setPaywallOpen(false);
  };

  const openHome = () => {
    closeAllOverlays();
    setShowDaily(false);
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
    saveProfile({
      height: values.height ? Number(values.height) : null,
      weight: values.weight ? Number(values.weight) : null,
      age: values.age ? Number(values.age) : null,
      gender: values.gender,
      goal: values.goal,
      onboardingComplete: true,
    });

    setProfileVersion((value) => value + 1);

    if (shouldShowDailyCheckIn()) {
      setShowDaily(true);
      setPage('daily');
    } else {
      setShowDaily(false);
      setPage('home');
    }
  };

  const handleDismissDaily = () => {
    dismissDailyCheckInToday();
    setShowDaily(false);
    setPage('home');
  };

  const handleStartWorkout = () => {
    closeAllOverlays();
    setShowDaily(false);
    setPage('workout');
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

    setPage('complete');
    setPremiumVersion((value) => value + 1);

    await refreshSmartNotifications();

    if (prs.length > 0 && !premiumActive) {
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
      <WorkoutFlow
        onBack={openHome}
        onComplete={handleCompleteWorkout}
      />
    );
  }

  if (page === 'complete' && lastSummary) {
    return (
      <>
        <WorkoutComplete
          summary={lastSummary}
          onContinue={openHome}
          onOpenPaywall={openPremium}
        />
        <PremiumPaywall open={paywallOpen} onClose={() => setPaywallOpen(false)} />
      </>
    );
  }

  if (page === 'gallery') {
    return <GymRatGallery onBack={openHome} />;
  }

  if (page === 'shop') {
    return <RatShop onBack={openHome} onOpenPremium={openPremium} />;
  }

  if (page === 'history') {
    return (
      <PlaceholderScreen
        title="Workout history"
        body="History stays reachable without broken navigation, but it is now properly routed through the premium trigger layer when locked."
        onBack={openHome}
        premiumHint
      />
    );
  }

  if (page === 'nutrition') {
    return (
      <PlaceholderScreen
        title="Nutrition"
        body="Nutrition stays reachable without broken navigation, but it is now properly routed through the premium trigger layer when locked."
        onBack={openHome}
        premiumHint
      />
    );
  }

  if (page === 'settings') {
    return (
      <OnboardingScreen
        onComplete={handleOnboardingComplete}
      />
    );
  }

  if (page === 'daily' && showDaily) {
    return (
      <DailyCheckInScreen
        onClose={handleDismissDaily}
        onStartWorkout={() => handleStartWorkout()}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black px-5 pb-8 pt-5 text-white">
        <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-md flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-lime-200">
              <Flame className="h-3.5 w-3.5" />
              Level up in real life
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] transition hover:bg-white/[0.09]"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-zinc-950/90 px-5 pb-6 pt-5 shadow-[0_24px_90px_rgba(0,0,0,0.48)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(163,230,53,0.12),transparent_35%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.05),transparent_30%)]" />

            <div className="relative z-10">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
                    Current form
                  </div>
                  <div className="mt-1 text-2xl font-black tracking-tight">LVL {level}</div>
                </div>

                <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-zinc-300">
                  {premiumActive ? 'Premium active' : 'Base mode'}
                </div>
              </div>

              <GymRatStage
                level={level}
                variant={variant}
                compact={false}
                showMeta={false}
                className="mt-2"
              />

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  <span>XP progress</span>
                  <span>{progressPercent}%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-lime-300 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-[0.14em]">Total XP</span>
                  </div>
                  <div className="mt-2 text-2xl font-black">{totalXP}</div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Crown className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-[0.14em]">Status</span>
                  </div>
                  <div className="mt-2 text-base font-black">
                    {premiumActive ? 'Premium unlocked' : 'Ready to upgrade'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartWorkout}
                className="mt-5 inline-flex min-h-[58px] w-full items-center justify-center rounded-[24px] bg-lime-300 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.2)] transition hover:brightness-105"
              >
                Start workout
              </button>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPage('gallery')}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/[0.08]"
                >
                  Level gallery
                </button>

                <button
                  type="button"
                  onClick={() => setPage('shop')}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/[0.08]"
                >
                  Shop
                </button>
              </div>
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
            setShowDaily(true);
            setPage('daily');
          }}
          onOpenHistory={() => {
            const allowed = maybeOpenHistoryPaywall({
              onOpened: () => {
                setMenuOpen(false);
                setPaywallOpen(true);
              },
              onAllowed: () => {
                setMenuOpen(false);
                setPage('history');
              },
            });

            if (allowed) {
              setPage('history');
            }
          }}
          onOpenNutrition={() => {
            const allowed = maybeOpenNutritionPaywall({
              onOpened: () => {
                setMenuOpen(false);
                setPaywallOpen(true);
              },
              onAllowed: () => {
                setMenuOpen(false);
                setPage('nutrition');
              },
            });

            if (allowed) {
              setPage('nutrition');
            }
          }}
          onOpenGallery={() => {
            setMenuOpen(false);
            setPage('gallery');
          }}
          onOpenShop={() => {
            setMenuOpen(false);
            setPage('shop');
          }}
          onOpenSettings={() => {
            setMenuOpen(false);
            setPage('settings');
          }}
          onOpenPremium={openPremium}
        />
      ) : null}

      <PremiumPaywall open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </>
  );
}