import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Crown, Lock, Sparkles } from 'lucide-react';

import { getBackgroundImage, getItemImage } from '@/lib/assetRegistry';
import type { SlotKey } from '@/lib/assetTypes';
import { getLevelFromXP, getTotalXP } from '@/lib/gamificationStore';
import {
  canAccessShopItem,
  equipItem,
  getEquippedItemIdForSlot,
  getShopItems,
  ownItem,
  type ShopItem,
} from '@/lib/shopStore';

type ShopScreenProps = {
  onBack: () => void;
  onOpenPaywall?: () => void;
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
  if (item.slot === 'background') return getBackgroundImage(item.id);
  return getItemImage(item.id);
}

function getResolvedLevel(value: unknown): number {
  if (typeof value === 'number') return value;

  if (value && typeof value === 'object' && 'level' in value) {
    const candidate = (value as { level?: unknown }).level;
    if (typeof candidate === 'number') return candidate;
  }

  return 1;
}

function SlotButton({
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
      className={[
        'rounded-full border px-3 py-2 text-xs font-black transition',
        active
          ? 'border-lime-300/30 bg-lime-300/12 text-white'
          : 'border-white/10 bg-white/[0.05] text-white/70 hover:bg-white/[0.08] hover:text-white',
      ].join(' ')}
    >
      {label}
      {equipped ? (
        <span className="ml-2 text-[10px] text-lime-300/80">•</span>
      ) : null}
    </button>
  );
}

function ShopTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex-1 rounded-full border px-3 py-2 text-xs font-black transition',
        active
          ? 'border-lime-300/30 bg-lime-300/12 text-white'
          : 'border-white/10 bg-white/[0.05] text-white/65 hover:bg-white/[0.08] hover:text-white',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function ItemCard({
  item,
  isEquipped,
  onAction,
}: {
  item: ShopItem;
  isEquipped: boolean;
  onAction: (item: ShopItem) => void;
}) {
  const locked = !item.accessible;
  const asset = getDisplayAsset(item);

  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3 shadow-[0_12px_34px_rgba(0,0,0,0.22)]">
      <div className="mb-3 overflow-hidden rounded-[18px] border border-white/10 bg-black/20">
        {asset ? (
          <img
            src={asset}
            alt={item.name}
            className="h-28 w-full object-contain p-3"
            draggable={false}
          />
        ) : (
          <div className="flex h-28 items-center justify-center text-2xl">
            {item.icon || item.emoji || '✨'}
          </div>
        )}
      </div>

      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black text-white">{item.name}</h3>
          <p className="mt-1 text-xs text-white/55">
            {isEquipped
              ? 'Equipped now'
              : item.owned
                ? 'Owned'
                : item.priceLabel ?? '9 kr'}
          </p>
        </div>

        <div className="shrink-0">
          {locked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-300/12 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-100">
              <Lock className="h-3 w-3" />
              Locked
            </span>
          ) : item.isPremium ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-300/12 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-100">
              <Crown className="h-3 w-3" />
              Premium
            </span>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onAction(item)}
        className={[
          'mt-2 w-full rounded-[18px] px-3 py-2.5 text-sm font-black transition',
          locked
            ? 'bg-yellow-300/12 text-yellow-100 hover:bg-yellow-300/16'
            : isEquipped
              ? 'bg-white text-black'
              : 'bg-gradient-to-r from-lime-300 via-emerald-400 to-yellow-300 text-black hover:brightness-105',
        ].join(' ')}
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

  const currentLevel = getResolvedLevel(getLevelFromXP(getTotalXP()));

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

    if (activeTab === 'regular') return bySlot.filter((item) => !item.isPremium);
    if (activeTab === 'premium') return bySlot.filter((item) => item.isPremium);

    return bySlot;
  }, [items, activeSlot, activeTab]);

  const ownedCount = items.filter((item) => item.owned).length;
  const equippedCount = slotOrder.filter((slot) =>
    Boolean(getEquippedItemIdForSlot(slot)),
  ).length;
  const currentSlotEquipped = getEquippedItemIdForSlot(activeSlot);

  const handleBuyOrEquip = (item: ShopItem) => {
    if (!canAccessShopItem(item)) {
      onOpenPaywall?.();
      return;
    }

    if (!item.owned) {
      ownItem(item.id);
    }

    equipItem(item.id);
    setRefreshKey((value) => value + 1);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[460px] flex-col px-4 pb-6 pt-4">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
              Shop
            </p>
            <h1 className="mt-1 text-[22px] font-black leading-none text-white">
              GymRat Identity
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Tight, item-first loadout. No preview clutter.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
              Owned
            </p>
            <p className="mt-1 text-lg font-black text-white">{ownedCount}</p>
          </div>

          <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
              Equipped
            </p>
            <p className="mt-1 text-lg font-black text-white">{equippedCount}</p>
          </div>

          <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
              Level
            </p>
            <p className="mt-1 text-lg font-black text-white">{currentLevel}</p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto pb-1">
          <div className="flex min-w-max gap-2">
            {slotOrder.map((slot) => (
              <SlotButton
                key={slot}
                label={slotLabels[slot]}
                active={activeSlot === slot}
                equipped={Boolean(getEquippedItemIdForSlot(slot))}
                onClick={() => setActiveSlot(slot)}
              />
            ))}
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <ShopTabButton
            active={activeTab === 'all'}
            label="All"
            onClick={() => setActiveTab('all')}
          />
          <ShopTabButton
            active={activeTab === 'regular'}
            label="Regular"
            onClick={() => setActiveTab('regular')}
          />
          <ShopTabButton
            active={activeTab === 'premium'}
            label="Premium"
            onClick={() => setActiveTab('premium')}
          />
        </div>

        {visibleItems.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {visibleItems.map((item) => {
              const isEquipped = currentSlotEquipped === item.id;

              return (
                <ItemCard
                  key={item.id}
                  item={item}
                  isEquipped={isEquipped}
                  onAction={handleBuyOrEquip}
                />
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] text-white/70">
              <Sparkles className="h-5 w-5" />
            </div>

            <h3 className="mt-4 text-base font-black text-white">
              No items in this slot yet
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/58">
              Fill this slot next so the rat keeps feeling more alive.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}