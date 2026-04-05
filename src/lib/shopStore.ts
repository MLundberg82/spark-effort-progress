import { checkPremium } from './premiumStore';
import type { EquippedItems, ItemSlot } from './assetTypes';

export type ShopCategory = 'cosmetic' | 'glow' | 'background' | 'premium';

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  icon: string;
  premiumOnly?: boolean;
  requiresPremiumAccess?: boolean;
  productId?: string;
  priceLabel?: string;
  slot?: ItemSlot | 'background';
};

type EquippedState = EquippedItems & {
  background?: string;
};

const SHOP_ITEMS_KEY = 'gymrat-shop-items-owned';
const SHOP_EQUIPPED_KEY = 'gymrat-shop-equipped-v2';

export const shopItems: ShopItem[] = [
  {
    id: 'cap-black-core',
    name: 'Black Core Cap',
    description: 'Clean starter head item.',
    category: 'cosmetic',
    icon: '🧢',
    slot: 'head',
    productId: 'item_cap_black_core',
    priceLabel: '9 kr',
  },
  {
    id: 'shades-alpha',
    name: 'Alpha Shades',
    description: 'Sharp upper-tier face detail.',
    category: 'cosmetic',
    icon: '🕶️',
    slot: 'eyes',
    productId: 'item_shades_alpha',
    priceLabel: '9 kr',
  },
  {
    id: 'chain-gold-heavy',
    name: 'Gold Heavy Chain',
    description: 'Extra alpha energy around the neck.',
    category: 'cosmetic',
    icon: '⛓️',
    slot: 'neck',
    productId: 'item_chain_gold_heavy',
    priceLabel: '9 kr',
  },
  {
    id: 'hoodie-black-core',
    name: 'Black Core Hoodie',
    description: 'Classic gym-rat top.',
    category: 'cosmetic',
    icon: '🧥',
    slot: 'top',
    productId: 'item_hoodie_black_core',
    priceLabel: '9 kr',
  },
  {
    id: 'tank-alpha-gold',
    name: 'Alpha Tank Gold',
    description: 'Higher-tier premium-looking top.',
    category: 'cosmetic',
    icon: '🎽',
    slot: 'top',
    productId: 'item_tank_alpha_gold',
    priceLabel: '9 kr',
  },
  {
    id: 'joggers-core-grey',
    name: 'Core Grey Joggers',
    description: 'Starter lower-body cosmetic.',
    category: 'cosmetic',
    icon: '👖',
    slot: 'pants',
    productId: 'item_joggers_core_grey',
    priceLabel: '9 kr',
  },
  {
    id: 'legend-pants-black',
    name: 'Legend Black Pants',
    description: 'Late-game lower-body flex.',
    category: 'cosmetic',
    icon: '🖤',
    slot: 'pants',
    productId: 'item_legend_pants_black',
    priceLabel: '9 kr',
  },
  {
    id: 'shoes-street-core',
    name: 'Street Core Shoes',
    description: 'Starter shoe cosmetic.',
    category: 'cosmetic',
    icon: '👟',
    slot: 'feet',
    productId: 'item_shoes_street_core',
    priceLabel: '9 kr',
  },
  {
    id: 'shoes-legend-high',
    name: 'Legend High Shoes',
    description: 'Premium footwear flex.',
    category: 'premium',
    icon: '🔥',
    slot: 'feet',
    premiumOnly: true,
    requiresPremiumAccess: true,
    productId: 'item_shoes_legend_high',
    priceLabel: 'Included in Premium',
  },
  {
    id: 'aura-purple-smoke',
    name: 'Purple Smoke Aura',
    description: 'Premium glow effect around the hero.',
    category: 'glow',
    icon: '✨',
    slot: 'aura',
    premiumOnly: true,
    requiresPremiumAccess: true,
    productId: 'item_aura_purple_smoke',
    priceLabel: 'Included in Premium',
  },
  {
    id: 'aura-mythic-flame',
    name: 'Mythic Flame Aura',
    description: 'Late-game mythic aura.',
    category: 'premium',
    icon: '🔥',
    slot: 'aura',
    premiumOnly: true,
    requiresPremiumAccess: true,
    productId: 'item_aura_mythic_flame',
    priceLabel: 'Included in Premium',
  },
  {
    id: 'bg-underground-1',
    name: 'Underground Scene',
    description: 'Dark grind atmosphere behind your rat.',
    category: 'background',
    icon: '🌒',
    slot: 'background',
    productId: 'item_bg_underground_1',
    priceLabel: '9 kr',
  },
  {
    id: 'bg-grind-1',
    name: 'Grind Scene',
    description: 'Clean progression backdrop.',
    category: 'background',
    icon: '🌆',
    slot: 'background',
    productId: 'item_bg_grind_1',
    priceLabel: '9 kr',
  },
  {
    id: 'bg-king-1',
    name: 'King Backdrop',
    description: 'Elite premium hero background.',
    category: 'premium',
    icon: '👑',
    slot: 'background',
    premiumOnly: true,
    requiresPremiumAccess: true,
    productId: 'item_bg_king_1',
    priceLabel: 'Included in Premium',
  },
];

