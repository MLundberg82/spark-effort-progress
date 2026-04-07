import { type ReactNode } from 'react';
import {
  Clock3,
  Crown,
  Flame,
  History,
  Settings,
  UtensilsCrossed,
  X,
} from 'lucide-react';

type AppMenuProps = {
  isPremium: boolean;
  onClose: () => void;
  onOpenDaily: () => void;
  onOpenHistory: () => void;
  onOpenNutrition: () => void;
  onOpenSettings: () => void;
  onOpenTimer: () => void;
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
      ? 'border-yellow-300/20 bg-yellow-300/12 text-yellow-100 hover:bg-yellow-300/16'
      : 'border-white/12 bg-[#101010] text-white hover:bg-[#171717]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-[60px] w-full items-center gap-3 rounded-[18px] border px-3.5 py-3 text-left transition ${classes}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.06] text-white">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white">
          {label}
        </p>
        <p className="mt-1 line-clamp-2 text-[12px] leading-4 text-white/78">
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
  onOpenSettings,
  onOpenTimer,
  onOpenPremium,
}: AppMenuProps) {
  return (
    <aside
      className="pointer-events-auto absolute inset-y-0 right-0 flex h-full w-[84%] max-w-[400px] flex-col overflow-hidden rounded-l-[28px] border-l border-white/10 bg-[#060606] shadow-[-24px_0_80px_rgba(0,0,0,0.68)] animate-in slide-in-from-right duration-300"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="border-b border-white/8 px-4 pb-3.5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-300/90">
              Menu
            </p>
            <h2 className="mt-1 text-[24px] font-black tracking-tight text-white">
              GymRat
            </h2>
            <p className="mt-1 text-sm text-white/65">
              {isPremium ? 'Premium active' : 'Base mode'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.05] text-white/78 transition hover:bg-white/[0.1] hover:text-white"
          >
            <X className="h-4.5 w-4.5" />
          </button>
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
            description="Only timer controls, durations and loop mode."
            onClick={onOpenTimer}
          />

          <MenuButton
            icon={<History className="h-4.5 w-4.5" />}
            label="History"
            description="Logged sessions, trends and recent consistency."
            onClick={onOpenHistory}
          />

          <MenuButton
            icon={<UtensilsCrossed className="h-4.5 w-4.5" />}
            label="Nutrition"
            description="Macros and calories synced from your goal."
            onClick={onOpenNutrition}
          />

          <MenuButton
            icon={<Settings className="h-4.5 w-4.5" />}
            label="Profile & App"
            description="Body stats, level and language."
            onClick={onOpenSettings}
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