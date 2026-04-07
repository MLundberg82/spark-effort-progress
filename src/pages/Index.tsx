import { useEffect, useMemo, useState } from 'react';
import AppMenu from '@/components/AppMenu';
import DailyCheckInScreen from '@/components/DailyCheckInScreen';
import GymRatGallery from '@/components/GymRatGallery';
import HistoryScreen from '@/components/HistoryScreen';
import HomeScreen from '@/components/HomeScreen';
import NutritionScreen from '@/components/NutritionScreen';
import PremiumPaywall from '@/components/PremiumPaywall';
import SettingsScreen from '@/components/SettingsScreen';
import ShopScreen from '@/components/ShopScreen';
import TimerSettingsScreen from '@/components/TimerSettingsScreen';
import WorkoutFlow from '@/components/WorkoutFlow';
import {
  getCurrentLevelXP,
  getLevelFromXP,
  getNextLevelXP,
  getStreak,
  getTotalXP,
  isPremium,
} from '@/lib/gamificationStore';

type BaseView = 'home' | 'gallery' | 'shop' | 'workout';
type MenuView = 'root' | 'settings' | 'timer' | 'daily' | 'history' | 'nutrition';
type WorkoutFocus = 'chest' | 'back' | 'arms' | 'legs' | undefined;

type IndexScreenProps = {
  openPaywall?: (trigger: string) => void;
};

function MenuScreenShell({
  children,
  onOutsideClick,
}: {
  children: React.ReactNode;
  onOutsideClick: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]"
      onClick={onOutsideClick}
    >
      <div className="flex h-full w-full justify-end">
        <div
          className="pointer-events-auto h-full w-full max-w-[440px] overflow-y-auto"
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function IndexScreen({ openPaywall }: IndexScreenProps) {
  const [baseView, setBaseView] = useState<BaseView>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuStack, setMenuStack] = useState<MenuView[]>(['root']);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [workoutFocus, setWorkoutFocus] = useState<WorkoutFocus>(undefined);

  const currentMenuView = menuStack[menuStack.length - 1] ?? 'root';
  const canGoBackInMenu = menuStack.length > 1;

  useEffect(() => {
    if (baseView === 'home' && !menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [baseView, menuOpen]);

  useEffect(() => {
    const rerender = () => setRefreshKey((prev) => prev + 1);

    window.addEventListener('premium-updated', rerender);
    window.addEventListener('shop-updated', rerender);
    window.addEventListener('storage', rerender);
    window.addEventListener('nutrition-updated', rerender);
    window.addEventListener('profile-updated', rerender);
    window.addEventListener('gymrat-profile-updated', rerender);

    return () => {
      window.removeEventListener('premium-updated', rerender);
      window.removeEventListener('shop-updated', rerender);
      window.removeEventListener('storage', rerender);
      window.removeEventListener('nutrition-updated', rerender);
      window.removeEventListener('profile-updated', rerender);
      window.removeEventListener('gymrat-profile-updated', rerender);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!menuOpen || event.key !== 'Escape') return;

      event.preventDefault();

      if (canGoBackInMenu) {
        setMenuStack((prev) => prev.slice(0, -1));
      } else {
        closeMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen, canGoBackInMenu]);

  const appState = useMemo(() => {
    const totalXP = getTotalXP();
    const level = getLevelFromXP(totalXP);

    return {
      level,
      currentXP: getCurrentLevelXP(totalXP),
      nextLevelXP: getNextLevelXP(totalXP),
      streak: getStreak(),
      premiumActive: isPremium(),
    };
  }, [refreshKey]);

  const closeMenu = () => {
    setMenuOpen(false);
    setMenuStack(['root']);
  };

  const openMenu = () => {
    setMenuOpen(true);
    setMenuStack(['root']);
  };

  const pushMenuView = (view: MenuView) => {
    setMenuStack((prev) => {
      if (prev[prev.length - 1] === view) return prev;
      return [...prev, view];
    });
  };

  const popMenuView = () => {
    setMenuStack((prev) => {
      if (prev.length <= 1) return prev;
      return prev.slice(0, -1);
    });
  };

  const goHome = () => {
    setWorkoutFocus(undefined);
    setBaseView('home');
  };

  const openWorkout = (focus?: WorkoutFocus) => {
    setWorkoutFocus(focus);
    setBaseView('workout');
    closeMenu();
  };

  const renderMenuOverlay = () => {
    if (!menuOpen) return null;

    if (currentMenuView === 'root') {
      return (
        <div
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]"
          onClick={closeMenu}
        >
          <div className="flex h-full w-full justify-end">
            <AppMenu
              isPremium={appState.premiumActive}
              onClose={closeMenu}
              onOpenDaily={() => pushMenuView('daily')}
              onOpenHistory={() => pushMenuView('history')}
              onOpenNutrition={() => pushMenuView('nutrition')}
              onOpenSettings={() => pushMenuView('settings')}
              onOpenTimer={() => pushMenuView('timer')}
              onOpenPremium={() => {
                closeMenu();
                setPremiumOpen(true);
                openPaywall?.('menu');
              }}
            />
          </div>
        </div>
      );
    }

    if (currentMenuView === 'settings') {
      return (
        <MenuScreenShell onOutsideClick={closeMenu}>
          <SettingsScreen onBack={popMenuView} />
        </MenuScreenShell>
      );
    }

    if (currentMenuView === 'timer') {
      return (
        <MenuScreenShell onOutsideClick={closeMenu}>
          <TimerSettingsScreen onBack={popMenuView} />
        </MenuScreenShell>
      );
    }

    if (currentMenuView === 'daily') {
      return (
        <MenuScreenShell onOutsideClick={closeMenu}>
          <DailyCheckInScreen
            onClose={popMenuView}
            onStartWorkout={(focus) => openWorkout(focus as WorkoutFocus)}
          />
        </MenuScreenShell>
      );
    }

    if (currentMenuView === 'history') {
      return (
        <MenuScreenShell onOutsideClick={closeMenu}>
          <HistoryScreen onBack={popMenuView} />
        </MenuScreenShell>
      );
    }

    if (currentMenuView === 'nutrition') {
      return (
        <MenuScreenShell onOutsideClick={closeMenu}>
          <NutritionScreen onBack={popMenuView} />
        </MenuScreenShell>
      );
    }

    return null;
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
        currentXP={appState.currentXP}
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