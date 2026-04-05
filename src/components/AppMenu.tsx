import { Crown, Flame, Images, Settings, ShoppingBag, X } from 'lucide-react';

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

function MenuButton({
  label,
  onClick,
  badge,
}: {
  label: string;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:bg-white/[0.08]"
    >
      <span className="font-semibold text-white">{label}</span>
      {badge ? (
        <span className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-200">
          {badge}
        </span>
      ) : null}
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
    <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-y-0 left-0 w-[88%] max-w-[360px] border-r border-white/10 bg-[#111113] p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Menu
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">GymRat</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          <MenuButton label="Daily Check-In" onClick={onOpenDaily} />
          <MenuButton
            label="History"
            onClick={onOpenHistory}
            badge={isPremium ? undefined : 'Premium'}
          />
          <MenuButton
            label="Nutrition"
            onClick={onOpenNutrition}
            badge={isPremium ? undefined : 'Premium'}
          />
          <MenuButton label="Level Gallery" onClick={onOpenGallery} />
          <MenuButton label="Shop" onClick={onOpenShop} />
          <MenuButton label="Settings" onClick={onOpenSettings} />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
            <Flame className="mx-auto h-4 w-4 text-orange-300" />
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
              Daily
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
            <Images className="mx-auto h-4 w-4 text-zinc-200" />
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
              Style
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
            <ShoppingBag className="mx-auto h-4 w-4 text-zinc-200" />
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
              Shop
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenPremium}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-300 to-amber-300 px-4 py-4 font-black text-black"
        >
          <Crown className="h-4 w-4" />
          {isPremium ? 'Premium active' : 'Unlock Premium'}
        </button>
      </div>
    </div>
  );
}