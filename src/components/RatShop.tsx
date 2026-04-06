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
      className={`rounded-2xl border px-3 py-2 text-left transition ${
        active
          ? 'border-lime-400/30 bg-lime-400/12 text-white'
          : 'border-white/10 bg-white/[0.04] text-white/75 hover:border-white/20 hover:bg-white/[0.07]'
      }`}
    >
      <div className="text-[11px] font-black uppercase tracking-[0.12em]">
        {label}
      </div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white/45">
        {equipped ? 'Equipped' : active ? 'Open' : 'Browse'}
      </div>
    </button>
  );
}

function ItemBadge({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'premium' | 'locked';
}) {
  const classes =
    tone === 'premium'
      ? 'border-yellow-300/20 bg-yellow-300/10 text-yellow-100'
      : tone === 'locked'
      ? 'border-red-300/20 bg-red-300/10 text-red-100'
      : 'border-white/10 bg-white/[0.05] text-white/65';

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${classes}`}
    >
      {children}
    </div>
  );
}

function ItemRow({
  item,
  isEquipped,
  onAction,
}: {
  item: ShopItem;
  isEquipped: boolean;
  onAction: (item: ShopItem) => void;
}) {
  const locked = !item.accessible;
  const previewSrc = getItemPreviewSrc(item);

  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/25">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt={item.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="text-2xl">{item.icon || item.emoji || '✨'}</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-sm font-black uppercase tracking-[0.08em] text-white">
              {item.name}
            </div>

            {locked ? (
              <ItemBadge tone="locked">
                <Lock className="h-3 w-3" />
                Locked
              </ItemBadge>
            ) : item.isPremium ? (
              <ItemBadge tone="premium">
                <Crown className="h-3 w-3" />
                Premium
              </ItemBadge>
            ) : (
              <ItemBadge>Base</ItemBadge>
            )}
          </div>

          <div className="mt-1 line-clamp-2 text-xs leading-5 text-white/55">
            {item.description}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ItemBadge>{slotLabels[item.slot]}</ItemBadge>

            {isEquipped ? (
              <ItemBadge>
                <Check className="h-3 w-3" />
                Equipped
              </ItemBadge>
            ) : null}

            <div className="text-[11px] font-black uppercase tracking-[0.12em] text-white/45">
              {isEquipped
                ? 'Equipped'
                : item.owned
                ? item.isPremium
                  ? 'Premium owned'
                  : 'Owned'
                : item.priceLabel}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onAction(item)}
        className={`mt-3 inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[18px] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition active:scale-[0.995] ${
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
          'Equip'
        ) : (
          <>Buy · {item.priceLabel}</>
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

  const currentSlotEquipped = useMemo(
    () => getEquippedItemIdForSlot(activeSlot),
    [activeSlot, refreshKey],
  );

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
    <div className="min-h-screen bg-black px-5 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/80 transition hover:bg-white/[0.08]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            onClick={onOpenPremium}
            className="inline-flex items-center gap-2 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-yellow-100 transition hover:bg-yellow-300/15"
          >
            <Crown className="h-4 w-4" />
            Premium
          </button>
        </div>

        <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-lime-300/80">
                Cosmetics
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight">
                Build your look
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-white/60">
                Equip cosmetics directly on your rat with a tighter, faster shop flow.
              </p>
            </div>

            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.05fr_1.4fr]">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
                    Live preview
                  </div>
                  <div className="mt-1 text-sm font-black uppercase tracking-[0.08em] text-white">
                    Cosmetic loadout
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/55">
                  <Sparkles className="h-3 w-3" />
                  {slotLabels[activeSlot]}
                </div>
              </div>

              <div className="mt-3 overflow-hidden rounded-[22px] border border-white/10 bg-black/25 p-2">
                <EquippedRatPreview />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/40">
                    Owned
                  </div>
                  <div className="mt-1 text-xl font-black">{ownedCount}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/40">
                    Premium
                  </div>
                  <div className="mt-1 text-xl font-black">{premiumCount}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/40">
                    Slot
                  </div>
                  <div className="mt-1 truncate text-sm font-black uppercase tracking-[0.08em]">
                    {slotLabels[activeSlot]}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
                Slots
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
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

              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="text-sm font-black uppercase tracking-[0.1em] text-white">
                  {slotLabels[activeSlot]}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">
                  {filteredItems.length} items
                </div>
              </div>

              {filteredItems.length === 0 ? (
                <div className="mt-3 rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-white/55">
                  No items in this slot yet.
                </div>
              ) : (
                <div className="mt-3 grid gap-3">
                  {filteredItems.map((item) => {
                    const isCurrentlyEquipped = currentSlotEquipped === item.id;

                    return (
                      <ItemRow
                        key={item.id}
                        item={item}
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
    </div>
  );
}