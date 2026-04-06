import { useEffect, useMemo, useState } from 'react';
import {
  getBackgroundImage,
  getDefaultBackgroundForLevel,
  getItemImageForSlot,
  getRatImageForLevel,
} from '@/lib/assetRegistry';
import type {
  CosmeticSlot,
  EquippedItems,
  RatVariant,
} from '@/lib/assetTypes';
import { getProfile } from '@/lib/profileStore';
import { getEquippedState } from '@/lib/shopStore';

type EquippedRatPreviewProps = {
  level: number;
  variant?: RatVariant;
  className?: string;
  equippedOverride?: EquippedItems;
  prioritySlot?: CosmeticSlot | null;
};

type LayerStyle = {
  wrapper: string;
  image: string;
};

const BASE_LAYER =
  'pointer-events-none absolute inset-0 flex items-end justify-center';

const SLOT_STYLES: Record<CosmeticSlot, LayerStyle> = {
  aura: {
    wrapper: 'pointer-events-none absolute inset-0 z-[1] flex items-center justify-center',
    image:
      'h-[108%] w-[108%] max-w-none object-contain opacity-90 drop-shadow-[0_0_42px_rgba(163,230,53,0.24)]',
  },

  pants: {
    wrapper:
      'pointer-events-none absolute inset-x-[18%] bottom-[12.2%] z-[4] flex justify-center',
    image: 'w-[64%] max-w-none object-contain',
  },

  feet: {
    wrapper:
      'pointer-events-none absolute inset-x-[18.5%] bottom-[7.2%] z-[5] flex justify-center',
    image: 'w-[65%] max-w-none object-contain',
  },

  top: {
    wrapper:
      'pointer-events-none absolute inset-x-[12.5%] top-[15.5%] z-[6] flex justify-center',
    image: 'w-[76%] max-w-none object-contain',
  },

  neck: {
    wrapper:
      'pointer-events-none absolute inset-x-[30.5%] top-[17.5%] z-[7] flex justify-center',
    image: 'w-[31%] max-w-none object-contain',
  },

  head: {
    wrapper:
      'pointer-events-none absolute inset-x-[24%] top-[1.8%] z-[8] flex justify-center',
    image: 'w-[49%] max-w-none object-contain',
  },

  eyes: {
    wrapper:
      'pointer-events-none absolute inset-x-[35.2%] top-[13.5%] z-[9] flex justify-center',
    image: 'w-[20.5%] max-w-none object-contain',
  },
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
  wrapperClassName,
  imageClassName,
}: {
  src: string | null;
  alt: string;
  wrapperClassName: string;
  imageClassName: string;
}) {
  if (!src) return null;

  return (
    <div className={wrapperClassName}>
      <img src={src} alt={alt} className={imageClassName} draggable={false} />
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
  const [equippedState, setEquippedState] = useState(getEquippedState());

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

  const backgroundSrc = useMemo(() => {
    return (
      (equipped.background ? getBackgroundImage(equipped.background) : null) ??
      getDefaultBackgroundForLevel(level)
    );
  }, [equipped.background, level]);

  const baseRatSrc = useMemo(() => {
    return getRatImageForLevel(level, resolvedVariant);
  }, [level, resolvedVariant]);

  const orderedSlots: CosmeticSlot[] = [
    'aura',
    'pants',
    'feet',
    'top',
    'neck',
    'head',
    'eyes',
  ];

  const prioritizedSlots = useMemo(() => {
    if (!prioritySlot) return orderedSlots;
    return [prioritySlot, ...orderedSlots.filter((slot) => slot !== prioritySlot)];
  }, [prioritySlot]);

  const overlayLayers = useMemo(
    () =>
      prioritizedSlots.map((slot) => ({
        slot,
        itemId: equipped[slot],
        src: equipped[slot]
          ? getItemImageForSlot(slot, equipped[slot], resolvedVariant)
          : null,
      })),
    [equipped, prioritizedSlots, resolvedVariant],
  );

  const auraSrc =
    overlayLayers.find((layer) => layer.slot === 'aura')?.src ?? null;

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {backgroundSrc ? (
        <img
          src={backgroundSrc}
          alt="Background"
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-[#050505]" />
      )}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.06),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.16)_36%,rgba(0,0,0,0.58)_100%)]" />

      <Layer
        src={auraSrc}
        alt="Aura"
        wrapperClassName={SLOT_STYLES.aura.wrapper}
        imageClassName={SLOT_STYLES.aura.image}
      />

      {baseRatSrc ? (
        <div className={`${BASE_LAYER} z-[3] pb-[15%]`}>
          <img
            src={baseRatSrc}
            alt="GymRat"
            className="h-[76%] w-auto max-w-none object-contain drop-shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
            draggable={false}
          />
        </div>
      ) : (
        <div className="absolute inset-0 z-[3] flex items-center justify-center text-sm font-semibold text-white/70">
          Missing rat image
        </div>
      )}

      {overlayLayers
        .filter((layer) => layer.slot !== 'aura')
        .map((layer) => {
          if (!layer.src) return null;

          const style = SLOT_STYLES[layer.slot];

          return (
            <Layer
              key={`${layer.slot}-${layer.itemId ?? 'none'}`}
              src={layer.src}
              alt={layer.slot}
              wrapperClassName={style.wrapper}
              imageClassName={style.image}
            />
          );
        })}
    </div>
  );
}