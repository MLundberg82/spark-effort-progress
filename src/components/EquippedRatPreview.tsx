import { getEquipped } from '@/lib/shopStore';
import { getTotalXP, getLevelFromXP, getRatTier } from '@/lib/gamificationStore';
import { getCurrentTierImage, getGenderKey } from '@/lib/ratImages';
import { getItemById } from '@/lib/itemAssets';
import type { EquippedItems, RatVariant, ItemAsset } from '@/lib/assetTypes';

type EquippedRatPreviewProps = {
  size?: 'hero' | 'shop' | 'gallery';
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

function getPreviewSizeClass(size: EquippedRatPreviewProps['size']) {
  if (size === 'hero') return 'w-[260px] h-[260px] sm:w-[320px] sm:h-[320px]';
  if (size === 'gallery') return 'w-40 h-40';
  return 'w-48 h-48';
}

function getEquippedItems(equipped: EquippedItems): ItemAsset[] {
  return SLOT_RENDER_ORDER
    .map((slot) => getItemById(equipped[slot]))
    .filter(Boolean) as ItemAsset[];
}

export default function EquippedRatPreview({
  size = 'hero',
}: EquippedRatPreviewProps) {
  const totalXP = getTotalXP();

  const levelData = getLevelFromXP(totalXP);
  const level =
    typeof levelData === 'number' ? levelData : levelData?.level ?? 1;

  const ratTierData = getRatTier(level);
  const tier =
    typeof ratTierData === 'string'
      ? ratTierData
      : ratTierData?.tier ?? 'baby';

  const variant = getGenderKey() as RatVariant;
  const baseRatImage = getCurrentTierImage(tier);

  const equipped = (getEquipped() ?? {}) as EquippedItems;
  const equippedItems = getEquippedItems(equipped).sort((a, b) => a.zIndex - b.zIndex);
  const sizeClass = getPreviewSizeClass(size);

  const auraItems = equippedItems.filter((item) => item.slot === 'aura');
  const frontItems = equippedItems.filter((item) => item.slot !== 'aura');

  return (
    <div className={`relative mx-auto ${sizeClass}`}>
      <div className="absolute inset-0 rounded-full bg-black/20 blur-2xl" />

      {auraItems.map((item) => {
        const src = item.variants?.[variant] || item.image;
        if (!src) return null;

        return (
          <img
            key={item.id}
            src={src}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-95"
            draggable={false}
          />
        );
      })}

      <img
        src={baseRatImage}
        alt="Gym Rat"
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />

      {frontItems.map((item) => {
        const src = item.variants?.[variant] || item.image;
        if (!src) return null;

        return (
          <img
            key={item.id}
            src={src}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
        );
      })}
    </div>
  );
}