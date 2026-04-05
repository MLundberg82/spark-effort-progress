import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Dumbbell, Flame, Target, User, Weight } from 'lucide-react';
import SplashScreen from '../components/SplashScreen';
import HomeScreen from '../components/HomeScreen';
import WorkoutFlow from '../components/WorkoutFlow';
import WorkoutComplete from '../components/WorkoutComplete';
import WorkoutStartScreen from '../components/WorkoutStartScreen';
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
import {
  addWorkoutHistory,
  type FocusArea,
  type WorkoutExerciseDetail,
} from '../lib/historyStore';
import { clearWorkoutDraft, saveWorkoutDraft } from '../lib/workoutStore';
import { checkPremium, subscribePremium } from '../lib/premiumStore';
import {
  getPlansForLevel,
  setSelectedPlanIndex,
  setTrainingLevel,
} from '../lib/trainingStore';
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
  focusArea: FocusArea;
  details: WorkoutExerciseDetail[];
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
    existing?.trainingLevel ?? 'beginner',
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
    setTrainingLevel(trainingLevel);
    completeOnboarding();
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(132,204,22,0.12),transparent_32%),linear-gradient(180deg,#0b0b0d_0%,#111214_100%)] px-4 py-8 text-white">
      <div className="mx-auto max-w-xl rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.4)] backdrop-blur">
        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-lime-300">
          First launch setup
        </div>
        <h1 className="mt-2 text-4xl font-black">GymRat</h1>
        <p className="mt-3 text-sm text-white/65">
          Quick setup once. Then straight into the app with a premium feel from start.
        </p>

        <div className="mt-6 flex gap-2">
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
            <h2 className="text-xl font-bold">Base profile</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs uppercase tracking-[0.16em] text-white/45">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.16em] text-white/45">
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
                <label className="text-xs uppercase tracking-[0.16em] text-white/45">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="text-xs uppercase tracking-[0.16em] text-white/45">Gender</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(['male', 'female', 'non-binary'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setGender(option)}
                    className={`rounded-2xl px-3 py-3 text-sm capitalize transition ${
                      gender === option
                        ? 'bg-emerald-400 font-semibold text-black'
                        : 'border border-white/10 bg-white/[0.04] text-white'
                    }`}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canStepOneContinue}
              className="mt-6 w-full rounded-2xl bg-emerald-400 px-4 py-3 font-black uppercase tracking-[0.14em] text-black transition disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold">Training goal</h2>

            <div className="mt-4 space-y-3">
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
                  icon: <Target className="h-5 w-5 text-lime-300" />,
                },
                {
                  key: 'build' as const,
                  title: 'Build',
                  desc: 'Push progression and support muscle growth.',
                  icon: <Dumbbell className="h-5 w-5 text-sky-300" />,
                },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setGoal(option.key)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    goal === option.key
                      ? 'border-emerald-400/20 bg-emerald-400/10'
                      : 'border-white/10 bg-white/[0.04]'
                  }`}
                  type="button"
                >
                  <div className="flex items-start gap-3">
                    {option.icon}
                    <div>
                      <div className="font-bold">{option.title}</div>
                      <div className="mt-1 text-sm text-white/60">{option.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold"
                type="button"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 rounded-2xl bg-emerald-400 px-4 py-3 font-black uppercase tracking-[0.14em] text-black"
                type="button"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold">Training level</h2>

            <div className="mt-4 space-y-3">
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
                  onClick={() => setTrainingLevelValue(option.key)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    trainingLevel === option.key
                      ? 'border-emerald-400/20 bg-emerald-400/10'
                      : 'border-white/10 bg-white/[0.04]'
                  }`}
                  type="button"
                >
                  <div className="font-bold">{option.label}</div>
                  <div className="mt-1 text-sm text-white/60">{option.desc}</div>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/65">
              Nutrition will auto-follow your goal. Goal + body data carry into nutrition
              automatically, so the app feels connected from day one.
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold"
                type="button"
              >
                Back
              </button>
              <button
                onClick={finish}
                className="flex-1 rounded-2xl bg-emerald-400 px-4 py-3 font-black uppercase tracking-[0.14em] text-black"
                type="button"
              >
                Start app
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsFallback({ onBack }: { onBack: () => void }) {
  const profile = getProfile();

  return (
    <div className="min-h-screen bg-[#0b0b0d] px-4 py-5 text-white">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold"
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
            Settings
          </div>
          <h1 className="mt-2 text-3xl font-black">Profile & control</h1>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/45">Gender</div>
              <div className="mt-2 text-lg font-bold">{profile?.gender ?? '-'}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/45">Goal</div>
              <div className="mt-2 text-lg font-bold">{profile?.goal ?? '-'}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/45">
                Training level
              </div>
              <div className="mt-2 text-lg font-bold">{profile?.trainingLevel ?? '-'}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/45">Weight</div>
              <div className="mt-2 text-lg font-bold">
                {profile?.weight ? `${profile.weight} kg` : '-'}
              </div>
            </div>
          </div>

          <p className="mt-5 text-sm text-white/60">
            Full settings screen can be polished later. This fallback keeps the app runnable now.
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
    isOnboardingComplete() && Boolean(getProfile()),
  );
  const [menuOpenLocal, setMenuOpenLocal] = useState(getUIState().menuOpen);
  const [paywallOpenLocal, setPaywallOpenLocal] = useState(getUIState().paywallOpen);
  const [finishedWorkout, setFinishedWorkout] = useState<FinishedWorkout | null>(null);
  const [premium, setPremium] = useState(checkPremium().isActive);
  const [showWorkoutStart, setShowWorkoutStart] = useState(false);

  const stats = useMemo(
    () => getAppStats(),
    [
      page,
      finishedWorkout,
      menuOpenLocal,
      paywallOpenLocal,
      profileReady,
      premium,
      showWorkoutStart,
    ],
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
    focusArea: FocusArea;
    details: WorkoutExerciseDetail[];
  }) => {
    const earnedXP = Math.max(
      50,
      result.exercisesCompleted * 20 + Math.floor(result.volume / 100),
    );

    addWorkoutHistory({
      workoutName: result.workoutName,
      durationMinutes: result.durationMinutes,
      exercisesCompleted: result.exercisesCompleted,
      volume: result.volume,
      completedAt: new Date().toISOString(),
      focusArea: result.focusArea,
      details: result.details,
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

  const openWorkoutStart = () => {
    const profile = getProfile();
    if (profile?.trainingLevel) {
      setTrainingLevel(profile.trainingLevel);
    }
    setShowWorkoutStart(true);
  };

  const startPresetWorkout = (planIndex: number) => {
    const profile = getProfile();
    const level = profile?.trainingLevel ?? 'beginner';
    const plans = getPlansForLevel(level);
    const selectedPlan = plans[planIndex] ?? plans[0];
    const defaultDay = selectedPlan?.days?.[0];

    if (profile?.trainingLevel) {
      setTrainingLevel(profile.trainingLevel);
    }

    setSelectedPlanIndex(planIndex);

    saveWorkoutDraft({
      startedAt: new Date().toISOString(),
      workoutName: defaultDay?.label
        ? `${selectedPlan.name} • ${defaultDay.label}`
        : selectedPlan?.name ?? 'Workout',
      notes: JSON.stringify([]),
    });

    setShowWorkoutStart(false);
    changePage('workout');
  };

  const startCustomWorkout = () => {
    const profile = getProfile();

    if (profile?.trainingLevel) {
      setTrainingLevel(profile.trainingLevel);
    }

    saveWorkoutDraft({
      startedAt: new Date().toISOString(),
      workoutName: 'Custom Workout',
      notes: JSON.stringify([]),
    });

    setShowWorkoutStart(false);
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
      {!showWorkoutStart && page === 'home' && (
        <HomeScreen
          stats={stats}
          onOpenMenu={openMenu}
          onStartWorkout={openWorkoutStart}
          onOpenGallery={() => changePage('gallery')}
          onOpenShop={() => changePage('shop')}
        />
      )}

      {showWorkoutStart && (
        <WorkoutStartScreen
          isPremium={premium}
          onBack={() => setShowWorkoutStart(false)}
          onStartPreset={startPresetWorkout}
          onStartCustom={startCustomWorkout}
          onOpenPremium={() => {
            openManualPaywall(openPaywall);
          }}
        />
      )}

      {!showWorkoutStart && page === 'workout' && (
        <WorkoutFlow
          onBack={() => changePage('home')}
          onComplete={handleWorkoutFinish}
        />
      )}

      {!showWorkoutStart && page === 'complete' && finishedWorkout && (
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

      {!showWorkoutStart && page === 'history' && (
        <HistoryScreen onBack={() => changePage('home')} />
      )}

      {!showWorkoutStart && page === 'nutrition' && (
        <NutritionScreen
          onBack={() => changePage('home')}
          onOpenPaywall={nutritionHandler}
        />
      )}

      {!showWorkoutStart && page === 'daily' && (
        <DailyCheckInScreen onBack={() => changePage('home')} />
      )}

      {!showWorkoutStart && page === 'gallery' && (
        <GymRatGallery onBack={() => changePage('home')} />
      )}

      {!showWorkoutStart && page === 'shop' && (
        <RatShop
          onBack={() => changePage('home')}
          onOpenPremium={() => openManualPaywall(openPaywall)}
        />
      )}

      {!showWorkoutStart &&
        page === 'settings' &&
        (typeof SettingsScreen === 'function' ? (
          <SettingsScreen onBack={() => changePage('home')} />
        ) : (
          <SettingsFallback onBack={() => changePage('home')} />
        ))}

      {!showWorkoutStart && menuOpenLocal && (
        <AppMenu
          isPremium={premium}
          onClose={() => {
            closeMenu();
            changePage('home');
          }}
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

      {!showWorkoutStart && paywallOpenLocal && (
        <PremiumPaywall open={paywallOpenLocal} onClose={closePaywall} />
      )}
    </>
  );
}