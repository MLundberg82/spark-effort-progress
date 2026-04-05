import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Crown, Lock, ShoppingBag, Sparkles } from 'lucide-react';
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

function getDisplayAsset(item: ShopItem) {
  if (item.slot === 'background') {
    return getBackgroundImage(item.id);
  }

  return getItemImage(item.id);
}

function CategoryButton({
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
      onClick={onClick}
      className={`rounded-2xl px-3 py-3 text-center transition ${
        active
          ? 'border border-emerald-400/25 bg-emerald-400/10'
          : 'border border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
      }`}
    >
      <p className="text-sm font-bold text-white">{label}</p>
      <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/45">
        {equipped ? 'Equipped' : 'Open'}
      </p>
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
    <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 shadow-[0_14px_40px_rgba(0,0,0,0.24)]">
      <div className="relative overflow-hidden rounded-[1.3rem] border border-white/10 bg-black/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.10),transparent_60%)]" />

        <div className="flex h-36 items-center justify-center">
          {asset ? (
            <img
              src={asset}
              alt={item.name}
              className="max-h-28 max-w-[80%] object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-4xl">
              {item.icon || item.emoji || '✨'}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black tracking-tight text-white">
            {item.name}
          </h3>
          <p className="mt-1 text-sm leading-5 text-white/58">
            {item.description}
          </p>
        </div>

        {locked ? (
          <div className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-yellow-300">
            Locked
          </div>
        ) : item.isPremium ? (
          <div className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-yellow-300">
            Premium
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/40">
            Slot
          </p>
          <p className="mt-1 text-sm font-bold text-white">
            {slotLabels[activeSlot]}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/40">
            Status
          </p>
          <p className="mt-1 text-sm font-bold text-white">
            {isEquipped
              ? 'Equipped'
              : item.owned
              ? item.isPremium
                ? 'Premium owned'
                : 'Owned'
              : item.priceLabel ?? '9 kr'}
          </p>
        </div>
      </div>

      <button
        onClick={() => onAction(item)}
        className={`mt-3 w-full rounded-2xl px-4 py-3 text-sm font-black transition ${
          locked
            ? 'bg-yellow-400/15 text-yellow-200 hover:bg-yellow-400/20'
            : isEquipped
            ? 'bg-white text-black'
            : 'bg-emerald-400 text-black hover:brightness-105'
        }`}
      >
        {locked
          ? 'Unlock Premium'
          : isEquipped
          ? 'Equipped'
          : item.owned
          ? 'Equip'
          : `Buy · ${item.priceLabel ?? '9 kr'}`}
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

  const currentSlotEquipped = getEquippedItemIdForSlot(activeSlot);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_28%),linear-gradient(180deg,#07110d_0%,#0b1511_38%,#050806_100%)] px-4 pb-8 pt-5 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-emerald-300">
            Shop
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/75">
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Cosmetics</span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
            Build your look
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/65">
            Equip backgrounds, aura and item layers directly on your rat so progression feels visible.
          </p>

          <div className="mt-5 overflow-hidden rounded-[1.7rem] border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-white">Live Preview</p>
              <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/45">
                Equipped items
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.10),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-3 py-5">
              <div className="mx-auto max-w-[13rem] scale-[1.08]">
                <EquippedRatPreview level={1} />
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-white">Slots</p>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/40">
                Cosmetic loadout
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {slotOrder.map((slot) => {
                const active = activeSlot === slot;
                const equipped = Boolean(getEquippedItemIdForSlot(slot));

                return (
                  <CategoryButton
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

          <div className="mt-5 space-y-3">
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

            {filteredItems.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center">
                <Sparkles className="mx-auto h-5 w-5 text-emerald-300" />
                <p className="mt-3 text-base font-bold text-white">
                  No items in this slot yet
                </p>
                <p className="mt-2 text-sm text-white/55">
                  Fill this slot next so the rat always feels more alive over time.
                </p>
              </div>
            ) : null}
          </div>

          <button
            onClick={onOpenPremium}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-[1.4rem] border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-sm font-bold text-yellow-200 transition hover:bg-yellow-400/15"
          >
            <Crown className="h-4 w-4" />
            <span>See Premium cosmetics</span>
            <Lock className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}