import { useMemo } from 'react';
import { getProfile } from '@/lib/profileStore';
import { getLevelFromXP, getTotalXP } from '@/lib/gamificationStore';
import { getEquippedItems } from '@/lib/shopStore';
import { getBackgroundAsset, getItemAsset, getRatImage } from '@/lib/assetRegistry';
import type { RatVariant } from '@/lib/assetTypes';

type EquippedRatPreviewProps = {
  className?: string;
};

function getVariantFromProfileGender(gender?: string): RatVariant {
  if (gender === 'female') return 'female';
  if (gender === 'non-binary') return 'nonbinary';
  return 'male';
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export default function EquippedRatPreview({
  className = '',
}: EquippedRatPreviewProps) {
  const profile = getProfile();
  const totalXP = getTotalXP();
  const level = getLevelFromXP(totalXP);
  const variant = getVariantFromProfileGender(profile?.gender);
  const equipped = getEquippedItems();

  const ratSrc = useMemo(() => getRatImage(level, variant), [level, variant]);

  const backgroundSrc = useMemo(() => {
    if (!equipped.background) return null;
    return getBackgroundAsset(equipped.background) ?? null;
  }, [equipped.background]);

  const overlays = useMemo(() => {
    const ordered = [
      { key: 'feet', id: equipped.feet },
      { key: 'pants', id: equipped.pants },
      { key: 'top', id: equipped.top },
      { key: 'neck', id: equipped.neck },
      { key: 'eyes', id: equipped.eyes },
      { key: 'head', id: equipped.head },
      { key: 'aura', id: equipped.aura },
    ] as const;

    return ordered
      .map((entry) => {
        if (!entry.id) return null;

        const src = getItemAsset(entry.id);
        if (!src) return null;

        return {
          key: entry.key,
          id: entry.id,
          src,
        };
      })
      .filter(Boolean) as Array<{
      key: string;
      id: string;
      src: string;
    }>;
  }, [
    equipped.feet,
    equipped.pants,
    equipped.top,
    equipped.neck,
    equipped.eyes,
    equipped.head,
    equipped.aura,
  ]);

  const auraOverlay = overlays.find((item) => item.key === 'aura');
  const clothingOverlays = overlays.filter((item) => item.key !== 'aura');

  return (
    <div className={cx('relative isolate w-full', className)}>
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-[32px]">
        {backgroundSrc ? (
          <img
            src={backgroundSrc}
            alt="Equipped background"
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(16,185,129,0.18),rgba(255,255,255,0.03),rgba(0,0,0,0.22)),linear-gradient(180deg,rgba(17,24,39,0.86),rgba(10,13,18,1))]" />
        )}

        <div className="absolute inset-0 bg-black/10" />

        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.22),rgba(0,0,0,0.4))]" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute h-[72%] w-[72%] rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute h-[55%] w-[55%] rounded-full bg-amber-300/10 blur-3xl" />

          {auraOverlay ? (
            <img
              src={auraOverlay.src}
              alt="Equipped aura"
              className="absolute inset-0 h-full w-full object-contain opacity-95 drop-shadow-[0_0_35px_rgba(16,185,129,0.22)]"
              draggable={false}
            />
          ) : (
            <div className="absolute h-[78%] w-[78%] rounded-full bg-emerald-400/6 blur-[70px]" />
          )}

          <div className="relative z-[2] flex h-full w-full items-end justify-center px-2 pb-2">
            <div className="relative h-[88%] w-full">
              {ratSrc ? (
                <img
                  src={ratSrc}
                  alt="GymRat"
                  className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_22px_50px_rgba(0,0,0,0.42)]"
                  draggable={false}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-8xl">
                  🐀
                </div>
              )}

              {clothingOverlays.map((overlay, index) => (
                <img
                  key={`${overlay.key}-${overlay.id}-${index}`}
                  src={overlay.src}
                  alt={overlay.id}
                  className="absolute inset-0 h-full w-full object-contain"
                  draggable={false}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0))]" />
      </div>
    </div>
  );
}