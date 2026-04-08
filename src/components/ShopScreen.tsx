import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Crown, Lock, Sparkles } from 'lucide-react';
import { getBackgroundImage, getItemImage } from '@/lib/assetRegistry';
import type { EquippedItems, SlotKey } from '@/lib/assetTypes';
import { getLevelFromXP, getTotalXP } from '@/lib/gamificationStore';
import EquippedRatPreview from '@/components/EquippedRatPreview';
import {
  canAccessShopItem,
  equipItem,
  getEquippedItemIdForSlot,
  getEquippedState,
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

function getPreviewPrioritySlot(
  slot: SlotKey | null | undefined,
): 'head' | 'eyes' | 'neck' | 'top' | 'pants' | 'feet' | 'aura' | undefined {
  if (!slot || slot === 'background') return undefined;
  return slot;
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
      onClick={onClick}
      className={[
        'rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.22em] transition',
        active
          ? 'border-lime-300/70 bg-lime-300/12 text-lime-100'
          : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-zinc-200',
      ].join(' ')}
    >
      {label}
      {equipped ? <span className="ml-2 text-lime-300">•</span> : null}
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
      onClick={onClick}
      className={[
        'rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.2em] transition',
        active
          ? 'bg-white text-black'
          : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-100',
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
  onPreview,
  isPreviewing,
}: {
  item: ShopItem;
  isEquipped: boolean;
  onAction: (item: ShopItem) => void;
  onPreview: (itemId: string | null) => void;
  isPreviewing: boolean;
}) {
  const locked = !item.accessible;
  const asset = getDisplayAsset(item);

  return (
    <div
      className={[
        'rounded-[24px] border p-3 shadow-[0_24px_80px_rgba(0,0,0,0.35)] transition',
        isPreviewing
          ? 'border-lime-300/40 bg-lime-300/[0.06]'
          : 'border-white/10 bg-black/40',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={() => onPreview(isPreviewing ? null : item.id)}
        className="w-full text-left"
      >
        {asset ? (
          <div className="mb-3 overflow-hidden rounded-[18px] border border-white/10 bg-black/40">
            <img
              src={asset}
              alt={item.name}
              className="h-28 w-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-3 flex h-28 items-center justify-center rounded-[18px] border border-white/10 bg-black/40 text-3xl">
            {item.icon || item.emoji || '✨'}
          </div>
        )}

        <h3 className="text-sm font-black text-white">{item.name}</h3>
        <p className="mt-1 text-xs text-zinc-400">
          {isEquipped ? 'Equipped now' : item.owned ? 'Owned' : item.priceLabel ?? '9 kr'}
        </p>

        <div className="mt-2 flex items-center gap-2">
          {locked ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-yellow-300/25 bg-yellow-300/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-yellow-100">
              <Lock className="h-3 w-3" />
              Locked
            </span>
          ) : item.isPremium ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-lime-300/25 bg-lime-300/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-lime-100">
              <Crown className="h-3 w-3" />
              Premium
            </span>
          ) : null}

          {isPreviewing ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.05] px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              <Sparkles className="h-3 w-3" />
              Previewing
            </span>
          ) : null}
        </div>
      </button>

      <button
        onClick={() => onAction(item)}
        className={[
          'mt-3 w-full rounded-[18px] px-3 py-2.5 text-sm font-black transition',
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
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);

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

  useEffect(() => {
    setPreviewItemId(null);
  }, [activeSlot, activeTab]);

  const items = useMemo(() => getShopItems(), [refreshKey]);

  const visibleItems = useMemo(() => {
    const bySlot = items.filter((item) => item.slot === activeSlot);

    if (activeTab === 'regular') return bySlot.filter((item) => !item.isPremium);
    if (activeTab === 'premium') return bySlot.filter((item) => item.isPremium);

    return bySlot;
  }, [items, activeSlot, activeTab]);

  const equippedState = useMemo(() => getEquippedState(), [refreshKey]);

  const previewItem = useMemo(
    () => visibleItems.find((item) => item.id === previewItemId) ?? null,
    [visibleItems, previewItemId],
  );

  const previewEquipped = useMemo<EquippedItems>(() => {
    if (!previewItem) return equippedState;

    return {
      ...equippedState,
      [previewItem.slot]: previewItem.id,
    };
  }, [equippedState, previewItem]);

  const previewPrioritySlot = getPreviewPrioritySlot(
    previewItem?.slot ?? activeSlot,
  );

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
    setPreviewItemId(item.id);
    setRefreshKey((value) => value + 1);
  };

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(163,230,53,0.12),_transparent_26%),linear-gradient(180deg,_#07080b_0%,_#040507_100%)] text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-100 transition hover:border-white/20 hover:bg-white/[0.07]"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="rounded-full border border-lime-300/25 bg-lime-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-lime-100">
            Shop
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/35 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-zinc-500">
            GymRat Identity
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
            Tight, item-first loadout
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            Preview gear on the rat before you buy or equip it.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-3">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">
                Owned
              </div>
              <div className="mt-2 text-2xl font-black text-white">{ownedCount}</div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-3">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">
                Equipped
              </div>
              <div className="mt-2 text-2xl font-black text-white">{equippedCount}</div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-3">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">
                Level
              </div>
              <div className="mt-2 text-2xl font-black text-white">{currentLevel}</div>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/30 p-3">
            <EquippedRatPreview
              level={currentLevel}
              className="mx-auto w-full max-w-[320px]"
              equippedOverride={previewEquipped}
              prioritySlot={previewPrioritySlot}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
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

        <div className="flex flex-wrap gap-2">
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
          <div className="grid grid-cols-2 gap-3">
            {visibleItems.map((item) => {
              const isEquipped = currentSlotEquipped === item.id;

              return (
                <ItemCard
                  key={item.id}
                  item={item}
                  isEquipped={isEquipped}
                  isPreviewing={previewItemId === item.id}
                  onPreview={setPreviewItemId}
                  onAction={handleBuyOrEquip}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-[24px] border border-white/10 bg-black/30 p-5 text-center">
            <h3 className="text-lg font-black text-white">No items in this slot yet</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Fill this slot next so the rat keeps feeling more alive.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}