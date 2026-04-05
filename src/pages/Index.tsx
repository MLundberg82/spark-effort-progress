import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
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
  const optionClass =
    'rounded-2xl border px-4 py-4 text-left transition';

  const canStepOneContinue =
    age >= 13 &&
    height >= 120 &&
    weight >= 35;

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
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            <Sparkles className="h-4 w-4" />
            First launch setup
          </div>

          <h1 className="text-[2rem] font-black tracking-[-0.04em]">GymRat</h1>
          <p className="mt-2 text-sm text-white/68">
            Quick setup once. Then straight into the app with a premium feel from start.
          </p>

          <div className="mt-4 flex gap-2">
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
              <div className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white/45">
                Base profile
              </div>

              <label className="block">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <User className="h-4 w-4 text-emerald-300" />
                  Age
                </div>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className={inputClass}
                />
              </label>

              <label className="mt-4 block">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Ruler className="h-4 w-4 text-emerald-300" />
                  Height (cm)
                </div>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className={inputClass}
                />
              </label>

              <label className="mt-4 block">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Weight className="h-4 w-4 text-emerald-300" />
                  Weight (kg)
                </div>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className={inputClass}
                />
              </label>

              <div className="mt-4">
                <div className="mb-2 text-sm text-white/70">Gender</div>
                <div className="grid grid-cols-3 gap-2">
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
              <div className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white/45">
                Training goal
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: 'lose' as const,
                    title: 'Lose',
                    desc: 'Cut body fat and stay high-protein in nutrition.',
                  },
                  {
                    key: 'maintain' as const,
                    title: 'Maintain',
                    desc: 'Stay steady, recover well and keep momentum.',
                  },
                  {
                    key: 'build' as const,
                    title: 'Build',
                    desc: 'Push progression and support muscle growth.',
                  },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setGoal(option.key)}
                    className={`${optionClass} w-full ${
                      goal === option.key
                        ? 'border-emerald-400/20 bg-emerald-400/10'
                        : 'border-white/10 bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-base font-bold">
                      <Target className="h-4 w-4 text-emerald-300" />
                      {option.title}
                    </div>
                    <div className="mt-1 text-sm text-white/60">{option.desc}</div>
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
              <div className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white/45">
                Training level
              </div>

              <div className="space-y-3">
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
                    onClick={() => setTrainingLevel(option.key)}
                    className={`${optionClass} w-full ${
                      trainingLevel === option.key
                        ? 'border-emerald-400/20 bg-emerald-400/10'
                        : 'border-white/10 bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-base font-bold">
                      <Dumbbell className="h-4 w-4 text-emerald-300" />
                      {option.label}
                    </div>
                    <div className="mt-1 text-sm text-white/60">{option.desc}</div>
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-300">
                  <Flame className="h-4 w-4" />
                  Nutrition will auto-follow your goal
                </div>
                <p className="text-sm text-white/60">
                  Goal + body data carry into nutrition automatically, so the app feels connected from day one.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold"
                >
                  <span className="inline-flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </span>
                </button>
                <button
                  type="button"
                  onClick={finish}
                  className="flex-1 rounded-2xl bg-white px-4 py-3 font-black uppercase tracking-[0.14em] text-black"
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
  const [page, setPage] = useState(() => getCurrentPage() as AppPage);
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
          onOpenGallery={() => {
            changePage('gallery');
          }}
          onOpenShop={() => {
            changePage('shop');
          }}
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
          onGoHome={() => {
            setCurrentPage('home');
            setPage('home');
          }}
          onOpenPaywall={openPaywall}
        />
      )}

      {page === 'history' && (
        <HistoryScreen
          onBack={() => changePage('home')}
        />
      )}

      {page === 'nutrition' && (
        <NutritionScreen
          onBack={() => changePage('home')}
          onOpenPaywall={openPaywall}
        />
      )}

      {page === 'settings' && (
        <SettingsScreen
          onBack={() => changePage('home')}
        />
      )}

      {page === 'daily' && (
        <DailyCheckInScreen
          onBack={() => changePage('home')}
        />
      )}

      {page === 'gallery' && (
        <div className="min-h-screen bg-[#09090b] px-4 py-4 text-white">
          <div className="mx-auto max-w-[430px]">
            <button
              type="button"
              onClick={() => changePage('home')}
              className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
            >
              Back
            </button>

            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Gallery
              </div>
              <h1 className="text-[2rem] font-black tracking-[-0.04em]">Rat evolution</h1>
              <p className="mt-2 text-sm text-white/65">
                Placeholder page until your full gallery component is wired to this route.
              </p>
            </div>
          </div>
        </div>
      )}

      {page === 'shop' && (
        <div className="min-h-screen bg-[#09090b] px-4 py-4 text-white">
          <div className="mx-auto max-w-[430px]">
            <button
              type="button"
              onClick={() => changePage('home')}
              className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
            >
              Back
            </button>

            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Shop
              </div>
              <h1 className="text-[2rem] font-black tracking-[-0.04em]">Cosmetic loadout</h1>
              <p className="mt-2 text-sm text-white/65">
                Wire your main shop screen here if it is already present in the repo.
              </p>
            </div>
          </div>
        </div>
      )}

      <AppMenu
        open={menuOpenLocal}
        currentPage={page}
        onClose={closeMenu}
        onNavigate={(nextPage) => {
          closeMenu();
          changePage(nextPage);
        }}
        onOpenPaywall={() => {
          closeMenu();
          openPaywall();
        }}
      />

      {paywallOpenLocal && (
        <PremiumPaywall
          open={paywallOpenLocal}
          onClose={closePaywall}
        />
      )}
    </>
  );
}