import { useEffect, useMemo, useState } from 'react';
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
    <div className="min-h-screen bg-[#0a0d12] px-4 py-6 text-white">
      <div className="mx-auto max-w-xl">
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(245,158,11,0.10),rgba(255,255,255,0.03))] p-6 shadow-[0_16px_60px_rgba(0,0,0,0.35)]">
          {step === 1 && (
            <>
              <div className="inline-flex items-center rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                GymRat
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight">Set your base</h1>
              <p className="mt-2 text-sm text-white/65">
                Quick setup first. Then straight to your start screen.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-white/70">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-white/70">Weight</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-white/70">Gender</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
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

                <button
                  onClick={() => setStep(2)}
                  type="button"
                  className="mt-6 w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-black"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="inline-flex items-center rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                GymRat
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight">Training level</h1>
              <p className="mt-2 text-sm text-white/65">
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
                    <div className="mt-1 text-sm text-white/60">{option.desc}</div>
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
            openPaywall();
          }}
          onOpenShop={() => {
            openPaywall();
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

      <AppMenu
        open={menuOpenLocal}
        onClose={closeMenu}
        isPremium={premium}
        hasTrainingLevel={Boolean(getProfile()?.trainingLevel)}
        onOpenPremium={() => {
          closeMenu();
          openPaywall();
        }}
        onOpenNutrition={() => {
          closeMenu();
          changePage('nutrition');
        }}
        onOpenHistory={() => {
          closeMenu();
          changePage('history');
        }}
        onOpenCustomWorkout={() => {
          closeMenu();
          startWorkout();
        }}
        onOpenLevelSelect={() => {
          closeMenu();
          changePage('settings');
        }}
      />

      <PremiumPaywall
        open={paywallOpenLocal}
        onClose={closePaywall}
      />
    </>
  );
}