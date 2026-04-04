import { useEffect, useMemo, useState } from 'react';
import {
  Crown,
  Dumbbell,
  Flame,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  TimerReset,
  Trophy,
  X,
  Zap,
} from 'lucide-react';

import { getLevelFromXP, getStreak, getTotalXP, isPremium } from '@/lib/gamificationStore';
import TrainingLevelSelector from '@/components/TrainingLevelSelector';
import SettingsScreen from '@/components/SettingsScreen';
import { useT } from '@/lib/i18n';
import WorkoutFlow from '@/components/WorkoutFlow';
import HistoryScreen from '@/components/HistoryScreen';
import NutritionScreen from '@/components/NutritionScreen';
import GymRatGallery from '@/components/GymRatGallery';
import RatShop from '@/components/RatShop';

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

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-lime-400 via-emerald-400 to-yellow-300 transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function PlaceholderScreen({
  title,
  subtitle,
  onBack,
  onOpenPremium,
  premiumRequired = false,
  premiumActive = false,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
  onOpenPremium?: () => void;
  premiumRequired?: boolean;
  premiumActive?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#07110d] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-8 pt-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90"
        >
          ← Back
        </button>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_50px_rgba(132,255,136,0.08)]">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
            GymRat
          </div>

          <h1 className="text-3xl font-black tracking-tight">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-white/70">{subtitle}</p>

          {premiumRequired && !premiumActive && (
            <div className="mt-5 rounded-3xl border border-amber-400/20 bg-amber-300/10 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-200">
                <Crown className="h-4 w-4" />
                Premium required
              </div>
              <p className="mt-2 text-sm text-amber-100/80">
                This area is part of the premium path.
              </p>

              <button
                onClick={onOpenPremium}
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-yellow-300 via-amber-300 to-lime-300 px-4 py-3 text-sm font-black text-[#111]"
              >
                Open Premium
              </button>
            </div>
          )}

          <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-bold text-white/90">Rebuild mode</div>
            <p className="mt-2 text-sm leading-6 text-white/65">
              This section is intentionally simplified while Home / Index is rebuilt first.
              The goal is to keep the app feeling premium and stable while the deeper pages are
              repaired one by one.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PremiumModal({
  open,
  onClose,
  onOpenPaywall,
}: {
  open: boolean;
  onClose: () => void;
  onOpenPaywall: () => void;
}) {
  if (!open) return null;

  const premiumItems = [
    {
      icon: Zap,
      title: 'XP boost',
      text: 'Double down on progress and level up faster.',
    },
    {
      icon: Trophy,
      title: 'History',
      text: 'Track sessions, momentum and progression over time.',
    },
    {
      icon: Sparkles,
      title: 'Nutrition',
      text: 'Macros, targets and better structure around your results.',
    },
    {
      icon: Crown,
      title: 'Cosmetics',
      text: 'Premium looks, gear and a more elite rat identity.',
    },
    {
      icon: Dumbbell,
      title: 'Custom workout',
      text: 'Build your own training flow instead of only preset paths.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-yellow-300/20 bg-[#111915] text-white shadow-[0_25px_100px_rgba(0,0,0,0.55)]">
        <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-lime-300/10 via-transparent to-yellow-300/10 p-5">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-white/80"
            aria-label="Close premium modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-yellow-200">
            <Crown className="h-3.5 w-3.5" />
            Premium
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-tight">
            Level up faster in real life
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            Built for dopamine, progress and momentum — not fluff.
          </p>
        </div>

        <div className="space-y-3 p-5">
          {premiumItems.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-300/20 to-yellow-300/20 text-lime-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white">{title}</div>
                  <div className="mt-1 text-sm leading-6 text-white/65">{text}</div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={onOpenPaywall}
            className="mt-2 w-full rounded-2xl bg-gradient-to-r from-lime-300 via-emerald-300 to-yellow-300 px-4 py-4 text-base font-black text-[#101410] shadow-[0_10px_30px_rgba(180,255,120,0.2)]"
          >
            Unlock Premium
          </button>

          <button
            onClick={onClose}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/80"
          >
            Continue free
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  glow = false,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  glow?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className={cn(
        'rounded-[24px] border p-4',
        glow
          ? 'border-lime-300/20 bg-gradient-to-br from-lime-300/10 to-yellow-300/10 shadow-[0_0_35px_rgba(170,255,140,0.12)]'
          : 'border-white/10 bg-white/[0.04]'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">{label}</div>
        <Icon className="h-4 w-4 text-white/45" />
      </div>
      <div className="mt-3 text-3xl font-black tracking-tight text-white">{value}</div>
    </div>
  );
}

function HomeAction({
  title,
  text,
  icon: Icon,
  onClick,
  premium = false,
  highlight = false,
}: {
  title: string;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  premium?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-[26px] border p-4 text-left transition duration-200',
        highlight
          ? 'border-lime-300/20 bg-gradient-to-br from-lime-300/10 via-emerald-300/8 to-yellow-300/10 shadow-[0_0_35px_rgba(170,255,140,0.08)]'
          : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.06]'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
            highlight
              ? 'bg-gradient-to-br from-lime-300/20 to-yellow-300/20 text-lime-200'
              : 'bg-white/8 text-white/75'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="text-sm font-extrabold text-white">{title}</div>
            {premium && (
              <span className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-200">
                Premium
              </span>
            )}
          </div>
          <div className="mt-1 text-sm leading-6 text-white/62">{text}</div>
        </div>
      </div>
    </button>
  );
}

export default function IndexScreen({ openPaywall }: IndexScreenProps) {
  const t = useT();

  const [view, setView] = useState<ScreenView>(
    hasCompletedOnboarding() ? 'home' : 'training-level'
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
      currentXP: levelData.currentXP,
      xpToNext: levelData.xpToNext,
      progress: Math.round((levelData.progress || 0) * 100),
      streak: getStreak(),
      premiumActive: isPremium(),
    };
  }, [refreshKey]);

  useEffect(() => {
    const rerender = () => setRefreshKey((prev) => prev + 1);

    window.addEventListener('premium-updated', rerender);
    window.addEventListener('gymrat-language-changed', rerender);
    window.addEventListener('focus', rerender);

    return () => {
      window.removeEventListener('premium-updated', rerender);
      window.removeEventListener('gymrat-language-changed', rerender);
      window.removeEventListener('focus', rerender);
    };
  }, []);

  const goHome = () => {
    setMenuOpen(false);
    setRefreshKey((prev) => prev + 1);
    setView(hasCompletedOnboarding() ? 'home' : 'training-level');
  };

  const handleFinishOnboarding = () => {
    markOnboardingCompleted();
    setRefreshKey((prev) => prev + 1);
    setView('home');
  };

  const openPremium = () => {
    setMenuOpen(false);
    setPremiumOpen(true);
  };

  const triggerPaywall = () => {
    setPremiumOpen(false);
    openPaywall?.('manual');
  };

  if (view === 'training-level') {
    return (
      <div className="min-h-screen bg-[#07110d]">
        <TrainingLevelSelector onComplete={handleFinishOnboarding} />
      </div>
    );
  }

  if (view === 'settings') {
    return <SettingsScreen onBack={goHome} premiumActive={appState.premiumActive} />;
  }

  if (view === 'daily-check-in') {
    return (
      <PlaceholderScreen
        title="Daily Check-in"
        subtitle="Consistency, focus and momentum tracking will live here."
        onBack={goHome}
      />
    );
  }

  if (view === 'food') {
    return (
      <NutritionScreen
        onBack={goHome}
        premiumActive={appState.premiumActive}
        onOpenPremium={openPremium}
      />
    );
  }

  if (view === 'history') {
    return (
      <HistoryScreen
        onBack={goHome}
        premiumActive={appState.premiumActive}
        onOpenPremium={openPremium}
      />
    );
  }

  if (view === 'gallery') {
    return <GymRatGallery onBack={goHome} />;
  }

  if (view === 'shop') {
    return (
      <RatShop
        onBack={goHome}
        premiumActive={appState.premiumActive}
        onOpenPremium={openPremium}
      />
    );
  }

  if (view === 'workout') {
    return (
      <WorkoutFlow
        onBack={goHome}
        onComplete={() => setRefreshKey((prev) => prev + 1)}
        openPaywall={(trigger) => openPaywall?.(trigger as never)}
      />
    );
  }

  const nextLevelXP = Math.max(appState.xpToNext - appState.currentXP, 0);

  return (
    <div className="min-h-screen overflow-hidden bg-[#07110d] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-lime-300/75">
              GymRat
            </div>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Level up IRL</h1>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] text-white/90 shadow-[0_0_20px_rgba(255,255,255,0.04)]"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-lime-300/20 bg-[radial-gradient(circle_at_top,_rgba(173,255,120,0.20),_transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 shadow-[0_0_60px_rgba(160,255,120,0.10)]">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-yellow-300/10 blur-3xl" />
          <div className="absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-lime-300/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-lime-200">
                  <Star className="h-3.5 w-3.5" />
                  Dopamine loop
                </div>

                <div className="mt-3 text-4xl font-black tracking-tight">
                  Level {appState.level}
                </div>
                <div className="mt-1 text-sm text-white/65">
                  {appState.premiumActive
                    ? 'Premium active — faster, deeper, cleaner progression.'
                    : 'Train, gain XP and unlock your next form.'}
                </div>
              </div>

              <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-black/20 text-4xl shadow-inner">
                🐀
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-white/55">
                <span>XP progress</span>
                <span>
                  {appState.currentXP}/{appState.xpToNext}
                </span>
              </div>
              <ProgressBar value={appState.progress} />
              <div className="mt-2 text-sm text-white/60">
                {nextLevelXP} XP until next level
              </div>
            </div>

            <button
              onClick={() => setView('workout')}
              className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-[22px] bg-gradient-to-r from-lime-300 via-emerald-300 to-yellow-300 text-base font-black text-[#0c120d] shadow-[0_10px_35px_rgba(170,255,140,0.25)] transition hover:scale-[1.01]"
            >
              <Dumbbell className="h-5 w-5" />
              {t('startWorkout')}
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatCard label="Streak" value={appState.streak} icon={Flame} glow />
          <StatCard label="Total XP" value={appState.totalXP.toLocaleString()} icon={Zap} />
          <StatCard
            label="Plan"
            value={appState.premiumActive ? 'PRO' : 'FREE'}
            icon={appState.premiumActive ? ShieldCheck : Crown}
          />
        </div>

        {!appState.premiumActive && (
          <button
            onClick={openPremium}
            className="mt-4 overflow-hidden rounded-[28px] border border-yellow-300/20 bg-gradient-to-r from-yellow-300/12 via-white/[0.04] to-lime-300/12 p-4 text-left shadow-[0_0_40px_rgba(255,220,120,0.07)]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-300/20 to-lime-300/20 text-yellow-200">
                <Crown className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-base font-black text-white">Go Premium</div>
                  <span className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-200">
                    XP boost
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-white/68">
                  Nutrition, history, custom workout, cosmetics and a faster level-up loop.
                </p>
              </div>
            </div>
          </button>
        )}

        <div className="mt-5">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-white/45">
            Main actions
          </div>

          <div className="space-y-3">
            <HomeAction
              title={t('gallery')}
              text="See level milestones, future forms and your evolution path."
              icon={Sparkles}
              onClick={() => setView('gallery')}
            />

            <HomeAction
              title={t('shop')}
              text="Cosmetics, identity and visual flex."
              icon={Crown}
              onClick={() => setView('shop')}
              premium={!appState.premiumActive}
            />

            <HomeAction
              title={t('nutrition')}
              text="Macros, food tracking and goals."
              icon={Zap}
              onClick={() => setView('food')}
              premium
              highlight
            />

            <HomeAction
              title={t('history')}
              text="Sessions, momentum and progression tracking."
              icon={TimerReset}
              onClick={() => setView('history')}
              premium
            />

            <HomeAction
              title="Daily Check-in"
              text="Small daily actions that keep momentum alive."
              icon={Flame}
              onClick={() => setView('daily-check-in')}
            />
          </div>
        </div>
      </div>

      <div
        className={cn(
          'pointer-events-none fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300',
          menuOpen ? 'opacity-100' : 'opacity-0'
        )}
      />

      <aside
        className={cn(
          'fixed right-0 top-0 z-50 flex h-screen w-[88%] max-w-sm flex-col border-l border-white/10 bg-[#101713] p-5 text-white shadow-[-20px_0_60px_rgba(0,0,0,0.45)] transition-transform duration-300',
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-lime-300/70">
              Menu
            </div>
            <div className="mt-1 text-2xl font-black tracking-tight">GymRat</div>
          </div>

          <button
            onClick={() => setMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/80"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-white/75">Current status</div>
            {appState.premiumActive ? (
              <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-lime-200">
                Premium
              </span>
            ) : (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/65">
                Free
              </span>
            )}
          </div>

          <div className="mt-3 text-3xl font-black">Level {appState.level}</div>
          <div className="mt-1 text-sm text-white/60">Streak: {appState.streak} days</div>
        </div>

        <div className="space-y-3 overflow-y-auto pb-4">
          <button
            onClick={() => {
              setMenuOpen(false);
              setView('daily-check-in');
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
          >
            <div>
              <div className="text-sm font-bold">Daily Check-in</div>
              <div className="mt-1 text-xs text-white/55">Stay consistent every day</div>
            </div>
            <span className="text-white/35">›</span>
          </button>

          <button
            onClick={() => {
              setMenuOpen(false);
              setView('food');
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
          >
            <div>
              <div className="text-sm font-bold">Nutrition</div>
              <div className="mt-1 text-xs text-white/55">Macros, goals and food tracking</div>
            </div>
            <span className="text-white/35">›</span>
          </button>

          <button
            onClick={() => {
              setMenuOpen(false);
              setView('history');
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
          >
            <div>
              <div className="text-sm font-bold">Training History</div>
              <div className="mt-1 text-xs text-white/55">Logbook, progress and previous sessions</div>
            </div>
            <span className="text-white/35">›</span>
          </button>

          <button
            onClick={() => {
              setMenuOpen(false);
              setView('settings');
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-bold">
                <Settings className="h-4 w-4" />
                Settings
              </div>
              <div className="mt-1 text-xs text-white/55">Language and app preferences</div>
            </div>
            <span className="text-white/35">›</span>
          </button>

          <button
            onClick={() => {
              setMenuOpen(false);
              window.location.href = 'mailto:hello@getgymrat.com?subject=GymRat%20Support';
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
          >
            <div>
              <div className="text-sm font-bold">Contact</div>
              <div className="mt-1 text-xs text-white/55">Get help or ask a question</div>
            </div>
            <span className="text-white/35">›</span>
          </button>

          <button
            onClick={() => {
              setMenuOpen(false);
              window.location.href =
                'mailto:hello@getgymrat.com?subject=GymRat%20Bug%20Report&body=Describe%20the%20issue%20here:%0A%0AWhat%20happened:%0A%0AWhat%20did%20you%20expect%20to%20happen:%0A';
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
          >
            <div>
              <div className="text-sm font-bold">Report a Bug</div>
              <div className="mt-1 text-xs text-white/55">Tell us when something breaks</div>
            </div>
            <span className="text-white/35">›</span>
          </button>
        </div>

        {!appState.premiumActive && (
          <button
            onClick={openPremium}
            className="mt-auto rounded-[22px] bg-gradient-to-r from-yellow-300 via-amber-300 to-lime-300 px-4 py-4 text-sm font-black text-[#111]"
          >
            Go Premium
          </button>
        )}
      </aside>

      {menuOpen && (
        <button
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30"
          aria-label="Close menu overlay"
        />
      )}

      <PremiumModal
        open={premiumOpen}
        onClose={() => setPremiumOpen(false)}
        onOpenPaywall={triggerPaywall}
      />
    </div>
  );
}