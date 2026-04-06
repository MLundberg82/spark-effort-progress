import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Crown,
  Lock,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";

import EquippedRatPreview from "@/components/EquippedRatPreview";
import { getLevelFromXP, getTotalXP } from "@/lib/gamificationStore";
import { getProfile } from "@/lib/profileStore";
import {
  canAccessShopItem,
  equipItem,
  getEquippedItemIdForSlot,
  getEquippedState,
  getItemPreviewSrc,
  getShopItems,
  ownItem,
  subscribeShop,
  type ShopItem,
  unequipItem,
} from "@/lib/shopStore";
import type { RatVariant, SlotKey } from "@/lib/assetTypes";

type RatShopProps = {
  onBack?: () => void;
  onOpenPremium?: () => void;
};

const slotLabels: Record<SlotKey, string> = {
  head: "Head",
  eyes: "Eyes",
  neck: "Neck",
  top: "Top",
  pants: "Legs",
  feet: "Feet",
  aura: "Aura",
  background: "Background",
};

const slotOrder: SlotKey[] = [
  "head",
  "eyes",
  "neck",
  "top",
  "pants",
  "feet",
  "aura",
  "background",
];

function resolveVariant(): RatVariant {
  const profile = getProfile();

  if (profile.gender === "female") return "female";
  if (profile.gender === "non-binary") return "non-binary";
  return "male";
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
      onClick={onClick}
      className={`inline-flex min-h-[40px] items-center justify-center rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition ${
        active
          ? "border-lime-400/30 bg-lime-400/12 text-lime-100"
          : equipped
            ? "border-white/10 bg-white/[0.08] text-white"
            : "border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.07]"
      }`}
    >
      {label}
    </button>
  );
}

function ItemBadge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "premium" | "locked";
}) {
  const classes =
    tone === "premium"
      ? "border-yellow-300/20 bg-yellow-300/10 text-yellow-100"
      : tone === "locked"
        ? "border-red-300/20 bg-red-300/10 text-red-100"
        : "border-white/10 bg-white/[0.05] text-white/65";

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${classes}`}
    >
      {children}
    </div>
  );
}

function ItemCard({
  item,
  isEquipped,
  variant,
  onAction,
}: {
  item: ShopItem;
  isEquipped: boolean;
  variant: RatVariant;
  onAction: (item: ShopItem) => void;
}) {
  const locked = !item.accessible;
  const previewSrc = getItemPreviewSrc(item, variant);
  const isBackground = item.slot === "background";

  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-3">
      <div className="flex gap-3">
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-white/10 bg-black/25 ${
            isBackground ? "h-20 w-[96px]" : "h-[72px] w-[72px]"
          }`}
        >
          {previewSrc ? (
            <img
              src={previewSrc}
              alt={item.name}
              className="h-full w-full object-contain"
              draggable={false}
            />
          ) : (
            <div className="text-2xl">{item.icon || item.emoji || "✨"}</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-black uppercase tracking-[0.12em] text-white">
                {item.name}
              </div>
            </div>

            {locked ? (
              <ItemBadge tone="locked">Locked</ItemBadge>
            ) : item.isPremium ? (
              <ItemBadge tone="premium">Premium</ItemBadge>
            ) : (
              <ItemBadge>Base</ItemBadge>
            )}
          </div>

          <div className="mt-1.5 text-[11px] leading-5 text-white/58">
            {item.description}
          </div>

          <div className="mt-2.5 flex flex-wrap gap-2">
            <ItemBadge>{slotLabels[item.slot]}</ItemBadge>
            {isEquipped ? <ItemBadge>Equipped</ItemBadge> : null}
            {!isEquipped ? (
              <ItemBadge>
                {item.owned
                  ? item.isPremium
                    ? "Premium owned"
                    : "Owned"
                  : item.priceLabel}
              </ItemBadge>
            ) : null}
          </div>
        </div>
      </div>

      <button
        onClick={() => onAction(item)}
        className={`mt-3 inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-[16px] px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition active:scale-[0.995] ${
          locked
            ? "border border-yellow-300/20 bg-yellow-300/10 text-yellow-100 hover:bg-yellow-300/15"
            : isEquipped
              ? "border border-white/10 bg-white text-black"
              : item.owned
                ? "border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.09]"
                : "bg-lime-300 text-black shadow-[0_18px_50px_rgba(163,230,53,0.18)] hover:brightness-105"
        }`}
      >
        {locked ? (
          <>
            <Lock className="h-3.5 w-3.5" />
            Unlock premium
          </>
        ) : isEquipped ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Equipped
          </>
        ) : item.owned ? (
          "Equip"
        ) : (
          <>Buy · {item.priceLabel}</>
        )}
      </button>
    </div>
  );
}

