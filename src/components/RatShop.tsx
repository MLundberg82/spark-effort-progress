import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Crown,
  Lock,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

import EquippedRatPreview from '@/components/EquippedRatPreview';
import { getProfile } from '@/lib/profileStore';
import {
  canAccessShopItem,
  equipItem,
  getEquippedItemIdForSlot,
  getShopItems,
  ownItem,
  shopItems,
  subscribeShop,
  type ShopItem,
} from '@/lib/shopStore';
import type { ItemSlot } from '@/lib/assetTypes';
import { getItemImage, getBackgroundImage } from '@/lib/assetRegistry';

type SlotKey = ItemSlot | 'background';

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

function getBadge(item: ReturnType<typeof getShopItems>[number]) {
  if (item.equipped) return 'Equipped';
  if (item.owned) return item.isPremium ? 'Premium owned' : 'Owned';
  if (!item.accessible) return 'Premium';
  return item.priceLabel ?? '9 kr';
}

export default function RatShop({ onBack, onOpenPremium }: RatShopProps) {
  const [activeSlot, setActiveSlot] = useState<SlotKey>('top');
  const [refreshKey, setRefreshKey] = useState(0);

  const profile = getProfile();
  const level = 1;

  const liveItems = useMemo(() => getShopItems(), [refreshKey]);

  const filteredItems = useMemo(() => {
    return liveItems.filter((item) => item.slot === activeSlot);
  }, [liveItems, activeSlot]);

  useEffect(() => {
    return subscribeShop(() => {
      setRefreshKey((value) => value + 1);
    });
  }, []);

  const handleBuyOrEquip = (item: ReturnType<typeof getShopItems>[number]) => {
    if (!canAccessShopItem(item)) {
      onOpenPremium?.();
      return;
    }

    if (!item.owned && !item.isPremium) {
      ownItem(item.id);
      setRefreshKey((value) => value + 1);
    }

    equipItem(item.id);
    setRefreshKey((value) => value + 1);
  };

  const currentSlotEquipped = getEquippedItemIdForSlot(activeSlot);

  return (
    <div className="min-h-screen bg-[#09090b] px-4 pb-8 pt-4 text-white">
      <div className="mx-auto max-w-[430px]">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white/75 transition hover:bg-white/[0.08]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Rat Shop
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            <Sparkles className="h-4 w-4" />
            Cosmetic loadout
          </div>

          <h1 className="text-[2rem] font-black tracking-[-0.04em]">Build your look</h1>
          <p className="mt-2 text-sm text-white/68">
            Equip backgrounds, aura and item layers directly on your rat.
          </p>

          <div className="mt-5 flex justify-center">
            <EquippedRatPreview level={level} gender={profile?.gender} size="hero" />
          </div>
        </div>

        <div className="mt-4 rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
            <ShoppingBag className="h-4 w-4 text-emerald-300" />
            Slots
          </div>

          <div className="grid grid-cols-4 gap-2">
            {slotOrder.map((slot) => {
              const active = activeSlot === slot;
              const equipped = getEquippedItemIdForSlot(slot);

              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setActiveSlot(slot)}
                  className={`rounded-2xl px-3 py-3 text-center transition ${
                    active
                      ? 'border border-emerald-400/25 bg-emerald-400/10'
                      : 'border border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
                  }`}
                >
                  <div className="text-xs font-semibold text-white">{slotLabels[slot]}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/45">
                    {equipped ? 'Equipped' : 'Empty'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {filteredItems.map((item) => {
            const locked = !item.accessible;
            const asset = getDisplayAsset(item);
            const isCurrentSlotEquipped = currentSlotEquipped === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-[1.5rem] border p-4 transition ${
                  isCurrentSlotEquipped
                    ? 'border-emerald-400/25 bg-emerald-400/10'
                    : 'border-white/10 bg-white/[0.04]'
                }`}
              >
                <div className="flex gap-4">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                    {asset ? (
                      <img
                        src={asset}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="text-2xl">{item.icon}</div>
                    )}

                    {locked ? (
                      <div className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white/80">
                        <Lock className="h-3.5 w-3.5" />
                      </div>
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{item.name}</h3>

                          {item.isPremium ? (
                            <span className="rounded-full border border-yellow-400/25 bg-yellow-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-yellow-200">
                              Premium
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 text-sm leading-relaxed text-white/55">
                          {item.description}
                        </p>
                      </div>

                      <div className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
                        {getBadge(item)}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs uppercase tracking-[0.12em] text-white/45">
                        Slot: {slotLabels[activeSlot]}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBuyOrEquip(item)}
                        className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                          locked
                            ? 'bg-yellow-400/15 text-yellow-200 hover:bg-yellow-400/20'
                            : isCurrentSlotEquipped
                            ? 'bg-white text-black'
                            : 'bg-emerald-400 text-black hover:brightness-105'
                        }`}
                      >
                        {locked ? (
                          <span className="inline-flex items-center gap-2">
                            <Crown className="h-4 w-4" />
                            Unlock Premium
                          </span>
                        ) : isCurrentSlotEquipped ? (
                          <span className="inline-flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Equipped
                          </span>
                        ) : item.owned ? (
                          'Equip'
                        ) : (
                          `Buy · ${item.priceLabel ?? '9 kr'}`
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-white/55">
              No items in this slot yet.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}