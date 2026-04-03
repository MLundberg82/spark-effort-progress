import { getBackgroundAsset, getLevelVisual } from '@/lib/levelVisuals';
import { getItemById } from '@/lib/itemAssets';
import type { EquippedItems, ItemAsset, RatVariant } from '@/lib/assetTypes';

type GymRatStageProps = {
  level: number;
  variant: RatVariant;
  equipped?: EquippedItems;
  className?: string;
  showTierBadge?: boolean;
  showLevelBadge?: boolean;
};

const SLOT_RENDER_ORDER: Array<keyof EquippedItems> = [
  'aura',
  'pants',
  'feet',
  'top',
  'neck',
  'head',
  'eyes',
];

function getEquippedItemList(equipped?: EquippedItems): ItemAsset[] {
  if (!equipped) return [];

  const items = SLOT_RENDER_ORDER
    .map((slot) => getItemById(equipped[slot]))
    .filter(Boolean) as ItemAsset[];

  return [...items].sort((a, b) => a.zIndex - b.zIndex);
}

export default function GymRatStage({
  level,
  variant,
  equipped,
  className = '',
  showTierBadge = true,
  showLevelBadge = true,
}: GymRatStageProps) {
  const visual = getLevelVisual(level);
  const background = getBackgroundAsset(visual.backgroundId);
  const ratImage = visual.ratAssets[variant];
  const equippedItems = getEquippedItemList(equipped);

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950 shadow-2xl ${className}`}
    >
      <div className="absolute inset-0">
        <img
          src={background.image}
          alt={background.id}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/0 to-black/35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_60%)]" />

      <div className="absolute left-4 top-4 right-4 z-30 flex items-start justify-between">
        {showTierBadge ? (
          <div className="rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-400">
              Tier
            </div>
            <div className="text-sm font-bold text-white">
              {visual.tierName}
            </div>
          </div>
        ) : (
          <div />
        )}

        {showLevelBadge ? (
          <div className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-right backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-400">
              Level
            </div>
            <div className="text-sm font-bold text-white">{level}</div>
          </div>
        ) : null}
      </div>

      <div className="relative z-20 flex h-[520px] items-end justify-center px-4 pb-0 pt-20 sm:h-[620px]">
        <div
          className="pointer-events-none absolute bottom-6 h-10 w-[58%] rounded-full bg-black/40 blur-2xl"
          aria-hidden="true"
        />

        <div
          className="relative flex h-full w-full items-end justify-center"
          style={{
            transform: `translateY(${background.characterOffsetY ?? 0}px)`,
          }}
        >
          <div
            className="relative h-[86%] w-full max-w-[420px] origin-bottom"
            style={{
              transform: `scale(${visual.ratScale})`,
            }}
          >
            {equippedItems
              .filter((item) => item.slot === 'aura')
              .map((item) => {
                const source = item.variants?.[variant] || item.image;
                return (
                  <img
                    key={item.id}
                    src={source}
                    alt={item.name}
                    className="absolute inset-0 h-full w-full object-contain"
                    draggable={false}
                  />
                );
              })}

            <img
              src={ratImage}
              alt={`${visual.tierName} ${variant} rat`}
              className="absolute inset-0 h-full w-full object-contain"
              draggable={false}
            />

            {equippedItems
              .filter((item) => item.slot !== 'aura')
              .map((item) => {
                const source = item.variants?.[variant] || item.image;
                return (
                  <img
                    key={item.id}
                    src={source}
                    alt={item.name}
                    className="absolute inset-0 h-full w-full object-contain"
                    draggable={false}
                  />
                );
              })}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30 p-4">
        <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                Identity
              </div>
              <div className="text-sm font-semibold capitalize text-white">
                {variant === 'nonbinary' ? 'Non-binary' : variant}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                Lighting
              </div>
              <div className="text-sm font-semibold capitalize text-white">
                {visual.lighting}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                Next target
              </div>
              <div className="text-sm font-semibold text-white">
                {visual.unlockXpTarget.toLocaleString()} XP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}