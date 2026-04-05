import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Crown,
  Dumbbell,
  Flame,
  Target,
  User,
  Weight,
  X,
} from 'lucide-react';

import SplashScreen from '../components/SplashScreen';
import HomeScreen from '../components/HomeScreen';
import WorkoutFlow from '../components/WorkoutFlow';
import WorkoutComplete from '../components/WorkoutComplete';
import HistoryScreen from '../components/HistoryScreen';
import NutritionScreen from '../components/NutritionScreen';
import SettingsScreen from '../components/SettingsScreen';
import AppMenu from '../components/AppMenu';
import PremiumPaywall from '../components/PremiumPaywall';
import DailyCheckInScreen from '../components/DailyCheckInScreen';
import GymRatGallery from '../components/GymRatGallery';
import RatShop from '../components/RatShop';

import {
  completeOnboarding,
  getProfile,
  isOnboardingComplete,
  saveProfile,
  type TrainingGoal,
  type TrainingLevel,
  type UserGender,
  type UserProfile,
} from '../lib/profileStore';

import {
  addXP,
  getAppStats,
  getCurrentPage,
  getUIState,
  setCurrentPage,
  setMenuOpen,
  setPaywallOpen,
  setWorkoutSummary,
  type AppPage,
} from '../lib/appStore';

import { addWorkoutHistory } from '../lib/historyStore';
import { clearWorkoutDraft, saveWorkoutDraft } from '../lib/workoutStore';
import { checkPremium, subscribePremium } from '../lib/premiumStore';
import {
  maybeOpenHistoryPaywall,
  maybeOpenNutritionPaywall,
  openManualPaywall,
} from '../lib/paywallTriggers';

type FinishedWorkout = {
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
  earnedXP: number;
};

