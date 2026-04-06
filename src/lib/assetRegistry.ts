import type { AssetDictionary, CosmeticSlot, RatVariant } from "@/lib/assetTypes";

const assetModules = import.meta.glob("../assets/**/*.{png,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function normalizeKey(value: string) {
  return value.trim().toLowerCase();
}

function basenameWithoutExtension(path: string) {
  const fileName = path.split("/").pop() ?? path;
  return fileName.replace(/\.[^.]+$/, "");
}

const assetMap: AssetDictionary = Object.fromEntries(
  Object.entries(assetModules).map(([path, url]) => [
    normalizeKey(basenameWithoutExtension(path)),
    url,
  ]),
);

function findFirstExisting(keys: Array<string | null | undefined>) {
  for (const key of keys) {
    if (!key) continue;
    const match = assetMap[normalizeKey(key)];
    if (match) return match;
  }

  return null;
}

function normalizeVariant(variant?: RatVariant) {
  if (!variant) return "male";
  if (variant === "non-binary") return "nonbinary";
  return variant;
}

function levelBucket(level: number) {
  const milestones = [1, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 100];

  let current = 1;
  for (const milestone of milestones) {
    if (level >= milestone) {
      current = milestone;
    } else {
      break;
    }
  }

  return current;
}

function getTierName(level: number) {
  if (level >= 100) return "legend";
  if (level >= 90) return "mythic";
  if (level >= 80) return "king";
  if (level >= 70) return "elite";
  if (level >= 60) return "alpha";
  if (level >= 50) return "grind";
  if (level >= 30) return "grind";
  if (level >= 15) return "underground";
  return "underground";
}

export function getAssetById(id: string | null | undefined) {
  if (!id) return null;
  return findFirstExisting([id]);
}

export function getBackgroundImage(id: string | null | undefined) {
  if (!id) return null;

  return findFirstExisting([
    id,
    `background-${id}`,
    `bg-${id}`,
  ]);
}

export function getDefaultBackgroundForLevel(level: number) {
  const tier = getTierName(level);

  return findFirstExisting([
    `bg-${tier}-1`,
    `bg-${tier}-01`,
    "bg-underground-1",
  ]);
}

export function getRatImageForLevel(level: number, variant: RatVariant) {
  const bucket = levelBucket(level);
  const normalizedVariant = normalizeVariant(variant);
  const padded = String(bucket).padStart(3, "0");

  return findFirstExisting([
    `rat-lv-${padded}-${normalizedVariant}`,
    `rat-lv-${bucket}-${normalizedVariant}`,
    `rat-level-${padded}-${normalizedVariant}`,
    `rat-level-${bucket}-${normalizedVariant}`,
    `rat-${bucket}-${normalizedVariant}`,
    `rat-${normalizedVariant}-${padded}`,
    `rat-${normalizedVariant}-${bucket}`,
    `rat-lv-${padded}-male`,
    `rat-lv-${bucket}-male`,
  ]);
}

function buildVariantCandidates(baseId: string, variant: RatVariant) {
  const normalizedVariant = normalizeVariant(variant);

  return [
    `${baseId}-${normalizedVariant}`,
    `${baseId}_${normalizedVariant}`,
    `${baseId}${normalizedVariant}`,
    baseId,
  ];
}

export function getItemImageForSlot(
  slot: CosmeticSlot,
  itemId: string | null | undefined,
  variant?: RatVariant,
) {
  if (!itemId) return null;

  const resolvedVariant = variant ?? "male";
  const variantCandidates = buildVariantCandidates(itemId, resolvedVariant);

  const slotCandidates = variantCandidates.flatMap((candidate) => [
    candidate,
    `${slot}-${candidate}`,
  ]);

  return findFirstExisting(slotCandidates);
}

export function getAllAssetIds() {
  return Object.keys(assetMap);
}

export function getAssetsByPrefix(prefix: string) {
  const normalizedPrefix = normalizeKey(prefix);

  return Object.entries(assetMap)
    .filter(([key]) => key.startsWith(normalizedPrefix))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, url]) => ({ id: key, src: url }));
}

export function getBackgroundAssets() {
  return getAssetsByPrefix("bg-");
}

export function getRatAssets() {
  return getAssetsByPrefix("rat-");
}