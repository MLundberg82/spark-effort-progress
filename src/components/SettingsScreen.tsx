import { Crown, Flame, History, Settings, Sparkles, Timer, UtensilsCrossed, X } from 'lucide-react';
import type { ReactNode } from 'react';

type AppMenuProps = {
  isPremium: boolean;
  onClose: () => void;
  onOpenDaily: () => void;
  onOpenHistory: () => void;
  onOpenNutrition: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  onOpenTimerSettings: () => void;
  onOpenPremium: () => void;
};

type MenuButtonProps = {
  label: string;
  description: string;
  onClick: () => void;
  icon: ReactNode;
  accent?: 'default' | 'premium';
};

function MenuButton({
  label,
  description,
  onClick,
  icon,
  accent = 'default',
}: MenuButtonProps) {
  const classes =
    accent === 'premium'
      ? 'border-yellow-300/22 bg-[#101010] text-yellow-100 hover:bg-[#151515]'
      : 'border-white/12 bg-[#0c0c0c] text-white hover:bg-[#121212]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[18px] border px-4 py-3 text-left transition ${classes}`}
    >
      <div className="flex items-start gap-3">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-black text-white/85 shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-[13px] font-black uppercase tracking-[0.12em] text-white">
            {label}
          </h3>
          <p className="mt-1 text-[13px] leading-6 text-white/72">{description}</p>
        </div>
      </div>
    </button>
  );
}

export default function AppMenu({
  isPremium,
  onClose,
  onOpenDaily,
  onOpenHistory,
  onOpenNutrition,
  onOpenShop,
  onOpenSettings,
  onOpenTimerSettings,
  onOpenPremium,
}: AppMenuProps) {
  return (
    <div
      className="absolute inset-y-0 right-0 flex w-[80%] max-w-[420px] flex-col border-l border-white/12 bg-[#050505] shadow-[-24px_0_80px_rgba(0,0,0,0.72)]"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between border-b border-white/10 px-5 pb-4 pt-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/42">
            Menu
          </p>
          <h2 className="mt-1 text-[22px] font-black leading-none text-white">
            GymRat
          </h2>
          <p className="mt-2 text-sm text-white/62">
            {isPremium ? 'Premium active' : 'Base mode'}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/10 bg-black text-white/80 transition hover:bg-[#111111] hover:text-white"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
        <div className="space-y-2.5">
          <MenuButton
            label="Daily Check-In"
            description="Streak, recovery and recommended next focus."
            onClick={onOpenDaily}
            icon={<Flame className="h-5 w-5" />}
          />

          <MenuButton
            label="Timer Settings"
            description="Set timer, rest timer and loop behavior."
            onClick={onOpenTimerSettings}
            icon={<Timer className="h-5 w-5" />}
          />

          <MenuButton
            label="Settings"
            description="Profile, language and app setup."
            onClick={onOpenSettings}
            icon={<Settings className="h-5 w-5" />}
          />

          <MenuButton
            label="History"
            description="Progress, logs and workout overview."
            onClick={onOpenHistory}
            icon={<History className="h-5 w-5" />}
          />

          <MenuButton
            label="Nutrition"
            description="Macros, targets and food logging."
            onClick={onOpenNutrition}
            icon={<UtensilsCrossed className="h-5 w-5" />}
          />

          <MenuButton
            label="Shop"
            description="Cosmetics, backgrounds and identity unlocks."
            onClick={onOpenShop}
            icon={<Sparkles className="h-5 w-5" />}
          />

          <MenuButton
            label="Get Premium"
            description="Unlock the heavier version of GymRat."
            onClick={onOpenPremium}
            icon={<Crown className="h-5 w-5" />}
            accent="premium"
          />
        </div>
      </div>
    </div>
  );
}