import {
  Apple,
  Clock3,
  Crown,
  Dumbbell,
  Flame,
  History,
  Images,
  Lock,
  Settings2,
  ShoppingBag,
  Sparkles,
  TimerReset,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { AppPage } from '@/lib/appStore';
import { getTimerSettings, toggleTimerEnabled } from '@/lib/timerStore';
import { checkPremium } from '@/lib/premiumStore';

type AppMenuProps = {
  open: boolean;
  currentPage?: AppPage;
  onClose: () => void;
  onNavigate: (page: AppPage) => void;
  onOpenPaywall: () => void;
};

type MenuRowProps = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  premium?: boolean;
  locked?: boolean;
  active?: boolean;
  onClick: () => void;
};

function MenuRow({
  icon,
  title,
  subtitle,
  premium = false,
  locked = false,
  active = false,
  onClick,
}: MenuRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[1.25rem] border p-4 text-left transition ${
        active
          ? 'border-emerald-400/25 bg-emerald-400/10 shadow-[0_0_0_1px_rgba(74,222,128,0.08)]'
          : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            active ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/[0.06] text-white/80'
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-bold text-white">{title}</div>

            {premium ? (
              <span className="rounded-full border border-yellow-400/25 bg-yellow-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-yellow-200">
                Premium
              </span>
            ) : null}

            {locked ? (
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                Locked
              </span>
            ) : null}
          </div>

          {subtitle ? (
            <div className="mt-1 text-sm leading-relaxed text-white/55">{subtitle}</div>
          ) : null}
        </div>
      </div>
    </button>
  );
}

export default function AppMenu({
  open,
  currentPage = 'home',
  onClose,
  onNavigate,
  onOpenPaywall,
}: AppMenuProps) {
  const [, forceRender] = useState(0);
  const timer = useMemo(() => getTimerSettings(), [open]);
  const premiumActive = checkPremium();

  const goTo = (page: AppPage) => {
    onClose();
    onNavigate(page);
  };

  const goToPremium = () => {
    onClose();
    onOpenPaywall();
  };

  const handlePremiumRoute = (page: AppPage) => {
    if (premiumActive) {
      goTo(page);
      return;
    }

    goToPremium();
  };

  const toggleTimer = () => {
    toggleTimerEnabled();
    forceRender((value) => value + 1);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[430px] rounded-t-[2rem] border border-white/10 bg-[#09090b] px-4 pb-6 pt-4 shadow-[0_-20px_80px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Menu
            </div>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-white">
              GymRat
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/75 transition hover:bg-white/[0.08]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <MenuRow
            icon={<Sparkles className="h-4 w-4" />}
            title="Home"
            subtitle="Back to your rat, level and quick start."
            active={currentPage === 'home'}
            onClick={() => goTo('home')}
          />

          <MenuRow
            icon={<Dumbbell className="h-4 w-4" />}
            title="Start Workout"
            subtitle="Jump straight into the workout flow."
            active={currentPage === 'workout'}
            onClick={() => goTo('workout')}
          />

          <MenuRow
            icon={<Images className="h-4 w-4" />}
            title="Gallery"
            subtitle="See your rat evolution and unlocked milestone looks."
            active={currentPage === 'gallery'}
            onClick={() => goTo('gallery')}
          />

          <MenuRow
            icon={<ShoppingBag className="h-4 w-4" />}
            title="Shop"
            subtitle="Cosmetics, backgrounds and aura upgrades."
            active={currentPage === 'shop'}
            onClick={() => goTo('shop')}
          />

          <MenuRow
            icon={<Apple className="h-4 w-4" />}
            title="Nutrition"
            subtitle="Track food, macros and goal-linked targets."
            premium={!premiumActive}
            locked={!premiumActive}
            active={currentPage === 'nutrition'}
            onClick={() => handlePremiumRoute('nutrition')}
          />

          <MenuRow
            icon={<History className="h-4 w-4" />}
            title="Workout History"
            subtitle="See previous sessions and progression."
            premium={!premiumActive}
            locked={!premiumActive}
            active={currentPage === 'history'}
            onClick={() => handlePremiumRoute('history')}
          />

          <MenuRow
            icon={<Flame className="h-4 w-4" />}
            title="Daily Check-in"
            subtitle="Consistency layer and daily momentum."
            active={currentPage === 'daily'}
            onClick={() => goTo('daily')}
          />

          <MenuRow
            icon={<Crown className="h-4 w-4" />}
            title="Go Premium"
            subtitle="Unlock nutrition, history and premium cosmetics."
            premium
            onClick={goToPremium}
          />

          <MenuRow
            icon={<Settings2 className="h-4 w-4" />}
            title="Settings"
            subtitle="Profile, timer and premium controls."
            active={currentPage === 'settings'}
            onClick={() => goTo('settings')}
          />
        </div>

        <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
            <TimerReset className="h-4 w-4 text-emerald-300" />
            Workout timer
          </div>

          <div className="text-sm text-white/70">
            Set length: {timer.setSeconds}s · Rest: {timer.restSeconds}s
          </div>

          <button
            type="button"
            onClick={toggleTimer}
            className="mt-3 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left transition hover:bg-black/30"
          >
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-emerald-300" />
              <div>
                <div className="text-sm font-semibold text-white">Auto timer active</div>
                <div className="text-xs text-white/45">
                  Exact set/rest values are edited in Settings.
                </div>
              </div>
            </div>

            <div
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                timer.enabled
                  ? 'bg-emerald-400/15 text-emerald-300'
                  : 'bg-white/[0.06] text-white/55'
              }`}
            >
              {timer.enabled ? 'On' : 'Off'}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}