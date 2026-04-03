export type RatVariant = 'male' | 'female' | 'nonbinary';

export type ItemSlot =
  | 'head'
  | 'eyes'
  | 'neck'
  | 'top'
  | 'pants'
  | 'feet'
  | 'aura';

export type LevelMilestone =
  | 1
  | 5
  | 10
  | 15
  | 20
  | 25
  | 30
  | 35
  | 40
  | 50
  | 60
  | 70
  | 80
  | 90
  | 100;

export interface RatAssetSet {
  male: string;
  female: string;
  nonbinary: string;
}

export interface BackgroundAsset {
  id: string;
  image: string;
  stageScale?: number;
  characterOffsetY?: number;
  overlayGlow?: string;
}

export interface LevelVisualConfig {
  level: LevelMilestone;
  tierName: string;
  ratScale: number;
  backgroundId: string;
  ratAssets: RatAssetSet;
  difficultyWeight: number;
  unlockXpTarget: number;
  lighting: 'dim' | 'moody' | 'neon' | 'elite' | 'legend';
}

export interface ItemAsset {
  id: string;
  name: string;
  slot: ItemSlot;
  image: string;
  zIndex: number;
  premium?: boolean;
  unlockLevel?: number;
  variants?: Partial<Record<RatVariant, string>>;
}

export interface EquippedItems {
  head?: string;
  eyes?: string;
  neck?: string;
  top?: string;
  pants?: string;
  feet?: string;
  aura?: string;
}