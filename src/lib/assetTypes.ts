export type RatVariant = 'male' | 'female' | 'nonbinary';

export type ItemSlot =
  | 'head'
  | 'eyes'
  | 'neck'
  | 'top'
  | 'pants'
  | 'feet'
  | 'aura';

export type EquippedItems = Partial<Record<ItemSlot, string>>;

export type AssetShopItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  slot: ItemSlot;
  owned: boolean;
  isPremium: boolean;
  unlockLevel?: number;
  image?: string;
};