import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Crown, Lock, ShoppingBag } from 'lucide-react';
import EquippedRatPreview from '@/components/EquippedRatPreview';
import {
  canAccessShopItem,
  equipItem,
  getEquippedItemIdForSlot,
  getShopItems,
  ownItem,
  subscribeShop,
} from '@/lib/shopStore';
import type { ItemSlot } from '@/lib/assetTypes';
import { getBackgroundImage, getItemImage } from '@/lib/assetRegistry';

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

function getDisplayAsset(item: { id: string; slot?: SlotKey }) {
  if (item.slot === 'background') {
    return getBackgroundImage(item.id);
  }
  return getItemImage(item.id);
}

export default function RatShop({ onBack, onOpenPremium }: RatShopProps) {
  const [activeSlot, setActiveSlot] = useState<SlotKey>('top');
  const [refreshKey, setRefreshKey] = useState(0);

  const liveItems = useMemo(() => getShopItems(), [refreshKey]);

  const filteredItems = useMemo(() => {
    return liveItems.filter((item) => item.slot === activeSlot);
  }, [liveItems, activeSlot]);

  useEffect(() => {
    return subscribeShop(() => {
      setRefreshKey((value) => value + 1);
    });
  }, []);

  const handleBuyOrEquip = (item: (typeof filteredItems)[number]) => {
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
    <div className="min-h-screen bg-[#09090b] px-4 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-[430px]">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/10 px-3 py-2 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
              Rat Shop
            </div>
            <div className="text-lg font-black leading-none">Cosmetics</div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
            Cosmetic loadout
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Build your look</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Equip backgrounds, aura and item layers directly on your rat.
          </p>

          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Live Preview</div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-200">
                <ShoppingBag className="h-3 w-3" />
                Equipped items
              </span>
            </div>

            <EquippedRatPreview />
          </div>

          <div className="mt-5">
            <div className="text-sm font-semibold text-white">Slots</div>
            <div className="mt-3 grid grid-cols-4 gap-2">
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
                    <div className="mt-1 text-[10px] text-zinc-400">
                      {equipped ? 'Equipped' : 'Empty'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filteredItems.map((item) => {
              const locked = !item.accessible;
              const asset = getDisplayAsset(item);
              const isCurrentSlotEquipped = currentSlotEquipped === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                      {asset ? (
                        <img
                          src={asset}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="text-3xl">{item.icon || '✨'}</div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-white">{item.name}</h3>
                          <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
                        </div>

                        {locked ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/15 bg-yellow-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-yellow-200">
                            <Lock className="h-3 w-3" />
                            Premium
                          </span>
                        ) : item.isPremium ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/15 bg-amber-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200">
                            <Crown className="h-3 w-3" />
                            Premium
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                        <span>Slot: {slotLabels[activeSlot]}</span>
                        <span>
                          {isCurrentSlotEquipped
                            ? 'Equipped'
                            : item.owned
                            ? item.isPremium
                              ? 'Premium owned'
                              : 'Owned'
                            : item.priceLabel ?? '9 kr'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBuyOrEquip(item)}
                        className={`mt-3 rounded-2xl px-4 py-2 text-sm font-bold transition ${
                          locked
                            ? 'bg-yellow-400/15 text-yellow-200 hover:bg-yellow-400/20'
                            : isCurrentSlotEquipped
                            ? 'bg-white text-black'
                            : 'bg-emerald-400 text-black hover:brightness-105'
                        }`}
                      >
                        {locked
                          ? 'Unlock Premium'
                          : isCurrentSlotEquipped
                          ? 'Equipped'
                          : item.owned
                          ? 'Equip'
                          : `Buy · ${item.priceLabel ?? '9 kr'}`}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm text-zinc-400">
                No items in this slot yet.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}