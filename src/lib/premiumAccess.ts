export type PremiumFeatureKey =
  | 'workout_history'
  | 'nutrition_tracking'
  | 'custom_workouts'
  | 'premium_shop_items';

export function canUsePremiumFeature(
  feature: PremiumFeatureKey,
  premium: boolean
): boolean {
  if (!feature) return true;
  return premium;
}

export type ShopItemLike = {
  id: string;
  name: string;
  price?: number;
  requiresPremium?: boolean;
};

export function isShopItemAvailable(
  item: ShopItemLike,
  premium: boolean
): boolean {
  if (!item.requiresPremium) return true;
  return premium;
}

export function getEffectiveShopPrice(
  item: ShopItemLike,
  premium: boolean
): number {
  if (item.requiresPremium && premium) return 0;
  return item.price ?? 0;
}