import { type ReactNode } from 'react';
import {
  Clock3,
  Crown,
  Flame,
  History,
  Mail,
  Settings,
  Shield,
  Sparkles,
  UtensilsCrossed,
  X,
} from 'lucide-react';

import gymratLogo from '@/assets/logo.png';

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

type FooterLinkCardProps = {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
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
      ? 'border-lime-300/22 bg-lime-300/[0.16] hover:bg-lime-300/[0.20] shadow-[0_0_24px_rgba(163,230,53,0.12)]'
      : 'border-white/14 bg-black/38 hover:bg-black/46';

  const iconClasses =
    accent === 'premium'
      ? 'border-lime-300/22 bg-lime-300/[0.14] text-lime-100'
      : 'border-white/12 bg-white/[0.08] text-white/88';

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
        <div className="mt-1 text-sm leading-snug text-white/82">
          {description}
        </div>
      </div>
    </button>
  );
}

function FooterLinkCard({
  href,
  label,
  description,
  icon,
}: FooterLinkCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-[18px] border border-white/14 bg-black/38 px-3.5 py-3 transition hover:bg-black/46"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/12 bg-white/[0.08] text-white/88">
        {icon}
      </div>

      <div className="min-w-0">
        <div className="text-sm font-black uppercase tracking-[0.14em] text-white">
          {label}
        </div>
        <div className="mt-1 text-sm leading-snug text-white/76">
          {description}
        </div>
      </div>
    </a>
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
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-white/14 bg-black/38 p-2">
            <img
              src={gymratLogo}
              alt="GymRat"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="min-w-0">
            <div className="text-sm font-black uppercase tracking-[0.14em] text-white">
              GYMRAT
            </div>
            <div className="mt-1 text-sm text-white/78">
              {isPremium ? 'Premium active' : 'Base mode'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/14 bg-black/38 text-white transition hover:bg-black/46"
          aria-label="Close menu"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <section className="rounded-[22px] border border-white/14 bg-white/[0.06] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
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
            description="Logged sessions, workout archive and recent consistency."
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

      <section className="mt-auto rounded-[22px] border border-white/14 bg-white/[0.06] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
        <div className="space-y-2.5">
          <FooterLinkCard
            href="https://getgymrat.com/terms"
            label="Terms of Use"
            description="Use of the app, premium terms, acceptable use and non-medical disclaimer."
            icon={<Shield className="h-4.5 w-4.5" />}
          />

          <FooterLinkCard
            href="https://getgymrat.com/privacy"
            label="Privacy Policy"
            description="How workout, nutrition, device and usage data may be collected and handled."
            icon={<Sparkles className="h-4.5 w-4.5" />}
          />

          <FooterLinkCard
            href="mailto:hello@getgymrat.com"
            label="Contact"
            description="hello@getgymrat.com"
            icon={<Mail className="h-4.5 w-4.5" />}
          />
        </div>
      </section>
    </div>
  );
}