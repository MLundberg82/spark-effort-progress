import { checkPremium } from '@/lib/premiumStore';
import type { ItemSlot } from '@/lib/assetTypes';

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  slot: ItemSlot | 'background';
  owned: boolean;
  isPremium: boolean;
  accessible: boolean;
  price: number;
  priceLabel?: string;
  icon?: string;
  emoji?: string;
  unlockLevel?: number;
};

type EquippedState = Partial<Record<ItemSlot | 'background', string>>;
type ShopState = {
  ownedItemIds: string[];
  equipped: EquippedState;
};

const STORAGE_KEY = 'gymrat-shop-state';

const BASE_ITEMS: Omit<ShopItem, 'owned' | 'accessible'>[] = [
  {
    id: 'cap-black-core',
    name: 'Black Core Cap',
    description: 'Clean starter head item.',
    slot: 'head',
    isPremium: false,
    price: 9,
    priceLabel: '9 kr',
    icon: '🧢',
    unlockLevel: 1,
  },
  {
    id: 'hoodie-black-core',
    name: 'Black Core Hoodie',
    description: 'Classic gym-rat top.',
    slot: 'top',
    isPremium: false,
    price: 9,
    priceLabel: '9 kr',
    icon: '🖤',
    unlockLevel: 1,
  },
  {
    id: 'joggers-core-grey',
    name: 'Core Grey Joggers',
    description: 'Starter lower-body cosmetic.',
    slot: 'pants',
    isPremium: false,
    price: 9,
    priceLabel: '9 kr',
    icon: '👖',
    unlockLevel: 1,
  },
  {
    id: 'shoes-street-core',
    name: 'Street Core Shoes',
    description: 'Starter shoe cosmetic.',
    slot: 'feet',
    isPremium: false,
    price: 9,
    priceLabel: '9 kr',
    icon: '👟',
    unlockLevel: 1,
  },
  {
    id: 'chain-gold-heavy',
    name: 'Gold Heavy Chain',
    description: 'Extra alpha energy.',
    slot: 'neck',
    isPremium: false,
    price: 9,
    priceLabel: '9 kr',
    icon: '⛓️',
    unlockLevel: 30,
  },
  {
    id: 'shades-alpha',
    name: 'Alpha Shades',
    description: 'Clean upper-tier look.',
    slot: 'eyes',
    isPremium: false,
    price: 9,
    priceLabel: '9 kr',
    icon: '🕶️',
    unlockLevel: 35,
  },
  {
    id: 'tank-alpha-gold',
    name: 'Alpha Tank Gold',
    description: 'High-visibility alpha tank.',
    slot: 'top',
    isPremium: false,
    price: 9,
    priceLabel: '9 kr',
    icon: '🏆',
    unlockLevel: 35,
  },
  {
    id: 'legend-pants-black',
    name: 'Legend Black Pants',
    description: 'Late-game lower-body flex.',
    slot: 'pants',
    isPremium: false,
    price: 9,
    priceLabel: '9 kr',
    icon: '⚫',
    unlockLevel: 80,
  },
  {
    id: 'shoes-legend-high',
    name: 'Legend High Shoes',
    description: 'Premium footwear flex.',
    slot: 'feet',
    isPremium: true,
    price: 9,
    priceLabel: 'Premium',
    icon: '👑',
    unlockLevel: 70,
  },
  {
    id: 'aura-purple-smoke',
    name: 'Purple Smoke Aura',
    description: 'Premium glow effect.',
    slot: 'aura',
    isPremium: true,
    price: 9,
    priceLabel: 'Premium',
    icon: '✨',
    unlockLevel: 50,
  },
  {
    id: 'aura-mythic-flame',
    name: 'Mythic Flame Aura',
    description: 'Late-game mythic aura.',
    slot: 'aura',
    isPremium: true,
    price: 9,
    priceLabel: 'Premium',
    icon: '🔥',
    unlockLevel: 90,
  },
  {
    id: 'bg-underground-1',
    name: 'Underground Background',
    description: 'Dark starter background.',
    slot: 'background',
    isPremium: false,
    price: 9,
    priceLabel: '9 kr',
    icon: '🌆',
    unlockLevel: 1,
  },
  {
    id: 'bg-alpha-1',
    name: 'Alpha Background',
    description: 'Higher-tier alpha environment.',
    slot: 'background',
    isPremium: true,
    price: 9,
    priceLabel: 'Premium',
    icon: '⚡',
    unlockLevel: 35,
  },
];

const listeners = new Set<() => void>();

function getDefaultState(): ShopState {
  return {
    ownedItemIds: [
      'cap-black-core',
      'hoodie-black-core',
      'joggers-core-grey',
      'shoes-street-core',
      'bg-underground-1',
    ],
    equipped: {
      head: 'cap-black-core',
      top: 'hoodie-black-core',
      pants: 'joggers-core-grey',
      feet: 'shoes-street-core',
      background: 'bg-underground-1',
    },
  };
}

function readState(): ShopState {
  if (typeof window === 'undefined') return getDefaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();

    const parsed = JSON.parse(raw) as Partial<ShopState>;

    return {
      ownedItemIds: Array.isArray(parsed.ownedItemIds)
        ? parsed.ownedItemIds
        : getDefaultState().ownedItemIds,
      equipped:
        parsed.equipped && typeof parsed.equipped === 'object'
          ? parsed.equipped
          : getDefaultState().equipped,
    };
  } catch {
    return getDefaultState();
  }
}

function writeState(next: ShopState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeShop(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getShopItems(): ShopItem[] {
  const state = readState();
  const hasPremium = checkPremium();

  return BASE_ITEMS.map((item) => {
    const owned = state.ownedItemIds.includes(item.id);
    const accessible = item.isPremium ? hasPremium : true;

    return {
      ...item,
      owned,
      accessible,
    };
  });
}

export function getEquippedItemIdForSlot(slot: ItemSlot | 'background') {
  const state = readState();
  return state.equipped[slot];
}

export function ownItem(itemId: string) {
  const state = readState();

  if (state.ownedItemIds.includes(itemId)) {
    return state;
  }

  const next: ShopState = {
    ...state,
    ownedItemIds: [...state.ownedItemIds, itemId],
  };

  writeState(next);
  emit();
  return next;
}

export function equipItem(itemId: string) {
  const item = BASE_ITEMS.find((entry) => entry.id === itemId);
  if (!item) return readState();

  const state = readState();

  if (!state.ownedItemIds.includes(itemId) && !item.isPremium) {
    return state;
  }

  if (item.isPremium && !checkPremium()) {
    return state;
  }

  const next: ShopState = {
    ...state,
    equipped: {
      ...state.equipped,
      [item.slot]: itemId,
    },
  };

  if (!next.ownedItemIds.includes(itemId) && item.isPremium && checkPremium()) {
    next.ownedItemIds = [...next.ownedItemIds, itemId];
  }

  writeState(next);
  emit();
  return next;
}

export function canAccessShopItem(item: Pick<ShopItem, 'isPremium'>) {
  if (!item.isPremium) return true;
  return checkPremium();
}

export function clearEquippedItem(slot: ItemSlot | 'background') {
  const state = readState();
  const next: ShopState = {
    ...state,
    equipped: {
      ...state.equipped,
    },
  };

  delete next.equipped[slot];

  writeState(next);
  emit();
  return next;
}

export function getOwnedItemIds() {
  return readState().ownedItemIds;
}

export function getEquippedState() {
  return readState().equipped;
}