import type { ReactNode } from 'react';
import {
  Crown,
  Flame,
  History,
  Settings,
  ShoppingBag,
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
  onOpenGallery: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
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
  const accentClasses =
    accent === 'premium'
      ? 'border-yellow-300/20 bg-yellow-300/10 text-yellow-100 hover:bg-yellow-300/14'
      : 'border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]';

  return (
    <button
      onClick={onClick}
      className={`flex min-h-[64px] w-full items-center gap-3 rounded-[22px] border px-4 py-3 text-left transition ${accentClasses}`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
          accent === 'premium'
            ? 'border-yellow-300/20 bg-yellow-300/10'
            : 'border-white/10 bg-white/[0.05]'
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-black uppercase tracking-[0.12em]">
          {label}
        </div>
        <div className="mt-1 text-xs leading-5 text-white/60">{description}</div>
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
  onOpenGallery,
  onOpenShop,
  onOpenSettings,
  onOpenPremium,
}: AppMenuProps) {
  return (
    <div className="fixed inset-0 z-40">
      <button
        aria-label="Close menu overlay"
        onClick={onClose}
        className="absolute inset-0 bg-black/55"
      />

      <aside className="absolute right-0 top-0 flex h-full w-[80%] max-w-[420px] flex-col border-l border-white/10 bg-[#0a0a0a] px-4 pb-5 pt-4 text-white shadow-[-24px_0_60px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-lime-300/80">
              Menu
            </div>
            <div className="mt-2 text-2xl font-black tracking-tight">GymRat</div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white/75">
              <Flame className="h-3.5 w-3.5" />
              {isPremium ? 'Premium active' : 'Free mode'}
            </div>
          </div>

          <button
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] transition hover:bg-white/[0.08]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 overflow-y-auto pr-1">
          <MenuButton
            label="Daily check-in"
            description="Open your streak, daily momentum and recommended next step."
            onClick={onOpenDaily}
            icon={<Flame className="h-5 w-5" />}
          />

          <MenuButton
            label="History"
            description="See previous workouts, progress and long-term tracking."
            onClick={onOpenHistory}
            icon={<History className="h-5 w-5" />}
          />

          <MenuButton
            label="Nutrition"
            description="Macros, food logging and daily consistency."
            onClick={onOpenNutrition}
            icon={<UtensilsCrossed className="h-5 w-5" />}
          />

          <MenuButton
            label="Level gallery"
            description="View every GymRat form and locked milestone evolution."
            onClick={onOpenGallery}
            icon={<Sparkles className="h-5 w-5" />}
          />

          <MenuButton
            label="Shop"
            description="Unlock cosmetics, backgrounds and identity upgrades."
            onClick={onOpenShop}
            icon={<ShoppingBag className="h-5 w-5" />}
          />

          <MenuButton
            label="Settings"
            description="Profile, language, training setup, timer and support."
            onClick={onOpenSettings}
            icon={<Settings className="h-5 w-5" />}
          />

          <MenuButton
            label="Premium"
            description={
              isPremium
                ? 'Manage your premium access and unlocked progression layer.'
                : 'Unlock deeper tracking, custom tools and premium identity.'
            }
            onClick={onOpenPremium}
            icon={<Crown className="h-5 w-5" />}
            accent="premium"
          />
        </div>
      </aside>
    </div>
  );
}