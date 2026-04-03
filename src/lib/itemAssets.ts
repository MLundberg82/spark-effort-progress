import type { ItemAsset } from './assetTypes';
import { itemImports } from './assetImports';

export const ITEM_ASSETS: ItemAsset[] = [
  {
    id: 'hoodie-black-core',
    name: 'Black Core Hoodie',
    slot: 'top',
    image: itemImports.hoodieBlackCore,
    zIndex: 40,
    unlockLevel: 1,
  },
  {
    id: 'hoodie-purple-grind',
    name: 'Purple Grind Hoodie',
    slot: 'top',
    image: itemImports.hoodiePurpleGrind,
    zIndex: 40,
    unlockLevel: 20,
  },
  {
    id: 'tank-alpha-gold',
    name: 'Alpha Tank Gold',
    slot: 'top',
    image: itemImports.tankAlphaGold,
    zIndex: 40,
    unlockLevel: 35,
  },
  {
    id: 'joggers-core-grey',
    name: 'Core Grey Joggers',
    slot: 'pants',
    image: itemImports.joggersCoreGrey,
    zIndex: 30,
    unlockLevel: 1,
  },
  {
    id: 'joggers-purple-grind',
    name: 'Purple Grind Joggers',
    slot: 'pants',
    image: itemImports.joggersPurpleGrind,
    zIndex: 30,
    unlockLevel: 20,
  },
  {
    id: 'legend-pants-black',
    name: 'Legend Black Pants',
    slot: 'pants',
    image: itemImports.legendPantsBlack,
    zIndex: 30,
    unlockLevel: 80,
  },
  {
    id: 'cap-black-core',
    name: 'Black Core Cap',
    slot: 'head',
    image: itemImports.capBlackCore,
    zIndex: 50,
    unlockLevel: 1,
  },
  {
    id: 'shades-alpha',
    name: 'Alpha Shades',
    slot: 'eyes',
    image: itemImports.shadesAlpha,
    zIndex: 55,
    unlockLevel: 35,
  },
  {
    id: 'chain-gold-heavy',
    name: 'Gold Heavy Chain',
    slot: 'neck',
    image: itemImports.chainGoldHeavy,
    zIndex: 45,
    unlockLevel: 30,
  },
  {
    id: 'chain-legend-diamond',
    name: 'Legend Diamond Chain',
    slot: 'neck',
    image: itemImports.chainLegendDiamond,
    zIndex: 45,
    unlockLevel: 90,
    premium: true,
  },
  {
    id: 'shoes-street-core',
    name: 'Street Core Shoes',
    slot: 'feet',
    image: itemImports.shoesStreetCore,
    zIndex: 20,
    unlockLevel: 1,
  },
  {
    id: 'shoes-legend-high',
    name: 'Legend High Shoes',
    slot: 'feet',
    image: itemImports.shoesLegendHigh,
    zIndex: 20,
    unlockLevel: 70,
    premium: true,
  },
  {
    id: 'aura-purple-smoke',
    name: 'Purple Smoke Aura',
    slot: 'aura',
    image: itemImports.auraPurpleSmoke,
    zIndex: 10,
    unlockLevel: 50,
    premium: true,
  },
  {
    id: 'aura-mythic-flame',
    name: 'Mythic Flame Aura',
    slot: 'aura',
    image: itemImports.auraMythicFlame,
    zIndex: 10,
    unlockLevel: 90,
    premium: true,
  },
];

export function getItemById(id?: string) {
  if (!id) return undefined;
  return ITEM_ASSETS.find((item) => item.id === id);
}

export function getItemsForSlot(slot: ItemAsset['slot']) {
  return ITEM_ASSETS.filter((item) => item.slot === slot);
}