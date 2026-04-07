import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Clock3,
  Crown,
  FileText,
  Flame,
  History as HistoryIcon,
  Mail,
  Settings as SettingsIcon,
  Shield,
  UtensilsCrossed,
  X,
} from 'lucide-react';

import gymratLogo from '@/assets/logo.png';
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
type WorkoutFocus = 'chest' | 'back' | 'arms' | 'legs' | 'walk' | undefined;

type IndexScreenProps = {
  openPaywall?: (trigger: string) => void;
};

type RootMenuProps = {
  onClose: () => void;
  onOpenDaily: () => void;
  onOpenHistory: () => void;
  onOpenNutrition: () => void;
  onOpenSettings: () => void;
  onOpenTimer: () => void;
  onOpenPremium: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
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

function MenuButton({
  label,
  description,
  icon,
  onClick,
  premium = false,
}: {
  label: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
  premium?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full items-center gap-3 rounded-[20px] border px-3.5 py-3.5 text-left transition',
        premium
          ? 'border-yellow-300/35 bg-[#4b3500] hover:bg-[#5d4300] shadow-[0_0_28px_rgba(250,204,21,0.18)]'
          : 'border-white/12 bg-[#0a0a0a] hover:bg-[#121212]',
      ].join(' ')}
    >
      <div
        className={[
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border',
          premium
            ? 'border-yellow-300/35 bg-yellow-300/12 text-yellow-100'
            : 'border-white/12 bg-[#141414] text-lime-300',
        ].join(' ')}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <div
          className={[
            'text-sm font-black uppercase tracking-[0.14em]',
            premium ? 'text-yellow-50' : 'text-lime-200',
          ].join(' ')}
        >
          {label}
        </div>
        <div
          className={[
            'mt-1 text-sm leading-snug',
            premium ? 'text-yellow-50/92' : 'text-white/88',
          ].join(' ')}
        >
          {description}
        </div>
      </div>
    </button>
  );
}

function RootMenu({
  onClose,
  onOpenDaily,
  onOpenHistory,
  onOpenNutrition,
  onOpenSettings,
  onOpenTimer,
  onOpenPremium,
  onOpenTerms,
  onOpenPrivacy,
}: RootMenuProps) {
  return (
    <div className="flex min-h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-white/12 bg-black p-2.5">
            <img
              src={gymratLogo}
              alt="GymRat"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/12 bg-black text-white transition hover:bg-[#111111]"
          aria-label="Close menu"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <section className="rounded-[22px] border border-white/12 bg-black p-4 shadow-[0_10px_30px_rgba(0,0,0,0.32)]">
        <div className="space-y-2.5">
          <MenuButton
            label="Daily Check-In"
            description="Streak, next focus and momentum snapshot."
            onClick={onOpenDaily}
            icon={<Flame className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="Timer Settings"
            description="Only timer controls, durations and loop mode."
            onClick={onOpenTimer}
            icon={<Clock3 className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="History"
            description="Logged sessions, archive and recent consistency."
            onClick={onOpenHistory}
            icon={<HistoryIcon className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="Nutrition"
            description="Macros, calories and daily food log."
            onClick={onOpenNutrition}
            icon={<UtensilsCrossed className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="Profile & App"
            description="Body stats, training level and language."
            onClick={onOpenSettings}
            icon={<SettingsIcon className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="Get Premium"
            description="Unlock the heavier version of GymRat."
            onClick={onOpenPremium}
            icon={<Crown className="h-4.5 w-4.5" />}
            premium
          />
        </div>
      </section>

      <section className="mt-auto rounded-[22px] border border-white/12 bg-black p-4 shadow-[0_10px_30px_rgba(0,0,0,0.32)]">
        <div className="space-y-2.5">
          <MenuButton
            label="Terms of Use"
            description="Open the in-app terms."
            onClick={onOpenTerms}
            icon={<Shield className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="Privacy Policy"
            description="Open the in-app privacy policy."
            onClick={onOpenPrivacy}
            icon={<FileText className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="Contact"
            description="hello@getgymrat.com"
            onClick={() => {
              window.location.href = 'mailto:hello@getgymrat.com';
            }}
            icon={<Mail className="h-4.5 w-4.5" />}
          />
        </div>
      </section>
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
            <X className="h-4.5 w-4.5 rotate-45" />
          </button>

          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-lime-200">
              Legal
            </div>
            <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-1 text-sm text-white/82">
              Last updated April 2, 2026 · hello@getgymrat.com
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
              <p className="mt-2 text-sm leading-relaxed text-white/88">
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
      'The app provides general fitness and wellness information only. It does not provide medical advice, diagnosis or treatment. Users should consult a qualified professional before major exercise or nutrition changes, especially when injury, pain or medical conditions are involved.',
  },
  {
    heading: 'Premium subscriptions',
    body:
      'Some features may require a paid subscription. Pricing is shown at purchase. Subscriptions may renew automatically unless cancelled through the platform used for the subscription, such as Apple App Store or Google Play, unless otherwise stated.',
  },
  {
    heading: 'Acceptable use',
    body:
      'Users may not misuse the service, attempt unauthorized access, interfere with security or service operations, reverse engineer where not allowed by law, or upload harmful content.',
  },
  {
    heading: 'Availability and liability',
    body:
      'The service may change over time and is provided as is and as available to the fullest extent permitted by law. GetGymRat does not guarantee uninterrupted or error-free service availability.',
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
    if ((baseView === 'home' || baseView === 'workout') && !menuMounted) {
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
                <RootMenu
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