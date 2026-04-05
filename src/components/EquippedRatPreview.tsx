import { getProfile } from '@/lib/profileStore';
import { getEquippedState } from '@/lib/shopStore';
import {
  getBackgroundImage,
  getDefaultBackgroundForLevel,
  getItemImage,
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

  if (profile?.gender === 'female') return 'female';
  if (profile?.gender === 'non-binary') return 'non-binary';

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
      className={`pointer-events-none absolute inset-0 h-full w-full select-none object-contain ${className}`}
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
    getBackgroundImage(equipped.background) ?? getDefaultBackgroundForLevel(level);

  const ratSrc = getRatImageForLevel(level, resolvedVariant);

  const layerOrder: CosmeticSlot[] = [
    'aura',
    'pants',
    'feet',
    'top',
    'neck',
    'head',
    'eyes',
  ];

  const layers = layerOrder
    .map((slot) => {
      const itemId = equipped[slot];
      return {
        slot,
        itemId,
        src: itemId ? getItemImage(itemId, resolvedVariant) : null,
      };
    })
    .filter((entry) => Boolean(entry.itemId));

  return (
    <div className={`relative isolate h-full w-full overflow-hidden rounded-[32px] ${className}`}>
      {backgroundSrc ? (
        <img
          src={backgroundSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,255,107,0.18),rgba(0,0,0,0.92)_70%)]" />
      )}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.06),rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.74))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_82%,rgba(124,255,107,0.16),transparent_28%)]" />

      <div className="absolute inset-0 flex items-center justify-center p-2">
        <div className="relative h-full w-full">
          <Layer
            src={layers.find((entry) => entry.slot === 'aura')?.src ?? null}
            alt="Aura"
            className="scale-[1.08] opacity-90"
          />

          {ratSrc ? (
            <img
              src={ratSrc}
              alt="GymRat"
              className="absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_26px_46px_rgba(0,0,0,0.62)]"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center rounded-[28px] border border-white/10 bg-black/45">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-white/35">
                Missing rat asset
              </span>
            </div>
          )}

          {layers
            .filter((entry) => entry.slot !== 'aura')
            .map((entry) => (
              <Layer
                key={`${entry.slot}-${entry.itemId}`}
                src={entry.src}
                alt={entry.itemId ?? entry.slot}
                className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
              />
            ))}
        </div>
      </div>
    </div>
  );
}