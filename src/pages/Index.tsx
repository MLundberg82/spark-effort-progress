import { useEffect, useMemo, useState, type ReactNode } from 'react';

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
  isVisible,
  onOutsideClick,
}: {
  children: ReactNode;
  isVisible: boolean;
  onOutsideClick: () => void;
}) {
  return (
    <div
      className={[
        'fixed inset-0 z-[70] transition-opacity duration-300',
        isVisible ? 'bg-black/50 opacity-100 backdrop-blur-[5px]' : 'pointer-events-none bg-black/0 opacity-0',
      ].join(' ')}
      onClick={onOutsideClick}
    >
      <div
        className={[
          'ml-auto h-full w-full max-w-[560px] overflow-y-auto border-l border-white/10 bg-[#050505]/92 shadow-[-20px_0_60px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-transform duration-300 ease-out',
          isVisible ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default function IndexScreen({ openPaywall }: IndexScreenProps) {
  const [baseView, setBaseView] = useState<BaseView>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuStack, setMenuStack] = useState<MenuView[]>(['root']);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [workoutFocus, setWorkoutFocus] = useState<WorkoutFocus>(undefined);

  const currentMenuView = menuStack[menuStack.length - 1] ?? 'root';
  const canGoBackInMenu = menuStack.length > 1;

  useEffect(() => {
    if (baseView === 'home' && !menuMounted) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [baseView, menuMounted]);

  useEffect(() => {
    const rerender = () => setRefreshKey((prev) => prev + 1);

    window.addEventListener('premium-updated', rerender);
    window.addEventListener('shop-updated', rerender);
    window.addEventListener('storage', rerender);
    window.addEventListener('nutrition-updated', rerender);
    window.addEventListener('profile-updated', rerender);
    window.addEventListener('gymrat-profile-updated', rerender);
    window.addEventListener('history-updated', rerender);

    return () => {
      window.removeEventListener('premium-updated', rerender);
      window.removeEventListener('shop-updated', rerender);
      window.removeEventListener('storage', rerender);
      window.removeEventListener('nutrition-updated', rerender);
      window.removeEventListener('profile-updated', rerender);
      window.removeEventListener('gymrat-profile-updated', rerender);
      window.removeEventListener('history-updated', rerender);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!menuMounted || event.key !== 'Escape') return;

      event.preventDefault();

      if (canGoBackInMenu) {
        setMenuStack((prev) => prev.slice(0, -1));
        return;
      }

      closeMenu();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuMounted, canGoBackInMenu]);

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
    window.setTimeout(() => {
      setMenuMounted(false);
      setMenuStack(['root']);
    }, 300);
  };

  const openMenu = () => {
    setMenuMounted(true);
    setMenuStack(['root']);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setMenuOpen(true);
      });
    });
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

  const openPremium = (trigger: string) => {
    closeMenu();
    setPremiumOpen(true);
    openPaywall?.(trigger);
  };

  const renderMenuContent = () => {
    if (currentMenuView === 'root') {
      return (
        <AppMenu
          isPremium={appState.premiumActive}
          onClose={closeMenu}
          onOpenDaily={() => pushMenuView('daily')}
          onOpenHistory={() => pushMenuView('history')}
          onOpenNutrition={() => pushMenuView('nutrition')}
          onOpenSettings={() => pushMenuView('settings')}
          onOpenTimer={() => pushMenuView('timer')}
          onOpenPremium={() => openPremium('menu')}
        />
      );
    }

    if (currentMenuView === 'settings') {
      return <SettingsScreen onBack={popMenuView} />;
    }

    if (currentMenuView === 'timer') {
      return <TimerSettingsScreen onBack={popMenuView} />;
    }

    if (currentMenuView === 'daily') {
      return (
        <DailyCheckInScreen
          onClose={popMenuView}
          onStartWorkout={(focus) => openWorkout(focus as WorkoutFocus)}
        />
      );
    }

    if (currentMenuView === 'history') {
      return <HistoryScreen onBack={popMenuView} />;
    }

    if (currentMenuView === 'nutrition') {
      return <NutritionScreen onBack={popMenuView} />;
    }

    return null;
  };

  if (baseView === 'gallery') {
    return <GymRatGallery onBack={goHome} />;
  }

  if (baseView === 'shop') {
    return (
      <ShopScreen
        onBack={goHome}
        onOpenPaywall={() => {
          setPremiumOpen(true);
          openPaywall?.('shop');
        }}
      />
    );
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

      {menuMounted ? (
        <MenuScreenShell isVisible={menuOpen} onOutsideClick={closeMenu}>
          {renderMenuContent()}
        </MenuScreenShell>
      ) : null}

      <PremiumPaywall
        isOpen={premiumOpen}
        onClose={() => setPremiumOpen(false)}
      />
    </>
  );
}