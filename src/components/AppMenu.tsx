import type { ReactNode } from 'react';
import {
  Crown,
  History,
  Settings,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  X,
} from 'lucide-react';

type AppMenuProps = {
  isOpen: boolean;
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
  onClick: () => void;
  icon: ReactNode;
  accent?: 'default' | 'premium';
};

function MenuButton({
  label,
  onClick,
  icon,
  accent = 'default',
}: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full items-center gap-3 rounded-[20px] border px-4 py-3 text-left transition',
        accent === 'premium'
          ? 'border-yellow-300/20 bg-yellow-300/10 text-yellow-100 hover:bg-yellow-300/14'
          : 'border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
          accent === 'premium' ? 'bg-yellow-300/12' : 'bg-white/[0.06]',
        ].join(' ')}
      >
        {icon}
      </span>

      <span className="text-sm font-bold tracking-tight">{label}</span>
    </button>
  );
}

export default function AppMenu({
  isOpen,
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
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu overlay"
        className={[
          'fixed inset-0 z-40 bg-black/52 backdrop-blur-[2px] transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
      />

      <aside
        className={[
          'fixed right-0 top-0 z-50 flex h-[100dvh] w-[82%] max-w-sm flex-col border-l border-white/10',
          'bg-[#0a0d12]/96 px-4 pb-5 pt-4 shadow-[-18px_0_44px_rgba(0,0,0,0.38)] backdrop-blur-2xl',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        aria-hidden={!isOpen}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-lime-300/70">
              Menu
            </p>
            <h2 className="text-xl font-black tracking-tight text-white">GymRat</h2>
            <p className="mt-1 text-xs text-white/55">
              {isPremium ? 'Premium active' : 'Base mode'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.05] text-white/80 transition hover:bg-white/[0.08]"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          <MenuButton
            label="Daily Check-in"
            onClick={onOpenDaily}
            icon={<Sparkles className="h-4.5 w-4.5" />}
          />
          <MenuButton
            label="Nutrition"
            onClick={onOpenNutrition}
            icon={<UtensilsCrossed className="h-4.5 w-4.5" />}
          />
          <MenuButton
            label="Training History"
            onClick={onOpenHistory}
            icon={<History className="h-4.5 w-4.5" />}
          />
          <MenuButton
            label="Gallery"
            onClick={onOpenGallery}
            icon={<Sparkles className="h-4.5 w-4.5" />}
          />
          <MenuButton
            label="Shop"
            onClick={onOpenShop}
            icon={<ShoppingBag className="h-4.5 w-4.5" />}
          />
          <MenuButton
            label="Settings"
            onClick={onOpenSettings}
            icon={<Settings className="h-4.5 w-4.5" />}
          />

          {!isPremium ? (
            <div className="pt-2">
              <MenuButton
                label="Go Premium"
                onClick={onOpenPremium}
                icon={<Crown className="h-4.5 w-4.5" />}
                accent="premium"
              />
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}