import { useEffect, useMemo, useState } from 'react';

import AppMenu from '@/components/AppMenu';
import DailyCheckInScreen from '@/components/DailyCheckInScreen';
import GymRatGallery from '@/components/GymRatGallery';
import HomeScreen from '@/components/HomeScreen';
import PremiumPaywall from '@/components/PremiumPaywall';
import SettingsScreen from '@/components/SettingsScreen';
import ShopScreen from '@/components/ShopScreen';
import TrainingLevelSelector from '@/components/TrainingLevelSelector';
import WorkoutFlow from '@/components/WorkoutFlow';
import { getLevelFromXP, getStreak, getTotalXP, isPremium } from '@/lib/gamificationStore';

type ScreenView =
  | 'home'
  | 'training-level'
  | 'daily-check-in'
  | 'food'
  | 'history'
  | 'gallery'
  | 'shop'
  | 'workout'
  | 'settings';

type IndexScreenProps = {
  openPaywall?: (trigger: string) => void;
};

const ONBOARDING_COMPLETED_KEY = 'gymrat-onboarding-completed';

function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
}

function markOnboardingCompleted(): void {
  localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
}

function PlaceholderScreen({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
}) {
  return (
    <div className="min-h-[100dvh] bg-[#06080b] px-4 py-4 text-white">
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center text-center">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-white"
        >
          Back
        </button>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-lime-300/70">
          GymRat
        </p>
        <h1 className="mt-2 text-2xl font-black">{title}</h1>
        <p className="mt-3 max-w-xs text-sm text-white/60">{subtitle}</p>
      </div>
    </div>
  );
}

export default function IndexScreen({ openPaywall }: IndexScreenProps) {
  const [view, setView] = useState<ScreenView>(
    hasCompletedOnboarding() ? 'home' : 'training-level',
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const appState = useMemo(() => {
    const totalXP = getTotalXP();
    const levelData = getLevelFromXP(totalXP);

    return {
      totalXP,
      level: levelData.level,
      currentLevelXP: levelData.currentXP,
      nextLevelXP: levelData.xpToNext,
      totalWorkouts: Number(levelData.level ?? 0) > 0 ? Math.max(0, Math.round(totalXP / 120)) : 0,
      streak: getStreak(),
      premiumActive: isPremium(),
    };
  }, [refreshKey]);

  useEffect(() => {
    const rerender = () => setRefreshKey((prev) => prev + 1);

    window.addEventListener('premium-updated', rerender);
    window.addEventListener('shop-updated', rerender);
    window.addEventListener('profile-updated', rerender);
    window.addEventListener('gymrat-profile-updated', rerender);
    window.addEventListener('storage', rerender);

    return () => {
      window.removeEventListener('premium-updated', rerender);
      window.removeEventListener('shop-updated', rerender);
      window.removeEventListener('profile-updated', rerender);
      window.removeEventListener('gymrat-profile-updated', rerender);
      window.removeEventListener('storage', rerender);
    };
  }, []);

  const goHome = () => {
    setMenuOpen(false);
    setRefreshKey((prev) => prev + 1);
    setView(hasCompletedOnboarding() ? 'home' : 'training-level');
  };

  const openPremium = () => {
    setMenuOpen(false);
    setPremiumOpen(true);
  };

  const triggerPaywall = (trigger = 'manual') => {
    setPremiumOpen(false);
    openPaywall?.(trigger);
  };

  if (view === 'training-level') {
    return (
      <TrainingLevelSelector
        onComplete={() => {
          markOnboardingCompleted();
          setRefreshKey((prev) => prev + 1);
          setView('home');
        }}
      />
    );
  }

  if (view === 'settings') {
    return <SettingsScreen onBack={goHome} />;
  }

  if (view === 'daily-check-in') {
    return (
      <DailyCheckInScreen
        onClose={goHome}
        onStartWorkout={(focus) => {
          setView('workout');
          if (focus) {
            window.sessionStorage.setItem('gymrat-workout-focus', focus);
          }
        }}
      />
    );
  }

  if (view === 'gallery') {
    return <GymRatGallery onBack={goHome} />;
  }

  if (view === 'shop') {
    return (
      <ShopScreen
        onBack={goHome}
        onOpenPaywall={() => triggerPaywall('shop')}
      />
    );
  }

  if (view === 'workout') {
    const focus = window.sessionStorage.getItem('gymrat-workout-focus') as
      | 'chest'
      | 'back'
      | 'arms'
      | 'legs'
      | null;

    return (
      <WorkoutFlow
        onBack={goHome}
        initialFocus={focus ?? undefined}
        onComplete={() => {
          window.sessionStorage.removeItem('gymrat-workout-focus');
          setRefreshKey((prev) => prev + 1);
          setView('home');
        }}
      />
    );
  }

  if (view === 'food') {
    return (
      <PlaceholderScreen
        title="Nutrition"
        subtitle="Keep this stable for now until the premium nutrition flow is reconnected."
        onBack={goHome}
      />
    );
  }

  if (view === 'history') {
    return (
      <PlaceholderScreen
        title="Training History"
        subtitle="Keep this stable for now until the production-ready history flow is reconnected."
        onBack={goHome}
      />
    );
  }

  return (
    <>
      <HomeScreen
        stats={appState}
        onOpenMenu={() => setMenuOpen(true)}
        onStartWorkout={() => setView('workout')}
        onOpenGallery={() => setView('gallery')}
        onOpenShop={() => setView('shop')}
      />

      <AppMenu
        isOpen={menuOpen}
        isPremium={appState.premiumActive}
        onClose={() => setMenuOpen(false)}
        onOpenDaily={() => {
          setMenuOpen(false);
          setView('daily-check-in');
        }}
        onOpenHistory={() => {
          setMenuOpen(false);
          setView('history');
        }}
        onOpenNutrition={() => {
          setMenuOpen(false);
          setView('food');
        }}
        onOpenGallery={() => {
          setMenuOpen(false);
          setView('gallery');
        }}
        onOpenShop={() => {
          setMenuOpen(false);
          setView('shop');
        }}
        onOpenSettings={() => {
          setMenuOpen(false);
          setView('settings');
        }}
        onOpenPremium={openPremium}
      />

      <PremiumPaywall
        isOpen={premiumOpen}
        onClose={() => setPremiumOpen(false)}
      />
    </>
  );
}