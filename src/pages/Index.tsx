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
        'fixed inset-0 z-[70] transition-opacity duration-500 ease-out',
        isVisible
          ? 'bg-black/70 opacity-100'
          : 'pointer-events-none bg-black/0 opacity-0',
      ].join(' ')}
      onClick={onOutsideClick}
    >
      <div
        className={[
          'ml-auto h-full w-full overflow-hidden border-l border-white/10 bg-black shadow-[-18px_0_52px_rgba(0,0,0,0.58)]',
          'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
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
    }, 500);
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

  const renderSubmenuContent = () => {
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
          <div className="relative h-full w-full overflow-hidden bg-black">
            <div
              className={[
                'absolute inset-0 overflow-y-auto bg-black px-4 pb-8 pt-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                currentMenuView === 'root'
                  ? 'translate-x-0 scale-100 opacity-100'
                  : '-translate-x-8 scale-[0.985] opacity-35',
              ].join(' ')}
            >
              <div className="mx-auto w-full max-w-[520px]">
                <AppMenu
                  onClose={closeMenu}
                  onOpenDaily={() => pushMenuView('daily')}
                  onOpenHistory={() => pushMenuView('history')}
                  onOpenNutrition={() => pushMenuView('nutrition')}
                  onOpenSettings={() => pushMenuView('settings')}
                  onOpenTimer={() => pushMenuView('timer')}
                  onOpenPremium={() => openPremium('menu')}
                />
              </div>
            </div>

            <div
              className={[
                'absolute inset-0 overflow-y-auto border-l border-white/10 bg-black px-4 pb-8 pt-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                currentMenuView === 'root'
                  ? 'translate-x-full opacity-0'
                  : 'translate-x-0 opacity-100',
              ].join(' ')}
            >
              <div className="mx-auto w-full max-w-[520px]">
                {renderSubmenuContent()}
              </div>
            </div>
          </div>
        </MenuScreenShell>
      ) : null}

      <PremiumPaywall
        isOpen={premiumOpen}
        onClose={() => setPremiumOpen(false)}
      />
    </>
  );
}