const SHOP_KEY = 'gymrat-shop-purchases';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'clothing' | 'glow' | 'accessory' | 'background';
  icon: string;
  preview?: string;
  premium?: boolean;
  position?: { top?: string; left?: string; right?: string; bottom?: string; fontSize?: string; rotate?: string };
}

export const shopItems: ShopItem[] = [
  // ── CLOTHING (14 free) ──
  { id: 'gold-tank', name: 'Gold Tank Top', description: 'A shiny golden tank top for your rat', price: 9, category: 'clothing', icon: '👕', position: { top: '45%', left: '50%', fontSize: '1.8rem' } },
  { id: 'fire-hoodie', name: 'Fire Hoodie', description: 'A flame-patterned hoodie', price: 9, category: 'clothing', icon: '🔥', position: { top: '40%', left: '50%', fontSize: '1.8rem' } },
  { id: 'camo-shorts', name: 'Camo Shorts', description: 'Military-style gym shorts', price: 9, category: 'clothing', icon: '🩳', position: { top: '65%', left: '50%', fontSize: '1.5rem' } },
  { id: 'black-stringer', name: 'Black Stringer', description: 'Classic bodybuilder stringer', price: 9, category: 'clothing', icon: '🏋️', position: { top: '45%', left: '50%', fontSize: '1.8rem' } },
  { id: 'neon-tracksuit', name: 'Neon Tracksuit', description: 'Glowing neon green tracksuit', price: 9, category: 'clothing', icon: '💚', position: { top: '50%', left: '50%', fontSize: '2rem' } },
  { id: 'samurai-gi', name: 'Samurai Gi', description: 'Ancient warrior training robe', price: 9, category: 'clothing', icon: '⚔️', position: { top: '45%', left: '50%', fontSize: '1.8rem' } },
  { id: 'cyber-suit', name: 'Cyber Suit', description: 'Futuristic training exosuit', price: 9, category: 'clothing', icon: '🤖', position: { top: '45%', left: '50%', fontSize: '1.8rem' } },
  { id: 'dragon-vest', name: 'Dragon Vest', description: 'Vest with dragon embroidery', price: 9, category: 'clothing', icon: '🐉', position: { top: '45%', left: '50%', fontSize: '1.8rem' } },
  { id: 'arctic-parka', name: 'Arctic Parka', description: 'Ice-blue winter training jacket', price: 9, category: 'clothing', icon: '🧊', position: { top: '40%', left: '50%', fontSize: '1.8rem' } },
  { id: 'gladiator-armor', name: 'Gladiator Armor', description: 'Bronze chest plate from the arena', price: 9, category: 'clothing', icon: '🛡️', position: { top: '45%', left: '50%', fontSize: '1.8rem' } },
  { id: 'ninja-suit', name: 'Ninja Suit', description: 'Silent and deadly stealth gear', price: 9, category: 'clothing', icon: '🥷', position: { top: '45%', left: '50%', fontSize: '1.8rem' } },
  { id: 'hawaiian-shirt', name: 'Hawaiian Shirt', description: 'Lifting in paradise vibes', price: 9, category: 'clothing', icon: '🌺', position: { top: '45%', left: '50%', fontSize: '1.8rem' } },
  { id: 'varsity-jacket', name: 'Varsity Jacket', description: 'Old school letterman jacket', price: 9, category: 'clothing', icon: '🎓', position: { top: '40%', left: '50%', fontSize: '1.8rem' } },
  { id: 'space-suit', name: 'Space Suit', description: 'Train in zero gravity style', price: 9, category: 'clothing', icon: '🚀', position: { top: '45%', left: '50%', fontSize: '1.8rem' } },

  // ── ACCESSORIES (14 free) ──
  { id: 'crown-headband', name: 'Crown Headband', description: 'A royal headband for the king', price: 9, category: 'accessory', icon: '👑', position: { top: '8%', left: '50%', fontSize: '1.5rem' } },
  { id: 'chains', name: 'Gold Chains', description: 'Heavy gold chains for that extra drip', price: 9, category: 'accessory', icon: '⛓️', position: { top: '55%', left: '50%', fontSize: '1.3rem' } },
  { id: 'shades', name: 'Neon Shades', description: 'Glowing green sunglasses', price: 9, category: 'accessory', icon: '🕶️', position: { top: '22%', left: '50%', fontSize: '1.4rem' } },
  { id: 'wrist-wraps', name: 'War Wraps', description: 'Battle-worn wrist wraps', price: 9, category: 'accessory', icon: '🥊', position: { top: '60%', left: '28%', fontSize: '1.2rem' } },
  { id: 'diamond-earring', name: 'Diamond Earring', description: 'Ice cold diamond stud', price: 9, category: 'accessory', icon: '💎', position: { top: '18%', left: '72%', fontSize: '1rem' } },
  { id: 'battle-belt', name: 'Battle Belt', description: 'Legendary lifting belt', price: 9, category: 'accessory', icon: '🛡️', position: { top: '58%', left: '50%', fontSize: '1.3rem' } },
  { id: 'katana', name: 'Back Katana', description: 'A katana strapped to the back', price: 9, category: 'accessory', icon: '🗡️', position: { top: '30%', left: '78%', fontSize: '1.5rem', rotate: '-30deg' } },
  { id: 'viking-helm', name: 'Viking Helmet', description: 'Horned helmet of the north', price: 9, category: 'accessory', icon: '⛑️', position: { top: '5%', left: '50%', fontSize: '1.6rem' } },
  { id: 'halo-ring', name: 'Halo Ring', description: 'Floating golden halo above', price: 9, category: 'accessory', icon: '😇', position: { top: '-2%', left: '50%', fontSize: '1.5rem' } },
  { id: 'tattoo-sleeve', name: 'Tattoo Sleeve', description: 'Full tribal arm sleeve', price: 9, category: 'accessory', icon: '🎨', position: { top: '50%', left: '22%', fontSize: '1.2rem' } },
  { id: 'demon-horns', name: 'Demon Horns', description: 'Dark crimson horns of power', price: 9, category: 'accessory', icon: '😈', position: { top: '2%', left: '50%', fontSize: '1.5rem' } },
  { id: 'angel-wings', name: 'Angel Wings', description: 'Ethereal white feathered wings', price: 9, category: 'accessory', icon: '🪽', position: { top: '30%', left: '50%', fontSize: '2.2rem' } },
  { id: 'boom-box', name: 'Boom Box', description: 'Carry the beat to every set', price: 9, category: 'accessory', icon: '📻', position: { top: '55%', left: '75%', fontSize: '1.3rem' } },
  { id: 'pet-phoenix', name: 'Pet Phoenix', description: 'A tiny fire bird companion', price: 9, category: 'accessory', icon: '🦅', position: { top: '15%', left: '78%', fontSize: '1.3rem' } },

  // ── GYM EQUIPMENT (gear accessories) ──
  { id: 'barbell', name: 'Barbell', description: 'Olympic barbell for heavy lifts', price: 9, category: 'accessory', icon: '🏋️', position: { top: '60%', left: '50%', fontSize: '1.8rem' } },
  { id: 'dumbbell', name: 'Dumbbell', description: 'A pair of heavy dumbbells', price: 9, category: 'accessory', icon: '💪', position: { top: '58%', left: '30%', fontSize: '1.5rem' } },
  { id: 'weight-plate', name: 'Weight Plate', description: '45lb iron plate', price: 9, category: 'accessory', icon: '⚫', position: { top: '55%', left: '72%', fontSize: '1.3rem' } },
  { id: 'resistance-band', name: 'Resistance Band', description: 'Heavy duty resistance band', price: 9, category: 'accessory', icon: '🔴', position: { top: '50%', left: '28%', fontSize: '1.2rem' } },
  { id: 'kettlebell', name: 'Kettlebell', description: 'Cast iron kettlebell', price: 9, category: 'accessory', icon: '🔔', position: { top: '62%', left: '68%', fontSize: '1.4rem' } },
  { id: 'jump-rope', name: 'Jump Rope', description: 'Speed rope for conditioning', price: 9, category: 'accessory', icon: '🪢', position: { top: '55%', left: '22%', fontSize: '1.2rem' } },

  // ── GLOW EFFECTS (14 free) ──
  { id: 'glow-green', name: 'Toxic Glow', description: 'Green radioactive glow', price: 9, category: 'glow', icon: '💚', preview: 'shadow-[0_0_30px_hsl(138_90%_66%/0.6)]' },
  { id: 'glow-gold', name: 'Royal Glow', description: 'Golden divine glow', price: 9, category: 'glow', icon: '💛', preview: 'shadow-[0_0_30px_hsl(40_55%_55%/0.6)]' },
  { id: 'glow-fire', name: 'Fire Aura', description: 'Burning red & orange aura', price: 9, category: 'glow', icon: '🔥', preview: 'shadow-[0_0_30px_hsl(15_90%_55%/0.6)]' },
  { id: 'glow-ice', name: 'Ice Aura', description: 'Freezing blue crystal glow', price: 9, category: 'glow', icon: '❄️', preview: 'shadow-[0_0_30px_hsl(200_90%_60%/0.6)]' },
  { id: 'glow-purple', name: 'Mystic Aura', description: 'Purple magical energy', price: 9, category: 'glow', icon: '💜', preview: 'shadow-[0_0_30px_hsl(270_70%_55%/0.6)]' },
  { id: 'glow-rainbow', name: 'Prismatic Aura', description: 'Shifting rainbow energy', price: 9, category: 'glow', icon: '🌈', preview: 'shadow-[0_0_30px_hsl(300_80%_60%/0.6)]' },
  { id: 'glow-shadow', name: 'Shadow Aura', description: 'Dark void energy pulsing', price: 9, category: 'glow', icon: '🖤', preview: 'shadow-[0_0_30px_hsl(0_0%_20%/0.8)]' },
  { id: 'glow-pink', name: 'Sakura Bloom', description: 'Soft pink cherry blossom glow', price: 9, category: 'glow', icon: '🌸', preview: 'shadow-[0_0_30px_hsl(330_80%_65%/0.6)]' },
  { id: 'glow-electric', name: 'Electric Storm', description: 'Crackling electric blue', price: 9, category: 'glow', icon: '⚡', preview: 'shadow-[0_0_30px_hsl(210_100%_55%/0.7)]' },
  { id: 'glow-lava', name: 'Lava Core', description: 'Deep molten lava red', price: 9, category: 'glow', icon: '🌋', preview: 'shadow-[0_0_30px_hsl(5_85%_45%/0.7)]' },
  { id: 'glow-toxic', name: 'Toxic Waste', description: 'Neon yellow-green radiation', price: 9, category: 'glow', icon: '☢️', preview: 'shadow-[0_0_30px_hsl(80_100%_50%/0.6)]' },
  { id: 'glow-frost', name: 'Frostbite', description: 'White icy shimmer effect', price: 9, category: 'glow', icon: '🥶', preview: 'shadow-[0_0_30px_hsl(190_60%_80%/0.7)]' },
  { id: 'glow-blood', name: 'Blood Moon', description: 'Deep crimson lunar glow', price: 9, category: 'glow', icon: '🩸', preview: 'shadow-[0_0_30px_hsl(0_80%_35%/0.7)]' },
  { id: 'glow-cosmic', name: 'Cosmic Dust', description: 'Swirling galaxy particles', price: 9, category: 'glow', icon: '🌌', preview: 'shadow-[0_0_30px_hsl(250_60%_50%/0.6)]' },

  // ═══════════════════════════════════════════════
  // ── PREMIUM ITEMS (30 total: 10 per category) ──
  // ═══════════════════════════════════════════════

  // PREMIUM CLOTHING (10)
  { id: 'p-diamond-suit', name: '💎 Diamond Suit', description: 'Full body diamond-encrusted armor', price: 29, category: 'clothing', icon: '💎', premium: true, position: { top: '45%', left: '50%', fontSize: '2rem' } },
  { id: 'p-void-cloak', name: '🌑 Void Cloak', description: 'A cloak woven from pure darkness', price: 29, category: 'clothing', icon: '🌑', premium: true, position: { top: '35%', left: '50%', fontSize: '2.2rem' } },
  { id: 'p-phoenix-robe', name: '🔥 Phoenix Robe', description: 'Robe that burns with eternal flame', price: 29, category: 'clothing', icon: '🔥', premium: true, position: { top: '40%', left: '50%', fontSize: '2rem' } },
  { id: 'p-lightning-vest', name: '⚡ Thunder Vest', description: 'Crackling with electric energy', price: 29, category: 'clothing', icon: '⚡', premium: true, position: { top: '45%', left: '50%', fontSize: '2rem' } },
  { id: 'p-ice-king-armor', name: '❄️ Ice King Armor', description: 'Frozen crystal plate armor', price: 29, category: 'clothing', icon: '❄️', premium: true, position: { top: '42%', left: '50%', fontSize: '2rem' } },
  { id: 'p-galaxy-hoodie', name: '🌌 Galaxy Hoodie', description: 'Hoodie with swirling galaxies', price: 29, category: 'clothing', icon: '🌌', premium: true, position: { top: '40%', left: '50%', fontSize: '2rem' } },
  { id: 'p-titan-plate', name: '🏛️ Titan Plate', description: 'Olympian god-tier chest plate', price: 29, category: 'clothing', icon: '🏛️', premium: true, position: { top: '45%', left: '50%', fontSize: '2rem' } },
  { id: 'p-shadow-assassin', name: '🥷 Shadow Assassin', description: 'Invisible stealth combat suit', price: 29, category: 'clothing', icon: '🥷', premium: true, position: { top: '45%', left: '50%', fontSize: '2rem' } },
  { id: 'p-inferno-jacket', name: '🧥 Inferno Jacket', description: 'Jacket that trails flame particles', price: 29, category: 'clothing', icon: '🧥', premium: true, position: { top: '40%', left: '50%', fontSize: '2rem' } },
  { id: 'p-celestial-robe', name: '✨ Celestial Robe', description: 'Woven from starlight itself', price: 29, category: 'clothing', icon: '✨', premium: true, position: { top: '40%', left: '50%', fontSize: '2.2rem' } },

  // PREMIUM ACCESSORIES (10)
  { id: 'p-infinity-gauntlet', name: '🤜 Infinity Gauntlet', description: 'Snap your way to gains', price: 29, category: 'accessory', icon: '🤜', premium: true, position: { top: '55%', left: '25%', fontSize: '1.5rem' } },
  { id: 'p-dragon-wings', name: '🐲 Dragon Wings', description: 'Massive dragon-scale wings', price: 29, category: 'accessory', icon: '🐲', premium: true, position: { top: '25%', left: '50%', fontSize: '2.5rem' } },
  { id: 'p-laser-eyes', name: '👁️ Laser Eyes', description: 'Eyes that shoot pure energy beams', price: 29, category: 'accessory', icon: '👁️', premium: true, position: { top: '20%', left: '50%', fontSize: '1.5rem' } },
  { id: 'p-mjolnir', name: '🔨 Mjölnir', description: 'Thor\'s legendary hammer', price: 29, category: 'accessory', icon: '🔨', premium: true, position: { top: '50%', left: '78%', fontSize: '1.5rem' } },
  { id: 'p-third-eye', name: '🔮 Third Eye', description: 'All-seeing mystic forehead gem', price: 29, category: 'accessory', icon: '🔮', premium: true, position: { top: '12%', left: '50%', fontSize: '1.2rem' } },
  { id: 'p-shadow-pet', name: '🐈‍⬛ Shadow Cat', description: 'Dark feline companion of doom', price: 29, category: 'accessory', icon: '🐈‍⬛', premium: true, position: { top: '72%', left: '75%', fontSize: '1.3rem' } },
  { id: 'p-chain-whip', name: '⛓️ Chain Whip', description: 'Golden chain whip weapon', price: 29, category: 'accessory', icon: '⛓️', premium: true, position: { top: '55%', left: '75%', fontSize: '1.3rem' } },
  { id: 'p-floating-orbs', name: '🔵 Floating Orbs', description: 'Energy orbs orbiting your rat', price: 29, category: 'accessory', icon: '🔵', premium: true, position: { top: '30%', left: '80%', fontSize: '1rem' } },
  { id: 'p-skull-mask', name: '💀 Skull Mask', description: 'Terrifying skull face covering', price: 29, category: 'accessory', icon: '💀', premium: true, position: { top: '18%', left: '50%', fontSize: '1.6rem' } },
  { id: 'p-lightning-bolt', name: '⚡ Zeus Bolt', description: 'The original thunderbolt of the gods', price: 29, category: 'accessory', icon: '⚡', premium: true, position: { top: '35%', left: '80%', fontSize: '1.5rem', rotate: '-15deg' } },

  // PREMIUM GLOW (10)
  { id: 'p-glow-inferno', name: 'Inferno Pulse', description: 'Pulsating deep orange hellfire', price: 29, category: 'glow', icon: '🔥', premium: true, preview: 'shadow-[0_0_40px_hsl(20_100%_50%/0.8),0_0_80px_hsl(0_100%_40%/0.4)]' },
  { id: 'p-glow-void', name: 'Void Energy', description: 'Dark matter void distortion', price: 29, category: 'glow', icon: '🕳️', premium: true, preview: 'shadow-[0_0_40px_hsl(280_100%_20%/0.9),0_0_80px_hsl(260_80%_10%/0.5)]' },
  { id: 'p-glow-divine', name: 'Divine Light', description: 'Pure holy radiance', price: 29, category: 'glow', icon: '☀️', premium: true, preview: 'shadow-[0_0_50px_hsl(45_100%_70%/0.8),0_0_100px_hsl(40_100%_50%/0.3)]' },
  { id: 'p-glow-neon-rage', name: 'Neon Rage', description: 'Hot pink neon energy overflow', price: 29, category: 'glow', icon: '💗', premium: true, preview: 'shadow-[0_0_40px_hsl(330_100%_60%/0.8),0_0_80px_hsl(310_100%_50%/0.4)]' },
  { id: 'p-glow-supernova', name: 'Supernova', description: 'Exploding star white-blue core', price: 29, category: 'glow', icon: '💥', premium: true, preview: 'shadow-[0_0_50px_hsl(200_100%_80%/0.9),0_0_100px_hsl(220_100%_60%/0.4)]' },
  { id: 'p-glow-emerald', name: 'Emerald Dream', description: 'Deep emerald enchanted forest', price: 29, category: 'glow', icon: '💚', premium: true, preview: 'shadow-[0_0_40px_hsl(150_90%_40%/0.8),0_0_80px_hsl(140_80%_30%/0.4)]' },
  { id: 'p-glow-plasma', name: 'Plasma Core', description: 'Cyan-white plasma reactor glow', price: 29, category: 'glow', icon: '🔷', premium: true, preview: 'shadow-[0_0_40px_hsl(185_100%_60%/0.8),0_0_80px_hsl(190_100%_50%/0.4)]' },
  { id: 'p-glow-crimson', name: 'Crimson Wrath', description: 'Deep blood-red power aura', price: 29, category: 'glow', icon: '❤️‍🔥', premium: true, preview: 'shadow-[0_0_40px_hsl(0_100%_40%/0.8),0_0_80px_hsl(350_100%_30%/0.5)]' },
  { id: 'p-glow-aurora', name: 'Aurora Borealis', description: 'Northern lights shifting colors', price: 29, category: 'glow', icon: '🌊', premium: true, preview: 'shadow-[0_0_40px_hsl(160_80%_50%/0.7),0_0_80px_hsl(280_60%_50%/0.4)]' },
  { id: 'p-glow-obsidian', name: 'Obsidian Flame', description: 'Black fire with violet edges', price: 29, category: 'glow', icon: '🖤', premium: true, preview: 'shadow-[0_0_40px_hsl(270_60%_30%/0.8),0_0_80px_hsl(0_0%_5%/0.6)]' },

  // ── BACKGROUNDS (gym environments) ──
  { id: 'bg-squat-rack', name: 'Squat Rack', description: 'Heavy-duty power rack setup', price: 9, category: 'background', icon: '🏋️' },
  { id: 'bg-dumbbell-rack', name: 'Dumbbell Rack', description: 'Full wall of dumbbells', price: 9, category: 'background', icon: '💪' },
  { id: 'bg-mirror-wall', name: 'Mirror Wall', description: 'Classic gym mirror setup', price: 9, category: 'background', icon: '🪞' },
  { id: 'bg-boxing-ring', name: 'Boxing Ring', description: 'Fight night atmosphere', price: 9, category: 'background', icon: '🥊' },
  { id: 'bg-rooftop-gym', name: 'Rooftop Gym', description: 'City skyline outdoor gym', price: 9, category: 'background', icon: '🌆' },
  { id: 'bg-dungeon-gym', name: 'Dungeon Gym', description: 'Hardcore basement iron paradise', price: 9, category: 'background', icon: '⛓️' },
  { id: 'bg-beach-gym', name: 'Beach Gym', description: 'Muscle Beach outdoor setup', price: 9, category: 'background', icon: '🏖️' },
  { id: 'bg-neon-gym', name: 'Neon Gym', description: 'Cyberpunk neon-lit training zone', price: 9, category: 'background', icon: '🟣' },

  // Premium backgrounds
  { id: 'p-bg-olympus', name: '⚡ Mount Olympus', description: 'Train with the gods themselves', price: 29, category: 'background', icon: '⚡', premium: true },
  { id: 'p-bg-space-station', name: '🚀 Space Station', description: 'Zero gravity gym in orbit', price: 29, category: 'background', icon: '🚀', premium: true },
  { id: 'p-bg-volcano-forge', name: '🌋 Volcano Forge', description: 'Forged in fire and iron', price: 29, category: 'background', icon: '🌋', premium: true },
  { id: 'p-bg-ice-cavern', name: '❄️ Ice Cavern', description: 'Sub-zero training facility', price: 29, category: 'background', icon: '❄️', premium: true },
  { id: 'p-bg-dragon-lair', name: '🐲 Dragon Lair', description: 'Ancient dragon\'s training chamber', price: 29, category: 'background', icon: '🐲', premium: true },
];

