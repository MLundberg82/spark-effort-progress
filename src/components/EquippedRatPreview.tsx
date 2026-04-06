import { useEffect, useMemo, useState } from 'react';

import { getBackgroundImage, getDefaultBackgroundForLevel, getItemImageForSlot, getRatImageForLevel } from '@/lib/assetRegistry';
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
};

const BASE_LAYER =
  'pointer-events-none absolute inset-0 flex items-center justify-center';

const SLOT_STYLES: Record<CosmeticSlot, LayerStyle> = {
  aura: {
    wrapper: `${BASE_LAYER} z-[1]`,
    image:
      'h-[92%] w-[92%] object-contain opacity-90 drop-shadow-[0_0_36px_rgba(163,230,53,0.22)]',
  },
  pants: {
    wrapper: 'pointer-events-none absolute inset-x-[23%] bottom-[12%] z-[4] flex justify-center',
    image: 'w-[54%] max-w-none object-contain',
  },
  feet: {
    wrapper: 'pointer-events-none absolute inset-x-[22%] bottom-[7.5%] z-[5] flex justify-center',
    image: 'w-[56%] max-w-none object-contain',
  },
  top: {
    wrapper: 'pointer-events-none absolute inset-x-[18%] top-[25%] z-[6] flex justify-center',
    image: 'w-[64%] max-w-none object-contain',
  },
  neck: {
    wrapper: 'pointer-events-none absolute inset-x-[33%] top-[25.5%] z-[7] flex justify-center',
    image: 'w-[34%] max-w-none object-contain',
  },
  head: {
    wrapper: 'pointer-events-none absolute inset-x-[27%] top-[8.5%] z-[8] flex justify-center',
    image: 'w-[46%] max-w-none object-contain',
  },
  eyes: {
    wrapper: 'pointer-events-none absolute inset-x-[35%] top-[20%] z-[9] flex justify-center',
    image: 'w-[24%] max-w-none object-contain',
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
    <div className={wrapperClassName} aria-hidden="true">
      <img
        src={src}
        alt={alt}
        className={imageClassName}
        draggable={false}
        loading="eager"
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

  const backgroundSrc = useMemo(() => {
    return (
      (equipped.background ? getBackgroundImage(equipped.background) : null) ??
      getDefaultBackgroundForLevel(level)
    );
  }, [equipped.background, level]);

  const baseRatSrc = useMemo(() => {
    return getRatImageForLevel(level, resolvedVariant);
  }, [level, resolvedVariant]);

  const orderedSlots: CosmeticSlot[] = ['aura', 'pants', 'feet', 'top', 'neck', 'head', 'eyes'];

  const prioritizedSlots = useMemo(() => {
    if (!prioritySlot) return orderedSlots;
    return [prioritySlot, ...orderedSlots.filter((slot) => slot !== prioritySlot)];
  }, [prioritySlot]);

  const overlayLayers = useMemo(
    () =>
      prioritizedSlots.map((slot) => ({
        slot,
        itemId: equipped[slot],
        src: equipped[slot] ? getItemImageForSlot(slot, equipped[slot], resolvedVariant) : null,
      })),
    [equipped, prioritizedSlots, resolvedVariant],
  );

  return (
    <div
      className={[
        'relative isolate aspect-[4/5] w-full overflow-hidden rounded-[30px]',
        'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),rgba(255,255,255,0.02)_42%,rgba(0,0,0,0.08)_100%)]',
        'shadow-[0_24px_80px_rgba(0,0,0,0.45)]',
        className,
      ].join(' ')}
    >
      {backgroundSrc ? (
        <img
          src={backgroundSrc}
          alt="Background"
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/[0.04] to-black/20" />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/[0.04] to-black/[0.22]" />
      <div className="absolute inset-x-[14%] bottom-[4%] h-[16%] rounded-full bg-black/30 blur-2xl" />

      <Layer
        src={overlayLayers.find((layer) => layer.slot === 'aura')?.src ?? null}
        alt="Aura"
        wrapperClassName={SLOT_STYLES.aura.wrapper}
        imageClassName={SLOT_STYLES.aura.image}
      />

      {baseRatSrc ? (
        <div className="pointer-events-none absolute inset-x-[10%] bottom-[7%] top-[7%] z-[3] flex items-center justify-center">
          <img
            src={baseRatSrc}
            alt="GymRat"
            className="h-full w-full object-contain drop-shadow-[0_22px_42px_rgba(0,0,0,0.34)]"
            draggable={false}
            loading="eager"
          />
        </div>
      ) : (
        <div className="absolute inset-[14%] z-[3] flex items-center justify-center rounded-[28px] border border-dashed border-white/15 bg-black/20 text-center text-sm text-white/60">
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
              key={`${layer.slot}-${layer.itemId ?? 'empty'}`}
              src={layer.src}
              alt={layer.slot}
              wrapperClassName={style.wrapper}
              imageClassName={style.image}
            />
          );
        })}

      <div className="pointer-events-none absolute inset-0 rounded-[30px] ring-1 ring-inset ring-white/8" />
    </div>
  );
}