export default function RatShop({
  onBack,
  onOpenPremium,
}: RatShopProps) {
  const [activeSlot, setActiveSlot] = useState<SlotKey>("head");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    return subscribeShop(() => {
      setRefreshKey((value) => value + 1);
    });
  }, []);

  const totalXP = getTotalXP();
  const level = getLevelFromXP(totalXP);
  const variant = resolveVariant();

  const items = useMemo(() => getShopItems(), [refreshKey]);
  const equipped = useMemo(() => getEquippedState(), [refreshKey]);

  const equippedSlots = useMemo(
    () =>
      slotOrder.filter((slot) => {
        const itemId = getEquippedItemIdForSlot(slot);
        return Boolean(itemId);
      }),
    [refreshKey],
  );

  const filteredItems = useMemo(
    () => items.filter((item) => item.slot === activeSlot),
    [activeSlot, items],
  );

  const handleAction = (item: ShopItem) => {
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

  const handleUnequip = () => {
    unequipItem(activeSlot);
    setRefreshKey((value) => value + 1);
  };

  return (
    <div className="min-h-screen bg-black px-4 pb-5 pt-4 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-2.25rem)] max-w-6xl flex-col">
        <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onBack}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.05] transition hover:bg-white/[0.08]"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1 text-center">
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-lime-300/80">
                Shop
              </div>
            </div>

            <button
              onClick={onOpenPremium}
              className="inline-flex h-10 items-center gap-2 rounded-[16px] border border-yellow-300/20 bg-yellow-300/10 px-3 text-[10px] font-black uppercase tracking-[0.14em] text-yellow-100 transition hover:bg-yellow-300/15"
            >
              <Crown className="h-3.5 w-3.5" />
              Premium
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[22px] border border-white/10 bg-black/20 p-3.5">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                <Sparkles className="h-3.5 w-3.5" />
                Preview
              </div>

              <div className="mt-3 rounded-[20px] border border-white/10 bg-white/[0.04] p-2.5">
                <EquippedRatPreview
                  level={level}
                  variant={variant}
                  equippedOverride={equipped}
                  className="w-full"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {slotOrder.map((slot) => (
                  <SlotChip
                    key={slot}
                    label={slotLabels[slot]}
                    active={slot === activeSlot}
                    equipped={Boolean(equipped[slot])}
                    onClick={() => setActiveSlot(slot)}
                  />
                ))}
              </div>

              <div className="mt-3 rounded-[18px] border border-white/10 bg-white/[0.04] px-3.5 py-3">
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
                  Equipped
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {equippedSlots.length > 0 ? (
                    equippedSlots.map((slot) => (
                      <ItemBadge key={slot}>{slotLabels[slot]}</ItemBadge>
                    ))
                  ) : (
                    <div className="text-xs text-white/50">No cosmetics equipped yet.</div>
                  )}
                </div>

                {activeSlot !== "background" && equipped[activeSlot] ? (
                  <button
                    onClick={handleUnequip}
                    className="mt-3 inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.05] px-4 text-[11px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/[0.08]"
                  >
                    <X className="h-3.5 w-3.5" />
                    Unequip {slotLabels[activeSlot]}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-black/20 p-3.5">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                <ShoppingBag className="h-3.5 w-3.5" />
                {slotLabels[activeSlot]}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    variant={variant}
                    isEquipped={equipped[activeSlot] === item.id}
                    onAction={handleAction}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto flex justify-end pt-4">
          <button
            onClick={onBack}
            className="inline-flex min-h-[46px] items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.05] px-5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}