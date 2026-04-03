import GymRatStage from '@/components/GymRatStage';
import { ITEM_ASSETS } from '@/lib/itemAssets';
import type { EquippedItems, RatVariant } from '@/lib/assetTypes';

type ShopPageProps = {
  level: number;
  variant: RatVariant;
  equipped: EquippedItems;
  onEquip: (slot: keyof EquippedItems, itemId: string) => void;
};

export default function ShopPage({
  level,
  variant,
  equipped,
  onEquip,
}: ShopPageProps) {
  const availableItems = ITEM_ASSETS.filter((item) => !item.unlockLevel || level >= item.unlockLevel);

  return (
    <div className="min-h-screen bg-zinc-950 px-4 pb-24 pt-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
            Cosmetics
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Rat Shop
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Equip cosmetics that match the new progression style. Everything should feel native,
            premium and game-like.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <GymRatStage
            level={level}
            variant={variant}
            equipped={equipped}
            className="min-h-[620px]"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {availableItems.map((item) => {
              const active = equipped[item.slot] === item.id;

              return (
                <div
                  key={item.id}
                  className={`rounded-[24px] border p-4 ${
                    active
                      ? 'border-fuchsia-400/30 bg-fuchsia-500/10'
                      : 'border-white/10 bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-white">
                        {item.name}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                        {item.slot}
                      </div>
                      <div className="mt-2 text-xs text-zinc-400">
                        Unlock level: {item.unlockLevel ?? 1}
                      </div>
                    </div>

                    {item.premium ? (
                      <div className="rounded-full border border-amber-300/20 bg-amber-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
                        Premium
                      </div>
                    ) : null}
                  </div>

                  <button
                    onClick={() => onEquip(item.slot, item.id)}
                    className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      active
                        ? 'bg-white text-zinc-950'
                        : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {active ? 'Equipped' : 'Equip'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}