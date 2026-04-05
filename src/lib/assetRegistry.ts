import type { RatVariant } from '@/lib/assetTypes';

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

const topModules = import.meta.glob('@/assets/items/top/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

const pantsModules = import.meta.glob('@/assets/items/pants/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

const feetModules = import.meta.glob('@/assets/items/feet/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

const eyesModules = import.meta.glob('@/assets/items/eyes/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

const neckModules = import.meta.glob('@/assets/items/neck/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

const auraModules = import.meta.glob('@/assets/items/aura/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

const bodyModules = import.meta.glob('@/assets/items/body/*.png', {
  eager: true,
}) as Record<string, AssetModule>;

function toRecord(modules: Record<string, AssetModule>) {
  return Object.fromEntries(
    Object.entries(modules).map(([path, mod]) => {
      const file = path.split('/').pop()?.replace('.png', '') ?? path;
      return [file, mod.default];
    }),
  );
}

const maleRatMap = toRecord(ratMaleModules);
const femaleRatMap = toRecord(ratFemaleModules);
const nonBinaryRatMap = toRecord(ratNonBinaryModules);

const backgroundMap = toRecord(backgroundModules);
const headMap = toRecord(headModules);
const topMap = toRecord(topModules);
const pantsMap = toRecord(pantsModules);
const feetMap = toRecord(feetModules);
const eyesMap = toRecord(eyesModules);
const neckMap = toRecord(neckModules);
const auraMap = toRecord(auraModules);
const bodyMap = toRecord(bodyModules);

function normalizeVariant(variant: RatVariant): RatVariant {
  if (variant === 'female') return 'female';
  if (variant === 'non-binary') return 'non-binary';
  return 'male';
}

function getNearestMilestone(level: number) {
  const milestones = [1, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 100];
  let current = 1;

  for (const step of milestones) {
    if (level >= step) current = step;
  }

  return current;
}

function padLevel(level: number) {
  return String(level).padStart(3, '0');
}

function getVariantSuffix(variant: RatVariant) {
  if (variant === 'female') return 'female';
  if (variant === 'non-binary') return 'nonbinary';
  return 'male';
}

function pickRatMap(variant: RatVariant) {
  const normalized = normalizeVariant(variant);

  if (normalized === 'female') return femaleRatMap;
  if (normalized === 'non-binary') return nonBinaryRatMap;
  return maleRatMap;
}

export function getRatImage(id: string) {
  const lower = id.toLowerCase();

  let variant: RatVariant = 'male';
  if (lower.includes('female')) variant = 'female';
  if (lower.includes('nonbinary') || lower.includes('non-binary')) {
    variant = 'non-binary';
  }

  const match = lower.match(/rat-lv-(\d{1,3})/);
  const level = match ? Number(match[1]) : 1;

  return getRatImageForLevel(level, variant);
}

export function getRatImageForLevel(level: number, variant: RatVariant) {
  const milestone = getNearestMilestone(level);
  const key = `rat-lv-${padLevel(milestone)}-${getVariantSuffix(variant)}`;
  const ratMap = pickRatMap(variant);

  return ratMap[key] ?? null;
}

export function getBackgroundImage(id: string | null | undefined) {
  if (!id) return null;
  return backgroundMap[id] ?? null;
}

export function getDefaultBackgroundForLevel(level: number) {
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

function resolveBodyVariantId(id: string, variant: RatVariant) {
  if (variant === 'female') {
    return bodyMap[`${id}-female`] ? `${id}-female` : id;
  }

  if (variant === 'non-binary') {
    return bodyMap[`${id}-nonbinary`] ? `${id}-nonbinary` : id;
  }

  return bodyMap[`${id}-male`] ? `${id}-male` : id;
}

export function getItemImage(id: string, variant?: RatVariant) {
  if (!id) return null;

  if (headMap[id]) return headMap[id];
  if (topMap[id]) return topMap[id];
  if (pantsMap[id]) return pantsMap[id];
  if (feetMap[id]) return feetMap[id];
  if (eyesMap[id]) return eyesMap[id];
  if (neckMap[id]) return neckMap[id];
  if (auraMap[id]) return auraMap[id];

  if (bodyMap[id]) return bodyMap[id];

  if (variant) {
    const bodyVariantId = resolveBodyVariantId(id, variant);
    if (bodyMap[bodyVariantId]) return bodyMap[bodyVariantId];
  }

  return null;
}