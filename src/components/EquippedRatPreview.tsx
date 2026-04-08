import { useEffect, useMemo, useState } from 'react';
import { getProfile } from '@/lib/profileStore';
import { getEquippedState } from '@/lib/shopStore';
import {
  getBackgroundImage,
  getDefaultBackgroundForLevel,
  getItemImageForSlot,
  getRatImageForLevel,
} from '@/lib/assetRegistry';
import type { EquippedItems, RatVariant } from '@/lib/assetTypes';

type PreviewSlot = 'head' | 'eyes' | 'neck' | 'top' | 'pants' | 'feet' | 'aura';

type EquippedRatPreviewProps = {
  level: number;
  variant?: RatVariant;
  className?: string;
  equippedOverride?: EquippedItems;
  prioritySlot?: PreviewSlot | null;
};

const SLOT_ORDER: PreviewSlot[] = ['aura', 'pants', 'feet', 'top', 'neck', 'head', 'eyes'];

const VARIANT_BASE_OFFSETS: Record<RatVariant, string> = {
  male: 'translate-y-[1%]',
  female: 'translate-y-[0.5%] scale-[0.99]',
  'non-binary': 'translate-y-[0.75%]',
};

const SLOT_CLASSNAMES: Record<PreviewSlot, string> = {
  aura: 'absolute inset-0 z-[1] scale-[1.08] opacity-90',
  pants: 'absolute inset-0 z-[3]',
  feet: 'absolute inset-0 z-[4]',
  top: 'absolute inset-0 z-[5]',
  neck: 'absolute inset-0 z-[6]',
  head: 'absolute inset-0 z-[7]',
  eyes: 'absolute inset-0 z-[8]',
};

function resolveVariant(explicit?: RatVariant): RatVariant {
  if (explicit) return explicit;
  const profile = getProfile();

  if (profile.gender === 'female') return 'female';
  if (profile.gender === 'non-binary') return 'non-binary';

  return 'male';
}

function getTierBucket(level: number): number {
  if (level >= 100) return 100;
  if (level >= 90) return 90;
  if (level >= 80) return 80;
  if (level >= 70) return 70;
  if (level >= 60) return 60;
  if (level >= 50) return 50;
  if (level >= 40) return 40;
  if (level >= 30) return 30;
  if (level >= 25) return 25;
  if (level >= 20) return 20;
  if (level >= 15) return 15;
  if (level >= 10) return 10;
  if (level >= 5) return 5;
  return 1;
}

function getTierScale(level: number): string {
  const bucket = getTierBucket(level);

  if (bucket >= 80) return 'scale-[1.03]';
  if (bucket >= 40) return 'scale-[1.02]';
  if (bucket >= 15) return 'scale-[1.01]';

  return 'scale-100';
}

function getTierGlow(level: number): string {
  const bucket = getTierBucket(level);

  if (bucket >= 80) return 'drop-shadow-[0_0_30px_rgba(163,230,53,0.28)]';
  if (bucket >= 40) return 'drop-shadow-[0_0_22px_rgba(163,230,53,0.20)]';
  if (bucket >= 15) return 'drop-shadow-[0_0_16px_rgba(255,215,102,0.14)]';

  return 'drop-shadow-[0_0_10px_rgba(255,255,255,0.06)]';
}

function getSlotAdjustment(slot: PreviewSlot, level: number, variant: RatVariant): string {
  const bucket = getTierBucket(level);

  let base = '';

  if (bucket >= 20) {
    if (slot === 'top') base = 'translate-y-[0.4%]';
    if (slot === 'head' || slot === 'eyes') base = '-translate-y-[0.6%]';
  }

  if (bucket >= 40) {
    if (slot === 'top') base = 'translate-y-[0.75%] scale-[1.01]';
    if (slot === 'neck') base = 'translate-y-[0.35%]';
    if (slot === 'head' || slot === 'eyes') base = '-translate-y-[0.9%] scale-[1.01]';
    if (slot === 'pants') base = 'translate-y-[0.45%]';
  }

  if (bucket >= 70) {
    if (slot === 'top') base = 'translate-y-[1%] scale-[1.02]';
    if (slot === 'neck') base = 'translate-y-[0.55%] scale-[1.01]';
    if (slot === 'head' || slot === 'eyes') base = '-translate-y-[1.1%] scale-[1.015]';
    if (slot === 'pants') base = 'translate-y-[0.7%] scale-[1.01]';
    if (slot === 'feet') base = 'translate-y-[0.35%]';
  }

  if (variant === 'female') {
    if (slot === 'top') return [base, 'scale-[0.995]'].join(' ').trim();
    if (slot === 'head' || slot === 'eyes') return [base, '-translate-x-[0.15%]'].join(' ').trim();
  }

  if (variant === 'non-binary') {
    if (slot === 'top' || slot === 'pants') return [base, 'translate-y-[0.2%]'].join(' ').trim();
  }

  return base;
}

