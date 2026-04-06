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
  equippedOverride?: EquippedItems; // ✅ FIX
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

  // ✅ Use override if provided (shop preview), annars global state
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
        'relative isolate aspect-[4/4] w-full overflow-hidden rounded-[28px] border border-white/8 bg-black',
        className,
      ].join(' ')}
    >
      <div className="absolute inset-0">
        {backgroundSrc ? (
          <Layer
            src={backgroundSrc}
            alt="GymRat background"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(163,230,53,0.12),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/12" />
      </div>

      <div className="absolute inset-[5.5%] rounded-[24px]">
        {auraSrc ? (
          <Layer
            src={auraSrc}
            alt="Equipped aura"
            objectContain
            className="absolute inset-[10%] z-[1] h-[80%] w-[80%]"
          />
        ) : null}

        {baseRatSrc ? (
          <Layer
            src={baseRatSrc}
            alt="GymRat"
            objectContain
            className="absolute bottom-[6%] left-1/2 z-[2] h-[84%] w-[62%] -translate-x-1/2"
          />
        ) : null}

        {overlayLayers.map((layer) =>
          layer.src ? (
            <Layer
              key={`${layer.slot}-${layer.itemId ?? 'empty'}`}
              src={layer.src}
              alt={`${layer.slot} equipped item`}
              objectContain
              className="absolute bottom-[6%] left-1/2 z-[3] h-[84%] w-[62%] -translate-x-1/2"
            />
          ) : null,
        )}
      </div>
    </div>
  );
}