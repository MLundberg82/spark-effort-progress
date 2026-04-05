import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Crown, Lock, ShoppingBag, Sparkles, Star } from 'lucide-react';

import EquippedRatPreview from '@/components/EquippedRatPreview';
import {
  canAccessShopItem,
  equipItem,
  getEquippedItemIdForSlot,
  getItemPreviewSrc,
  getShopItems,
  ownItem,
  subscribeShop,
  type ShopItem,
} from '@/lib/shopStore';
import type { SlotKey } from '@/lib/assetTypes';

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
      className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
        active
          ? 'border-lime-300/30 bg-lime-300/14 text-lime-200'
          : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.07]'
      }`}
    >
      <div>{label}</div>
      <div className="mt-1 text-[10px] tracking-[0.18em] text-zinc-400">
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
  const asset = getItemPreviewSrc(item);

  return (
    <div className="rounded-[28px] border border-white/10 bg-zinc-950/90 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.24)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-black tracking-tight text-white">{item.name}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{item.description}</p>
        </div>

        <div className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-300">
          {slotLabels[activeSlot]}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]">
        {asset ? (
          <div className="relative flex aspect-[16/10] items-center justify-center p-3">
            <img
              src={asset}
              alt={item.name}
              className="max-h-full max-w-full object-contain"
              draggable={false}
            />
          </div>
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center text-4xl">
            {item.icon || item.emoji || '✨'}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {locked ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-yellow-100">
            <Lock className="h-3.5 w-3.5" />
            Locked
          </div>
        ) : item.isPremium ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-yellow-100">
            <Crown className="h-3.5 w-3.5" />
            Premium
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-200">
            <Star className="h-3.5 w-3.5" />
            Base
          </div>
        )}

        <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-200">
          {isEquipped ? 'Equipped' : item.owned ? item.isPremium ? 'Premium owned' : 'Owned' : item.priceLabel}
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
            Buy · {item.priceLabel}
          </>
        )}
      </button>
    </div>
  );
}

export default function RatShop({ onBack, onOpenPremium }: RatShopProps) {
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
    <div className="min-h-screen bg-black px-5 py-5 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="button"
            onClick={onOpenPremium}
            className="inline-flex h-12 items-center gap-2 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 text-sm font-black uppercase tracking-[0.14em] text-yellow-100 transition hover:bg-yellow-300/15"
          >
            <Crown className="h-4 w-4" />
            See Premium
          </button>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-zinc-950/90 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.48)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-lime-200">
            <ShoppingBag className="h-3.5 w-3.5" />
            Cosmetics
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight">Build your look</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            Equip backgrounds, aura and item layers directly on your rat so progression feels visible.
          </p>

          <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
                  Live preview
                </div>
                <div className="mt-1 text-lg font-black text-white">Cosmetic loadout</div>
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-300">
                {slotLabels[activeSlot]}
              </div>
            </div>

            <EquippedRatPreview level={1} className="mx-auto max-w-[320px]" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                Owned
              </div>
              <div className="mt-1 text-2xl font-black text-white">{ownedCount}</div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                Premium
              </div>
              <div className="mt-1 text-2xl font-black text-white">{premiumCount}</div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                Slot
              </div>
              <div className="mt-1 text-base font-black text-white">{slotLabels[activeSlot]}</div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
              Slots
            </div>

            <div className="flex flex-wrap gap-2">
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

          <div className="mt-5">
            <div className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
              {slotLabels[activeSlot]}
            </div>

            {filteredItems.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] px-4 py-5">
                <div className="text-lg font-black text-white">No items in this slot yet</div>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  Fill this slot next so the rat always feels more alive over time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => {
                  const isCurrentlyEquipped = currentSlotEquipped === item.id;

                  return (
                    <ItemCard
                      key={item.id}
                      item={item}
                      activeSlot={activeSlot}
                      isEquipped={isCurrentlyEquipped}
                      onAction={handleBuyOrEquip}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}