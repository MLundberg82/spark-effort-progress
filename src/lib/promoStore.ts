/**
 * Promo Code System
 * 
 * Local validation with backend-ready structure.
 * Codes are case-insensitive and single-use per device.
 */

import { grantPremium } from './premiumStore';
import { trackEvent } from './analytics';

const REDEEMED_KEY = 'gymrat-redeemed-codes';

export interface PromoCode {
  code: string;
  type: 'premium' | 'xp_boost' | 'shop_item';
  value?: string; // item ID for shop_item, XP amount for xp_boost
  expiresAt?: string; // ISO date
}

// Built-in codes — in production, validate these server-side
const VALID_CODES: PromoCode[] = [
  { code: 'GYMRAT2024', type: 'premium' },
  { code: 'RATPACK', type: 'premium' },
  { code: 'EARLYADOPTER', type: 'premium' },
  { code: 'LEVELUP', type: 'premium' },
];

function getRedeemedCodes(): string[] {
  try {
    const raw = localStorage.getItem(REDEEMED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRedeemedCode(code: string): void {
  const redeemed = getRedeemedCodes();
  redeemed.push(code.toUpperCase());
  localStorage.setItem(REDEEMED_KEY, JSON.stringify(redeemed));
}

export type RedeemResult = 
  | { success: true; message: string; type: PromoCode['type'] }
  | { success: false; error: string };

export function redeemCode(input: string): RedeemResult {
  const code = input.trim().toUpperCase();

  if (!code) {
    return { success: false, error: 'Please enter a code' };
  }

  // Check if already redeemed
  const redeemed = getRedeemedCodes();
  if (redeemed.includes(code)) {
    return { success: false, error: 'This code has already been redeemed' };
  }

  // Find valid code
  const promo = VALID_CODES.find(c => c.code === code);
  if (!promo) {
    return { success: false, error: 'Invalid code' };
  }

  // Check expiry
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return { success: false, error: 'This code has expired' };
  }

  // Apply reward
  switch (promo.type) {
    case 'premium':
      grantPremium('promo_code');
      break;
    // Future: handle xp_boost, shop_item
  }

  saveRedeemedCode(code);
  trackEvent('code_redeemed', { code: promo.code, type: promo.type });

  return {
    success: true,
    message: promo.type === 'premium' ? 'Premium unlocked! 🎉' : 'Code redeemed!',
    type: promo.type,
  };
}
