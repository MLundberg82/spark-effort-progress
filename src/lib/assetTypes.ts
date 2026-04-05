export type RatVariant = 'male' | 'female' | 'non-binary';

export type ItemSlot =
  | 'head'
  | 'eyes'
  | 'neck'
  | 'top'
  | 'pants'
  | 'feet'
  | 'aura';

export type CosmeticSlot = ItemSlot;
export type BackgroundSlot = 'background';
export type SlotKey = CosmeticSlot | BackgroundSlot;

export type EquippedItems = {
  head: string | null;
  eyes: string | null;
  neck: string | null;
  top: string | null;
  pants: string | null;
  feet: string | null;
  aura: string | null;
  background: string | null;
};

export type AssetRecord = {
  id: string;
  src: string;
};