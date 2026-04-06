import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Crown, Lock, ShoppingBag, Sparkles } from 'lucide-react';

import EquippedRatPreview from '@/components/EquippedRatPreview';
import { getLevelFromXP, getTotalXP } from '@/lib/gamificationStore';
import { getBackgroundImage, getItemImage } from '@/lib/assetRegistry';
import { canAccessShopItem, equipItem, getEquippedItemIdForSlot, getShopItems, ownItem, type ShopItem } from '@/lib/shopStore';
import type { SlotKey } from '@/lib/assetTypes';

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
  if (item.slot === 'background') return getBackgroundImage(item.id);
  return getItemImage(item.id);
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
          : 'border-white/10 bg-white/[0.05] text-white/70 hover:text-white',
      ].join(' ')}
    >
      {label}
      {equipped ? <span className="ml-2 text-[10px] text-lime-300/80">•</span> : null}
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
    <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-3 shadow-[0_12px_34px_rgba(0,0,0,0.22)]">
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
            {isEquipped ? 'Equipped now' : item.owned ? 'Owned' : item.priceLabel ?? '9 kr'}
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
        {locked ? 'Unlock Premium' : isEquipped ? 'Equipped' : item.owned ? 'Equip' : `Buy · ${item.priceLabel ?? '9 kr'}`}
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

    if (activeTab === 'regular') return bySlot.filter((item) => !item.isPremium);
    if (activeTab === 'premium') return bySlot.filter((item) => item.isPremium);

    return bySlot;
  }, [items, activeSlot, activeTab]);

  const ownedCount = items.filter((item) => item.owned).length;
  const equippedCount = slotOrder.filter((slot) => Boolean(getEquippedItemIdForSlot(slot))).length;

  const handleBuyOrEquip = (item: ShopItem) => {
    if (!canAccessShopItem(item)) {
      onOpenPaywall();
      return;
    }

    if (!item.owned) ownItem(item.id);
    equipItem(item.id);
    setRefreshKey((value) => value + 1);
  };

  const currentSlotEquipped = getEquippedItemIdForSlot(activeSlot);

  return (
    <div className="min-h-[100dvh] bg-[#06080b] text-white">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-5 pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/[0.09]"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-lime-300/70">
              Shop
            </p>
            <h1 className="text-lg font-black tracking-tight">GymRat Identity</h1>
          </div>

          <button
            type="button"
            onClick={onOpenPaywall}
            className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-yellow-100 transition hover:bg-yellow-300/14"
          >
            Premium
          </button>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-[20px] border border-white/10 bg-white/[0.05] px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              Owned
            </p>
            <p className="mt-1 text-base font-black">{ownedCount}</p>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-white/[0.05] px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              Equipped
            </p>
            <p className="mt-1 text-base font-black">{equippedCount}</p>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-white/[0.05] px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              Level
            </p>
            <p className="mt-1 text-base font-black">{currentLevel.level}</p>
          </div>
        </div>

        <div className="mb-3 rounded-[28px] border border-white/10 bg-white/[0.04] p-3">
          <EquippedRatPreview
            level={currentLevel.level}
            prioritySlot={activeSlot === 'background' ? null : activeSlot}
            className="mx-auto w-full"
          />
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
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

        <div className="mb-3 flex gap-2">
          {([
            { key: 'all', label: 'All' },
            { key: 'regular', label: 'Regular' },
            { key: 'premium', label: 'Premium' },
          ] as const).map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setActiveTab(option.key)}
              className={[
                'flex-1 rounded-full border px-3 py-2 text-xs font-black transition',
                activeTab === option.key
                  ? 'border-lime-300/30 bg-lime-300/12 text-white'
                  : 'border-white/10 bg-white/[0.05] text-white/65 hover:text-white',
              ].join(' ')}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-1">
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

          {visibleItems.length === 0 ? (
            <div className="col-span-2 rounded-[24px] border border-dashed border-white/10 bg-white/[0.04] p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06]">
                <Sparkles className="h-5 w-5 text-white/70" />
              </div>
              <h3 className="text-sm font-black text-white">No items in this slot yet</h3>
              <p className="mt-1 text-xs text-white/55">
                Fill this slot next so the rat keeps feeling more alive.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}