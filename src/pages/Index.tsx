import { useEffect, useMemo, useState } from 'react';
import AppMenu from '@/components/AppMenu';
import DailyCheckInScreen from '@/components/DailyCheckInScreen';
import GymRatGallery from '@/components/GymRatGallery';
import HomeScreen from '@/components/HomeScreen';
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
  isPremium,
} from '@/lib/gamificationStore';

type BaseView =
  | 'home'
  | 'gallery'
  | 'shop'
  | 'workout';

type MenuView =
  | 'root'
  | 'settings'
  | 'daily'
  | 'history'
  | 'nutrition';

type WorkoutFocus = 'chest' | 'back' | 'arms' | 'legs' | undefined;

type IndexScreenProps = {
  openPaywall?: (trigger: string) => void;
};

export default function IndexScreen({ openPaywall }: IndexScreenProps) {
  const [baseView, setBaseView] = useState<BaseView>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<MenuView>('root');
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [workoutFocus, setWorkoutFocus] = useState<WorkoutFocus>(undefined);

  // 🔥 FIX: scroll per screen
  useEffect(() => {
    if (baseView === 'home') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [baseView]);

  const appState = useMemo(() => {
    const totalXP = getTotalXP();
    const level = getLevelFromXP(totalXP);

    return {
      level,
      currentLevelXP: getCurrentLevelXP(totalXP),
      nextLevelXP: getNextLevelXP(totalXP),
      streak: getStreak(),
      premiumActive: isPremium(),
    };
  }, [refreshKey]);

  useEffect(() => {
    const rerender = () => setRefreshKey((prev) => prev + 1);

    window.addEventListener('premium-updated', rerender);
    window.addEventListener('shop-updated', rerender);
    window.addEventListener('storage', rerender);

    return () => {
      window.removeEventListener('premium-updated', rerender);
      window.removeEventListener('shop-updated', rerender);
      window.removeEventListener('storage', rerender);
    };
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    setMenuView('root');
  };

  const openMenu = () => {
    setMenuView('root');
    setMenuOpen(true);
  };

  const goHome = () => {
    setWorkoutFocus(undefined);
    setBaseView('home');
  };

  const openWorkout = (focus?: WorkoutFocus) => {
    setWorkoutFocus(focus);
    setBaseView('workout');
  };

  const renderMenuOverlay = () => {
    if (!menuOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={closeMenu}
      >
        {menuView === 'root' && (
          <AppMenu
            isPremium={appState.premiumActive}
            onClose={closeMenu}
            onOpenDaily={() => setMenuView('daily')}
            onOpenHistory={() => setMenuView('history')}
            onOpenNutrition={() => setMenuView('nutrition')}
            onOpenGallery={() => {
              closeMenu();
              setBaseView('gallery');
            }}
            onOpenShop={() => {
              closeMenu();
              setBaseView('shop');
            }}
            onOpenSettings={() => setMenuView('settings')}
            onOpenPremium={() => setPremiumOpen(true)}
          />
        )}

        {menuView === 'settings' && (
          <SettingsScreen onBack={() => setMenuView('root')} />
        )}

        {menuView === 'daily' && (
          <DailyCheckInScreen
            onClose={() => setMenuView('root')}
            onStartWorkout={(focus) => openWorkout(focus as WorkoutFocus)}
          />
        )}
      </div>
    );
  };

  if (baseView === 'gallery') {
    return <GymRatGallery onBack={goHome} />;
  }

  if (baseView === 'shop') {
    return <ShopScreen onBack={goHome} />;
  }

  if (baseView === 'workout') {
    return (
      <WorkoutFlow
        initialFocus={workoutFocus}
        onBack={goHome}
        onComplete={goHome}
      />
    );
  }

  return (
    <>
      <HomeScreen
        level={appState.level}
        currentXP={appState.currentLevelXP}
        nextLevelXP={appState.nextLevelXP}
        streak={appState.streak}
        premiumActive={appState.premiumActive}
        onOpenMenu={openMenu}
        onStartWorkout={() => openWorkout()}
        onOpenGallery={() => setBaseView('gallery')}
        onOpenShop={() => setBaseView('shop')}
      />

      {renderMenuOverlay()}

      <PremiumPaywall
        isOpen={premiumOpen}
        onClose={() => setPremiumOpen(false)}
      />
    </>
  );
}