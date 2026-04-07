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

type BaseView = 'home' | 'gallery' | 'shop' | 'workout';
type MenuView = 'root' | 'settings' | 'daily' | 'history' | 'nutrition';
type WorkoutFocus = 'chest' | 'back' | 'arms' | 'legs' | undefined;

type IndexScreenProps = {
  openPaywall?: (trigger: string) => void;
};

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
    if (baseView === 'home') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [baseView]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow || 'auto';
    };
  }, [menuOpen]);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!menuOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();

        if (canGoBackInMenu) {
          setMenuStack((prev) => prev.slice(0, -1));
        } else {
          closeMenu();
        }
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
      currentLevelXP: getCurrentLevelXP(totalXP),
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
    setMenuStack(['root']);
    setMenuOpen(true);
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

  const openGalleryFromMenu = () => {
    closeMenu();
    setBaseView('gallery');
  };

  const openShopFromMenu = () => {
    closeMenu();
    setBaseView('shop');
  };

  const openPremiumFromMenu = () => {
    closeMenu();
    setPremiumOpen(true);
    openPaywall?.('menu');
  };

  const renderMenuOverlay = () => {
    if (!menuOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={closeMenu}
      >
        {currentMenuView === 'root' && (
          <AppMenu
            isPremium={appState.premiumActive}
            onClose={closeMenu}
            onOpenDaily={() => pushMenuView('daily')}
            onOpenHistory={() => pushMenuView('history')}
            onOpenNutrition={() => pushMenuView('nutrition')}
            onOpenGallery={openGalleryFromMenu}
            onOpenShop={openShopFromMenu}
            onOpenSettings={() => pushMenuView('settings')}
            onOpenPremium={openPremiumFromMenu}
          />
        )}

        {currentMenuView === 'settings' && (
          <SettingsScreen onBack={popMenuView} />
        )}

        {currentMenuView === 'daily' && (
          <DailyCheckInScreen
            onClose={popMenuView}
            onStartWorkout={(focus) => openWorkout(focus as WorkoutFocus)}
          />
        )}

        {currentMenuView === 'history' && (
          <div
            className="absolute inset-y-0 right-0 flex w-[80%] max-w-[420px] flex-col border-l border-white/10 bg-[#0a0a0a]/96 shadow-[-24px_0_80px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 pb-4 pt-6">
              <button
                type="button"
                onClick={popMenuView}
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[11px] font-black uppercase tracking-[0.16em] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
              >
                Back
              </button>

              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
                  Menu
                </p>
                <h2 className="text-base font-black uppercase tracking-[0.16em] text-white">
                  History
                </h2>
              </div>
            </div>

            <div className="flex-1 px-5 py-5">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                  Coming next
                </p>
                <h3 className="mt-2 text-lg font-black text-white">
                  History stays inside the menu stack now.
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Back takes you to the previous menu layer instead of dropping
                  you to home.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentMenuView === 'nutrition' && (
          <div
            className="absolute inset-y-0 right-0 flex w-[80%] max-w-[420px] flex-col border-l border-white/10 bg-[#0a0a0a]/96 shadow-[-24px_0_80px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 pb-4 pt-6">
              <button
                type="button"
                onClick={popMenuView}
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[11px] font-black uppercase tracking-[0.16em] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
              >
                Back
              </button>

              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
                  Menu
                </p>
                <h2 className="text-base font-black uppercase tracking-[0.16em] text-white">
                  Nutrition
                </h2>
              </div>
            </div>

            <div className="flex-1 px-5 py-5">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                  Coming next
                </p>
                <h3 className="mt-2 text-lg font-black text-white">
                  Nutrition also respects the same menu stack.
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Outside click closes the menu. Back moves one layer up.
                </p>
              </div>
            </div>
          </div>
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