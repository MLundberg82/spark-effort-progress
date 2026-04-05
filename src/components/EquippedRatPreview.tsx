import { getProfile } from '@/lib/profileStore';
import { getEquippedState } from '@/lib/shopStore';
import {
  getBackgroundImage,
  getItemImage,
  getRatImage,
} from '@/lib/assetRegistry';
import type { CosmeticSlot, RatVariant } from '@/lib/assetTypes';

type EquippedRatPreviewProps = {
  level: number;
  variant?: RatVariant;
  className?: string;
};

function getTierBucket(level: number) {
  if (level >= 100) return 100;
  if (level >= 90) return 90;
  if (level >= 80) return 80;
  if (level >= 70) return 70;
  if (level >= 60) return 60;
  if (level >= 50) return 50;
  if (level >= 40) return 40;
  if (level >= 35) return 35;
  if (level >= 30) return 30;
  if (level >= 25) return 25;
  if (level >= 20) return 20;
  if (level >= 15) return 15;
  if (level >= 10) return 10;
  if (level >= 5) return 5;
  return 1;
}

function resolveVariant(explicit?: RatVariant): RatVariant {
  if (explicit) return explicit;

  const profile = getProfile();
  if (profile?.gender === 'female') return 'female';
  if (profile?.gender === 'non-binary') return 'non-binary';
  return 'male';
}

function getBaseRatId(level: number, variant: RatVariant) {
  const tier = getTierBucket(level);
  return `rat-lv-${String(tier).padStart(3, '0')}-${variant}`;
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
      className={`absolute inset-0 h-full w-full object-contain ${className}`}
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

  const backgroundSrc = equipped.background
    ? getBackgroundImage(equipped.background)
    : null;

  const baseRatSrc = getRatImage(getBaseRatId(level, resolvedVariant));

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
    src: equipped[slot] ? getItemImage(equipped[slot] as string) : null,
  }));

  return (
    <div
      className={`relative overflow-hidden rounded-[30px] border border-white/10 bg-black/20 ${className}`}
    >
      <div className="relative aspect-square w-full">
        {backgroundSrc ? (
          <img
            src={backgroundSrc}
            alt="Background"
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.14),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.01))]" />
        )}

        <Layer
          src={layers.find((entry) => entry.slot === 'aura')?.src ?? null}
          alt="Aura"
          className="scale-[1.08] drop-shadow-[0_0_28px_rgba(52,211,153,0.24)]"
        />

        {baseRatSrc ? (
          <img
            src={baseRatSrc}
            alt="GymRat"
            className="absolute inset-0 h-full w-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            🐀
          </div>
        )}

        {layers
          .filter((entry) => entry.slot !== 'aura')
          .map((entry) => (
            <Layer
              key={entry.slot}
              src={entry.src}
              alt={entry.itemId ?? entry.slot}
            />
          ))}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-white/10 bg-black/25 p-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            Current form
          </p>
          <p className="mt-1 font-semibold text-white">Level {level}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            Variant
          </p>
          <p className="mt-1 font-semibold capitalize text-white">
            {resolvedVariant}
          </p>
        </div>
      </div>
    </div>
  );
}