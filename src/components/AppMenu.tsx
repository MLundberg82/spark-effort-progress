import { Crown, Flame, History, Settings, Sparkles, Timer, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { AppPage } from '@/lib/appStore';
import { getTimerSettings, toggleTimerEnabled } from '@/lib/timerSettingsStore';
import { isPremiumUnlocked } from '@/lib/premiumStore';

type AppMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: AppPage) => void;
  onOpenPaywall: () => void;
};

type MenuCardProps = {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onClick: () => void;
  premium?: boolean;
  locked?: boolean;
};

function MenuCard({
  title,
  subtitle,
  icon,
  onClick,
  premium = false,
  locked = false,
}: MenuCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.08]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex rounded-2xl bg-white/[0.05] p-3 text-emerald-300">
          {icon}
        </div>

        <div className="flex gap-2">
          {premium ? (
            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200">
              Premium
            </span>
          ) : null}

          {locked ? (
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
              Locked
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-base font-bold text-white">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-zinc-400">{subtitle}</div> : null}
      </div>
    </button>
  );
}

export default function AppMenu({
  isOpen,
  onClose,
  onNavigate,
  onOpenPaywall,
}: AppMenuProps) {
  const [, forceRender] = useState(0);
  const timer = useMemo(() => getTimerSettings(), [isOpen]);
  const premiumUnlocked = isPremiumUnlocked();

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[430px] rounded-t-[2rem] border border-white/10 bg-[#09090b] p-4 text-white shadow-[0_-24px_80px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
              Menu
            </div>
            <h2 className="mt-1 text-2xl font-black">GymRat</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-3">
          <MenuCard
            title="Daily Check-in"
            subtitle="Keep the streak and lock in your day."
            icon={<Flame className="h-5 w-5" />}
            onClick={() => goTo('daily')}
          />

          <MenuCard
            title="History"
            subtitle="Review workouts, progression and consistency."
            icon={<History className="h-5 w-5" />}
            onClick={() => goTo('history')}
          />

          <MenuCard
            title="Nutrition"
            subtitle="Macros, goals and premium nutrition tracking."
            icon={<Sparkles className="h-5 w-5" />}
            onClick={() => goTo('nutrition')}
            premium={!premiumUnlocked}
            locked={!premiumUnlocked}
          />

          <button
            type="button"
            onClick={toggleTimer}
            className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.08]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-2xl bg-white/[0.05] p-3 text-emerald-300">
                  <Timer className="h-5 w-5" />
                </div>

                <div>
                  <div className="text-base font-bold text-white">Workout Timer</div>
                  <div className="mt-1 text-sm text-zinc-400">
                    {timer.enabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>

              <div
                className={`h-6 w-11 rounded-full p-1 transition ${
                  timer.enabled ? 'bg-emerald-400' : 'bg-white/10'
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-black transition ${
                    timer.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </button>

          <MenuCard
            title={premiumUnlocked ? 'Premium active' : 'Go Premium'}
            subtitle={
              premiumUnlocked
                ? 'Your premium access is active.'
                : 'Unlock nutrition, history depth, custom workouts and more.'
            }
            icon={<Crown className="h-5 w-5" />}
            onClick={goToPremium}
            premium
          />

          <MenuCard
            title="Settings"
            subtitle="Language, app behavior and future preferences."
            icon={<Settings className="h-5 w-5" />}
            onClick={() => goTo('settings')}
          />
        </div>
      </div>
    </div>
  );
}