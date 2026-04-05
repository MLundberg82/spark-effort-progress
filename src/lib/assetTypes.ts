export type RatVariant = 'male' | 'female' | 'non-binary';

export type CosmeticSlot =
  | 'head'
  | 'eyes'
  | 'neck'
  | 'top'
  | 'pants'
  | 'feet'
  | 'aura';

export type BackgroundSlot = 'background';
export type ItemSlot = CosmeticSlot;
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

export type AssetDictionary = Record<string, string>;

export type AssetCategory =
  | 'rats'
  | 'backgrounds'
  | 'head'
  | 'eyes'
  | 'neck'
  | 'top'
  | 'pants'
  | 'feet'
  | 'aura'
  | 'body';

export const COSMETIC_SLOTS: CosmeticSlot[] = [
  'head',
  'eyes',
  'neck',
  'top',
  'pants',
  'feet',
  'aura',
];

export const SLOT_KEYS: SlotKey[] = [...COSMETIC_SLOTS, 'background'];

export const DEFAULT_EQUIPPED_ITEMS: EquippedItems = {
  head: null,
  eyes: null,
  neck: null,
  top: null,
  pants: null,
  feet: null,
  aura: null,
  background: null,
};

export function isRatVariant(value: unknown): value is RatVariant {
  return value === 'male' || value === 'female' || value === 'non-binary';
}

export function isCosmeticSlot(value: unknown): value is CosmeticSlot {
  return COSMETIC_SLOTS.includes(value as CosmeticSlot);
}

export function isSlotKey(value: unknown): value is SlotKey {
  return SLOT_KEYS.includes(value as SlotKey);
}

export function normalizeRatVariant(value: unknown): RatVariant {
  if (value === 'female') return 'female';
  if (value === 'non-binary' || value === 'nonbinary' || value === 'nb') return 'non-binary';
  return 'male';
}

export function createEmptyEquippedItems(
  partial?: Partial<EquippedItems> | null,
): EquippedItems {
  return {
    head: typeof partial?.head === 'string' ? partial.head : null,
    eyes: typeof partial?.eyes === 'string' ? partial.eyes : null,
    neck: typeof partial?.neck === 'string' ? partial.neck : null,
    top: typeof partial?.top === 'string' ? partial.top : null,
    pants: typeof partial?.pants === 'string' ? partial.pants : null,
    feet: typeof partial?.feet === 'string' ? partial.feet : null,
    aura: typeof partial?.aura === 'string' ? partial.aura : null,
    background: typeof partial?.background === 'string' ? partial.background : null,
  };
}