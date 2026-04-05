import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Crown,
  Lock,
  ShoppingBag,
  Sparkles,
  Star,
} from 'lucide-react';
import EquippedRatPreview from '@/components/EquippedRatPreview';
import {
  canAccessShopItem,
  equipItem,
  getEquippedItemIdForSlot,
  getShopItems,
  ownItem,
  subscribeShop,
  type ShopItem,
} from '@/lib/shopStore';
import type { SlotKey } from '@/lib/assetTypes';
import { getBackgroundImage, getItemImage } from '@/lib/assetRegistry';

type RatShopProps = {
  onBack?: () => void;
  onOpenPremium?: () => void;
};

const slotLabels: Record<SlotKey, string> = {
  head: 'Head',
  eyes: 'Eyes',
  neck: 'Neck',
  top: 'Top',
  pants: 'Pants',
  feet: 'Feet',
  aura: 'Aura',
  background: 'Background',
};

const slotOrder: SlotKey[] = [
  'head',
  'eyes',
  'neck',
  'top',
  'pants',
  'feet',
  'aura',
  'background',
];

function getDisplayAsset(item: ShopItem) {
  if (item.slot === 'background') {
    return getBackgroundImage(item.id);
  }

  return getItemImage(item.id);
}

function SlotChip({
  label,
  active,
  equipped,
  onClick,
}: {
  label: string;
  active: boolean;
  equipped: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-[20px] border px-4 py-3 text-left transition ${
        active
          ? 'border-lime-300/25 bg-lime-300/10 shadow-[0_0_0_1px_rgba(163,230,53,0.08)]'
          : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]'
      }`}
    >
      <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white">
        {label}
      </div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">
        {equipped ? 'Equipped' : active ? 'Open' : 'Browse'}
      </div>
    </button>
  );
}

function ItemCard({
  item,
  activeSlot,
  isEquipped,
  onAction,
}: {
  item: ShopItem;
  activeSlot: SlotKey;
  isEquipped: boolean;
  onAction: (item: ShopItem) => void;
}) {
  const locked = !item.accessible;
  const asset = getDisplayAsset(item);

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_36%)]" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-black text-white">{item.name}</div>
            <div className="mt-1 text-sm leading-5 text-white/55">{item.description}</div>
          </div>

          <div className="shrink-0 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/70">
            {slotLabels[activeSlot]}
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-black/20">
          {asset ? (
            <img
              src={asset}
              alt={item.name}
              className="h-[120px] w-full object-contain p-3"
            />
          ) : (
            <div className="flex h-[120px] items-center justify-center text-4xl">
              {item.icon || item.emoji || '✨'}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {locked ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-yellow-200">
              <Lock className="h-3.5 w-3.5" />
              Locked
            </div>
          ) : item.isPremium ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-yellow-200">
              <Crown className="h-3.5 w-3.5 text-yellow-300" />
              Premium
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/70">
              <ShoppingBag className="h-3.5 w-3.5" />
              Base
            </div>
          )}

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/70">
            <Star className="h-3.5 w-3.5 text-lime-300" />
            {isEquipped
              ? 'Equipped'
              : item.owned
              ? item.isPremium
                ? 'Premium owned'
                : 'Owned'
              : item.priceLabel ?? '9 kr'}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAction(item)}
          className={`mt-4 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[22px] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] transition active:scale-[0.995] ${
            locked
              ? 'border border-yellow-300/20 bg-yellow-300/10 text-yellow-100 hover:bg-yellow-300/15'
              : isEquipped
              ? 'border border-white/10 bg-white text-black'
              : item.owned
              ? 'border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.09]'
              : 'bg-lime-300 text-black shadow-[0_18px_50px_rgba(163,230,53,0.18)] hover:brightness-105'
          }`}
        >
          {locked ? (
            <>
              <Crown className="h-4 w-4" />
              Unlock Premium
            </>
          ) : isEquipped ? (
            <>
              <Check className="h-4 w-4" />
              Equipped
            </>
          ) : item.owned ? (
            <>
              <Sparkles className="h-4 w-4" />
              Equip
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              Buy · {item.priceLabel ?? '9 kr'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function RatShop({
  onBack,
  onOpenPremium,
}: RatShopProps) {
  const [activeSlot, setActiveSlot] = useState<SlotKey>('top');
  const [refreshKey, setRefreshKey] = useState(0);

  const liveItems = useMemo(() => getShopItems(), [refreshKey]);

  const filteredItems = useMemo(() => {
    return liveItems.filter((item) => item.slot === activeSlot);
  }, [liveItems, activeSlot]);

  const currentSlotEquipped = getEquippedItemIdForSlot(activeSlot);

  const ownedCount = useMemo(() => {
    return liveItems.filter((item) => item.owned).length;
  }, [liveItems]);

  const premiumCount = useMemo(() => {
    return liveItems.filter((item) => item.isPremium).length;
  }, [liveItems]);

  useEffect(() => {
    return subscribeShop(() => {
      setRefreshKey((value) => value + 1);
    });
  }, []);

  const handleBuyOrEquip = (item: ShopItem) => {
    if (!canAccessShopItem(item)) {
      onOpenPremium?.();
      return;
    }

    if (!item.owned) {
      ownItem(item.id);
    }

    equipItem(item.id);
    setRefreshKey((value) => value + 1);
  };

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,rgba(132,204,22,0.14),transparent_28%),linear-gradient(180deg,#050505_0%,#0d0d0f_58%,#09090b_100%)] px-4 pb-8 pt-5 text-white">
      <div className="mx-auto max-w-md">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="button"
            onClick={onOpenPremium}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 text-[11px] font-black uppercase tracking-[0.18em] text-yellow-200 transition hover:bg-yellow-300/15 active:scale-[0.98]"
          >
            <Crown className="h-4 w-4 text-yellow-300" />
            See Premium
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-300">
            Cosmetics
          </div>

          <h1 className="mt-2 text-3xl font-black leading-none text-white">
            Build your look
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/60">
            Equip backgrounds, aura and item layers directly on your rat so progression feels visible.
          </p>

          <div className="mt-5 overflow-hidden rounded-[26px] border border-white/10 bg-black/20 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">
              Live Preview
            </div>

            <div className="relative mt-4 h-[220px] overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(163,230,53,0.14),rgba(255,255,255,0.02),transparent_72%)]">
              <EquippedRatPreview
                className="h-full w-full object-contain p-3"
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-3 py-3">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/42">
                  Owned
                </div>
                <div className="mt-2 text-xl font-black text-white">{ownedCount}</div>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-3 py-3">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/42">
                  Premium
                </div>
                <div className="mt-2 text-xl font-black text-white">{premiumCount}</div>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-3 py-3">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/42">
                  Slot
                </div>
                <div className="mt-2 text-xl font-black text-white">
                  {slotLabels[activeSlot]}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">
            Slots
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {slotOrder.map((slot) => {
              const active = activeSlot === slot;
              const equipped = Boolean(getEquippedItemIdForSlot(slot));

              return (
                <SlotChip
                  key={slot}
                  label={slotLabels[slot]}
                  active={active}
                  equipped={equipped}
                  onClick={() => setActiveSlot(slot)}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-4 rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">
            Cosmetic loadout
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {slotLabels[activeSlot]}
          </div>

          {filteredItems.length === 0 ? (
            <div className="mt-4 rounded-[24px] border border-dashed border-white/10 bg-black/20 p-6 text-center">
              <div className="text-lg font-black text-white">No items in this slot yet</div>
              <div className="mt-2 text-sm leading-6 text-white/55">
                Fill this slot next so the rat always feels more alive over time.
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {filteredItems.map((item) => {
                const isEquipped = currentSlotEquipped === item.id;

                return (
                  <ItemCard
                    key={item.id}
                    item={item}
                    activeSlot={activeSlot}
                    isEquipped={isEquipped}
                    onAction={handleBuyOrEquip}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}