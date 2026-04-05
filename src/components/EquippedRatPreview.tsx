import { getProfile } from '@/lib/profileStore';
import { getEquippedState } from '@/lib/shopStore';
import {
  getBackgroundImage,
  getDefaultBackgroundForLevel,
  getItemImageForSlot,
  getRatImageForLevel,
} from '@/lib/assetRegistry';
import type { CosmeticSlot, RatVariant } from '@/lib/assetTypes';

type EquippedRatPreviewProps = {
  level: number;
  variant?: RatVariant;
  className?: string;
};

function resolveVariant(explicit?: RatVariant): RatVariant {
  if (explicit) return explicit;

  const profile = getProfile();

  if (profile.gender === 'female') return 'female';
  if (profile.gender === 'non-binary') return 'non-binary';
  return 'male';
}

function Layer({
  src,
  alt,
  className = '',
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
      className={`pointer-events-none absolute inset-0 h-full w-full object-contain ${className}`}
      draggable={false}
    />
  );
}

export default function EquippedRatPreview({
  level,
  variant,
  className = '',
}: EquippedRatPreviewProps) {
  const resolvedVariant = resolveVariant(variant);
  const equipped = getEquippedState();

  const backgroundSrc =
    (equipped.background ? getBackgroundImage(equipped.background) : null) ??
    getDefaultBackgroundForLevel(level);

  const baseRatSrc = getRatImageForLevel(level, resolvedVariant);

  const layerOrder: CosmeticSlot[] = [
    'aura',
    'pants',
    'feet',
    'top',
    'neck',
    'head',
    'eyes',
  ];

  const layers = layerOrder.map((slot) => ({
    slot,
    itemId: equipped[slot],
    src: equipped[slot]
      ? getItemImageForSlot(slot, equipped[slot], resolvedVariant)
      : null,
  }));

  const auraSrc = layers.find((entry) => entry.slot === 'aura')?.src ?? null;

  return (
    <div
      className={`relative isolate overflow-hidden rounded-[32px] border border-white/10 bg-zinc-950/90 ${className}`}
    >
      {backgroundSrc ? (
        <img
          src={backgroundSrc}
          alt="Background"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(163,230,53,0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.14))]" />
      )}

      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 flex aspect-[4/5] w-full items-end justify-center p-4 sm:p-5">
        <div className="relative h-full w-full max-w-[320px]">
          <Layer
            src={auraSrc}
            alt="Aura"
            className="scale-[1.08] object-contain drop-shadow-[0_0_28px_rgba(52,211,153,0.24)]"
          />

          {baseRatSrc ? (
            <img
              src={baseRatSrc}
              alt="GymRat"
              className="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-[0_14px_35px_rgba(0,0,0,0.35)]"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center rounded-[28px] border border-dashed border-white/15 bg-white/[0.03] text-center text-sm font-semibold text-zinc-400">
              Missing rat image
            </div>
          )}

          {layers
            .filter((entry) => entry.slot !== 'aura')
            .map((entry) => (
              <Layer
                key={`${entry.slot}-${entry.itemId ?? 'empty'}`}
                src={entry.src}
                alt={entry.slot}
              />
            ))}
        </div>
      </div>
    </div>
  );
}