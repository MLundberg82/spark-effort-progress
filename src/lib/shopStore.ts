import {
  getBackgroundImage,
  getItemImageForSlot,
} from "@/lib/assetRegistry";
import type {
  EquippedItems,
  RatVariant,
  SlotKey,
} from "@/lib/assetTypes";
import { checkPremium } from "@/lib/premiumStore";

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

const SHOP_KEY = "gymrat-shop-store";

const DEFAULT_EQUIPPED: EquippedItems = {
  head: null,
  eyes: null,
  neck: null,
  top: null,
  pants: null,
  feet: null,
  aura: null,
  background: "bg-underground-1",
};

const STARTER_UNLOCKS = new Set<string>([
  "cap-starter-core",
  "top-core-tee",
  "pants-core-fit",
  "feet-white-runner",
  "bg-underground-1",
]);

const CATALOG_BASE: Array<
  Omit<ShopItem, "owned" | "accessible">
> = [
  {
    id: "cap-starter-core",
    slot: "head",
    name: "Starter Crown",
    description: "Simple headpiece that makes the rat feel leveled from day one.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "👑",
  },
  {
    id: "cap-black-core",
    slot: "head",
    name: "Black Core Cap",
    description: "Minimal headwear for a cleaner premium silhouette.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "🧢",
  },
  {
    id: "cap-gold-core",
    slot: "head",
    name: "Gold Core Cap",
    description: "Slightly louder flex without cluttering the hero.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "✨",
  },
  {
    id: "cap-king-crown",
    slot: "head",
    name: "King Crown",
    description: "High-status crown piece for stronger forms.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "👑",
    isPremium: true,
  },

  {
    id: "eyes-shadow-core",
    slot: "eyes",
    name: "Shadow Eyes",
    description: "Sharper look for a more serious training vibe.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "👀",
  },
  {
    id: "eyes-red-focus",
    slot: "eyes",
    name: "Red Focus",
    description: "A more intense training expression.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "🔥",
  },

  {
    id: "neck-gold-chain",
    slot: "neck",
    name: "Gold Chain",
    description: "Clean progression flex without overdoing it.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "⛓️",
  },
  {
    id: "neck-elite-chain",
    slot: "neck",
    name: "Elite Chain",
    description: "Sharper premium finish around the neck line.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "💎",
    isPremium: true,
  },

  {
    id: "top-core-tee",
    slot: "top",
    name: "Core Tee",
    description: "Minimal top layer for a polished hero look.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "👕",
  },
  {
    id: "top-black-pump",
    slot: "top",
    name: "Black Pump Tee",
    description: "Darker upper piece for a more focused look.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "🖤",
  },
  {
    id: "top-king-inferno",
    slot: "top",
    name: "Inferno Top",
    description: "Aggressive premium upper layer with more presence.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "🔥",
    isPremium: true,
  },

  {
    id: "pants-core-fit",
    slot: "pants",
    name: "Core Legs",
    description: "Athletic lower layer that frames the build better.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "🦵",
  },
  {
    id: "pants-black-taper",
    slot: "pants",
    name: "Black Taper Legs",
    description: "Leaner lower-body look with better contrast.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "⚫",
  },
  {
    id: "pants-elite-compression",
    slot: "pants",
    name: "Elite Compression Legs",
    description: "More athletic lower-body style for advanced forms.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "🏁",
    isPremium: true,
  },

  {
    id: "feet-white-runner",
    slot: "feet",
    name: "White Runner",
    description: "Clean shoes for a lighter premium finish.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "👟",
  },
  {
    id: "feet-black-runner",
    slot: "feet",
    name: "Black Runner",
    description: "Darker footwear to anchor the whole outfit.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "🥾",
  },
  {
    id: "feet-gold-step",
    slot: "feet",
    name: "Gold Step",
    description: "A flashier step for premium identity.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "⭐",
    isPremium: true,
  },

  {
    id: "aura-emerald-core",
    slot: "aura",
    name: "Emerald Aura",
    description: "Soft glow to make the current level feel more alive.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "✨",
  },
  {
    id: "aura-blue-arc",
    slot: "aura",
    name: "Blue Arc Aura",
    description: "Cooler glow layer around the rat silhouette.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "💠",
  },
  {
    id: "aura-inferno-burst",
    slot: "aura",
    name: "Inferno Burst",
    description: "More dramatic premium aura around the full preview.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "🔥",
    isPremium: true,
  },

  {
    id: "bg-underground-1",
    slot: "background",
    name: "Underground",
    description: "Starter background that keeps the hero grounded.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "🏚️",
  },
  {
    id: "bg-grind-1",
    slot: "background",
    name: "Grind Background",
    description: "Sharper background for daily grind energy.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "🏋️",
  },
  {
    id: "bg-alpha-1",
    slot: "background",
    name: "Alpha Background",
    description: "A more elevated room for your stronger form.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "⚡",
  },
  {
    id: "bg-elite-1",
    slot: "background",
    name: "Elite Background",
    description: "Cleaner aura and stronger premium identity.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "💎",
    isPremium: true,
  },
  {
    id: "bg-king-1",
    slot: "background",
    name: "King Background",
    description: "Bold stage for a higher-status rat form.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "👑",
    isPremium: true,
  },
  {
    id: "bg-mythic-1",
    slot: "background",
    name: "Mythic Background",
    description: "Mythic-grade finish for the premium fantasy.",
    price: 9,
    priceLabel: "9 kr",
    emoji: "🌌",
    isPremium: true,
  },
];

