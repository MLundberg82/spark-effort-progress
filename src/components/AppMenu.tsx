import { type ReactNode } from 'react';
import {
  Clock3,
  Crown,
  Flame,
  History,
  Settings,
  Sparkles,
  UtensilsCrossed,
  X,
} from 'lucide-react';

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
  const shellClasses =
    accent === 'premium'
      ? 'border-yellow-300/18 bg-yellow-300/[0.06] hover:bg-yellow-300/[0.09]'
      : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.06]';

  const iconClasses =
    accent === 'premium'
      ? 'border-yellow-300/14 bg-yellow-300/[0.07] text-yellow-100'
      : 'border-white/10 bg-white/[0.04] text-white/78';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-[62px] w-full items-center gap-3 rounded-[18px] border px-3.5 py-3 text-left transition ${shellClasses}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border transition ${iconClasses}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white">
          {label}
        </p>
        <p className="mt-1 line-clamp-2 text-[12px] leading-4 text-white/58">
          {description}
        </p>
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
    <aside
      className="pointer-events-auto absolute inset-y-0 right-0 flex h-full w-[84%] max-w-[400px] flex-col overflow-hidden rounded-l-[28px] border-l border-white/10 bg-[#070707] shadow-[-24px_0_80px_rgba(0,0,0,0.68)] animate-in slide-in-from-right duration-300"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="border-b border-white/8 px-4 pb-3.5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-300/85">
              Menu
            </p>
            <h2 className="mt-1 text-[24px] font-black tracking-tight text-white">
              GymRat
            </h2>
            <p className="mt-1 text-sm text-white/48">
              {isPremium ? 'Premium active' : 'Base mode'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="mt-3 rounded-[18px] border border-lime-300/14 bg-lime-300/[0.05] px-3 py-2.5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-lime-200/90">
            <Flame className="h-3.5 w-3.5" />
            Fast access
          </div>
          <p className="mt-1 text-[12px] leading-4 text-white/58">
            Cleaner menu, tighter controls, less blur.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 pt-3">
        <div className="space-y-2">
          <MenuButton
            icon={<Flame className="h-4.5 w-4.5" />}
            label="Daily Check-In"
            description="Streak, next focus and momentum snapshot."
            onClick={onOpenDaily}
          />

          <MenuButton
            icon={<Clock3 className="h-4.5 w-4.5" />}
            label="Timer Settings"
            description="Open timer controls, durations and reset options."
            onClick={onOpenTimerSettings}
          />

          <MenuButton
            icon={<History className="h-4.5 w-4.5" />}
            label="History"
            description="Your logged sessions and recent consistency."
            onClick={onOpenHistory}
          />

          <MenuButton
            icon={<UtensilsCrossed className="h-4.5 w-4.5" />}
            label="Nutrition"
            description="Calories, macros and goal-linked setup."
            onClick={onOpenNutrition}
          />

          <MenuButton
            icon={<Settings className="h-4.5 w-4.5" />}
            label="Profile & App"
            description="Body stats, training level and language."
            onClick={onOpenSettings}
          />

          <MenuButton
            icon={<Sparkles className="h-4.5 w-4.5" />}
            label="Shop"
            description="Cosmetics, glows, backgrounds and identity."
            onClick={onOpenShop}
          />

          <MenuButton
            icon={<Crown className="h-4.5 w-4.5 text-yellow-100" />}
            label="Get Premium"
            description="Unlock the heavier version of GymRat."
            onClick={onOpenPremium}
            accent="premium"
          />
        </div>
      </div>
    </aside>
  );
}