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

import gymratLogo from '@/assets/logo.png';

type AppMenuProps = {
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
  const isPremium = accent === 'premium';

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full items-center gap-3 rounded-[20px] border px-3.5 py-3.5 text-left transition',
        isPremium
          ? 'border-yellow-300/35 bg-[#3a2a00] hover:bg-[#4a3500] shadow-[0_0_28px_rgba(250,204,21,0.18)]'
          : 'border-white/12 bg-black hover:bg-[#0f0f0f]',
      ].join(' ')}
    >
      <div
        className={[
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border',
          isPremium
            ? 'border-yellow-300/35 bg-yellow-300/15 text-yellow-100'
            : 'border-white/12 bg-[#111111] text-lime-300',
        ].join(' ')}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <div
          className={[
            'text-sm font-black uppercase tracking-[0.14em]',
            isPremium ? 'text-yellow-50' : 'text-white',
          ].join(' ')}
        >
          {label}
        </div>
        <div
          className={[
            'mt-1 text-sm leading-snug',
            isPremium ? 'text-yellow-50/88' : 'text-lime-100/88',
          ].join(' ')}
        >
          {description}
        </div>
      </div>
    </button>
  );
}

export default function AppMenu({
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
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-white/12 bg-black p-2.5">
            <img
              src={gymratLogo}
              alt="GymRat"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/12 bg-black text-white transition hover:bg-[#111111]"
          aria-label="Close menu"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <section className="rounded-[22px] border border-white/12 bg-[#050505] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
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
            description="Logged sessions, archive and recent consistency."
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