function emitShopUpdate() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('shop-updated'));
}

export function getOwnedItems(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(SHOP_ITEMS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function ownItem(itemId: string): void {
  if (typeof window === 'undefined') return;

  const current = getOwnedItems();
  if (current.includes(itemId)) return;

  localStorage.setItem(SHOP_ITEMS_KEY, JSON.stringify([...current, itemId]));
  emitShopUpdate();
}

function getDefaultEquippedState(): EquippedState {
  return {};
}

export function getEquippedItems(): EquippedState {
  if (typeof window === 'undefined') return getDefaultEquippedState();

  try {
    const raw = localStorage.getItem(SHOP_EQUIPPED_KEY);
    if (!raw) return getDefaultEquippedState();

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return getDefaultEquippedState();

    return parsed as EquippedState;
  } catch {
    return getDefaultEquippedState();
  }
}

function writeEquippedItems(next: EquippedState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SHOP_EQUIPPED_KEY, JSON.stringify(next));
  emitShopUpdate();
}

export function getEquippedItem(): string | null {
  const equipped = getEquippedItems();

  const first =
    equipped.head ??
    equipped.eyes ??
    equipped.neck ??
    equipped.top ??
    equipped.pants ??
    equipped.feet ??
    equipped.aura ??
    equipped.background ??
    null;

  return first ?? null;
}

export function getEquippedItemIds(): string[] {
  const equipped = getEquippedItems();

  return [
    equipped.head,
    equipped.eyes,
    equipped.neck,
    equipped.top,
    equipped.pants,
    equipped.feet,
    equipped.aura,
    equipped.background,
  ].filter(Boolean) as string[];
}

export function isOwned(itemId: string): boolean {
  return getOwnedItems().includes(itemId);
}

export function canAccessShopItem(item: ShopItem): boolean {
  if (!item.requiresPremiumAccess) return true;
  return checkPremium();
}

export function isItemOwnedOrIncluded(item: ShopItem): boolean {
  if (item.requiresPremiumAccess) {
    return checkPremium();
  }

  return isOwned(item.id);
}

export function equipItem(itemId: string): void {
  const item = shopItems.find((entry) => entry.id === itemId);
  if (!item || !item.slot) return;

  if (!isItemOwnedOrIncluded(item)) return;

  const current = getEquippedItems();
  const next: EquippedState = { ...current };

  if (item.slot === 'background') {
    next.background = item.id;
  } else {
    next[item.slot] = item.id;
  }

  writeEquippedItems(next);
}

export function unequipSlot(slot: ItemSlot | 'background'): void {
  const current = getEquippedItems();
  const next: EquippedState = { ...current };

  if (slot === 'background') {
    delete next.background;
  } else {
    delete next[slot];
  }

  writeEquippedItems(next);
}

export function getEquippedItemIdForSlot(slot: ItemSlot | 'background'): string | undefined {
  const equipped = getEquippedItems();

  if (slot === 'background') {
    return equipped.background;
  }

  return equipped[slot];
}

export function getShopItems() {
  const premium = checkPremium();
  const ownedItems = getOwnedItems();
  const equipped = getEquippedItems();

  return shopItems.map((item) => {
    const premiumIncluded = !!item.requiresPremiumAccess || !!item.premiumOnly;
    const owned = premiumIncluded ? premium : ownedItems.includes(item.id);

    const equippedForSlot =
      item.slot === 'background'
        ? equipped.background === item.id
        : item.slot
        ? equipped[item.slot] === item.id
        : false;

    return {
      ...item,
      isPremium: premiumIncluded,
      accessible: canAccessShopItem(item),
      owned,
      equipped: equippedForSlot,
    };
  });
}

export function subscribeShop(listener: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = () => listener();

  window.addEventListener('shop-updated', handler);
  window.addEventListener('gymrat:premium-updated', handler);

  return () => {
    window.removeEventListener('shop-updated', handler);
    window.removeEventListener('gymrat:premium-updated', handler);
  };
}