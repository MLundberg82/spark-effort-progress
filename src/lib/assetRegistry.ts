import type { AssetShopItem, ItemSlot, RatVariant } from './assetTypes';

const ratModules = import.meta.glob('../assets/rats/**/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const itemModules = import.meta.glob('../assets/items/**/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const backgroundModules = import.meta.glob('../assets/backgrounds/**/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function includesAll(haystack: string, needles: string[]) {
  const h = normalize(haystack);
  return needles.every((needle) => h.includes(normalize(needle)));
}

function findFirst(
  modules: Record<string, string>,
  tokenSets: string[][]
): string | undefined {
  const entries = Object.entries(modules);

  for (const tokens of tokenSets) {
    const match = entries.find(([path]) => includesAll(path, tokens));
    if (match) return match[1];
  }

  return undefined;
}

function padLevel(level: number) {
  return String(level).padStart(3, '0');
}

function nearestMilestone(level: number) {
  const milestones = [100, 90, 80, 70, 60, 50, 40, 35, 30, 25, 20, 15, 10, 5, 1];
  return milestones.find((m) => level >= m) ?? 1;
}

export function toRatVariant(
  gender?: 'male' | 'female' | 'non-binary'
): RatVariant {
  if (gender === 'female') return 'female';
  if (gender === 'non-binary') return 'nonbinary';
  return 'male';
}

export function getRatImage(level: number, variant: RatVariant): string | undefined {
  const milestone = nearestMilestone(level);
  const padded = padLevel(milestone);

  return findFirst(ratModules, [
    [`rat-lv-${padded}`, variant],
    [`rat-lv-${milestone}`, variant],
    [`lv-${padded}`, variant],
    [`lv-${milestone}`, variant],
    [padded, variant],
    [String(milestone), variant],
  ]);
}

export const ASSET_SHOP_CATALOG_BASE: Omit<AssetShopItem, 'owned' | 'image'>[] = [
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
    emoji: '📿',
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
    id: 'hoodie-purple-grind',
    name: 'Purple Grind Hoodie',
    description: 'Grind-tier cosmetic top.',
    price: 210,
    emoji: '🟣',
    slot: 'top',
    isPremium: false,
    unlockLevel: 20,
  },
  {
    id: 'tank-alpha-gold',
    name: 'Alpha Tank Gold',
    description: 'High-visibility alpha tank.',
    price: 260,
    emoji: '🥇',
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
    id: 'chain-legend-diamond',
    name: 'Legend Diamond Chain',
    description: 'Prestige premium chain.',
    price: 420,
    emoji: '💎',
    slot: 'neck',
    isPremium: true,
    unlockLevel: 90,
  },
  {
    id: 'shoes-legend-high',
    name: 'Legend High Shoes',
    description: 'Premium footwear flex.',
    price: 360,
    emoji: '🔥',
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
  return findFirst(itemModules, [
    [itemId],
    [itemId.replace(/-/g, ' ')],
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

export function getBackgroundImage(backgroundId: string): string | undefined {
  return findFirst(backgroundModules, [[backgroundId]]);
}

export function getItemsForSlot(slot: ItemSlot) {
  return ASSET_SHOP_CATALOG_BASE.filter((item) => item.slot === slot).map((item) => ({
    ...item,
    image: getItemImage(item.id),
  }));
}