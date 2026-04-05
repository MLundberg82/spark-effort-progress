import { Crown, History, Settings, ShoppingBag, Sparkles, UtensilsCrossed, X } from 'lucide-react';

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
  icon: React.ReactNode;
  accent?: 'default' | 'premium';
};

function MenuButton({
  label,
  description,
  onClick,
  icon,
  accent = 'default',
}: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
        accent === 'premium'
          ? 'border-yellow-300/20 bg-yellow-300/10 hover:bg-yellow-300/15'
          : 'border-white/10 bg-white/[0.05] hover:bg-white/[0.08]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
            accent === 'premium' ? 'bg-yellow-300/15 text-yellow-100' : 'bg-white/[0.08] text-white'
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-sm font-black uppercase tracking-[0.14em] text-white">{label}</div>
          <div className="mt-1 text-sm leading-5 text-zinc-300">{description}</div>
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
  onOpenGallery,
  onOpenShop,
  onOpenSettings,
  onOpenPremium,
}: AppMenuProps) {
  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="Close menu backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
      />

      <aside className="absolute right-0 top-0 h-full w-[80%] max-w-[420px] border-l border-white/10 bg-zinc-950/96 p-5 shadow-[-20px_0_60px_rgba(0,0,0,0.45)]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
              Menu
            </div>
            <div className="mt-1 text-2xl font-black tracking-tight text-white">
              GymRat
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/[0.08]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
            Status
          </div>
          <div className="mt-2 text-lg font-black text-white">
            {isPremium ? 'Premium active' : 'Base mode'}
          </div>
          <div className="mt-1 text-sm leading-6 text-zinc-300">
            Keep the shell simple and stable while we harden flows and connect real premium.
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto pb-8">
          <MenuButton
            label="Daily check-in"
            description="Open streak, momentum and today’s quick entry point."
            onClick={onOpenDaily}
            icon={<Sparkles className="h-5 w-5" />}
          />

          <MenuButton
            label="History"
            description="View progression, workouts and long-term consistency."
            onClick={onOpenHistory}
            icon={<History className="h-5 w-5" />}
          />

          <MenuButton
            label="Nutrition"
            description="Open macro and nutrition view."
            onClick={onOpenNutrition}
            icon={<UtensilsCrossed className="h-5 w-5" />}
          />

          <MenuButton
            label="Gallery"
            description="See all level milestones and forms."
            onClick={onOpenGallery}
            icon={<Sparkles className="h-5 w-5" />}
          />

          <MenuButton
            label="Shop"
            description="Equip backgrounds, auras and cosmetic layers."
            onClick={onOpenShop}
            icon={<ShoppingBag className="h-5 w-5" />}
          />

          <MenuButton
            label="Settings"
            description="Re-open setup and profile controls safely."
            onClick={onOpenSettings}
            icon={<Settings className="h-5 w-5" />}
          />

          <MenuButton
            label="Premium"
            description="Unlock the stronger version of GymRat."
            onClick={onOpenPremium}
            icon={<Crown className="h-5 w-5" />}
            accent="premium"
          />
        </div>
      </aside>
    </div>
  );
}