export function getPurchases(): string[] {
  const data = localStorage.getItem(SHOP_KEY);
  return data ? JSON.parse(data) : [];
}

export function purchaseItem(itemId: string): boolean {
  const purchases = getPurchases();
  if (purchases.includes(itemId)) return false;
  purchases.push(itemId);
  localStorage.setItem(SHOP_KEY, JSON.stringify(purchases));
  return true;
}

export function hasPurchased(itemId: string): boolean {
  return getPurchases().includes(itemId);
}

// Active equipment
const EQUIPPED_KEY = 'gymrat-equipped';

export function getEquipped(): { clothing?: string; glow?: string; accessory?: string; background?: string } {
  const data = localStorage.getItem(EQUIPPED_KEY);
  return data ? JSON.parse(data) : {};
}

export function equipItem(itemId: string, category: ShopItem['category']): void {
  const equipped = getEquipped();
  equipped[category] = itemId;
  localStorage.setItem(EQUIPPED_KEY, JSON.stringify(equipped));
  window.dispatchEvent(new Event('gymrat-equip-changed'));
}

export function getActiveGlowClass(): string {
  const equipped = getEquipped();
  if (!equipped.glow) return '';
  const item = shopItems.find(i => i.id === equipped.glow);
  return item?.preview || '';
}
