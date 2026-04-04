export type ShopItem = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  image?: string;
  isPremium: boolean;
  owned: boolean;
};

type ShopState = {
  equippedItemIds: string[];
};

const KEY = 'gymrat-shop-store';

const defaultState: ShopState = {
  equippedItemIds: [],
};

function read(): ShopState {
  if (typeof window === 'undefined') return defaultState;
  const raw = localStorage.getItem(KEY);
  if (!raw) return defaultState;

  try {
    return { ...defaultState, ...JSON.parse(raw) } as ShopState;
  } catch {
    return defaultState;
  }
}

function write(state: ShopState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

//
// 🧠 ITEMS (ENKEL VERSION NU)
//
export function getShopItems(): ShopItem[] {
  return [
    {
      id: 'hoodie-core',
      name: 'Core Hoodie',
      description: 'Clean base cosmetic.',
      emoji: '🧥',
      isPremium: false,
      owned: true,
    },
    {
      id: 'crown-king',
      name: 'King Crown',
      description: 'High-status premium cosmetic.',
      emoji: '👑',
      isPremium: true,
      owned: false,
    },
    {
      id: 'aura-neon',
      name: 'Neon Aura',
      description: 'Dopamine glow energy.',
      emoji: '✨',
      isPremium: true,
      owned: false,
    },
  ];
}

//
// 🎯 EQUIP SYSTEM
//
export function getEquippedItemIds() {
  return read().equippedItemIds;
}

export function equipItem(itemId: string) {
  const state = read();
  write({
    ...state,
    equippedItemIds: [itemId],
  });
  return true;
}

export function clearEquippedItems() {
  write({ equippedItemIds: [] });
}