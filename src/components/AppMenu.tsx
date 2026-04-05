import { Crown, Apple, History, Dumbbell, Flame, Settings, X, TimerReset } from 'lucide-react';
import type { AppPage } from '../lib/appStore';

type AppMenuProps = {
  open: boolean;
  currentPage: AppPage;
  onClose: () => void;
  onNavigate: (page: AppPage) => void;
  onOpenPaywall: () => void;
};

type MenuItemProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  active?: boolean;
  premium?: boolean;
  onClick: () => void;
};

function MenuItem({
  icon,
  title,
  subtitle,
  active = false,
  premium = false,
  onClick,
}: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
        active
          ? 'border-lime-400/25 bg-lime-400/10'
          : 'border-white/10 bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-black/20 text-white">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white">{title}</p>
          {premium && (
            <span className="rounded-full bg-lime-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-lime-300">
              Premium
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-5 text-zinc-400">{subtitle}</p>
      </div>
    </button>
  );
}

export default function AppMenu({
  open,
  currentPage,
  onClose,
  onNavigate,
  onOpenPaywall,
}: AppMenuProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[75] bg-black/60" onClick={onClose}>
      <div
        className="absolute left-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto border-r border-white/10 bg-zinc-950 p-4 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-lime-300/80">Menu</p>
            <h2 className="mt-1 text-2xl font-black">GymRat</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <MenuItem
            icon={<Flame className="h-5 w-5" />}
            title="Daily Check-in"
            subtitle="Quick daily consistency and momentum check."
            active={currentPage === 'daily'}
            onClick={() => onNavigate('daily')}
          />

          <MenuItem
            icon={<Apple className="h-5 w-5" />}
            title="Nutrition"
            subtitle="Track food, macros and progress."
            premium
            active={currentPage === 'nutrition'}
            onClick={() => onNavigate('nutrition')}
          />

          <MenuItem
            icon={<History className="h-5 w-5" />}
            title="Workout History"
            subtitle="See previous sessions and progression."
            premium
            active={currentPage === 'history'}
            onClick={() => onNavigate('history')}
          />

          <MenuItem
            icon={<Dumbbell className="h-5 w-5" />}
            title="Shop"
            subtitle="Cosmetics, backgrounds and premium visuals."
            active={currentPage === 'shop'}
            onClick={() => onNavigate('shop')}
          />

          <MenuItem
            icon={<Settings className="h-5 w-5" />}
            title="Settings"
            subtitle="Profile, app status and timer settings."
            active={currentPage === 'settings'}
            onClick={() => onNavigate('settings')}
          />

          <div className="rounded-2xl border border-lime-400/20 bg-lime-400/10 p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-lime-300" />
              <p className="text-sm font-semibold text-white">Go Premium</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-300">
              Unlock nutrition, history, custom workout flow, timer upgrades and exclusive visual rewards.
            </p>

            <button
              type="button"
              onClick={onOpenPaywall}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 px-4 text-sm font-bold text-black"
            >
              <Crown className="h-4 w-4" />
              Open Premium
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <TimerReset className="h-4 w-4 text-lime-300" />
              <p className="text-sm font-semibold text-white">Timer</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              Timer setup lives in Settings next, then the same timer will float during workouts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}