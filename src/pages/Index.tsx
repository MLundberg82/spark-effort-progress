import { useEffect, useMemo, useState } from 'react';
import { Crown, Flame, Menu, Settings, Sparkles, X } from 'lucide-react';
import { getLevelFromXP, getStreak, getTotalXP, isPremium } from '@/lib/gamificationStore';
import TrainingLevelSelector from '@/components/TrainingLevelSelector';
import SettingsScreen from '@/components/SettingsScreen';
import { useT } from '@/lib/i18n';

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
    <div className="min-h-screen bg-background px-4 py-4 text-foreground">
      <div className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 rounded-2xl border border-border/50 bg-secondary/30 px-4 py-2 text-sm font-medium"
        >
          Back
        </button>

        <div className="rounded-3xl border border-border/40 bg-card/70 p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            GymRat
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

          {premiumRequired && !premiumActive && (
            <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                <Crown className="h-4 w-4" />
                Premium required
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                This area is planned as a premium feature.
              </p>
              <button
                type="button"
                onClick={onOpenPremium}
                className="mt-4 rounded-2xl px-4 py-2 text-sm font-semibold gradient-accent text-accent-foreground shadow-gold"
              >
                Open Premium
              </button>
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-border/40 bg-secondary/20 p-4 text-sm text-muted-foreground">
            This screen is temporarily simplified so the app can build cleanly while we repair the remaining broken files one by one.
          </div>
        </div>
      </div>
    </div>
  );
}

