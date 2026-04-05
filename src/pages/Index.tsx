import { useEffect, useMemo, useState } from 'react';
import SplashScreen from '../components/SplashScreen';
import HomeScreen from '../components/HomeScreen';
import WorkoutFlow from '../components/WorkoutFlow';
import WorkoutComplete from '../components/WorkoutComplete';
import HistoryScreen from '../components/HistoryScreen';
import NutritionScreen from '../components/NutritionScreen';
import ShopScreen from '../components/ShopScreen';
import SettingsScreen from '../components/SettingsScreen';
import AppMenu from '../components/AppMenu';
import PremiumPaywall from '../components/PremiumPaywall';
import DailyCheckInScreen from '../components/DailyCheckInScreen';

import {
  completeOnboarding,
  getProfile,
  isOnboardingComplete,
  saveProfile,
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

type FinishedWorkout = {
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
  earnedXP: number;
};

function OnboardingGate({ onComplete }: { onComplete: () => void }) {
  const existing = getProfile();

  const [step, setStep] = useState<1 | 2>(1);
  const [age, setAge] = useState(existing?.age ?? 25);
  const [weight, setWeight] = useState(existing?.weight ?? 75);
  const [gender, setGender] = useState<UserGender>(existing?.gender ?? 'male');
  const [trainingLevel, setTrainingLevel] = useState<TrainingLevel>(
    existing?.trainingLevel ?? 'beginner'
  );

  const finish = () => {
    const nextProfile: UserProfile = {
      age,
      weight,
      gender,
      trainingLevel,
    };

    saveProfile(nextProfile);
    completeOnboarding();
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_24%),linear-gradient(180deg,_#09090b_0%,_#0f172a_100%)] px-4 py-8 text-white">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center">
        <div className="w-full rounded-[32px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          {step === 1 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-400">GymRat</p>
              <h1 className="mt-3 text-3xl font-black">Set your base</h1>
              <p className="mt-2 text-sm text-zinc-400">
                Quick setup first. Then straight to your start screen.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Weight
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Gender
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['male', 'female', 'non-binary'] as const).map((option) => (
                      <button
                        key={option}
                        onClick={() => setGender(option)}
                        type="button"
                        className={`rounded-2xl px-3 py-3 text-sm transition ${
                          gender === option
                            ? 'bg-emerald-500 font-semibold text-black'
                            : 'border border-white/10 bg-white/5 text-white'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                type="button"
                className="mt-6 w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-black"
              >
                Next
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-400">GymRat</p>
              <h1 className="mt-3 text-3xl font-black">Training level</h1>
              <p className="mt-2 text-sm text-zinc-400">
                Pick your experience level, then we drop you into the app.
              </p>

              <div className="mt-6 space-y-3">
                {([
                  { key: 'beginner', label: 'Beginner', desc: 'Simple and direct start' },
                  { key: 'intermediate', label: 'Intermediate', desc: 'Some gym experience already' },
                  { key: 'advanced', label: 'Advanced', desc: 'More serious training base' },
                ] as const).map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setTrainingLevel(option.key)}
                    type="button"
                    className={`w-full rounded-2xl border p-4 text-left ${
                      trainingLevel === option.key
                        ? 'border-emerald-400/20 bg-emerald-400/10'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="mt-1 text-sm text-zinc-400">{option.desc}</div>
                  </button>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep(1)}
                  type="button"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  Back
                </button>
                <button
                  onClick={finish}
                  type="button"
                  className="rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-black"
                >
                  Start
                </button>
              </div>
            </>
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

  const stats = useMemo(
    () => getAppStats(),
    [page, finishedWorkout, menuOpenLocal, paywallOpenLocal, profileReady]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1200);
    return () => window.clearTimeout(timer);
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
    return <OnboardingGate onComplete={() => setProfileReady(true)} />;
  }

  return (
    <>
      {page === 'home' && (
        <HomeScreen
          stats={stats}
          onOpenMenu={openMenu}
          onStartWorkout={startWorkout}
          onOpenGallery={() => {
            // tillfälligt: samma plats som shop/navigation-strukturen har nu
            changePage('shop');
          }}
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
          onGoHome={() => {
            setCurrentPage('home');
            setPage('home');
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

      {page === 'shop' && (
        <ShopScreen
          onBack={() => changePage('home')}
          onOpenPaywall={openPaywall}
        />
      )}

      {page === 'settings' && <SettingsScreen onBack={() => changePage('home')} />}

      {page === 'daily' && <DailyCheckInScreen onBack={() => changePage('home')} />}

<AppMenu
  open={menuOpenLocal}
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

      <PremiumPaywall
        open={paywallOpenLocal}
        onClose={closePaywall}
      />
    </>
  );
}