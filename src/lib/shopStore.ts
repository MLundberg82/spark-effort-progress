import { checkPremium } from './premiumStore';

export type ShopCategory = 'cosmetic' | 'glow' | 'background' | 'premium';

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  icon: string;
  premiumOnly?: boolean;
  requiresPremiumAccess?: boolean;
  productId?: string; // RevenueCat / store product
  priceLabel?: string; // fallback label in UI
};

const SHOP_ITEMS_KEY = 'gymrat-shop-items-owned';
const SHOP_EQUIPPED_KEY = 'gymrat-shop-equipped';

export const shopItems: ShopItem[] = [
  {
    id: 'cosmetic-black-tank',
    name: 'Black Tank',
    description: 'Clean starter gym-rat energy.',
    category: 'cosmetic',
    icon: '',
    productId: 'item_black_tank',
    priceLabel: '9 kr',
  },
  {
    id: 'cosmetic-gold-chain',
    name: 'Gold Chain',
    description: 'Extra aura for the main screen.',
    category: 'cosmetic',
    icon: '',
    productId: 'item_gold_chain',
    priceLabel: '9 kr',
  },
  {
    id: 'glow-lime-core',
    name: 'Lime Core Glow',
    description: 'Neon progression vibe.',
    category: 'glow',
    icon: '✨',
    productId: 'item_lime_core_glow',
    priceLabel: '9 kr',
  },
  {
    id: 'bg-underground',
    name: 'Underground Scene',
    description: 'Dark grind atmosphere.',
    category: 'background',
    icon: '',
    productId: 'item_bg_underground',
    priceLabel: '9 kr',
  },
  {
    id: 'premium-obsidian-aura',
    name: 'Obsidian Aura',
    description: 'Premium-only prestige cosmetic.',
    category: 'premium',
    premiumOnly: true,
    requiresPremiumAccess: true,
    icon: '',
    productId: 'item_premium_obsidian_aura',
    priceLabel: '9 kr',
  },
  {
    id: 'premium-inferno-glow',
    name: 'Inferno Glow',
    description: 'Premium flame flex.',
    category: 'premium',
    premiumOnly: true,
    requiresPremiumAccess: true,
    icon: '',
    productId: 'item_premium_inferno_glow',
    priceLabel: '9 kr',
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
  window.dispatchEvent(new CustomEvent('shop-updated'));
}

export function getEquippedItem(): string | null {
  return localStorage.getItem(SHOP_EQUIPPED_KEY);
}

export function equipItem(itemId: string): void {
  localStorage.setItem(SHOP_EQUIPPED_KEY, itemId);
  window.dispatchEvent(new CustomEvent('shop-updated'));
}

export function isOwned(itemId: string): boolean {
  return getOwnedItems().includes(itemId);
}

export function canAccessShopItem(item: ShopItem): boolean {
  if (!item.requiresPremiumAccess) return true;
  return checkPremium();
}