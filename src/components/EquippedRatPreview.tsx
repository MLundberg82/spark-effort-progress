import { useEffect, useMemo, useState } from 'react';

import { getProfile } from '@/lib/profileStore';
import { getEquippedState } from '@/lib/shopStore';
import {
  getBackgroundImage,
  getDefaultBackgroundForLevel,
  getItemImageForSlot,
  getRatImageForLevel,
} from '@/lib/assetRegistry';
import type { CosmeticSlot, EquippedItems, RatVariant } from '@/lib/assetTypes';

type EquippedRatPreviewProps = {
  level: number;
  variant?: RatVariant;
  className?: string;
  equippedOverride?: EquippedItems;
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
  objectContain = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  objectContain?: boolean;
}) {
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={[
        'pointer-events-none select-none',
        objectContain ? 'object-contain' : 'object-cover',
        className,
      ].join(' ')}
    />
  );
}

export default function EquippedRatPreview({
  level,
  variant,
  className = '',
  equippedOverride,
}: EquippedRatPreviewProps) {
  const [equippedState, setEquippedState] = useState<EquippedItems>(getEquippedState);

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

  const auraSrc = useMemo(() => {
    return equipped.aura
      ? getItemImageForSlot('aura', equipped.aura, resolvedVariant)
      : null;
  }, [equipped.aura, resolvedVariant]);

  const overlayLayers = useMemo(
    () =>
      (['pants', 'feet', 'top', 'neck', 'head', 'eyes'] as CosmeticSlot[]).map((slot) => ({
        slot,
        itemId: equipped[slot],
        src: equipped[slot]
          ? getItemImageForSlot(slot, equipped[slot], resolvedVariant)
          : null,
      })),
    [equipped, resolvedVariant],
  );

  return (
    <div
      className={[
        'relative isolate h-full min-h-0 w-full overflow-hidden rounded-[28px] border border-white/8 bg-black',
        className,
      ].join(' ')}
    >
      <div className="absolute inset-0">
        {backgroundSrc ? (
          <Layer
            src={backgroundSrc}
            alt="GymRat background"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(163,230,53,0.12),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/14" />
      </div>

      <div className="absolute inset-0 z-[1] flex items-center justify-center">
        {auraSrc ? (
          <Layer
            src={auraSrc}
            alt="Equipped aura"
            objectContain
            className="absolute left-1/2 top-1/2 h-[76%] w-[76%] -translate-x-1/2 -translate-y-[42%] opacity-90"
          />
        ) : null}

        {baseRatSrc ? (
          <Layer
            src={baseRatSrc}
            alt="GymRat"
            objectContain
            className="absolute left-1/2 top-1/2 z-[2] h-[92%] w-[76%] -translate-x-1/2 -translate-y-[34%]"
          />
        ) : (
          <div className="absolute inset-0 z-[2] flex items-center justify-center rounded-[20px] border border-dashed border-white/12 bg-black/20 px-4 text-center text-sm font-semibold text-white/45">
            Missing rat image
          </div>
        )}

        {overlayLayers.map((layer) =>
          layer.src ? (
            <Layer
              key={`${layer.slot}-${layer.itemId ?? 'empty'}`}
              src={layer.src}
              alt={`${layer.slot} equipped item`}
              objectContain
              className="absolute left-1/2 top-1/2 z-[3] h-[92%] w-[76%] -translate-x-1/2 -translate-y-[34%]"
            />
          ) : null,
        )}
      </div>
    </div>
  );
}