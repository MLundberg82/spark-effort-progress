import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Crown, Lock, ShoppingBag, Sparkles } from 'lucide-react';

import EquippedRatPreview from '@/components/EquippedRatPreview';
import {
  canAccessShopItem,
  equipItem,
  getEquippedItemIdForSlot,
  getShopItems,
  ownItem,
  type ShopItem,
} from '@/lib/shopStore';
import type { SlotKey } from '@/lib/assetTypes';
import { getBackgroundImage, getItemImage } from '@/lib/assetRegistry';
import { getLevelFromXP, getTotalXP } from '@/lib/gamificationStore';

type ShopScreenProps = {
  onBack: () => void;
  onOpenPaywall: () => void;
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

type ShopTab = 'all' | 'regular' | 'premium';

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
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left transition ${
        active
          ? 'border-emerald-400/20 bg-emerald-400/10'
          : 'border-white/10 bg-white/[0.04]'
      }`}
    >
      <div className="font-bold text-white">{label}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        {equipped ? 'Equipped' : 'Open'}
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
    <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_14px_35px_rgba(0,0,0,0.24)]">
      <div className="overflow-hidden rounded-[22px] border border-white/10 bg-black/20">
        {asset ? (
          <img
            src={asset}
            alt={item.name}
            className="aspect-square w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex aspect-square items-center justify-center text-5xl">
            {item.icon || item.emoji || '✨'}
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-black text-white">{item.name}</h3>
        <p className="mt-2 text-sm text-zinc-400">{item.description}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {locked ? (
          <span className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-200">
            Locked
          </span>
        ) : item.isPremium ? (
          <span className="rounded-full border border-purple-300/20 bg-purple-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-purple-200">
            Premium
          </span>
        ) : null}

        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300">
          {slotLabels[activeSlot]}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
            Status
          </p>
          <p className="mt-1 font-semibold text-white">
            {isEquipped
              ? 'Equipped'
              : item.owned
              ? item.isPremium
                ? 'Premium owned'
                : 'Owned'
              : item.priceLabel ?? '9 kr'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
            Slot
          </p>
          <p className="mt-1 font-semibold text-white">{slotLabels[activeSlot]}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onAction(item)}
        className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-black transition ${
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

export default function ShopScreen({
  onBack,
  onOpenPaywall,
}: ShopScreenProps) {
  const [activeSlot, setActiveSlot] = useState<SlotKey>('top');
  const [activeTab, setActiveTab] = useState<ShopTab>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const currentLevel = getLevelFromXP(getTotalXP());

  useEffect(() => {
    const rerender = () => setRefreshKey((value) => value + 1);

    window.addEventListener('shop-updated', rerender);
    window.addEventListener('premium-updated', rerender);
    window.addEventListener('storage', rerender);

    return () => {
      window.removeEventListener('shop-updated', rerender);
      window.removeEventListener('premium-updated', rerender);
      window.removeEventListener('storage', rerender);
    };
  }, []);

  const items = useMemo(() => getShopItems(), [refreshKey]);

  const visibleItems = useMemo(() => {
    const bySlot = items.filter((item) => item.slot === activeSlot);

    if (activeTab === 'regular') {
      return bySlot.filter((item) => !item.isPremium);
    }

    if (activeTab === 'premium') {
      return bySlot.filter((item) => item.isPremium);
    }

    return bySlot;
  }, [items, activeSlot, activeTab]);

  const ownedCount = items.filter((item) => item.owned).length;
  const equippedCount = slotOrder.filter((slot) => Boolean(getEquippedItemIdForSlot(slot))).length;
  const premiumCount = items.filter((item) => item.isPremium).length;

  const handleBuyOrEquip = (item: ShopItem) => {
    if (!canAccessShopItem(item)) {
      onOpenPaywall();
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.16),_transparent_30%),linear-gradient(180deg,_#09090b_0%,_#111113_100%)] px-4 py-5 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="button"
            onClick={onOpenPaywall}
            className="inline-flex items-center gap-2 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-3 text-sm font-black text-yellow-100"
          >
            <Crown className="h-4 w-4" />
            Open Premium
          </button>
        </div>

        <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">
            <ShoppingBag className="h-4 w-4" />
            <span>GymRat Identity</span>
          </div>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Build your visual edge
          </h1>

          <p className="mt-3 max-w-3xl text-sm text-zinc-300 sm:text-base">
            Premium should feel visible. Regular cosmetics can later connect to real purchases. Premium cosmetics should feel included, stronger and more exclusive.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.3)]">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                  Owned
                </p>
                <p className="mt-2 text-2xl font-black text-white">{ownedCount}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                  Equipped
                </p>
                <p className="mt-2 text-2xl font-black text-white">{equippedCount}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                  Premium items
                </p>
                <p className="mt-2 text-2xl font-black text-white">{premiumCount}</p>
              </div>
            </div>

            <div className="mt-4">
              <EquippedRatPreview level={currentLevel} />
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Slots
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {slotOrder.map((slot) => (
                  <CategoryButton
                    key={slot}
                    label={slotLabels[slot]}
                    active={activeSlot === slot}
                    equipped={Boolean(getEquippedItemIdForSlot(slot))}
                    onClick={() => setActiveSlot(slot)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              Cosmetic loadout
            </div>

            <h2 className="mt-2 text-2xl font-black">{slotLabels[activeSlot]}</h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {(
                [
                  { key: 'all', label: 'All items' },
                  { key: 'regular', label: 'Regular items' },
                  { key: 'premium', label: 'Premium included' },
                ] as const
              ).map((option) => (
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

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {visibleItems.map((item) => {
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

              {visibleItems.length === 0 ? (
                <div className="rounded-[26px] border border-dashed border-white/10 bg-black/20 p-6 text-center md:col-span-2">
                  <Lock className="mx-auto h-10 w-10 text-zinc-500" />
                  <h3 className="mt-4 text-lg font-black text-white">
                    No items in this slot yet
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    Fill this slot next so the rat always feels more alive over time.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}