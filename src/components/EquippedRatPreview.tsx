import { useEffect, useMemo, useState } from 'react';

import {
  getBackgroundImage,
  getDefaultBackgroundForLevel,
  getItemImageForSlot,
  getRatImageForLevel,
} from '@/lib/assetRegistry';
import type { CosmeticSlot, EquippedItems, RatVariant } from '@/lib/assetTypes';
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
  style?: React.CSSProperties;
};

type OffsetStyle = {
  wrapper?: React.CSSProperties;
  image?: React.CSSProperties;
};

const SLOT_ORDER: CosmeticSlot[] = ['aura', 'pants', 'feet', 'top', 'neck', 'head', 'eyes'];

const BASE_LAYER = 'pointer-events-none absolute inset-0 flex items-end justify-center';

const SLOT_STYLES: Record<CosmeticSlot, LayerStyle> = {
  aura: {
    wrapper: 'pointer-events-none absolute inset-0 z-[1] flex items-center justify-center',
    image:
      'h-[108%] w-[108%] max-w-none object-contain opacity-90 drop-shadow-[0_0_42px_rgba(163,230,53,0.24)]',
  },
  pants: {
    wrapper: 'pointer-events-none absolute inset-x-[18%] bottom-[12.2%] z-[4] flex justify-center',
    image: 'w-[64%] max-w-none object-contain',
  },
  feet: {
    wrapper: 'pointer-events-none absolute inset-x-[18.5%] bottom-[7.2%] z-[5] flex justify-center',
    image: 'w-[65%] max-w-none object-contain',
  },
  top: {
    wrapper: 'pointer-events-none absolute inset-x-[12.5%] top-[15.5%] z-[6] flex justify-center',
    image: 'w-[76%] max-w-none object-contain',
  },
  neck: {
    wrapper: 'pointer-events-none absolute inset-x-[30.5%] top-[17.5%] z-[7] flex justify-center',
    image: 'w-[31%] max-w-none object-contain',
  },
  head: {
    wrapper: 'pointer-events-none absolute inset-x-[24%] top-[1.8%] z-[8] flex justify-center',
    image: 'w-[49%] max-w-none object-contain',
  },
  eyes: {
    wrapper: 'pointer-events-none absolute inset-x-[35.2%] top-[13.5%] z-[9] flex justify-center',
    image: 'w-[20.5%] max-w-none object-contain',
  },
};

const VARIANT_BASE_OFFSETS: Record<RatVariant, OffsetStyle> = {
  male: {},
  female: {
    image: { transform: 'translateY(0.4%) scale(0.992)' },
  },
  'non-binary': {
    image: { transform: 'translateY(0.15%) scale(0.996)' },
  },
};

const LEVEL_FAMILY_OFFSETS: Record<'base' | 'mid' | 'elite' | 'legend', Partial<Record<CosmeticSlot, OffsetStyle>>> = {
  base: {
    top: { image: { transform: 'translateY(0%) scale(1)' } },
    head: { image: { transform: 'translateY(0%) scale(1)' } },
  },
  mid: {
    top: { image: { transform: 'translateY(-1%) scale(1.01)' } },
    head: { image: { transform: 'translateY(-0.6%) scale(1.01)' } },
    pants: { image: { transform: 'translateY(0.8%) scale(1.01)' } },
  },
  elite: {
    top: { image: { transform: 'translateY(-1.5%) scale(1.025)' } },
    head: { image: { transform: 'translateY(-1%) scale(1.02)' } },
    neck: { image: { transform: 'translateY(-0.8%) scale(1.015)' } },
    pants: { image: { transform: 'translateY(1.2%) scale(1.015)' } },
  },
  legend: {
    aura: { image: { transform: 'scale(1.06)' } },
    top: { image: { transform: 'translateY(-2%) scale(1.03)' } },
    head: { image: { transform: 'translateY(-1.2%) scale(1.025)' } },
    neck: { image: { transform: 'translateY(-1%) scale(1.02)' } },
    pants: { image: { transform: 'translateY(1.2%) scale(1.02)' } },
  },
};

const VARIANT_SLOT_OFFSETS: Record<RatVariant, Partial<Record<CosmeticSlot, OffsetStyle>>> = {
  male: {},
  female: {
    top: { image: { transform: 'translateY(-0.6%) scale(0.985)' } },
    pants: { image: { transform: 'translateY(0.8%) scale(0.985)' } },
    head: { image: { transform: 'translateY(0.2%) scale(0.982)' } },
  },
  'non-binary': {
    top: { image: { transform: 'translateY(-0.2%) scale(0.992)' } },
    pants: { image: { transform: 'translateY(0.4%) scale(0.992)' } },
  },
};

function resolveVariant(explicit?: RatVariant): RatVariant {
  if (explicit) return explicit;
  const profile = getProfile();
  if (profile?.gender === 'female') return 'female';
  if (profile?.gender === 'non-binary') return 'non-binary';
  return 'male';
}

function getLevelFamily(level: number): 'base' | 'mid' | 'elite' | 'legend' {
  if (level >= 70) return 'legend';
  if (level >= 30) return 'elite';
  if (level >= 10) return 'mid';
  return 'base';
}

function mergeStyle(...styles: Array<React.CSSProperties | undefined>): React.CSSProperties | undefined {
  const filtered = styles.filter(Boolean);
  if (filtered.length === 0) return undefined;
  return Object.assign({}, ...filtered);
}

