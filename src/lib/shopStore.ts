import type { EquippedItems, SlotKey } from '@/lib/assetTypes';
import { DEFAULT_EQUIPPED_ITEMS, createEmptyEquippedItems } from '@/lib/assetTypes';
import { getBackgroundImage, getItemImageForSlot } from '@/lib/assetRegistry';
import { checkPremium } from '@/lib/premiumStore';
import { getProfile } from '@/lib/profileStore';

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
const SHOP_EVENT = 'shop-updated';

const DEFAULT_EQUIPPED: EquippedItems = {
  ...DEFAULT_EQUIPPED_ITEMS,
  background: 'bg-underground-1',
};

const CATALOG_BASE: Array<Omit<ShopItem, 'owned' | 'accessible'>> = [
  {
    id: 'cap-starter-core',
    slot: 'head',
    name: 'Starter Crown',
    description: 'Simple crown to make the rat feel leveled from day one.',
    price: 9,
    priceLabel: '9 kr',
    emoji: '👑',
  },
  {
    id: 'eyes-shadow-core',
    slot: 'eyes',
    name: 'Shadow Eyes',
    description: 'Sharper eye layer for a more serious training vibe.',
    price: 9,
    priceLabel: '9 kr',
    emoji: '⚡',
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
    description: 'Minimal top layer for a polished hero silhouette.',
    price: 9,
    priceLabel: '9 kr',
    emoji: '🧥',
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
    description: 'Sharper room for daily grind energy.',
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
    emoji: '🟨',
    isPremium: true,
  },
  {
    id: 'bg-king-1',
    slot: 'background',
    name: 'King Background',
    description: 'Bold stage for a higher-status rat form.',
    price: 9,
    priceLabel: '9 kr',
    emoji: '🟪',
    isPremium: true,
  },
  {
    id: 'bg-mythic-1',
    slot: 'background',
    name: 'Mythic Background',
    description: 'Mythic-grade finish for the endgame fantasy.',
    price: 9,
    priceLabel: '9 kr',
    emoji: '🔥',
    isPremium: true,
  },
];

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function sanitizeOwnedItemIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string');
}

function sanitizeEquipped(value: unknown): EquippedItems {
  if (!value || typeof value !== 'object') {
    return DEFAULT_EQUIPPED;
  }

  return {
    ...DEFAULT_EQUIPPED,
    ...createEmptyEquippedItems(value as Partial<EquippedItems>),
    background:
      typeof (value as Partial<EquippedItems>).background === 'string'
        ? (value as Partial<EquippedItems>).background ?? 'bg-underground-1'
        : 'bg-underground-1',
  };
}

function readState(): ShopState {
  if (!isBrowser()) {
    return {
      ownedItemIds: ['cap-starter-core'],
      equipped: DEFAULT_EQUIPPED,
    };
  }

  try {
    const raw = localStorage.getItem(SHOP_KEY);
    if (!raw) {
      return {
        ownedItemIds: ['cap-starter-core'],
        equipped: DEFAULT_EQUIPPED,
      };
    }

    const parsed = JSON.parse(raw) as Partial<ShopState>;

    return {
      ownedItemIds: Array.from(new Set(['cap-starter-core', ...sanitizeOwnedItemIds(parsed.ownedItemIds)])),
      equipped: sanitizeEquipped(parsed.equipped),
    };
  } catch {
    return {
      ownedItemIds: ['cap-starter-core'],
      equipped: DEFAULT_EQUIPPED,
    };
  }
}

function writeState(state: ShopState) {
  if (!isBrowser()) return;

  localStorage.setItem(SHOP_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(SHOP_EVENT, { detail: state }));
}

export function subscribeShop(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handler = () => callback();

  window.addEventListener(SHOP_EVENT, handler);
  window.addEventListener('premium-updated', handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(SHOP_EVENT, handler);
    window.removeEventListener('premium-updated', handler);
    window.removeEventListener('storage', handler);
  };
}

export function getEquippedState(): EquippedItems {
  return readState().equipped;
}

export function getOwnedItemIds(): string[] {
  return readState().ownedItemIds;
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
    const owned = state.ownedItemIds.includes(item.id) || (!item.isPremium && item.id === 'cap-starter-core');
    const accessible = !item.isPremium || premium;

    return {
      ...item,
      owned,
      accessible,
    };
  });
}

export function getShopItemsBySlot(slot: SlotKey): ShopItem[] {
  return getShopItems().filter((item) => item.slot === slot);
}

export function getShopItemById(itemId: string): ShopItem | null {
  return getShopItems().find((item) => item.id === itemId) ?? null;
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
  const item = getShopItemById(itemId);
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

export function isEquipped(itemId: string): boolean {
  const equipped = getEquippedState();
  return Object.values(equipped).includes(itemId);
}

export function getItemPreviewSrc(item: Pick<ShopItem, 'id' | 'slot'>): string | null {
  const profile = getProfile();
  const variant = profile.gender;

  if (item.slot === 'background') {
    return getBackgroundImage(item.id);
  }

  if (
    item.slot === 'head' ||
    item.slot === 'eyes' ||
    item.slot === 'neck' ||
    item.slot === 'top' ||
    item.slot === 'pants' ||
    item.slot === 'feet' ||
    item.slot === 'aura'
  ) {
    return getItemImageForSlot(item.slot, item.id, variant);
  }

  return null;
}

export function resetShopState() {
  const next: ShopState = {
    ownedItemIds: ['cap-starter-core'],
    equipped: DEFAULT_EQUIPPED,
  };

  writeState(next);
  return next;
}