function Layer({
  src,
  alt,
  wrapperClassName = '',
  imageClassName = '',
}: {
  src: string | null;
  alt: string;
  wrapperClassName?: string;
  imageClassName?: string;
}) {
  if (!src) return null;

  return (
    <div className={wrapperClassName}>
      <img
        src={src}
        alt={alt}
        className={imageClassName}
        draggable={false}
      />
    </div>
  );
}

export default function EquippedRatPreview({
  level,
  variant,
  className = '',
  equippedOverride,
  prioritySlot = null,
}: EquippedRatPreviewProps) {
  const [equippedState, setEquippedState] = useState<EquippedItems>(getEquippedState());

  useEffect(() => {
    const sync = () => setEquippedState(getEquippedState());

    window.addEventListener('shop-updated', sync as EventListener);
    window.addEventListener('premium-updated', sync as EventListener);
    window.addEventListener('storage', sync);
    window.addEventListener('gymrat-profile-updated', sync as EventListener);
    window.addEventListener('profile-updated', sync as EventListener);

    return () => {
      window.removeEventListener('shop-updated', sync as EventListener);
      window.removeEventListener('premium-updated', sync as EventListener);
      window.removeEventListener('storage', sync);
      window.removeEventListener('gymrat-profile-updated', sync as EventListener);
      window.removeEventListener('profile-updated', sync as EventListener);
    };
  }, []);

  const equipped = equippedOverride ?? equippedState;
  const resolvedVariant = resolveVariant(variant);

  const backgroundSrc = useMemo(
    () =>
      (equipped.background ? getBackgroundImage(equipped.background) : null) ??
      getDefaultBackgroundForLevel(level),
    [equipped.background, level],
  );

  const baseRatSrc = useMemo(
    () => getRatImageForLevel(level, resolvedVariant),
    [level, resolvedVariant],
  );

  const prioritizedSlots = useMemo(() => {
    if (!prioritySlot) return SLOT_ORDER;
    return [prioritySlot, ...SLOT_ORDER.filter((slot) => slot !== prioritySlot)];
  }, [prioritySlot]);

  const overlayLayers = useMemo(
    () =>
      prioritizedSlots.map((slot) => ({
        slot,
        itemId: equipped[slot],
        src: equipped[slot]
          ? getItemImageForSlot(slot, equipped[slot] as string, resolvedVariant)
          : null,
      })),
    [equipped, prioritizedSlots, resolvedVariant],
  );

  const auraSrc = overlayLayers.find((layer) => layer.slot === 'aura')?.src ?? null;
  const baseStyle = VARIANT_BASE_OFFSETS[resolvedVariant];
  const tierScale = getTierScale(level);
  const tierGlow = getTierGlow(level);

  return (
    <div className={['relative w-full', className].join(' ').trim()}>
      <div className="relative mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-[30px]">
        {backgroundSrc ? (
          <img
            src={backgroundSrc}
            alt="Rat background"
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(163,230,53,0.14),_transparent_35%),linear-gradient(180deg,_rgba(7,8,11,0.96)_0%,_rgba(4,5,7,1)_100%)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/20" />

        <Layer
          src={auraSrc}
          alt="Equipped aura"
          wrapperClassName="pointer-events-none absolute inset-0 z-[2]"
          imageClassName="h-full w-full object-contain"
        />

        <div className="absolute inset-x-0 bottom-0 top-[6%] z-[3] flex items-end justify-center">
          <div className={['relative h-[92%] w-[92%]', baseStyle, tierScale].join(' ').trim()}>
            {baseRatSrc ? (
              <img
                src={baseRatSrc}
                alt="Gym rat"
                className={['absolute inset-0 h-full w-full object-contain', tierGlow].join(' ')}
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center rounded-[28px] border border-white/10 bg-black/40 text-sm font-black uppercase tracking-[0.22em] text-zinc-400">
                Missing rat image
              </div>
            )}

            {overlayLayers
              .filter((layer) => layer.slot !== 'aura')
              .map((layer) => (
                <Layer
                  key={layer.slot}
                  src={layer.src}
                  alt={`${layer.slot} item`}
                  wrapperClassName={SLOT_CLASSNAMES[layer.slot]}
                  imageClassName={[
                    'h-full w-full object-contain transition-transform duration-300',
                    getSlotAdjustment(layer.slot, level, resolvedVariant),
                    prioritySlot === layer.slot ? 'drop-shadow-[0_0_18px_rgba(255,255,255,0.18)]' : '',
                  ].join(' ').trim()}
                />
              ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-[10%] bottom-3 h-10 rounded-full bg-black/25 blur-2xl" />
      </div>
    </div>
  );
}
