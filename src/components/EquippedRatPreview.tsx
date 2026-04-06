import { getBackgroundImage, getDefaultBackgroundForLevel, getItemImageForSlot, getRatImageForLevel } from "@/lib/assetRegistry";
import type { CosmeticSlot, RatVariant } from "@/lib/assetTypes";
import { getProfile } from "@/lib/profileStore";
import { getEquippedState } from "@/lib/shopStore";

type EquippedRatPreviewProps = {
  level: number;
  variant?: RatVariant;
  className?: string;
  equippedOverride?: ReturnType<typeof getEquippedState>;
};

function resolveVariant(explicit?: RatVariant): RatVariant {
  if (explicit) return explicit;

  const profile = getProfile();

  if (profile.gender === "female") return "female";
  if (profile.gender === "non-binary") return "non-binary";
  return "male";
}

function Layer({
  src,
  alt,
  className = "",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={`absolute inset-0 h-full w-full object-contain ${className}`}
      draggable={false}
    />
  );
}

export default function EquippedRatPreview({
  level,
  variant,
  className = "",
  equippedOverride,
}: EquippedRatPreviewProps) {
  const resolvedVariant = resolveVariant(variant);
  const equipped = equippedOverride ?? getEquippedState();

  const backgroundSrc =
    (equipped.background ? getBackgroundImage(equipped.background) : null) ??
    getDefaultBackgroundForLevel(level);

  const baseRatSrc = getRatImageForLevel(level, resolvedVariant);

  const layerOrder: CosmeticSlot[] = [
    "aura",
    "pants",
    "feet",
    "top",
    "neck",
    "head",
    "eyes",
  ];

  const layers = layerOrder.map((slot) => ({
    slot,
    itemId: equipped[slot],
    src: equipped[slot]
      ? getItemImageForSlot(slot, equipped[slot], resolvedVariant)
      : null,
  }));

  const auraSrc = layers.find((entry) => entry.slot === "aura")?.src ?? null;
  const nonAuraLayers = layers.filter((entry) => entry.slot !== "aura");

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-[24px] ${className}`}
    >
      {backgroundSrc ? (
        <img
          src={backgroundSrc}
          alt="Rat background"
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/[0.04]" />

      {auraSrc ? (
        <img
          src={auraSrc}
          alt="Aura"
          className="absolute inset-0 h-full w-full scale-[1.03] object-contain opacity-95"
          draggable={false}
        />
      ) : null}

      <div className="absolute inset-0 flex items-center justify-center p-[7%]">
        <div className="relative h-full w-full">
          {baseRatSrc ? (
            <img
              src={baseRatSrc}
              alt={`Rat level ${level}`}
              className="absolute inset-0 h-full w-full object-contain"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center rounded-[20px] border border-white/10 bg-black/30 text-center text-xs font-black uppercase tracking-[0.14em] text-white/50">
              Missing rat image
            </div>
          )}

          {nonAuraLayers.map((entry) => (
            <Layer
              key={`${entry.slot}-${entry.itemId ?? "empty"}`}
              src={entry.src}
              alt={`${entry.slot} overlay`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}