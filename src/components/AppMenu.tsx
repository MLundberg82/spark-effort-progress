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
      className={[
        'flex w-full items-center gap-3 rounded-[18px] border px-3.5 py-3 text-left transition',
        classes,
      ].join(' ')}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-white/80">
        {icon}
      </div>

      <div className="min-w-0">
        <div className="text-sm font-black uppercase tracking-[0.14em]">
          {label}
        </div>
        <div className="mt-1 text-sm text-white/60">{description}</div>
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
    <div className="min-h-full bg-[#050505] px-4 pb-8 pt-4">
      <div className="mx-auto flex w-full max-w-[520px] flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
              Menu
            </div>
            <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-white">
              GymRat
            </h2>
            <p className="mt-1 text-sm text-white/55">
              {isPremium ? 'Premium active' : 'Base mode'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
            Fast access
          </div>
          <p className="mt-2 text-sm text-white/60">
            Cleaner menu, tighter controls, less blur.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
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
            description="Logged sessions, trends and recent consistency."
            onClick={onOpenHistory}
            icon={<History className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="Nutrition"
            description="Macros and calories synced from your goal."
            onClick={onOpenNutrition}
            icon={<UtensilsCrossed className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="Profile & App"
            description="Body stats, level and language."
            onClick={onOpenSettings}
            icon={<Settings className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="Get Premium"
            description="Unlock the heavier version of GymRat."
            onClick={onOpenPremium}
            icon={<Crown className="h-4.5 w-4.5" />}
            accent="premium"
          />
        </div>
      </div>
    </div>
  );
}