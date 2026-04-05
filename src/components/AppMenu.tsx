import { useMemo, useState } from 'react';
import {
  Apple,
  Clock3,
  Crown,
  Dumbbell,
  Flame,
  History,
  Lock,
  Settings2,
  ShoppingBag,
  Sparkles,
  TimerReset,
  X,
} from 'lucide-react';
import type { AppPage } from '@/lib/appStore';
import { getTimerSettings, toggleTimerEnabled } from '@/lib/timerStore';

type AppMenuProps = {
  open: boolean;
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
  onClick: () => void;
};

function MenuRow({
  icon,
  title,
  subtitle,
  premium = false,
  locked = false,
  onClick,
}: MenuRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.08]"
    >
      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-bold text-white">{title}</div>

          {premium ? (
            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
              Premium
            </span>
          ) : null}

          {locked ? (
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
              <span className="inline-flex items-center gap-1">
                <Lock size={10} />
                Locked
              </span>
            </span>
          ) : null}
        </div>

        {subtitle ? (
          <div className="mt-1 text-sm leading-5 text-white/60">{subtitle}</div>
        ) : null}
      </div>
    </button>
  );
}

export default function AppMenu({
  open,
  onClose,
  onNavigate,
  onOpenPaywall,
}: AppMenuProps) {
  const [, forceRender] = useState(0);

  const timer = useMemo(() => getTimerSettings(), [open]);

  const goTo = (page: AppPage) => {
    onClose();
    onNavigate(page);
  };

  const goToPremium = () => {
    onClose();
    onOpenPaywall();
  };

  const toggleTimer = () => {
    toggleTimerEnabled();
    forceRender((value) => value + 1);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md border-l border-white/10 bg-[#0b0f14] p-4 text-white shadow-[-20px_0_60px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
              Menu
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight">GymRat</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/75 transition hover:bg-white/[0.08] hover:text-white"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <MenuRow
            icon={<Flame size={18} />}
            title="Home"
            subtitle="Back to your rat, level and quick start."
            onClick={() => goTo('home')}
          />

          <MenuRow
            icon={<Dumbbell size={18} />}
            title="Start Workout"
            subtitle="Jump straight into the workout flow."
            onClick={() => goTo('workout')}
          />

          <MenuRow
            icon={<ShoppingBag size={18} />}
            title="Shop"
            subtitle="Cosmetics, rewards and premium value layer."
            onClick={() => goTo('shop')}
          />

          <MenuRow
            icon={<Apple size={18} />}
            title="Nutrition"
            subtitle="Track food, macros and goals."
            premium
            locked
            onClick={goToPremium}
          />

          <MenuRow
            icon={<History size={18} />}
            title="Workout History"
            subtitle="See previous sessions and progression."
            premium
            locked
            onClick={goToPremium}
          />

          <MenuRow
            icon={<Sparkles size={18} />}
            title="Custom Workout"
            subtitle="Build your own sessions with the bigger exercise bank."
            premium
            locked
            onClick={goToPremium}
          />

          <MenuRow
            icon={<Crown size={18} />}
            title="Go Premium"
            subtitle="Unlock nutrition, history, custom workouts and premium cosmetics."
            premium
            onClick={goToPremium}
          />

          <MenuRow
            icon={<Settings2 size={18} />}
            title="Settings"
            subtitle="Profile, timer and premium controls."
            onClick={() => goTo('settings')}
          />

          <MenuRow
            icon={<Clock3 size={18} />}
            title="Daily Check-in"
            subtitle="Daily flow and consistency layer."
            onClick={() => goTo('daily')}
          />
        </div>

        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2">
            <TimerReset size={18} />
            <div className="text-sm font-bold text-white">Workout timer</div>
          </div>

          <div className="mt-2 text-sm text-white/60">
            Set length: {timer.setSeconds}s · Rest: {timer.restSeconds}s
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div>
              <div className="text-sm font-semibold text-white">Auto timer active</div>
              <div className="mt-1 text-xs text-white/55">
                Uses your saved timer settings during workouts.
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTimer}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                timer.enabled ? 'bg-lime-400' : 'bg-white/15'
              }`}
              aria-label="Toggle workout timer"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  timer.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="mt-3 text-xs text-white/45">
            Exact set/rest values are edited in Settings.
          </div>
        </div>
      </div>
    </div>
  );
}