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

export type AssetDictionary = Record<string, AssetRecord>;

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

export type OverlayLayer =
  | 'background'
  | 'rat-base'
  | 'body'
  | 'pants'
  | 'feet'
  | 'top'
  | 'neck'
  | 'head'
  | 'eyes'
  | 'aura'
  | 'fx';

export type OverlayAnchorKey = 'head' | 'torso' | 'hips' | 'feet' | 'back' | 'fullBody';

export type OverlayAnchor = {
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
};

export type OverlayAnchorMap = Record<OverlayAnchorKey, OverlayAnchor>;

export const DEFAULT_OVERLAY_LAYER_ORDER: readonly OverlayLayer[] = [
  'background',
  'rat-base',
  'body',
  'pants',
  'feet',
  'top',
  'neck',
  'head',
  'eyes',
  'aura',
  'fx',
] as const;

export const DEFAULT_RAT_OVERLAY_ANCHORS: OverlayAnchorMap = {
  head: { x: 0.5, y: 0.22, scale: 1 },
  torso: { x: 0.5, y: 0.5, scale: 1 },
  hips: { x: 0.5, y: 0.68, scale: 1 },
  feet: { x: 0.5, y: 0.9, scale: 1 },
  back: { x: 0.5, y: 0.45, scale: 1 },
  fullBody: { x: 0.5, y: 0.5, scale: 1 },
};

export function normalizeRatVariant(value: string | null | undefined): RatVariant {
  if (!value) return 'male';

  const normalized = value.toLowerCase().trim();
  if (normalized === 'female' || normalized === 'woman' || normalized === 'girl') {
    return 'female';
  }

  if (normalized === 'non-binary' || normalized === 'nonbinary' || normalized === 'nb') {
    return 'non-binary';
  }

  return 'male';
}
