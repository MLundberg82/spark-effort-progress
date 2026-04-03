import type { EquippedItems, ItemSlot } from '@/lib/assetTypes';
import { ITEM_ASSETS, getItemById } from '@/lib/itemAssets';

const SHOP_KEY = 'gymrat-shop-purchases';
const EQUIPPED_KEY = 'gymrat-equipped';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  slot: ItemSlot;
  premium?: boolean;
  icon?: string;
  unlockLevel?: number;
}

function getDefaultPrice(unlockLevel?: number, premium?: boolean): number {
  if (premium) return 29;
  if (!unlockLevel || unlockLevel <= 1) return 9;
  if (unlockLevel >= 70) return 29;
  if (unlockLevel >= 30) return 19;
  return 9;
}

function getDefaultDescription(name: string, slot: ItemSlot): string {
  const slotLabelMap: Record<ItemSlot, string> = {
    head: 'head item',
    eyes: 'eye accessory',
    neck: 'neck accessory',
    top: 'top item',
    pants: 'pants item',
    feet: 'footwear item',
    aura: 'aura effect',
  };

  return `${name} (${slotLabelMap[slot]}).`;
}

function getDefaultIcon(slot: ItemSlot): string {
  const iconMap: Record<ItemSlot, string> = {
    head: '🧢',
    eyes: '🕶️',
    neck: '⛓️',
    top: '🧥',
    pants: '👖',
    feet: '👟',
    aura: '✨',
  };

  return iconMap[slot];
}

export const shopItems: ShopItem[] = ITEM_ASSETS.map((item) => ({
  id: item.id,
  name: item.name,
  description: getDefaultDescription(item.name, item.slot),
  price: getDefaultPrice(item.unlockLevel, item.premium),
  slot: item.slot,
  premium: item.premium,
  unlockLevel: item.unlockLevel,
  icon: getDefaultIcon(item.slot),
}));

export function getPurchases(): string[] {
  const data = localStorage.getItem(SHOP_KEY);
  return data ? JSON.parse(data) : [];
}

export function purchaseItem(itemId: string): boolean {
  const item = getItemById(itemId);
  if (!item) return false;

  const purchases = getPurchases();
  if (purchases.includes(itemId)) return false;

  purchases.push(itemId);
  localStorage.setItem(SHOP_KEY, JSON.stringify(purchases));
  return true;
}

export function hasPurchased(itemId: string): boolean {
  return getPurchases().includes(itemId);
}

export function getEquipped(): EquippedItems {
  const data = localStorage.getItem(EQUIPPED_KEY);
  return data ? JSON.parse(data) : {};
}

export function equipItem(itemId: string, slot: ItemSlot): void {
  const item = getItemById(itemId);
  if (!item) return;
  if (item.slot !== slot) return;

  const equipped = getEquipped();
  equipped[slot] = itemId;
  localStorage.setItem(EQUIPPED_KEY, JSON.stringify(equipped));
  window.dispatchEvent(new Event('gymrat-equip-changed'));
}

export function unequipItem(slot: ItemSlot): void {
  const equipped = getEquipped();
  delete equipped[slot];
  localStorage.setItem(EQUIPPED_KEY, JSON.stringify(equipped));
  window.dispatchEvent(new Event('gymrat-equip-changed'));
}

export function isEquipped(itemId: string): boolean {
  const equipped = getEquipped();
  return Object.values(equipped).includes(itemId);
}

export function getEquippedItemId(slot: ItemSlot): string | undefined {
  return getEquipped()[slot];
}

export function getShopItemsForSlot(slot: ItemSlot): ShopItem[] {
  return shopItems.filter((item) => item.slot === slot);
}