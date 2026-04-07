import { type ReactNode } from 'react';
import {
  Clock3,
  Crown,
  FileText,
  Flame,
  History,
  Mail,
  Settings,
  Shield,
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
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
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
          ? 'border-yellow-300/35 bg-[#4a3400] hover:bg-[#5c4100] shadow-[0_0_28px_rgba(250,204,21,0.18)]'
          : 'border-white/12 bg-[#0a0a0a] hover:bg-[#131313]',
      ].join(' ')}
    >
      <div
        className={[
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border',
          isPremium
            ? 'border-yellow-300/35 bg-yellow-300/12 text-yellow-100'
            : 'border-white/12 bg-[#141414] text-lime-300',
        ].join(' ')}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <div
          className={[
            'text-sm font-black uppercase tracking-[0.14em]',
            isPremium ? 'text-yellow-50' : 'text-lime-200',
          ].join(' ')}
        >
          {label}
        </div>

        <div
          className={[
            'mt-1 text-sm leading-snug',
            isPremium ? 'text-yellow-50/90' : 'text-white/88',
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
  onOpenTerms,
  onOpenPrivacy,
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

      <section className="rounded-[22px] border border-white/12 bg-black p-4 shadow-[0_10px_30px_rgba(0,0,0,0.32)]">
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

      <section className="mt-auto rounded-[22px] border border-white/12 bg-black p-4 shadow-[0_10px_30px_rgba(0,0,0,0.32)]">
        <div className="space-y-2.5">
          <MenuButton
            label="Terms of Use"
            description="Open the in-app terms."
            onClick={onOpenTerms}
            icon={<Shield className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="Privacy Policy"
            description="Open the in-app privacy policy."
            onClick={onOpenPrivacy}
            icon={<FileText className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="Contact"
            description="hello@getgymrat.com"
            onClick={() => {
              window.location.href = 'mailto:hello@getgymrat.com';
            }}
            icon={<Mail className="h-4.5 w-4.5" />}
          />
        </div>
      </section>
    </div>
  );
}