function OnboardingGate({ onComplete }: { onComplete: () => void }) {
  const existing = getProfile();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [age, setAge] = useState(existing?.age ?? 25);
  const [height, setHeight] = useState(existing?.height ?? 180);
  const [weight, setWeight] = useState(existing?.weight ?? 75);
  const [gender, setGender] = useState<UserGender>(existing?.gender ?? 'male');
  const [goal, setGoal] = useState<TrainingGoal>(existing?.goal ?? 'maintain');
  const [trainingLevel, setTrainingLevelValue] = useState<TrainingLevel>(
    existing?.trainingLevel ?? 'beginner'
  );

  const canStepOneContinue = age >= 13 && height >= 120 && weight >= 35;

  const finish = () => {
    const nextProfile: UserProfile = {
      age,
      height,
      weight,
      gender,
      goal,
      trainingLevel,
    };

    saveProfile(nextProfile);
    completeOnboarding();
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.16),_transparent_30%),linear-gradient(180deg,_#09090b_0%,_#111113_100%)] px-4 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-[430px]">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
              <Dumbbell className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
                First launch setup
              </p>
              <h1 className="text-3xl font-black">GymRat</h1>
            </div>
          </div>

          <p className="mt-4 text-sm text-zinc-300">
            Quick setup once. Then straight into the app with a premium feel from
            start.
          </p>

          <div className="mt-5 flex gap-2">
            {[1, 2, 3].map((entry) => (
              <div
                key={entry}
                className={`h-2 flex-1 rounded-full ${
                  step >= entry ? 'bg-emerald-400' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="mt-6">
              <h2 className="text-xl font-black">Base profile</h2>

              <div className="mt-4 grid gap-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                    Gender
                  </label>

                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {(['male', 'female', 'non-binary'] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setGender(option)}
                        className={`rounded-2xl px-3 py-3 text-sm capitalize transition ${
                          gender === option
                            ? 'bg-emerald-400 font-semibold text-black'
                            : 'border border-white/10 bg-white/[0.04] text-white'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canStepOneContinue}
                className="mt-6 w-full rounded-2xl bg-emerald-400 px-4 py-3 font-black uppercase tracking-[0.14em] text-black transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="mt-6">
              <h2 className="text-xl font-black">Training goal</h2>

              <div className="mt-4 grid gap-3">
                {[
                  {
                    key: 'lose' as const,
                    title: 'Lose',
                    desc: 'Cut body fat and stay high-protein in nutrition.',
                    icon: <Flame className="h-5 w-5 text-orange-300" />,
                  },
                  {
                    key: 'maintain' as const,
                    title: 'Maintain',
                    desc: 'Stay steady, recover well and keep momentum.',
                    icon: <Target className="h-5 w-5 text-emerald-300" />,
                  },
                  {
                    key: 'build' as const,
                    title: 'Build',
                    desc: 'Push progression and support muscle growth.',
                    icon: <Weight className="h-5 w-5 text-yellow-300" />,
                  },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setGoal(option.key)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      goal === option.key
                        ? 'border-emerald-400/20 bg-emerald-400/10'
                        : 'border-white/10 bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{option.icon}</div>
                      <div className="text-left">
                        <div className="font-bold text-white">{option.title}</div>
                        <div className="mt-1 text-sm text-zinc-300">{option.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 rounded-2xl bg-emerald-400 px-4 py-3 font-black uppercase tracking-[0.14em] text-black"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-6">
              <h2 className="text-xl font-black">Training level</h2>

              <div className="mt-4 grid gap-3">
                {[
                  {
                    key: 'beginner' as const,
                    label: 'Beginner',
                    desc: 'Simple and direct start with lower friction.',
                  },
                  {
                    key: 'intermediate' as const,
                    label: 'Intermediate',
                    desc: 'You already train and want momentum + progression.',
                  },
                  {
                    key: 'advanced' as const,
                    label: 'Advanced',
                    desc: 'Serious training base with stronger identity vibe.',
                  },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setTrainingLevelValue(option.key)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      trainingLevel === option.key
                        ? 'border-emerald-400/20 bg-emerald-400/10'
                        : 'border-white/10 bg-white/[0.04]'
                    }`}
                  >
                    <div className="font-bold text-white">{option.label}</div>
                    <div className="mt-1 text-sm text-zinc-300">{option.desc}</div>
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Nutrition will auto-follow your goal
                </div>
                <p className="mt-2 text-sm text-zinc-300">
                  Goal + body data carry into nutrition automatically, so the app
                  feels connected from day one.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={finish}
                  className="flex-1 rounded-2xl bg-emerald-400 px-4 py-3 font-black uppercase tracking-[0.14em] text-black"
                >
                  Start app
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsFallback({ onBack }: { onBack: () => void }) {
  const profile = getProfile();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#09090b_0%,_#111113_100%)] px-4 py-6 text-white">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mt-4 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06]">
              <User className="h-6 w-6 text-zinc-200" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
                Settings
              </p>
              <h1 className="text-3xl font-black">Profile & control</h1>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Gender
              </p>
              <p className="mt-2 font-semibold text-white">
                {profile?.gender ?? '-'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Goal
              </p>
              <p className="mt-2 font-semibold text-white">{profile?.goal ?? '-'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Training level
              </p>
              <p className="mt-2 font-semibold text-white">
                {profile?.trainingLevel ?? '-'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Weight
              </p>
              <p className="mt-2 font-semibold text-white">
                {profile?.weight ? `${profile.weight} kg` : '-'}
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm text-zinc-400">
            Full settings screen can be polished later. This fallback keeps the app
            runnable now.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [page, setPage] = useState<AppPage>(() => getCurrentPage());
  const [profileReady, setProfileReady] = useState(
    isOnboardingComplete() && Boolean(getProfile())
  );
  const [menuOpenLocal, setMenuOpenLocal] = useState(getUIState().menuOpen);
  const [paywallOpenLocal, setPaywallOpenLocal] = useState(getUIState().paywallOpen);
  const [finishedWorkout, setFinishedWorkout] = useState<FinishedWorkout | null>(
    null
  );
  const [premium, setPremium] = useState(checkPremium().isActive);

  const stats = useMemo(
    () => getAppStats(),
    [page, finishedWorkout, menuOpenLocal, paywallOpenLocal, profileReady, premium]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribePremium((state) => {
      setPremium(state.isActive);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      setPage(getCurrentPage());
      setMenuOpenLocal(getUIState().menuOpen);
      setPaywallOpenLocal(getUIState().paywallOpen);
      setPremium(checkPremium().isActive);
    };

    window.addEventListener('app-store-updated', handleRefresh);
    window.addEventListener('storage', handleRefresh);

    return () => {
      window.removeEventListener('app-store-updated', handleRefresh);
      window.removeEventListener('storage', handleRefresh);
    };
  }, []);

  const changePage = (nextPage: AppPage) => {
    setCurrentPage(nextPage);
    setPage(nextPage);
  };

  const openMenu = () => {
    setMenuOpen(true);
    setMenuOpenLocal(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setMenuOpenLocal(false);
  };

  const openPaywall = () => {
    setPaywallOpen(true);
    setPaywallOpenLocal(true);
  };

  const closePaywall = () => {
    setPaywallOpen(false);
    setPaywallOpenLocal(false);
  };

  const handleWorkoutFinish = (result: {
    workoutName: string;
    durationMinutes: number;
    exercisesCompleted: number;
    volume: number;
  }) => {
    const earnedXP = Math.max(
      50,
      result.exercisesCompleted * 20 + Math.floor(result.volume / 100)
    );

    addWorkoutHistory({
      workoutName: result.workoutName,
      durationMinutes: result.durationMinutes,
      exercisesCompleted: result.exercisesCompleted,
      volume: result.volume,
      completedAt: new Date().toISOString(),
    });

    addXP(earnedXP);
    clearWorkoutDraft();

    const summary: FinishedWorkout = {
      ...result,
      earnedXP,
    };

    setWorkoutSummary(summary);
    setFinishedWorkout(summary);
    changePage('complete');
  };

  const startWorkout = () => {
    saveWorkoutDraft({
      startedAt: new Date().toISOString(),
      workoutName: 'Workout',
    });
    changePage('workout');
  };

  const historyHandler = () => {
    maybeOpenHistoryPaywall({
      isPremium: premium,
      openPaywall,
      onAllowed: () => changePage('history'),
    });
  };

  const nutritionHandler = () => {
    maybeOpenNutritionPaywall({
      isPremium: premium,
      openPaywall,
      onAllowed: () => changePage('nutrition'),
    });
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!profileReady) {
    return (
      <OnboardingGate
        onComplete={() => {
          setProfileReady(true);
          changePage('home');
        }}
      />
    );
  }

  return (
    <>
      {page === 'home' && (
        <HomeScreen
          stats={stats}
          onOpenMenu={openMenu}
          onStartWorkout={startWorkout}
          onOpenGallery={() => changePage('gallery')}
          onOpenShop={() => changePage('shop')}
        />
      )}

      {page === 'workout' && (
        <WorkoutFlow
          onBack={() => changePage('home')}
          onComplete={handleWorkoutFinish}
        />
      )}

      {page === 'complete' && finishedWorkout && (
        <WorkoutComplete
          summary={finishedWorkout}
          onContinue={() => {
            setWorkoutSummary(null);
            setFinishedWorkout(null);
            changePage('home');
          }}
          onOpenPaywall={() => {
            openManualPaywall(openPaywall);
          }}
        />
      )}

      {page === 'history' && <HistoryScreen onBack={() => changePage('home')} />}

      {page === 'nutrition' && (
        <NutritionScreen
          onBack={() => changePage('home')}
          onOpenPaywall={nutritionHandler}
        />
      )}

      {page === 'daily' && <DailyCheckInScreen onBack={() => changePage('home')} />}

      {page === 'gallery' && <GymRatGallery onBack={() => changePage('home')} />}

      {page === 'shop' && (
        <RatShop
          onBack={() => changePage('home')}
          onOpenPremium={() => openManualPaywall(openPaywall)}
        />
      )}

      {page === 'settings' &&
        (typeof SettingsScreen === 'function' ? (
          <SettingsScreen onBack={() => changePage('home')} />
        ) : (
          <SettingsFallback onBack={() => changePage('home')} />
        ))}

      {menuOpenLocal && (
        <AppMenu
          isPremium={premium}
          onClose={closeMenu}
          onOpenDaily={() => {
            closeMenu();
            changePage('daily');
          }}
          onOpenHistory={() => {
            closeMenu();
            historyHandler();
          }}
          onOpenNutrition={() => {
            closeMenu();
            nutritionHandler();
          }}
          onOpenGallery={() => {
            closeMenu();
            changePage('gallery');
          }}
          onOpenShop={() => {
            closeMenu();
            changePage('shop');
          }}
          onOpenSettings={() => {
            closeMenu();
            changePage('settings');
          }}
          onOpenPremium={() => {
            closeMenu();
            openManualPaywall(openPaywall);
          }}
        />
      )}

      {paywallOpenLocal && <PremiumPaywall onClose={closePaywall} />}
    </>
  );
}