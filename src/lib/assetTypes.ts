export type RatVariant = "male" | "female" | "non-binary";

export type ItemSlot =
  | "head"
  | "eyes"
  | "neck"
  | "top"
  | "pants"
  | "feet"
  | "aura";

export type CosmeticSlot = ItemSlot;
export type BackgroundSlot = "background";
export type SlotKey = CosmeticSlot | BackgroundSlot;

export type EquippedItems = {
  head: string | null;
  eyes: string | null;
  neck: string | null;
  top: string | null;
  pants: string | null;
  feet: string | null;
  aura: string | null;
  background: string | null;
};

export type AssetRecord = {
  id: string;
  src: string;
};

export type AssetDictionary = Record<string, string>;

export type AssetCategory =
  | "rats"
  | "backgrounds"
  | "head"
  | "eyes"
  | "neck"
  | "top"
  | "pants"
  | "feet"
  | "aura"
  | "body";

export function normalizeRatVariant(value: string | null | undefined): RatVariant {
  if (!value) return "male";

  const normalized = value.toLowerCase().trim();

  if (
    normalized === "female" ||
    normalized === "woman" ||
    normalized === "girl"
  ) {
    return "female";
  }

  if (
    normalized === "non-binary" ||
    normalized === "nonbinary" ||
    normalized === "nb"
  ) {
    return "non-binary";
  }

  return "male";
}