function readState(): ShopState {
  if (typeof window === "undefined") {
    return {
      ownedItemIds: Array.from(STARTER_UNLOCKS),
      equipped: DEFAULT_EQUIPPED,
    };
  }

  try {
    const raw = window.localStorage.getItem(SHOP_KEY);

    if (!raw) {
      return {
        ownedItemIds: Array.from(STARTER_UNLOCKS),
        equipped: DEFAULT_EQUIPPED,
      };
    }

    const parsed = JSON.parse(raw) as Partial<ShopState>;

    return {
      ownedItemIds: Array.isArray(parsed.ownedItemIds)
        ? Array.from(
            new Set(
              parsed.ownedItemIds.filter(
                (entry): entry is string => typeof entry === "string",
              ),
            ),
          )
        : Array.from(STARTER_UNLOCKS),
      equipped: {
        ...DEFAULT_EQUIPPED,
        ...(parsed.equipped ?? {}),
      },
    };
  } catch {
    return {
      ownedItemIds: Array.from(STARTER_UNLOCKS),
      equipped: DEFAULT_EQUIPPED,
    };
  }
}

function writeState(state: ShopState) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(SHOP_KEY, JSON.stringify(state));
  window.dispatchEvent(
    new CustomEvent("shop-updated", {
      detail: state,
    }),
  );
}

function getStarterOwned(itemId: string) {
  return STARTER_UNLOCKS.has(itemId);
}

export function subscribeShop(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = () => callback();

  window.addEventListener("shop-updated", handler);
  window.addEventListener("premium-updated", handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener("shop-updated", handler);
    window.removeEventListener("premium-updated", handler);
    window.removeEventListener("storage", handler);
  };
}

export function getEquippedState(): EquippedItems {
  return readState().equipped;
}

export function getEquippedItemIdForSlot(slot: SlotKey) {
  return readState().equipped[slot];
}

export function canAccessShopItem(item: Pick<ShopItem, "isPremium">) {
  if (!item.isPremium) return true;
  return checkPremium().isActive;
}

export function getShopItems(): ShopItem[] {
  const state = readState();
  const premium = checkPremium().isActive;

  return CATALOG_BASE.map((item) => {
    const owned = state.ownedItemIds.includes(item.id) || getStarterOwned(item.id);
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

  if (state.ownedItemIds.includes(itemId)) {
    return state;
  }

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
      [slot]: slot === "background" ? "bg-underground-1" : null,
    },
  };

  writeState(next);
  return next;
}

export function getItemPreviewSrc(
  item: Pick<ShopItem, "id" | "slot">,
  variant?: RatVariant,
): string | null {
  if (item.slot === "background") {
    return getBackgroundImage(item.id);
  }

  return getItemImageForSlot(item.slot, item.id, variant);
}