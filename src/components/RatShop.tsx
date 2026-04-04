import { useMemo, useState } from 'react';
import { ArrowLeft, Crown, ShoppingBag, Sparkles, Zap } from 'lucide-react';
import {
  equipItem,
  getEquippedItem,
  getOwnedItems,
  isOwned,
  ownItem,
  shopItems,
  type ShopCategory,
} from '@/lib/shopStore';

type Props = {
  onBack: () => void;
  premiumActive?: boolean;
  onOpenPremium?: () => void;
};

const categories: { id: 'all' | ShopCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'cosmetic', label: 'Cosmetics' },
  { id: 'glow', label: 'Glow' },
  { id: 'background', label: 'Backgrounds' },
  { id: 'premium', label: 'Premium' },
];

export default function RatShop({
  onBack,
  premiumActive = false,
  onOpenPremium,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<'all' | ShopCategory>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const owned = useMemo(() => getOwnedItems(), [refreshKey]);
  const equipped = useMemo(() => getEquippedItem(), [refreshKey]);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return shopItems;
    return shopItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const handleBuy = (itemId: string) => {
    ownItem(itemId);
    setRefreshKey((prev) => prev + 1);
  };

  const handleEquip = (itemId: string) => {
    equipItem(itemId);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#07110d] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-8 pt-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_50px_rgba(170,255,140,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-lime-300/75">
                Shop
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight">Rat cosmetics</h1>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Identity, aura and visual progression.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-black/20 text-lime-200">
              <ShoppingBag className="h-7 w-7" />
            </div>
          </div>

          {!premiumActive && (
            <div className="mt-5 rounded-[26px] border border-yellow-300/20 bg-gradient-to-r from-yellow-300/12 via-white/[0.04] to-lime-300/12 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-300/10 text-yellow-200">
                  <Crown className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black text-white">Premium cosmetics</div>
                  <p className="mt-1 text-sm leading-6 text-white/68">
                    Unlock premium-only looks, glows and prestige visuals.
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenPremium}
                className="mt-4 w-full rounded-[18px] bg-gradient-to-r from-yellow-300 via-amber-300 to-lime-300 px-4 py-3 text-sm font-black text-[#111]"
              >
                Unlock Premium
              </button>
            </div>
          )}

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => {
              const active = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`shrink-0 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    active
                      ? 'bg-gradient-to-r from-lime-300 to-emerald-300 text-[#111]'
                      : 'border border-white/10 bg-white/[0.04] text-white/80'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          <div className="mt-5 space-y-3">
            {filteredItems.map((item) => {
              const ownedItem = owned.includes(item.id) || isOwned(item.id);
              const equippedItem = equipped === item.id;
              const lockedByPremium = item.premiumOnly && !premiumActive;

              return (
                <div
                  key={item.id}
                  className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white/[0.04] text-2xl">
                      {item.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-black text-white">{item.name}</div>
                        {item.premiumOnly && (
                          <span className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-200">
                            Premium
                          </span>
                        )}
                        {equippedItem && (
                          <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-lime-200">
                            Equipped
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-white/65">{item.description}</p>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/75">
                          <Zap className="h-3.5 w-3.5 text-lime-300" />
                          {item.price} coins
                        </div>

                        {lockedByPremium ? (
                          <button
                            onClick={onOpenPremium}
                            className="rounded-2xl bg-gradient-to-r from-yellow-300 via-amber-300 to-lime-300 px-4 py-2 text-xs font-black text-[#111]"
                          >
                            Unlock
                          </button>
                        ) : ownedItem ? (
                          <button
                            onClick={() => handleEquip(item.id)}
                            className={`rounded-2xl px-4 py-2 text-xs font-black ${
                              equippedItem
                                ? 'bg-lime-300 text-[#111]'
                                : 'bg-white/10 text-white'
                            }`}
                          >
                            {equippedItem ? 'Equipped' : 'Equip'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuy(item.id)}
                            className="rounded-2xl bg-gradient-to-r from-lime-300 via-emerald-300 to-yellow-300 px-4 py-2 text-xs font-black text-[#111]"
                          >
                            Buy
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <Sparkles className="h-4 w-4 text-lime-300" />
              Current style
            </div>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Equipped item: <span className="font-bold text-white">{equipped ?? 'None yet'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}