function PremiumCard({
  open,
  onClose,
  onOpenPaywall,
}: {
  open: boolean;
  onClose: () => void;
  onOpenPaywall: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Close premium modal"
      />

      <div className="relative z-10 w-full max-w-sm rounded-[28px] border border-white/10 bg-zinc-950/95 p-5 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/80"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
          <Crown className="h-5 w-5" />
        </div>

        <div className="mt-3 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
          GymRat Premium
        </div>

        <h2 className="mt-1 text-xl font-black tracking-tight text-white">
          Unlock deeper features
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Premium is for nutrition, history, XP boost and premium gear. You can always close this and continue in the app.
        </p>

        <div className="mt-4 space-y-2 rounded-3xl border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-sm text-white/90">
            <Sparkles className="h-4 w-4" />
            Nutrition and macro targets
          </div>
          <div className="flex items-center gap-2 text-sm text-white/90">
            <Sparkles className="h-4 w-4" />
            Training history
          </div>
          <div className="flex items-center gap-2 text-sm text-white/90">
            <Sparkles className="h-4 w-4" />
            2x XP boost
          </div>
          <div className="flex items-center gap-2 text-sm text-white/90">
            <Sparkles className="h-4 w-4" />
            Premium cosmetics and gear
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={onOpenPaywall}
            className="rounded-xl px-4 py-2.5 text-sm font-bold gradient-accent text-accent-foreground shadow-gold"
          >
            Open Premium
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-400"
          >
            Continue with free version
          </button>
        </div>
      </div>
    </div>
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
    return () => {
      window.removeEventListener('premium-updated', rerender);
      window.removeEventListener('gymrat-language-changed', rerender);
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
    return <TrainingLevelSelector onComplete={handleFinishOnboarding} />;
  }

  if (view === 'settings') {
    return (
      <SettingsScreen
        onBack={goHome}
        premiumActive={appState.premiumActive}
      />
    );
  }

  if (view === 'daily-check-in') {
    return (
      <PlaceholderScreen
        title="Daily Check-in"
        subtitle="Mood, energy, soreness and recovery tracking."
        onBack={goHome}
      />
    );
  }

  if (view === 'food') {
    return (
      <PlaceholderScreen
        title="Nutrition"
        subtitle="Daily calories, macros and hydration."
        onBack={goHome}
        onOpenPremium={openPremium}
        premiumRequired
        premiumActive={appState.premiumActive}
      />
    );
  }

  if (view === 'history') {
    return (
      <PlaceholderScreen
        title="History"
        subtitle="Training overview, streaks and progress."
        onBack={goHome}
        onOpenPremium={openPremium}
        premiumRequired
        premiumActive={appState.premiumActive}
      />
    );
  }

  if (view === 'gallery') {
    return (
      <PlaceholderScreen
        title="Gallery"
        subtitle="Rat forms and visual progression."
        onBack={goHome}
      />
    );
  }

  if (view === 'shop') {
    return (
      <PlaceholderScreen
        title="Shop"
        subtitle="Cosmetics, gear and future item previews."
        onBack={goHome}
        onOpenPremium={openPremium}
        premiumActive={appState.premiumActive}
      />
    );
  }

  if (view === 'workout') {
    return (
      <PlaceholderScreen
        title="Workout"
        subtitle="Workout flow will be restored next."
        onBack={goHome}
        onOpenPremium={openPremium}
        premiumActive={appState.premiumActive}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pb-8 pt-4 text-foreground">
      <div className="mx-auto w-full max-w-md">
        <div className="relative overflow-hidden rounded-[32px] border border-border/40 bg-card/70 p-5 shadow-sm">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,215,0,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.10),transparent_35%)]" />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                GymRat
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight">Home</h1>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/40 bg-secondary/40 text-secondary-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="relative mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/40 bg-secondary/20 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Level
              </div>
              <div className="mt-1 text-2xl font-black">{appState.level}</div>
            </div>

            <div className="rounded-2xl border border-border/40 bg-secondary/20 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Streak
              </div>
              <div className="mt-1 flex items-center gap-2 text-2xl font-black">
                <Flame className="h-5 w-5" />
                {appState.streak}
              </div>
            </div>
          </div>

          <div className="relative mt-4 rounded-2xl border border-border/40 bg-secondary/20 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">XP progress</span>
              <span className="font-semibold">
                {appState.currentXP}/{appState.xpToNext}
              </span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-background/80">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${appState.progress}%` }}
              />
            </div>
          </div>

          <div className="relative mt-5 rounded-3xl border border-border/40 bg-secondary/20 p-5 text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-border/40 bg-background/60 text-5xl">
              🐀
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              Temporary stable home view while we rebuild the remaining screens cleanly.
            </div>
          </div>

          <div className="relative mt-5 grid gap-3">
            <button
              type="button"
              onClick={() => setView('workout')}
              className="h-12 w-full rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-md"
            >
              {t('startWorkout')}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setView('gallery')}
                className="rounded-2xl border border-border/40 bg-secondary/30 px-4 py-3 text-sm font-semibold"
              >
                {t('gallery')}
              </button>

              <button
                type="button"
                onClick={() => setView('shop')}
                className="rounded-2xl border border-border/40 bg-secondary/30 px-4 py-3 text-sm font-semibold"
              >
                {t('shop')}
              </button>
            </div>
          </div>

          {!appState.premiumActive && (
            <button
              type="button"
              onClick={openPremium}
              className="relative mt-4 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left gradient-accent text-accent-foreground shadow-gold"
            >
              <div>
                <div className="font-bold">Go Premium</div>
                <div className="text-xs text-accent-foreground/80">
                  Unlock nutrition, history, 2x XP boost and premium gear
                </div>
              </div>
              <Crown className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 transition ${
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          aria-label="Close menu overlay"
        />

        <aside
          className={`absolute right-0 top-0 h-full w-[80%] max-w-sm border-l border-white/10 bg-zinc-950/96 p-4 text-white shadow-2xl transition-transform duration-300 ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                Menu
              </div>
              <div className="mt-1 text-2xl font-black">GymRat</div>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/80"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setView('daily-check-in');
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
            >
              <div>
                <div className="font-semibold">Daily Check-in</div>
                <div className="text-xs text-zinc-400">Stay consistent every day</div>
              </div>
              <span>›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setView('food');
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
            >
              <div>
                <div className="font-semibold">Nutrition</div>
                <div className="text-xs text-zinc-400">Macros, goals and food tracking</div>
              </div>
              <span>›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setView('history');
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
            >
              <div>
                <div className="font-semibold">Training History</div>
                <div className="text-xs text-zinc-400">Logbook, progress and previous sessions</div>
              </div>
              <span>›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setView('settings');
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                <div>
                  <div className="font-semibold">Settings</div>
                  <div className="text-xs text-zinc-400">Language and app preferences</div>
                </div>
              </div>
              <span>›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                window.location.href = 'mailto:hello@getgymrat.com?subject=GymRat%20Support';
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
            >
              <div>
                <div className="font-semibold">Contact</div>
                <div className="text-xs text-zinc-400">Get help or ask a question</div>
              </div>
              <span>›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                window.location.href =
                  'mailto:hello@getgymrat.com?subject=GymRat%20Bug%20Report&body=Describe%20the%20issue%20here:%0A%0AWhat%20happened:%0A%0AWhat%20did%20you%20expect%20to%20happen:%0A';
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
            >
              <div>
                <div className="font-semibold">Report a Bug</div>
                <div className="text-xs text-zinc-400">Tell us when something breaks</div>
              </div>
              <span>›</span>
            </button>
          </div>

          {!appState.premiumActive && (
            <button
              type="button"
              onClick={openPremium}
              className="mt-6 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left gradient-accent text-accent-foreground shadow-gold"
            >
              <div>
                <div className="font-bold">Go Premium</div>
                <div className="text-xs text-accent-foreground/80">
                  Unlock nutrition, history, 2x XP boost and premium gear
                </div>
              </div>
              <Crown className="h-5 w-5" />
            </button>
          )}
        </aside>
      </div>

      <PremiumCard
        open={premiumOpen}
        onClose={() => setPremiumOpen(false)}
        onOpenPaywall={triggerPaywall}
      />
    </div>
  );
}