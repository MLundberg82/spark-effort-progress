import { getProfile } from '@/lib/profileStore';
import { getEquippedState } from '@/lib/shopStore';
import { getBackgroundImage, getItemImage, getRatImage } from '@/lib/assetRegistry';
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

function getBaseRatCandidates(level: number, variant: RatVariant) {
  const tier = getTierBucket(level);

  const variantAliases =
    variant === 'non-binary'
      ? ['non-binary', 'nonbinary', 'nb']
      : [variant];

  const ids: string[] = [];

  for (const alias of variantAliases) {
    ids.push(`rat-lv-${String(tier).padStart(3, '0')}-${alias}`);
    ids.push(`rat-level-${tier}-${alias}`);
    ids.push(`rat-${tier}-${alias}`);
    ids.push(`rat-${alias}-${tier}`);
    ids.push(`rat-${alias}-lv-${String(tier).padStart(3, '0')}`);
  }

  ids.push(`rat-lv-${String(tier).padStart(3, '0')}`);
  ids.push(`rat-level-${tier}`);
  ids.push(`rat-${tier}`);

  return ids;
}

function resolveBaseRat(level: number, variant: RatVariant) {
  const candidates = getBaseRatCandidates(level, variant);

  for (const candidate of candidates) {
    const hit = getRatImage(candidate);
    if (hit) return hit;
  }

  return null;
}

function resolveLayerImage(itemId?: string | null) {
  if (!itemId) return null;
  return getItemImage(itemId);
}

function Layer({
  src,
  alt,
  className,
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
      className={`pointer-events-none absolute inset-0 h-full w-full object-contain ${className ?? ''}`}
    />
  );
}

export default function EquippedRatPreview({
  level,
  variant,
  className,
}: EquippedRatPreviewProps) {
  const resolvedVariant = resolveVariant(variant);
  const equipped = getEquippedState();

  const backgroundSrc = equipped.background
    ? getBackgroundImage(equipped.background)
    : null;

  const baseRatSrc = resolveBaseRat(level, resolvedVariant);

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
    src: resolveLayerImage(equipped[slot]),
  }));

  return (
    <div className={`relative w-full ${className ?? ''}`}>
      <div className="relative aspect-square w-full overflow-hidden rounded-[2rem]">
        {backgroundSrc ? (
          <img
            src={backgroundSrc}
            alt="Equipped background"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]" />
        )}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.08),transparent_24%)]" />

        <div className="absolute inset-[8%] flex items-center justify-center">
          <div className="relative h-full w-full">
            <Layer
              src={layers.find((entry) => entry.slot === 'aura')?.src ?? null}
              alt="Aura"
              className="scale-[1.12] drop-shadow-[0_0_28px_rgba(52,211,153,0.28)]"
            />

            {baseRatSrc ? (
              <img
                src={baseRatSrc}
                alt="GymRat"
                className="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.38)]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-40 w-40 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-6xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                  🐀
                </div>
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
        </div>

        <div className="pointer-events-none absolute inset-x-6 bottom-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-2 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/45">
                Current form
              </p>
              <p className="mt-1 text-sm font-black text-white">
                Level {level}
              </p>
            </div>

            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-emerald-300">
              {resolvedVariant}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}