function getSlotStyle(slot: CosmeticSlot, level: number, variant: RatVariant, emphasized: boolean) {
  const base = SLOT_STYLES[slot];
  const family = LEVEL_FAMILY_OFFSETS[getLevelFamily(level)][slot];
  const variantOffset = VARIANT_SLOT_OFFSETS[variant][slot];

  const imageStyle = mergeStyle(
    family?.image,
    variantOffset?.image,
    emphasized
      ? {
          filter:
            slot === 'aura'
              ? 'drop-shadow(0 0 28px rgba(190,242,100,0.45))'
              : 'drop-shadow(0 0 20px rgba(250,204,21,0.28))',
        }
      : undefined,
  );

  const wrapperStyle = mergeStyle(
    family?.wrapper,
    variantOffset?.wrapper,
    emphasized ? { opacity: 1 } : undefined,
  );

  return {
    wrapperClassName: `${base.wrapper}${emphasized ? ' animate-pulse' : ''}`,
    imageClassName: `${base.image}${emphasized ? ' brightness-110 saturate-110' : ''}`,
    wrapperStyle,
    imageStyle,
  };
}

function Layer({
  src,
  alt,
  wrapperClassName,
  imageClassName,
  wrapperStyle,
  imageStyle,
}: {
  src: string | null;
  alt: string;
  wrapperClassName: string;
  imageClassName: string;
  wrapperStyle?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
}) {
  if (!src) return null;

  return (
    <div className={wrapperClassName} style={wrapperStyle}>
      <img src={src} alt={alt} className={imageClassName} style={imageStyle} draggable={false} />
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

  const backgroundSrc = useMemo(
    () => (equipped.background ? getBackgroundImage(equipped.background) : null) ?? getDefaultBackgroundForLevel(level),
    [equipped.background, level],
  );

  const baseRatSrc = useMemo(() => getRatImageForLevel(level, resolvedVariant), [level, resolvedVariant]);

  const prioritizedSlots = useMemo(() => {
    if (!prioritySlot) return SLOT_ORDER;
    return [prioritySlot, ...SLOT_ORDER.filter((slot) => slot !== prioritySlot)];
  }, [prioritySlot]);

  const overlayLayers = useMemo(
    () =>
      prioritizedSlots.map((slot) => ({
        slot,
        itemId: equipped[slot],
        src: equipped[slot] ? getItemImageForSlot(slot, equipped[slot] as string, resolvedVariant) : null,
      })),
    [equipped, prioritizedSlots, resolvedVariant],
  );

  const auraSrc = overlayLayers.find((layer) => layer.slot === 'aura')?.src ?? null;
  const baseStyle = VARIANT_BASE_OFFSETS[resolvedVariant];

  return (
    <div className={`relative isolate overflow-hidden rounded-[32px] ${className}`}>
      {backgroundSrc ? (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-[32px]">
          <img
            src={backgroundSrc}
            alt="Equipped background"
            className="h-full w-full object-cover opacity-[0.88]"
            draggable={false}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(250,204,21,0.12),transparent_34%),linear-gradient(180deg,rgba(3,6,12,0.04),rgba(1,2,7,0.36)_65%,rgba(0,0,0,0.58))]" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 rounded-[32px] bg-[radial-gradient(circle_at_50%_10%,rgba(163,230,53,0.12),transparent_26%),linear-gradient(180deg,#04060d_0%,#020309_100%)]" />
      )}

      <div className="absolute inset-0 z-[1] rounded-[32px] bg-[radial-gradient(circle_at_50%_85%,rgba(0,0,0,0.12),transparent_42%)]" />

      <Layer
        src={auraSrc}
        alt="Equipped aura"
        wrapperClassName={getSlotStyle('aura', level, resolvedVariant, prioritySlot === 'aura').wrapperClassName}
        imageClassName={getSlotStyle('aura', level, resolvedVariant, prioritySlot === 'aura').imageClassName}
        wrapperStyle={getSlotStyle('aura', level, resolvedVariant, prioritySlot === 'aura').wrapperStyle}
        imageStyle={getSlotStyle('aura', level, resolvedVariant, prioritySlot === 'aura').imageStyle}
      />

      {baseRatSrc ? (
        <div className={`${BASE_LAYER} z-[3]`} style={baseStyle.wrapper}>
          <img
            src={baseRatSrc}
            alt="Current rat form"
            className="h-full w-full object-contain object-bottom drop-shadow-[0_16px_44px_rgba(0,0,0,0.55)]"
            style={baseStyle.image}
            draggable={false}
          />
        </div>
      ) : (
        <div className="absolute inset-0 z-[3] flex items-center justify-center rounded-[32px] border border-white/10 bg-black/20 text-[11px] uppercase tracking-[0.28em] text-white/45">
          Missing rat image
        </div>
      )}

      {overlayLayers
        .filter((layer) => layer.slot !== 'aura')
        .map((layer) => {
          if (!layer.src) return null;

          const style = getSlotStyle(layer.slot, level, resolvedVariant, prioritySlot === layer.slot);

          return (
            <Layer
              key={layer.slot}
              src={layer.src}
              alt={layer.itemId ? `${layer.itemId} equipped` : `${layer.slot} equipped`}
              wrapperClassName={style.wrapperClassName}
              imageClassName={style.imageClassName}
              wrapperStyle={style.wrapperStyle}
              imageStyle={style.imageStyle}
            />
          );
        })}

      <div className="pointer-events-none absolute inset-x-[10%] bottom-[4%] z-[10] h-12 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0.22)_35%,transparent_72%)] blur-lg" />
    </div>
  );
}
