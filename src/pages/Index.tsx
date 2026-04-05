import { useEffect, useMemo, useState } from 'react';
import {
  Dumbbell,
  Flame,
  Ruler,
  Sparkles,
  Target,
  User,
  Weight,
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
  const [trainingLevel, setTrainingLevel] = useState<TrainingLevel>(
    existing?.trainingLevel ?? 'beginner'
  );

  const shellClass =
    'min-h-screen bg-[#09090b] px-4 pb-8 pt-6 text-white';
  const wrapClass = 'mx-auto max-w-[430px]';
  const cardClass =
    'overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]';
  const inputClass =
    'mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400';
  const optionClass = 'rounded-2xl border px-4 py-4 text-left transition';

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
    <div className={shellClass}>
      <div className={wrapClass}>
        <div className={cardClass}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>First launch setup</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white">
            GymRat
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/65">
            Quick setup once. Then straight into the app with a premium feel from start.
          </p>

          <div className="mt-5 flex items-center gap-2">
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
              <h2 className="text-xl font-black text-white">Base profile</h2>

              <label className="mt-4 block text-sm text-white/70">
                <span className="mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Age
                </span>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className={inputClass}
                />
              </label>

              <label className="mt-4 block text-sm text-white/70">
                <span className="mb-2 flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Height (cm)
                </span>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className={inputClass}
                />
              </label>

              <label className="mt-4 block text-sm text-white/70">
                <span className="mb-2 flex items-center gap-2">
                  <Weight className="h-4 w-4" />
                  Weight (kg)
                </span>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className={inputClass}
                />
              </label>

              <div className="mt-5">
                <p className="mb-3 text-sm font-semibold text-white/75">Gender</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['male', 'female', 'non-binary'] as const).map((option) => (
                    <button
                      key={option}
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

              <button
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
              <h2 className="text-xl font-black text-white">Training goal</h2>

              <div className="mt-4 space-y-3">
                {[
                  {
                    key: 'lose' as const,
                    title: 'Lose',
                    desc: 'Cut body fat and stay high-protein in nutrition.',
                    icon: <Target className="h-4 w-4" />,
                  },
                  {
                    key: 'maintain' as const,
                    title: 'Maintain',
                    desc: 'Stay steady, recover well and keep momentum.',
                    icon: <Flame className="h-4 w-4" />,
                  },
                  {
                    key: 'build' as const,
                    title: 'Build',
                    desc: 'Push progression and support muscle growth.',
                    icon: <Dumbbell className="h-4 w-4" />,
                  },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setGoal(option.key)}
                    className={`${optionClass} w-full ${
                      goal === option.key
                        ? 'border-emerald-400/20 bg-emerald-400/10'
                        : 'border-white/10 bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-white">
                      {option.icon}
                      <span className="font-bold">{option.title}</span>
                    </div>
                    <p className="mt-2 text-sm text-white/65">{option.desc}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold"
                >
                  Back
                </button>
                <button
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
              <h2 className="text-xl font-black text-white">Training level</h2>

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
                    onClick={() => setTrainingLevel(option.key)}
                    className={`${optionClass} w-full ${
                      trainingLevel === option.key
                        ? 'border-emerald-400/20 bg-emerald-400/10'
                        : 'border-white/10 bg-white/[0.04]'
                    }`}
                  >
                    <p className="font-bold text-white">{option.label}</p>
                    <p className="mt-2 text-sm text-white/65">{option.desc}</p>
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-bold text-white">
                  Nutrition will auto-follow your goal
                </p>
                <p className="mt-2 text-sm text-white/65">
                  Goal + body data carry into nutrition automatically, so the app
                  feels connected from day one.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold"
                >
                  Back
                </button>
                <button
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

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [page, setPage] = useState<AppPage>(() => getCurrentPage() as AppPage);
  const [profileReady, setProfileReady] = useState(
    isOnboardingComplete() && Boolean(getProfile())
  );
  const [menuOpenLocal, setMenuOpenLocal] = useState(getUIState().menuOpen);
  const [paywallOpenLocal, setPaywallOpenLocal] = useState(getUIState().paywallOpen);
  const [finishedWorkout, setFinishedWorkout] = useState<FinishedWorkout | null>(null);
  const [premium, setPremium] = useState(checkPremium());

  const stats = useMemo(
    () => getAppStats(),
    [page, finishedWorkout, menuOpenLocal, paywallOpenLocal, profileReady, premium]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribePremium((state) => {
      setPremium(state.isActive);
    });

    return unsubscribe;
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
    openManualPaywall();
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
    setCurrentPage('complete');
    setPage('complete');
  };

  const startWorkout = () => {
    saveWorkoutDraft({
      startedAt: new Date().toISOString(),
    });

    changePage('workout');
  };

  const openHistory = () => {
    if (!premium) {
      maybeOpenHistoryPaywall();
      setPaywallOpen(true);
      setPaywallOpenLocal(true);
      return;
    }

    changePage('history');
  };

  const openNutrition = () => {
    if (!premium) {
      maybeOpenNutritionPaywall();
      setPaywallOpen(true);
      setPaywallOpenLocal(true);
      return;
    }

    changePage('nutrition');
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
            setCurrentPage('home');
            setPage('home');
            setFinishedWorkout(null);
          }}
          onOpenPaywall={openPaywall}
        />
      )}

      {page === 'history' && <HistoryScreen onBack={() => changePage('home')} />}

      {page === 'nutrition' && (
        <NutritionScreen
          onBack={() => changePage('home')}
          onOpenPaywall={openPaywall}
        />
      )}

      {page === 'settings' && (
        <SettingsScreen onBack={() => changePage('home')} />
      )}

      {page === 'daily' && (
        <DailyCheckInScreen onBack={() => changePage('home')} />
      )}

      {page === 'gallery' && (
        <GymRatGallery onBack={() => changePage('home')} />
      )}

      {page === 'shop' && (
        <RatShop
          onBack={() => changePage('home')}
          onOpenPremium={openPaywall}
        />
      )}

      {menuOpenLocal && (
        <AppMenu
          onClose={closeMenu}
          onNavigate={(nextPage) => {
            closeMenu();

            if (nextPage === 'history') {
              openHistory();
              return;
            }

            if (nextPage === 'nutrition') {
              openNutrition();
              return;
            }

            changePage(nextPage);
          }}
          onOpenPaywall={() => {
            closeMenu();
            openPaywall();
          }}
        />
      )}

      {paywallOpenLocal && <PremiumPaywall isOpen={true} onClose={closePaywall} />}
    </>
  );
}