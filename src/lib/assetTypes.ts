import type { AssetLookupResult } from '@/lib/assetTypes';

type AssetModule = {
  default: string;
};

const assetModules = import.meta.glob<AssetModule>(
  [
    '/src/assets/**/*.png',
    '/src/assets/**/*.webp',
    '/src/assets/**/*.jpg',
    '/src/assets/**/*.jpeg',
  ],
  { eager: true }
);

type IndexedAsset = AssetLookupResult & {
  normalizedId: string;
  normalizedFileName: string;
};

function stripExtension(fileName: string) {
  return fileName.replace(/\.(png|webp|jpg|jpeg)$/i, '');
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/\.(png|webp|jpg|jpeg)$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const indexedAssets: IndexedAsset[] = Object.entries(assetModules).map(
  ([path, mod]) => {
    const fileName = path.split('/').pop() ?? path;
    const id = stripExtension(fileName);

    return {
      id,
      src: mod.default,
      fileName,
      path,
      normalizedId: normalize(id),
      normalizedFileName: normalize(fileName),
    };
  }
);

function scoreAssetMatch(asset: IndexedAsset, query: string, preferredFolder?: string) {
  const normalizedQuery = normalize(query);
  let score = 0;

  if (asset.normalizedId === normalizedQuery) score += 1000;
  if (asset.normalizedFileName === normalizedQuery) score += 950;

  if (asset.normalizedId.startsWith(normalizedQuery)) score += 300;
  if (asset.normalizedFileName.startsWith(normalizedQuery)) score += 250;

  if (asset.normalizedId.includes(normalizedQuery)) score += 120;
  if (asset.normalizedFileName.includes(normalizedQuery)) score += 90;

  if (preferredFolder && asset.path.toLowerCase().includes(preferredFolder.toLowerCase())) {
    score += 80;
  }

  return score;
}

function findBestAsset(query: string, preferredFolder?: string) {
  const ranked = indexedAssets
    .map((asset) => ({
      asset,
      score: scoreAssetMatch(asset, query, preferredFolder),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.asset ?? null;
}

export function getAllAssets() {
  return indexedAssets.map(({ normalizedId, normalizedFileName, ...asset }) => asset);
}

export function getAssetById(id: string) {
  const hit = findBestAsset(id);
  if (!hit) return null;

  const { normalizedId, normalizedFileName, ...asset } = hit;
  return asset;
}

export function getAssetSrc(id: string) {
  return getAssetById(id)?.src ?? null;
}

export function getItemImage(id: string) {
  return (
    getAssetSrc(id) ??
    getAssetSrc(`${id}.png`) ??
    getAssetSrc(`${id}.webp`) ??
    null
  );
}

export function getBackgroundImage(id: string) {
  const hit =
    findBestAsset(id, '/background') ??
    findBestAsset(id, '/backgrounds') ??
    findBestAsset(id, '/bg') ??
    findBestAsset(id);

  if (!hit) return null;

  const { src } = hit;
  return src;
}

export function getRatImage(id: string) {
  const hit =
    findBestAsset(id, '/rats') ??
    findBestAsset(id, '/rat') ??
    findBestAsset(id);

  if (!hit) return null;

  return hit.src;
}

export function debugFindAssets(term: string) {
  const normalizedTerm = normalize(term);

  return indexedAssets
    .map((asset) => ({
      id: asset.id,
      fileName: asset.fileName,
      path: asset.path,
      src: asset.src,
      score: scoreAssetMatch(asset, normalizedTerm),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}