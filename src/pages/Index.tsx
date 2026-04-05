import { useEffect, useMemo, useState } from 'react';
import WorkoutFlow from '@/components/WorkoutFlow';
import WorkoutComplete from '@/components/WorkoutComplete';
import GymRatGallery from '@/components/GymRatGallery';
import RatShop from '@/components/RatShop';
import AppMenu from '@/components/AppMenu';
import GymRatStage from '@/components/GymRatStage';
import DailyCheckInScreen from '@/components/DailyCheckInScreen';

import { getTotalXP, getLevelFromXP } from '@/lib/gamificationStore';
import { getEquipped } from '@/lib/shopStore';
import { isPremium } from '@/lib/premiumStore';
import {
  buildAdaptiveWorkoutForFocus,
  getPresetWorkoutForFocus,
  type FocusArea,
  type GeneratedWorkout,
} from '@/lib/adaptiveWorkout';
import { ensureDailyReminder, shouldShowDailyCheckInToday } from '@/lib/notifications';
import { getStreakSummary } from '@/lib/streakStore';

type AppPage =
  | 'home'
  | 'workout'
  | 'complete'
  | 'gallery'
  | 'shop';

type WorkoutSummary = {
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
  prs?: Array<{
    exercise: string;
    newWeight: number;
    previousBest: number;
  }>;
};

function getDefaultWorkout(premium: boolean): GeneratedWorkout {
  return premium
    ? buildAdaptiveWorkoutForFocus('chest')
    : getPresetWorkoutForFocus('chest');
}

export default function Index() {
  const [page, setPage] = useState<AppPage>('home');
  const [lastWorkoutSummary, setLastWorkoutSummary] = useState<WorkoutSummary | null>(null);
  const [showDaily, setShowDaily] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<GeneratedWorkout | null>(null);
  const [streak, setStreak] = useState(() => getStreakSummary());

  const premium = useMemo(() => isPremium(), []);
  const xp = getTotalXP();
  const level = getLevelFromXP(xp);
  const equipped = getEquipped();

  useEffect(() => {
    void ensureDailyReminder({
      hour: 18,
      minute: 0,
    });

    if (shouldShowDailyCheckInToday()) {
      setShowDaily(true);
    }

    setStreak(getStreakSummary());
  }, []);

  const refreshStreak = () => {
    setStreak(getStreakSummary());
  };

  const handleStartWorkout = (focus: FocusArea = 'chest') => {
    const workout = premium
      ? buildAdaptiveWorkoutForFocus(focus)
      : getPresetWorkoutForFocus(focus);

    setActiveWorkout(workout);
    setShowDaily(false);
    setPage('workout');
  };

  const handleStartDefaultWorkout = () => {
    const workout = getDefaultWorkout(premium);
    setActiveWorkout(workout);
    setShowDaily(false);
    setPage('workout');
  };

  const handleStartWalk = () => {
    const workout = premium
      ? buildAdaptiveWorkoutForFocus('walk')
      : getPresetWorkoutForFocus('walk');

    setActiveWorkout(workout);
    setShowDaily(false);
    setPage('workout');
  };

  const handleWorkoutComplete = (summary: WorkoutSummary) => {
    setLastWorkoutSummary(summary);
    refreshStreak();
    setPage('complete');
  };

  const handleGoHome = () => {
    refreshStreak();
    setPage('home');
  };

  if (page === 'workout' && activeWorkout) {
    return (
      <WorkoutFlow
        workout={activeWorkout}
        onComplete={handleWorkoutComplete}
      />
    );
  }

  if (page === 'complete' && lastWorkoutSummary) {
    return (
      <WorkoutComplete
        summary={lastWorkoutSummary}
        onContinue={handleGoHome}
      />
    );
  }

  if (page === 'gallery') {
    return <GymRatGallery onBack={handleGoHome} />;
  }

  if (page === 'shop') {
    return <RatShop onBack={handleGoHome} />;
  }

  const xpProgress = xp % 100;

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {showDaily && (
        <DailyCheckInScreen
          onClose={() => setShowDaily(false)}
          onStartWorkout={(focus) => handleStartWorkout(focus ?? 'chest')}
        />
      )}

      <div className="absolute top-4 right-4 z-20">
        <AppMenu />
      </div>

      <div className="flex flex-col items-center justify-center h-[65vh] px-4">
        <div className="w-full max-w-[320px]">
          <GymRatStage level={level} equipped={equipped} />
        </div>

        <div className="w-full max-w-[280px] mt-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${xpProgress}%` }}
            />
          </div>

          <p className="text-xs text-center mt-1 text-muted-foreground">
            Level {level}
          </p>

          <div className="mt-3 text-center">
            <p className="text-sm font-semibold">
              🔥 {streak.currentStreak} streak
            </p>

            {streak.isAtRisk && (
              <p className="text-xs text-primary mt-1">
                Your streak is at risk today — even a walk keeps it alive
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 text-center px-6">
          <p className="text-xs text-muted-foreground">
            {premium
              ? 'Adaptive training and smart progression are active.'
              : 'Free mode uses preset workouts. Upgrade for adaptive coaching.'}
          </p>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-3">
        <button
          onClick={handleStartDefaultWorkout}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg"
        >
          Start Workout
        </button>

        <button
          onClick={handleStartWalk}
          className="w-full bg-secondary py-3 rounded-2xl font-semibold"
        >
          Start Walk
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setPage('gallery')}
            className="flex-1 bg-secondary py-3 rounded-xl"
          >
            Gallery
          </button>

          <button
            onClick={() => setPage('shop')}
            className="flex-1 bg-secondary py-3 rounded-xl"
          >
            Shop
          </button>
        </div>
      </div>
    </div>
  );
}