import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Crown,
  Lock,
  ShoppingBag,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';
import {
  equipItem,
  getEquippedItemIdForSlot,
  getOwnedItems,
  getShopItems,
  ownItem,
  unequipSlot,
  type ShopItem,
} from '../lib/shopStore';
import { isPremiumUnlocked } from '../lib/premiumStore';

type ShopScreenProps = {
  onBack: () => void;
  onOpenPaywall: () => void;
};

type ShopTab = 'all' | 'regular' | 'premium';

type UIItem = ReturnType<typeof getShopItems>[number];

function getCategoryLabel(item: UIItem) {
  if (item.slot === 'background') return 'Background';
  if (item.slot === 'aura') return 'Aura';
  if (item.slot === 'head') return 'Head';
  if (item.slot === 'eyes') return 'Eyes';
  if (item.slot === 'neck') return 'Neck';
  if (item.slot === 'top') return 'Top';
  if (item.slot === 'pants') return 'Pants';
  if (item.slot === 'feet') return 'Feet';
  return item.category;
}

function getAccentClasses(item: UIItem) {
  if (item.slot === 'background') {
    return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300';
  }

  if (item.slot === 'aura') {
    return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300';
  }

  if (item.isPremium) {
    return 'border-amber-300/20 bg-amber-300/10 text-amber-200';
  }

  return 'border-white/10 bg-white/[0.04] text-white/70';
}

function getActionLabel(item: UIItem, premium: boolean) {
  if (item.isPremium && !premium) return 'Premium only';
  if (!item.owned) return item.isPremium ? 'Unlock with Premium' : `Unlock ${item.priceLabel ?? '9 kr'}`;
  if (item.equipped) return 'Equipped';
  return 'Equip';
}

export default function ShopScreen({ onBack, onOpenPaywall }: ShopScreenProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<ShopTab>('all');

  useEffect(() => {
    const rerender = () => setRefreshKey((value) => value + 1);

    window.addEventListener('shop-updated', rerender);
    window.addEventListener('gymrat:premium-updated', rerender);

    return () => {
      window.removeEventListener('shop-updated', rerender);
      window.removeEventListener('gymrat:premium-updated', rerender);
    };
  }, []);

  const premium = isPremiumUnlocked();
  const ownedIds = getOwnedItems();

  const items = useMemo(() => {
    return getShopItems();
  }, [refreshKey, premium, ownedIds.length]);

  const visibleItems = useMemo(() => {
    if (activeTab === 'regular') return items.filter((item) => !item.isPremium);
    if (activeTab === 'premium') return items.filter((item) => item.isPremium);
    return items;
  }, [items, activeTab]);

  const ownedCount = items.filter((item) => item.owned).length;
  const equippedCount = items.filter((item) => item.equipped).length;
  const premiumCount = items.filter((item) => item.isPremium).length;

  const handlePrimaryAction = (item: UIItem) => {
    if (item.isPremium && !premium) {
      onOpenPaywall();
      return;
    }

    if (!item.owned && !item.isPremium) {
      ownItem(item.id);
      setRefreshKey((value) => value + 1);
      return;
    }

    if (item.equipped && item.slot) {
      unequipSlot(item.slot);
      setRefreshKey((value) => value + 1);
      return;
    }

    equipItem(item.id);
    setRefreshKey((value) => value + 1);
  };

  return (
    <div className="min-h-screen bg-[#0a0d12] px-4 pb-8 pt-5 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80">
            <ShoppingBag size={16} />
            Shop
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(245,158,11,0.10),rgba(255,255,255,0.03))] p-6 shadow-[0_16px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                <Sparkles size={14} />
                GymRat Identity
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight">
                Build your visual edge
              </h1>

              <p className="mt-2 text-sm leading-6 text-white/65">
                Premium should feel visible. Regular cosmetics can later connect to real purchases.
                Premium cosmetics should feel included, stronger and more exclusive.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:min-w-[360px]">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Owned
                </div>
                <div className="mt-2 text-xl font-black text-white">{ownedCount}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Equipped
                </div>
                <div className="mt-2 text-xl font-black text-white">{equippedCount}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Premium items
                </div>
                <div className="mt-2 text-xl font-black text-white">{premiumCount}</div>
              </div>
            </div>
          </div>
        </div>

        {!premium ? (
          <div className="rounded-[28px] border border-amber-300/10 bg-amber-300/[0.06] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-base font-bold text-white">
                  <Crown size={18} className="text-amber-200" />
                  Premium cosmetics unlock here
                </div>
                <div className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                  Premium includes selected cosmetics, aura effects and better hero backgrounds.
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenPaywall}
                className="rounded-2xl bg-amber-300 px-5 py-3 text-sm font-black text-black transition hover:brightness-105"
              >
                Open Premium
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {([
            { key: 'all', label: 'All items' },
            { key: 'regular', label: 'Regular items' },
            { key: 'premium', label: 'Premium included' },
          ] as const).map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setActiveTab(option.key)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeTab === option.key
                  ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
                  : 'border-white/10 bg-white/[0.03] text-white/70 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => {
            const equippedInSameSlot = item.slot
              ? getEquippedItemIdForSlot(item.slot) === item.id
              : false;

            return (
              <div
                key={item.id}
                className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/10 bg-black/20 text-2xl">
                    {item.icon || '✨'}
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${getAccentClasses(
                        item
                      )}`}
                    >
                      {getCategoryLabel(item)}
                    </span>

                    {item.isPremium ? (
                      <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
                        Premium
                      </span>
                    ) : null}

                    {equippedInSameSlot ? (
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                        Equipped
                      </span>
                    ) : null}
                  </div>
                </div>

                <h2 className="mt-4 text-xl font-black tracking-tight text-white">{item.name}</h2>
                <p className="mt-2 text-sm leading-6 text-white/60">{item.description}</p>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                    Access
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {item.isPremium ? 'Included in Premium' : item.priceLabel ?? '9 kr'}
                  </div>
                  <div className="mt-1 text-xs text-white/50">
                    {item.isPremium
                      ? 'No extra cosmetic purchase needed with Premium.'
                      : 'Regular cosmetics can later connect to local live pricing.'}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrimaryAction(item)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      item.isPremium && !premium
                        ? 'border border-amber-300/20 bg-amber-300/10 text-amber-200 hover:bg-amber-300/15'
                        : item.owned && item.equipped
                        ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                        : item.owned
                        ? 'bg-white text-black hover:scale-[1.01]'
                        : 'border border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.10]'
                    }`}
                  >
                    {item.isPremium && !premium ? (
                      <Lock size={16} />
                    ) : item.owned ? (
                      <Check size={16} />
                    ) : (
                      <Wand2 size={16} />
                    )}
                    {getActionLabel(item, premium)}
                  </button>

                  {item.owned && item.equipped && item.slot ? (
                    <button
                      type="button"
                      onClick={() => {
                        unequipSlot(item.slot);
                        setRefreshKey((value) => value + 1);
                      }}
                      className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/75 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 text-emerald-300" size={18} />
            <div>
              <div className="text-base font-bold text-white">Shop direction</div>
              <div className="mt-2 text-sm leading-6 text-white/60">
                Shoppen är nu byggd för riktig equip/unequip per slot, så hero-råttan kan spegla
                vad användaren faktiskt har på sig och vilken bakgrund som är vald.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}