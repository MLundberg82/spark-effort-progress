import { useEffect, useMemo, useState } from 'react';
import SplashScreen from '../components/SplashScreen';
import HomeScreen from '../components/Homescreen';
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
import { saveWorkoutDraft, clearWorkoutDraft } from '../lib/workoutStore';

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
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
        {step === 1 && (
          <>
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">GymRat</p>
              <h1 className="mt-2 text-3xl font-bold">Set your base</h1>
              <p className="mt-2 text-sm text-zinc-400">
                Quick setup first. Then straight to your start screen.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-zinc-300">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Weight</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['male', 'female', 'non-binary'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setGender(option)}
                      type="button"
                      className={`rounded-2xl px-3 py-3 text-sm transition ${
                        gender === option
                          ? 'bg-emerald-500 text-black font-semibold'
                          : 'bg-white/5 text-white border border-white/10'
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
                className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-black"
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">GymRat</p>
              <h1 className="mt-2 text-3xl font-bold">Training level</h1>
              <p className="mt-2 text-sm text-zinc-400">
                Pick your experience level, then we drop you into the app.
              </p>
            </div>

            <div className="space-y-3">
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
                  <p className="font-bold">{option.label}</p>
                  <p className="mt-1 text-sm text-zinc-400">{option.desc}</p>
                </button>
              ))}

              <div className="grid grid-cols-2 gap-3 pt-2">
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [page, setPage] = useState<AppPage>(getCurrentPage());
  const [profileReady, setProfileReady] = useState(Boolean(getProfile()));
  const [menuOpen, setMenuOpenLocal] = useState(getUIState().menuOpen);
  const [paywallOpen, setPaywallOpenLocal] = useState(getUIState().paywallOpen);
  const [finishedWorkout, setFinishedWorkout] = useState<FinishedWorkout | null>(null);
  const [navStack, setNavStack] = useState<AppPage[]>([]);

  const stats = useMemo(() => getAppStats(), [page, finishedWorkout, paywallOpen, menuOpen, profileReady]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const changePage = (nextPage: AppPage, pushHistory = true) => {
    if (pushHistory && page !== nextPage) {
      setNavStack((current) => [...current, page]);
    }
    setCurrentPage(nextPage);
    setPage(nextPage);
  };

  const goBack = () => {
    setNavStack((current) => {
      const copy = [...current];
      const previous = copy.pop();

      if (previous) {
        setCurrentPage(previous);
        setPage(previous);
      } else {
        setCurrentPage('home');
        setPage('home');
      }

      return copy;
    });
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

  const handleWorkoutFinish = (result: Omit<FinishedWorkout, 'earnedXP'>) => {
    const earnedXP = Math.max(50, result.exercisesCompleted * 20 + Math.floor(result.volume / 100));

    addWorkoutHistory({
      workoutName: result.workoutName,
      durationMinutes: result.durationMinutes,
      exercisesCompleted: result.exercisesCompleted,
      volume: result.volume,
      completedAt: new Date().toISOString(),
    });

    addXP(earnedXP);
    clearWorkoutDraft();

    const summary: FinishedWorkout = { ...result, earnedXP };
    setWorkoutSummary(summary);
    setFinishedWorkout(summary);
    setCurrentPage('complete');
    setPage('complete');
  };

  const startWorkout = () => {
    saveWorkoutDraft({ startedAt: new Date().toISOString() });
    changePage('workout');
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!profileReady) {
    return <OnboardingGate onComplete={() => setProfileReady(true)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {page === 'home' && (
        <HomeScreen
          stats={stats}
          onOpenMenu={openMenu}
          onStartWorkout={startWorkout}
        />
      )}

      {page === 'workout' && (
        <WorkoutFlow
          onCancel={goBack}
          onFinish={handleWorkoutFinish}
          onOpenPaywall={openPaywall}
        />
      )}

      {page === 'complete' && finishedWorkout && (
        <WorkoutComplete
          summary={finishedWorkout}
          onGoHome={() => {
            setNavStack([]);
            setCurrentPage('home');
            setPage('home');
          }}
          onOpenPaywall={openPaywall}
        />
      )}

      {page === 'history' && <HistoryScreen onBack={goBack} />}
      {page === 'nutrition' && <NutritionScreen onBack={goBack} onOpenPaywall={openPaywall} />}
      {page === 'shop' && <ShopScreen onBack={goBack} onOpenPaywall={openPaywall} />}
      {page === 'settings' && <SettingsScreen onBack={goBack} />}
      {page === 'daily' && <DailyCheckInScreen onBack={goBack} />}

      <AppMenu
        open={menuOpen}
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

      <PremiumPaywall open={paywallOpen} onClose={closePaywall} />
    </div>
  );
}