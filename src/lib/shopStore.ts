export type ShopCategory = 'cosmetic' | 'glow' | 'background' | 'premium';

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  premiumOnly?: boolean;
  category: ShopCategory;
  icon: string;
};

const SHOP_ITEMS_KEY = 'gymrat-shop-items-owned';
const SHOP_EQUIPPED_KEY = 'gymrat-shop-equipped';

export const shopItems: ShopItem[] = [
  {
    id: 'cosmetic-black-tank',
    name: 'Black Tank',
    description: 'Clean starter gym-rat energy.',
    price: 100,
    category: 'cosmetic',
    icon: '🖤',
  },
  {
    id: 'cosmetic-gold-chain',
    name: 'Gold Chain',
    description: 'Extra aura for the main screen.',
    price: 250,
    category: 'cosmetic',
    icon: '🔗',
  },
  {
    id: 'glow-lime-core',
    name: 'Lime Core Glow',
    description: 'Neon progression vibe.',
    price: 300,
    category: 'glow',
    icon: '✨',
  },
  {
    id: 'bg-underground',
    name: 'Underground Scene',
    description: 'Dark grind atmosphere.',
    price: 350,
    category: 'background',
    icon: '🌑',
  },
  {
    id: 'premium-obsidian-aura',
    name: 'Obsidian Aura',
    description: 'Premium-only prestige cosmetic.',
    price: 500,
    category: 'premium',
    premiumOnly: true,
    icon: '👑',
  },
  {
    id: 'premium-inferno-glow',
    name: 'Inferno Glow',
    description: 'Premium flame flex.',
    price: 650,
    category: 'premium',
    premiumOnly: true,
    icon: '🔥',
  },
];

export function getOwnedItems(): string[] {
  try {
    const raw = localStorage.getItem(SHOP_ITEMS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function ownItem(itemId: string): void {
  const current = getOwnedItems();
  if (current.includes(itemId)) return;
  localStorage.setItem(SHOP_ITEMS_KEY, JSON.stringify([...current, itemId]));
}

export function getEquippedItem(): string | null {
  return localStorage.getItem(SHOP_EQUIPPED_KEY);
}

export function equipItem(itemId: string): void {
  localStorage.setItem(SHOP_EQUIPPED_KEY, itemId);
}

export function isOwned(itemId: string): boolean {
  return getOwnedItems().includes(itemId);
}