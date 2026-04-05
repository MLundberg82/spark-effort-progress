import type {
  AssetCategory,
  AssetDictionary,
  CosmeticSlot,
  RatVariant,
} from '@/lib/assetTypes';
import { normalizeRatVariant } from '@/lib/assetTypes';

type AssetModule = {
  default: string;
};

const ratMaleModules = import.meta.glob('@/assets/rats/male/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

const ratFemaleModules = import.meta.glob('@/assets/rats/female/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

const ratNonBinaryModules = import.meta.glob('@/assets/rats/Non Binary/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

const backgroundModules = import.meta.glob('@/assets/backgrounds/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

const headModules = import.meta.glob('@/assets/items/head/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

const eyesModules = import.meta.glob('@/assets/items/eyes/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

const neckModules = import.meta.glob('@/assets/items/neck/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

const topModules = import.meta.glob('@/assets/items/top/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

const pantsModules = import.meta.glob('@/assets/items/pants/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

const feetModules = import.meta.glob('@/assets/items/feet/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

const auraModules = import.meta.glob('@/assets/items/aura/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

const bodyModules = import.meta.glob('@/assets/items/body/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

const MILESTONES = [1, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 100];

function toRecord(modules: Record<string, AssetModule>): AssetDictionary {
  return Object.fromEntries(
    Object.entries(modules).map(([path, mod]) => {
      const fileName = path.split('/').pop()?.replace('.png', '') ?? path;
      return [fileName, mod.default];
    }),
  );
}

const maleRatMap = toRecord(ratMaleModules);
const femaleRatMap = toRecord(ratFemaleModules);
const nonBinaryRatMap = toRecord(ratNonBinaryModules);

const backgroundMap = toRecord(backgroundModules);
const headMap = toRecord(headModules);
const eyesMap = toRecord(eyesModules);
const neckMap = toRecord(neckModules);
const topMap = toRecord(topModules);
const pantsMap = toRecord(pantsModules);
const feetMap = toRecord(feetModules);
const auraMap = toRecord(auraModules);
const bodyMap = toRecord(bodyModules);

const slotMaps: Record<CosmeticSlot, AssetDictionary> = {
  head: headMap,
  eyes: eyesMap,
  neck: neckMap,
  top: topMap,
  pants: pantsMap,
  feet: feetMap,
  aura: auraMap,
};

function getRatMap(variant: RatVariant): AssetDictionary {
  const resolved = normalizeRatVariant(variant);
  if (resolved === 'female') return femaleRatMap;
  if (resolved === 'non-binary') return nonBinaryRatMap;
  return maleRatMap;
}

function padLevel(level: number): string {
  return String(level).padStart(3, '0');
}

export function getNearestMilestone(level: number): number {
  let current = 1;

  for (const step of MILESTONES) {
    if (level >= step) current = step;
  }

  return current;
}

function getVariantSuffix(variant: RatVariant): string {
  const resolved = normalizeRatVariant(variant);
  if (resolved === 'female') return 'female';
  if (resolved === 'non-binary') return 'nonbinary';
  return 'male';
}

function getVariantAliases(variant: RatVariant): string[] {
  const resolved = normalizeRatVariant(variant);
  if (resolved === 'non-binary') {
    return ['nonbinary', 'non-binary', 'nb'];
  }

  return [resolved];
}

function getRatCandidateIds(level: number, variant: RatVariant): string[] {
  const milestone = getNearestMilestone(level);
  const padded = padLevel(milestone);
  const suffix = getVariantSuffix(variant);
  const aliases = getVariantAliases(variant);

  const candidates = new Set<string>();

  candidates.add(`rat-lv-${padded}-${suffix}`);
  candidates.add(`rat-lv-${padded}`);

  for (const alias of aliases) {
    candidates.add(`rat-lv-${padded}-${alias}`);
    candidates.add(`rat-level-${milestone}-${alias}`);
    candidates.add(`rat-${milestone}-${alias}`);
    candidates.add(`rat-${alias}-${milestone}`);
    candidates.add(`rat-${alias}-lv-${padded}`);
  }

  candidates.add(`rat-level-${milestone}`);
  candidates.add(`rat-${milestone}`);

  return Array.from(candidates);
}

function resolveBodyVariantId(baseId: string, variant: RatVariant): string[] {
  const resolved = normalizeRatVariant(variant);

  if (resolved === 'female') {
    return [`${baseId}-female`, baseId];
  }

  if (resolved === 'non-binary') {
    return [`${baseId}-nonbinary`, `${baseId}-non-binary`, baseId];
  }

  return [`${baseId}-male`, baseId];
}

function findFirstHit(map: AssetDictionary, candidates: string[]): string | null {
  for (const candidate of candidates) {
    if (map[candidate]) return map[candidate];
  }

  return null;
}

export function getRatImage(id: string | null | undefined): string | null {
  if (!id) return null;

  const lower = id.toLowerCase();

  let variant: RatVariant = 'male';
  if (lower.includes('female')) variant = 'female';
  if (lower.includes('nonbinary') || lower.includes('non-binary') || lower.includes('nb')) {
    variant = 'non-binary';
  }

  const match = lower.match(/rat-lv-(\d{1,3})/);
  const level = match ? Number(match[1]) : 1;

  return getRatImageForLevel(level, variant);
}

export function getRatImageForLevel(level: number, variant: RatVariant): string | null {
  const ratMap = getRatMap(variant);
  return findFirstHit(ratMap, getRatCandidateIds(level, variant));
}

export function getRatImageCandidates(level: number, variant: RatVariant): string[] {
  return getRatCandidateIds(level, variant);
}

export function getBackgroundImage(id: string | null | undefined): string | null {
  if (!id) return null;
  return backgroundMap[id] ?? null;
}

export function getDefaultBackgroundForLevel(level: number): string | null {
  if (level >= 90) return backgroundMap['bg-legend-1'] ?? null;
  if (level >= 80) return backgroundMap['bg-mythic-1'] ?? backgroundMap['bg-king-1'] ?? null;
  if (level >= 70) return backgroundMap['bg-king-1'] ?? null;
  if (level >= 60) return backgroundMap['bg-elite-2'] ?? backgroundMap['bg-elite-1'] ?? null;
  if (level >= 50) return backgroundMap['bg-elite-1'] ?? null;
  if (level >= 40) return backgroundMap['bg-alpha-2'] ?? backgroundMap['bg-alpha-1'] ?? null;
  if (level >= 30) return backgroundMap['bg-alpha-1'] ?? null;
  if (level >= 20) return backgroundMap['bg-grind-3'] ?? backgroundMap['bg-grind-2'] ?? null;
  if (level >= 10) return backgroundMap['bg-grind-2'] ?? backgroundMap['bg-grind-1'] ?? null;
  if (level >= 5) return backgroundMap['bg-underground-2'] ?? backgroundMap['bg-underground-1'] ?? null;
  return backgroundMap['bg-underground-1'] ?? null;
}

export function getItemImage(
  id: string | null | undefined,
  variant?: RatVariant,
): string | null {
  if (!id) return null;

  for (const map of Object.values(slotMaps)) {
    if (map[id]) return map[id];
  }

  if (bodyMap[id]) return bodyMap[id];

  if (variant) {
    for (const candidate of resolveBodyVariantId(id, variant)) {
      if (bodyMap[candidate]) return bodyMap[candidate];
    }
  }

  return null;
}

export function getItemImageForSlot(
  slot: CosmeticSlot,
  id: string | null | undefined,
  variant?: RatVariant,
): string | null {
  if (!id) return null;

  const slotMap = slotMaps[slot];
  if (slotMap[id]) return slotMap[id];

  if (variant) {
    for (const candidate of resolveBodyVariantId(id, variant)) {
      if (slotMap[candidate]) return slotMap[candidate];
      if (bodyMap[candidate]) return bodyMap[candidate];
    }
  }

  if (bodyMap[id]) return bodyMap[id];

  return null;
}

export function hasAsset(category: AssetCategory, id: string): boolean {
  const map = getAssetMap(category);
  return Boolean(map[id]);
}

export function getAssetMap(category: AssetCategory): AssetDictionary {
  switch (category) {
    case 'rats':
      return {
        ...maleRatMap,
        ...femaleRatMap,
        ...nonBinaryRatMap,
      };
    case 'backgrounds':
      return backgroundMap;
    case 'head':
      return headMap;
    case 'eyes':
      return eyesMap;
    case 'neck':
      return neckMap;
    case 'top':
      return topMap;
    case 'pants':
      return pantsMap;
    case 'feet':
      return feetMap;
    case 'aura':
      return auraMap;
    case 'body':
      return bodyMap;
    default:
      return {};
  }
}

export function listAssetIds(category: AssetCategory): string[] {
  return Object.keys(getAssetMap(category)).sort((a, b) => a.localeCompare(b));
}