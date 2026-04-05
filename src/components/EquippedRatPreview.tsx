import type { AssetShopItem, ItemSlot, RatVariant } from './assetTypes';

const ratModules = import.meta.glob('../assets/rats/**/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const itemModules = import.meta.glob('../assets/items/**/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const backgroundModules = import.meta.glob(
  '../assets/backgrounds/**/*.{png,jpg,jpeg,webp}',
  {
    eager: true,
    import: 'default',
  }
) as Record<string, string>;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function padLevel(level: number) {
  return String(level).padStart(3, '0');
}

function nearestMilestone(level: number) {
  const milestones = [100, 90, 80, 70, 60, 50, 40, 35, 30, 25, 20, 15, 10, 5, 1];
  return milestones.find((entry) => level >= entry) ?? 1;
}

function scoreMatch(path: string, tokens: string[]) {
  const normalizedPath = normalize(path);
  let score = 0;

  for (const token of tokens) {
    const normalizedToken = normalize(token);
    if (!normalizedToken) continue;

    if (normalizedPath.includes(normalizedToken)) {
      score += normalizedToken.length;
    } else {
      return -1;
    }
  }

  if (normalizedPath.endsWith('.png')) score += 8;
  if (normalizedPath.endsWith('.webp')) score += 6;
  if (normalizedPath.includes('/premium/')) score += 2;

  return score;
}

function findBest(modules: Record<string, string>, tokenSets: string[][]) {
  const entries = Object.entries(modules);
  let bestPath: string | undefined;
  let bestValue: string | undefined;
  let bestScore = -1;

  for (const tokens of tokenSets) {
    for (const [path, value] of entries) {
      const score = scoreMatch(path, tokens);
      if (score > bestScore) {
        bestScore = score;
        bestPath = path;
        bestValue = value;
      }
    }

    if (bestScore >= 0 && bestValue) {
      return bestValue;
    }
  }

  return bestPath ? modules[bestPath] : undefined;
}

export function toRatVariant(gender?: 'male' | 'female' | 'non-binary'): RatVariant {
  if (gender === 'female') return 'female';
  if (gender === 'non-binary') return 'nonbinary';
  return 'male';
}

export function getRatImage(level: number, variant: RatVariant): string | undefined {
  const milestone = nearestMilestone(level);
  const padded = padLevel(milestone);

  return findBest(ratModules, [
    [`rat-lv-${padded}`, variant],
    [`rat-lv-${milestone}`, variant],
    [`lv-${padded}`, variant],
    [`lv-${milestone}`, variant],
    [padded, variant],
    [String(milestone), variant],
  ]);
}

export const ASSET_SHOP_CATALOG_BASE: Omit<AssetShopItem, 'image'>[] = [
  {
    id: 'cap-black-core',
    name: 'Black Core Cap',
    description: 'Clean starter head item.',
    price: 60,
    emoji: '🧢',
    slot: 'head',
    isPremium: false,
    unlockLevel: 1,
  },
  {
    id: 'hoodie-black-core',
    name: 'Black Core Hoodie',
    description: 'Classic gym-rat top.',
    price: 90,
    emoji: '🧥',
    slot: 'top',
    isPremium: false,
    unlockLevel: 1,
  },
  {
    id: 'joggers-core-grey',
    name: 'Core Grey Joggers',
    description: 'Starter lower-body cosmetic.',
    price: 85,
    emoji: '👖',
    slot: 'pants',
    isPremium: false,
    unlockLevel: 1,
  },
  {
    id: 'shoes-street-core',
    name: 'Street Core Shoes',
    description: 'Starter shoe cosmetic.',
    price: 75,
    emoji: '👟',
    slot: 'feet',
    isPremium: false,
    unlockLevel: 1,
  },
  {
    id: 'chain-gold-heavy',
    name: 'Gold Heavy Chain',
    description: 'Extra alpha energy.',
    price: 180,
    emoji: '⛓️',
    slot: 'neck',
    isPremium: false,
    unlockLevel: 30,
  },
  {
    id: 'shades-alpha',
    name: 'Alpha Shades',
    description: 'Clean upper-tier look.',
    price: 160,
    emoji: '🕶️',
    slot: 'eyes',
    isPremium: false,
    unlockLevel: 35,
  },
  {
    id: 'tank-alpha-gold',
    name: 'Alpha Tank Gold',
    description: 'High-visibility alpha tank.',
    price: 260,
    emoji: '🎽',
    slot: 'top',
    isPremium: false,
    unlockLevel: 35,
  },
  {
    id: 'legend-pants-black',
    name: 'Legend Black Pants',
    description: 'Late-game lower-body flex.',
    price: 320,
    emoji: '⚫',
    slot: 'pants',
    isPremium: false,
    unlockLevel: 80,
  },
  {
    id: 'shoes-legend-high',
    name: 'Legend High Shoes',
    description: 'Premium footwear flex.',
    price: 360,
    emoji: '👑',
    slot: 'feet',
    isPremium: true,
    unlockLevel: 70,
  },
  {
    id: 'aura-purple-smoke',
    name: 'Purple Smoke Aura',
    description: 'Premium glow effect.',
    price: 340,
    emoji: '✨',
    slot: 'aura',
    isPremium: true,
    unlockLevel: 50,
  },
  {
    id: 'aura-mythic-flame',
    name: 'Mythic Flame Aura',
    description: 'Late-game mythic aura.',
    price: 520,
    emoji: '🔥',
    slot: 'aura',
    isPremium: true,
    unlockLevel: 90,
  },
];

export function getItemImage(itemId: string): string | undefined {
  return findBest(itemModules, [
    [itemId],
    [itemId.replace(/-/g, ' ')],
    [itemId.split('-')[0], itemId.split('-').slice(1).join('-')],
  ]);
}

export function getItemAsset(itemId?: string) {
  if (!itemId) return undefined;

  const base = ASSET_SHOP_CATALOG_BASE.find((item) => item.id === itemId);
  if (!base) return undefined;

  return {
    ...base,
    image: getItemImage(itemId),
  };
}

export function getItemsForSlot(slot: ItemSlot) {
  return ASSET_SHOP_CATALOG_BASE.filter((item) => item.slot === slot).map((item) => ({
    ...item,
    image: getItemImage(item.id),
  }));
}

export function getBackgroundImage(backgroundId: string): string | undefined {
  return findBest(backgroundModules, [
    [backgroundId],
    [backgroundId.replace(/-/g, ' ')],
    [backgroundId.split('-').slice(0, 2).join('-')],
  ]);
}