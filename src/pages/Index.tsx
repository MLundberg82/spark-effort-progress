import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, FileText, Shield } from 'lucide-react';

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
type MenuView =
  | 'root'
  | 'settings'
  | 'timer'
  | 'daily'
  | 'history'
  | 'nutrition'
  | 'terms'
  | 'privacy';
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
        'fixed inset-0 z-[80] transition-opacity duration-500 ease-out',
        isVisible ? 'bg-black/72 opacity-100' : 'pointer-events-none bg-black/0 opacity-0',
      ].join(' ')}
      onClick={onOutsideClick}
    >
      <div
        className={[
          'ml-auto h-full w-full overflow-hidden border-l border-white/10 bg-black shadow-[-20px_0_56px_rgba(0,0,0,0.62)]',
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

function LegalScreen({
  title,
  sections,
  onBack,
}: {
  title: string;
  sections: Array<{ heading: string; body: string }>;
  onBack: () => void;
}) {
  const isTerms = title === 'Terms of Use';

  return (
    <div className="min-h-full">
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-white/12 bg-black text-white transition hover:bg-[#111111]"
            aria-label="Back"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-lime-200">
              {isTerms ? (
                <Shield className="h-4.5 w-4.5" />
              ) : (
                <FileText className="h-4.5 w-4.5" />
              )}
              <span className="text-[11px] font-black uppercase tracking-[0.18em]">
                Legal
              </span>
            </div>

            <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white">
              {title}
            </h1>

            <p className="mt-1 text-sm text-white/84">
              In-app legal view · hello@getgymrat.com
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {sections.map((section) => (
            <section
              key={section.heading}
              className="rounded-[20px] border border-white/12 bg-black p-4"
            >
              <h3 className="text-sm font-black uppercase tracking-[0.14em] text-lime-200">
                {section.heading}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/90">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

const TERMS_SECTIONS = [
  {
    heading: 'Use of the service',
    body:
      'GetGymRat provides workout tracking, progress features, premium features and related fitness tools for personal use. By using the service, the user agrees to use it lawfully and according to the current terms.',
  },
  {
    heading: 'Health disclaimer',
    body:
      'The app provides general fitness and wellness information only. It does not provide medical advice, diagnosis or treatment. Users should consult a qualified professional before major exercise or nutrition changes.',
  },
  {
    heading: 'Premium subscriptions',
    body:
      'Some features may require a paid subscription. Pricing is shown at purchase. Subscriptions may renew automatically unless cancelled through the platform used for the subscription, such as Apple App Store or Google Play.',
  },
  {
    heading: 'Acceptable use',
    body:
      'Users may not misuse the service, attempt unauthorized access, interfere with security or service operations, or upload harmful content.',
  },
  {
    heading: 'Availability and liability',
    body:
      'The service may change over time and is provided as is and as available to the fullest extent permitted by law. GetGymRat does not guarantee uninterrupted or error-free availability.',
  },
];

const PRIVACY_SECTIONS = [
  {
    heading: 'Information collected',
    body:
      'Information may include account details, workout logs, training history, nutrition entries, goals, support requests, device information, app version, usage analytics, diagnostics and crash information.',
  },
  {
    heading: 'Premium and billing status',
    body:
      'If premium is used, the service may receive limited subscription status information from providers such as Apple, Google or RevenueCat. Full payment card information is not stored directly by GetGymRat.',
  },
  {
    heading: 'How information is used',
    body:
      'Data may be used to operate the product, save workout and nutrition history, improve features, analyze usage, handle subscriptions, prevent abuse and provide support.',
  },
  {
    heading: 'Sharing',
    body:
      'Personal data is not sold. Information may be shared only when necessary with trusted providers involved in hosting, analytics, authentication, payments or subscriptions.',
  },
  {
    heading: 'Retention and rights',
    body:
      'Information is kept as long as reasonably needed for the service, dispute handling and legal compliance. Depending on where the user lives, rights may include access, correction, deletion, restriction, objection or receiving a copy of personal data.',
  },
];

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

    const handleOpenTimerMenu = () => {
      setMenuMounted(true);
      setMenuStack(['timer']);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setMenuOpen(true);
        });
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-menu-timer', handleOpenTimerMenu as EventListener);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-menu-timer', handleOpenTimerMenu as EventListener);
    };
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

    if (currentMenuView === 'terms') {
      return (
        <LegalScreen
          title="Terms of Use"
          sections={TERMS_SECTIONS}
          onBack={popMenuView}
        />
      );
    }

    if (currentMenuView === 'privacy') {
      return (
        <LegalScreen
          title="Privacy Policy"
          sections={PRIVACY_SECTIONS}
          onBack={popMenuView}
        />
      );
    }

    return null;
  };

  let mainContent: ReactNode = null;

  if (baseView === 'gallery') {
    mainContent = <GymRatGallery onBack={goHome} />;
  } else if (baseView === 'shop') {
    mainContent = (
      <ShopScreen
        onBack={goHome}
        onOpenPaywall={() => {
          setPremiumOpen(true);
          openPaywall?.('shop');
        }}
      />
    );
  } else if (baseView === 'workout') {
    mainContent = (
      <WorkoutFlow
        initialFocus={workoutFocus}
        onBack={goHome}
        onComplete={goHome}
      />
    );
  } else {
    mainContent = (
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
    );
  }

  return (
    <>
      {mainContent}

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
                  onOpenTerms={() => pushMenuView('terms')}
                  onOpenPrivacy={() => pushMenuView('privacy')}
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