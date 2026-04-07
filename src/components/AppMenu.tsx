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
  const cardClasses =
    accent === 'premium'
      ? 'border-lime-300/20 bg-lime-300/[0.10] hover:bg-lime-300/[0.14] shadow-[0_0_24px_rgba(163,230,53,0.12)]'
      : 'border-white/12 bg-white/[0.08] hover:bg-white/[0.11]';

  const iconClasses =
    accent === 'premium'
      ? 'border-lime-300/20 bg-lime-300/[0.10] text-lime-100'
      : 'border-white/10 bg-white/[0.06] text-white/82';

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full items-center gap-3 rounded-[20px] border px-3.5 py-3.5 text-left transition',
        cardClasses,
      ].join(' ')}
    >
      <div
        className={[
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border',
          iconClasses,
        ].join(' ')}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <div className="text-sm font-black uppercase tracking-[0.14em] text-white">
          {label}
        </div>
        <div className="mt-1 text-sm leading-snug text-white/72">{description}</div>
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
    <div className="flex min-h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-lime-100/58">
            Menu
          </div>
          <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white">
            GymRat
          </h1>
          <p className="mt-1 text-sm text-white/72">
            {isPremium ? 'Premium active' : 'Base mode'}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/12 bg-white/[0.08] text-white transition hover:bg-white/[0.12]"
          aria-label="Close menu"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <section className="rounded-[22px] border border-white/12 bg-white/[0.08] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/52">
          Fast access
        </div>
        <p className="mt-2 text-sm leading-relaxed text-white/72">
          Premium transparency, stronger contrast and the same visual language across the whole menu stack.
        </p>
      </section>

      <section className="rounded-[22px] border border-white/12 bg-white/[0.08] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
        <div className="space-y-2.5">
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
            description="Logged sessions and recent consistency."
            onClick={onOpenHistory}
            icon={<History className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="Nutrition"
            description="Macros, calories and daily food log."
            onClick={onOpenNutrition}
            icon={<UtensilsCrossed className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="Profile & App"
            description="Body stats, training level and language."
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
      </section>
    </div>
  );
}