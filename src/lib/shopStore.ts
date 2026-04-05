import type { EquippedItems, SlotKey } from '@/lib/assetTypes';
import { checkPremium } from '@/lib/premiumStore';

export type ShopItem = {
  id: string;
  slot: SlotKey;
  name: string;
  description: string;
  price: number;
  priceLabel: string;
  emoji?: string;
  icon?: string;
  isPremium?: boolean;
  owned: boolean;
  accessible: boolean;
};

type ShopState = {
  ownedItemIds: string[];
  equipped: EquippedItems;
};

const SHOP_KEY = 'gymrat-shop-store';

const DEFAULT_EQUIPPED: EquippedItems = {
  head: null,
  eyes: null,
  neck: null,
  top: null,
  pants: null,
  feet: null,
  aura: null,
  background: 'bg-underground-1',
};

const CATALOG_BASE: Omit<ShopItem, 'owned' | 'accessible'>[] = [
  {
    id: 'cap-starter-core',
    slot: 'head',
    name: 'Starter Crown',
    description: 'Simple headpiece that makes the rat feel leveled from day one.',
    price: 9,
    priceLabel: '9 kr',
    emoji: '👑',
  },
  {
    id: 'eyes-shadow-core',
    slot: 'eyes',
    name: 'Shadow Eyes',
    description: 'A sharper look for a more serious training vibe.',
    price: 9,
    priceLabel: '9 kr',
    emoji: '🕶️',
  },
  {
    id: 'neck-gold-chain',
    slot: 'neck',
    name: 'Gold Chain',
    description: 'Clean progression flex without overdoing it.',
    price: 9,
    priceLabel: '9 kr',
    emoji: '⛓️',
  },
  {
    id: 'top-core-tee',
    slot: 'top',
    name: 'Core Tee',
    description: 'Minimal top layer for a polished hero look.',
    price: 9,
    priceLabel: '9 kr',
    emoji: '👕',
  },
  {
    id: 'pants-core-fit',
    slot: 'pants',
    name: 'Core Fit',
    description: 'Athletic lower layer that frames the build better.',
    price: 9,
    priceLabel: '9 kr',
    emoji: '👖',
  },
  {
    id: 'feet-white-runner',
    slot: 'feet',
    name: 'White Runner',
    description: 'Clean shoes for a lighter premium finish.',
    price: 9,
    priceLabel: '9 kr',
    emoji: '👟',
  },
  {
    id: 'aura-emerald-core',
    slot: 'aura',
    name: 'Emerald Aura',
    description: 'Soft glow to make the current form feel more alive.',
    price: 9,
    priceLabel: '9 kr',
    emoji: '✨',
  },
  {
    id: 'bg-grind-1',
    slot: 'background',
    name: 'Grind Background',
    description: 'Sharper background for daily grind energy.',
    price: 9,
    priceLabel: '9 kr',
    emoji: '🟩',
  },
  {
    id: 'bg-alpha-1',
    slot: 'background',
    name: 'Alpha Background',
    description: 'A more elevated room for your stronger form.',
    price: 9,
    priceLabel: '9 kr',
    emoji: '🟦',
    isPremium: true,
  },
  {
    id: 'bg-elite-1',
    slot: 'background',
    name: 'Elite Background',
    description: 'Cleaner aura and stronger premium identity.',
    price: 9,
    priceLabel: '9 kr',
    emoji: '🟪',
    isPremium: true,
  },
  {
    id: 'bg-king-1',
    slot: 'background',
    name: 'King Background',
    description: 'Bold stage for a higher-status rat form.',
    price: 9,
    priceLabel: '9 kr',
    emoji: '🟨',
    isPremium: true,
  },
  {
    id: 'bg-mythic-1',
    slot: 'background',
    name: 'Mythic Background',
    description: 'Mythic-grade finish for the premium fantasy.',
    price: 9,
    priceLabel: '9 kr',
    emoji: '🌈',
    isPremium: true,
  },
];

function readState(): ShopState {
  if (typeof window === 'undefined') {
    return {
      ownedItemIds: [],
      equipped: DEFAULT_EQUIPPED,
    };
  }

  try {
    const raw = localStorage.getItem(SHOP_KEY);
    if (!raw) {
      return {
        ownedItemIds: [],
        equipped: DEFAULT_EQUIPPED,
      };
    }

    const parsed = JSON.parse(raw) as Partial<ShopState>;

    return {
      ownedItemIds: Array.isArray(parsed.ownedItemIds)
        ? parsed.ownedItemIds.filter((entry): entry is string => typeof entry === 'string')
        : [],
      equipped: {
        ...DEFAULT_EQUIPPED,
        ...(parsed.equipped ?? {}),
      },
    };
  } catch {
    return {
      ownedItemIds: [],
      equipped: DEFAULT_EQUIPPED,
    };
  }
}

function writeState(state: ShopState) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(SHOP_KEY, JSON.stringify(state));
  window.dispatchEvent(
    new CustomEvent('shop-updated', {
      detail: state,
    })
  );
}

export function subscribeShop(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handler = () => callback();

  window.addEventListener('shop-updated', handler);
  window.addEventListener('premium-updated', handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener('shop-updated', handler);
    window.removeEventListener('premium-updated', handler);
    window.removeEventListener('storage', handler);
  };
}

export function getEquippedState(): EquippedItems {
  return readState().equipped;
}

export function getEquippedItemIdForSlot(slot: SlotKey) {
  return readState().equipped[slot];
}

export function canAccessShopItem(item: Pick<ShopItem, 'isPremium'>) {
  if (!item.isPremium) return true;
  return checkPremium().isActive;
}

export function getShopItems(): ShopItem[] {
  const state = readState();
  const premium = checkPremium().isActive;

  return CATALOG_BASE.map((item) => {
    const owned =
      state.ownedItemIds.includes(item.id) ||
      (!item.isPremium && item.id === 'cap-starter-core');

    const accessible = !item.isPremium || premium;

    return {
      ...item,
      owned,
      accessible,
    };
  });
}

export function ownItem(itemId: string) {
  const state = readState();

  if (state.ownedItemIds.includes(itemId)) return state;

  const next: ShopState = {
    ...state,
    ownedItemIds: [...state.ownedItemIds, itemId],
  };

  writeState(next);
  return next;
}

export function equipItem(itemId: string) {
  const item = getShopItems().find((entry) => entry.id === itemId);
  if (!item) return readState();

  if (!canAccessShopItem(item)) return readState();

  const state = readState();

  const next: ShopState = {
    ...state,
    ownedItemIds: state.ownedItemIds.includes(itemId)
      ? state.ownedItemIds
      : [...state.ownedItemIds, itemId],
    equipped: {
      ...state.equipped,
      [item.slot]: itemId,
    },
  };

  writeState(next);
  return next;
}

export function unequipItem(slot: SlotKey) {
  const state = readState();

  const next: ShopState = {
    ...state,
    equipped: {
      ...state.equipped,
      [slot]: slot === 'background' ? 'bg-underground-1' : null,
    },
  };

  writeState(next);
  return next;
}