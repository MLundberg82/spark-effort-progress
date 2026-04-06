import { useEffect, useMemo, useState } from 'react';

import AppMenu from '@/components/AppMenu';
import DailyCheckInScreen from '@/components/DailyCheckInScreen';
import GymRatGallery from '@/components/GymRatGallery';
import HomeScreen from '@/components/HomeScreen';
import NutritionScreen from '@/components/NutritionScreen';
import PremiumPaywall from '@/components/PremiumPaywall';
import SettingsScreen from '@/components/SettingsScreen';
import ShopScreen from '@/components/ShopScreen';
import WorkoutFlow from '@/components/WorkoutFlow';
import {
  getCurrentLevelXP,
  getLevelFromXP,
  getNextLevelXP,
  getStreak,
  getTotalXP,
} from '@/lib/gamificationStore';
import { checkPremium } from '@/lib/premiumStore';

type ScreenView =
  | 'home'
  | 'daily'
  | 'workout'
  | 'gallery'
  | 'shop'
  | 'history'
  | 'nutrition'
  | 'settings';

function resolveLevel(value: unknown): number {
  if (typeof value === 'number') return value;

  if (value && typeof value === 'object' && 'level' in value) {
    const candidate = (value as { level?: unknown }).level;
    if (typeof candidate === 'number') return candidate;
  }

  return 1;
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

export default function Index() {
  const [page, setPage] = useState<ScreenView>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const appState = useMemo(() => {
    const totalXP = getTotalXP();
    const level = resolveLevel(getLevelFromXP(totalXP));

    return {
      totalXP,
      level,
      currentLevelXP: getCurrentLevelXP(totalXP),
      nextLevelXP: getNextLevelXP(totalXP),
      totalWorkouts: level > 0 ? Math.max(0, Math.round(totalXP / 120)) : 0,
      streak: getStreak(),
      premiumActive: checkPremium().isActive,
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
    setPage('home');
  };

  if (page === 'settings') {
    return <SettingsScreen onBack={goHome} />;
  }

  if (page === 'daily') {
    return (
      <DailyCheckInScreen
        onClose={goHome}
        onStartWorkout={() => {
          setPage('workout');
        }}
      />
    );
  }

  if (page === 'gallery') {
    return <GymRatGallery onBack={goHome} />;
  }

  if (page === 'shop') {
    return (
      <ShopScreen
        onBack={goHome}
        onOpenPaywall={() => setPaywallOpen(true)}
      />
    );
  }

  if (page === 'workout') {
    return (
      <WorkoutFlow
        onBack={goHome}
        onComplete={() => {
          setRefreshKey((prev) => prev + 1);
          setPage('home');
        }}
      />
    );
  }

if (page === 'nutrition') {
  return (
    <NutritionScreen
      onBack={goHome}
      onOpenPaywall={() => setPaywallOpen(true)}
    />
  );
}

  if (page === 'history') {
    return (
      <PlaceholderScreen
        title="Training History"
        subtitle="History screen can be reconnected after the navigation is stable again."
        onBack={goHome}
      />
    );
  }

  return (
    <>
      <HomeScreen
        stats={appState}
        onOpenMenu={() => setMenuOpen(true)}
        onStartWorkout={() => setPage('workout')}
        onOpenGallery={() => setPage('gallery')}
        onOpenShop={() => setPage('shop')}
      />

      <AppMenu
        isOpen={menuOpen}
        isPremium={appState.premiumActive}
        onClose={() => setMenuOpen(false)}
        onOpenDaily={() => {
          setMenuOpen(false);
          setPage('daily');
        }}
        onOpenHistory={() => {
          setMenuOpen(false);
          setPage('history');
        }}
        onOpenNutrition={() => {
          setMenuOpen(false);
          setPage('nutrition');
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
        onOpenPremium={() => {
          setMenuOpen(false);
          setPaywallOpen(true);
        }}
      />

      <PremiumPaywall
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
      />
    </>
  );
}