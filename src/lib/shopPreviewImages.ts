import type { RatTier } from './gamificationStore';
import { getGenderKey } from './ratImages';
import { getItemById } from './itemAssets';

export function getItemPreviewImage(itemId: string, _tier: RatTier): string | null {
  const item = getItemById(itemId);
  if (!item) return null;

  const variant = getGenderKey();
  return item.variants?.[variant] || item.image || null;
}

export function hasItemPreview(itemId: string, tier: RatTier): boolean {
  return !!getItemPreviewImage(itemId, tier);
}