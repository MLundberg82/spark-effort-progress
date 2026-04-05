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
  icon,
}: {
  label: string;
  onClick: () => void;
  badge?: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-left text-white transition-all duration-200 hover:border-white/20 hover:bg-white/8 active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-white/90">
          {icon}
        </div>

        <div>
          <div className="text-[12px] font-black uppercase tracking-[0.18em]">
            {label}
          </div>
        </div>
      </div>

      {badge ? (
        <div className="rounded-full border border-lime-400/25 bg-lime-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-lime-300">
          {badge}
        </div>
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
  const handle = (fn: () => void) => {
    onClose();
    window.setTimeout(fn, 140);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="absolute right-0 top-0 h-full w-[80%] max-w-[420px] border-l border-white/10 bg-[linear-gradient(180deg,#111111_0%,#0a0a0a_100%)] p-4 shadow-[-24px_0_60px_rgba(0,0,0,0.45)] animate-in slide-in-from-right duration-300"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">
              Menu
            </div>
            <h2 className="mt-1 text-2xl font-black uppercase tracking-[0.04em] text-white">
              GymRat
            </h2>
            <p className="mt-1 text-sm text-white/45">
              Fast access. No fluff.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:border-white/20 hover:bg-white/10 active:scale-[0.98]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
                Status
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                {isPremium ? 'Premium active' : 'Base mode'}
              </div>
            </div>

            <div
              className={[
                'rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em]',
                isPremium
                  ? 'border border-lime-400/25 bg-lime-400/10 text-lime-300'
                  : 'border border-amber-400/20 bg-amber-400/10 text-amber-300',
              ].join(' ')}
            >
              {isPremium ? 'Unlocked' : 'Upgrade'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <MenuButton
            label="Daily Check-In"
            onClick={() => handle(onOpenDaily)}
            icon={<Flame className="h-4 w-4" />}
          />

          <MenuButton
            label="History"
            onClick={() => handle(onOpenHistory)}
            icon={<Flame className="h-4 w-4" />}
          />

          <MenuButton
            label="Nutrition"
            onClick={() => handle(onOpenNutrition)}
            badge={!isPremium ? 'Premium' : undefined}
            icon={<Flame className="h-4 w-4" />}
          />

          <MenuButton
            label="Level Gallery"
            onClick={() => handle(onOpenGallery)}
            icon={<Images className="h-4 w-4" />}
          />

          <MenuButton
            label="Shop"
            onClick={() => handle(onOpenShop)}
            icon={<ShoppingBag className="h-4 w-4" />}
          />

          <MenuButton
            label={isPremium ? 'Premium Active' : 'Unlock Premium'}
            onClick={() => handle(onOpenPremium)}
            badge={isPremium ? 'Active' : 'Boost'}
            icon={<Crown className="h-4 w-4" />}
          />

          <MenuButton
            label="Settings"
            onClick={() => handle(onOpenSettings)}
            icon={<Settings className="h-4 w-4" />}
          />
        </div>
      </div>
    </div>
  );
}