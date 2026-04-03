export const BASE_STYLE_PROMPT = `
Create a premium gritty stylized anthropomorphic gym rat character in a dark comic-game art style.
The rat should feel raw, tough, determined, and visually premium.
The setting should feel like a modern fitness game mixed with underground gym culture.
Lighting should be cinematic, with strong rim light, shadows, and subtle neon atmosphere.
The style must match across all generations:
- muscular gym rat
- premium mobile game character art
- dark, raw, cool, dominant vibe
- clean silhouette
- centered full-body composition
- designed for app/game progression system
- no joke style
- no childish cartoon style
- no messy anatomy
- high detail
- bold readable form
- same universe and same rendering style every time
`;

export const VARIANT_RULES = `
Generate three equally premium identity variants:
1. male rat: broader shoulders, masculine silhouette, tough stance
2. female rat: athletic powerful silhouette, fierce and dominant, not cute or soft
3. nonbinary rat: balanced strong silhouette, edgy, premium, confident and dominant
All three must feel equally cool, equally elite, and from the same game universe.
`;

export const COMPOSITION_RULES = `
Transparent background.
Full body centered.
Character standing naturally, facing mostly forward with slight angle.
Leave consistent empty margin around the body.
Same camera angle and same body placement across all levels for asset consistency.
`;

export const LEVEL_PROMPTS: Record<number, string> = {
  1: `
Level 1 Rookie.
Smaller body, beginner physique, slimmer arms and chest, simple gymwear, tough but still early-stage.
Underground starter gym character vibe.
`,
  5: `
Level 5 Starter.
Slightly larger physique, better posture, more confidence, beginner gains visible.
Still early game but clearly improving.
`,
  10: `
Level 10 Trainee.
Noticeably improved physique, broader shoulders, stronger legs, more gym confidence.
`,
  15: `
Level 15 Built.
Visible muscular development, more intimidating expression, better stance, upgraded gymwear.
`,
  20: `
Level 20 Grinder.
Now clearly strong, more aggressive body language, wider torso, stronger arms, more gym status.
`,
  25: `
Level 25 Savage.
Heavier chest, stronger arms, more attitude, more dominant body shape, stronger fashion/game identity.
`,
  30: `
Level 30 Heavy.
Very noticeable mass increase, powerful silhouette, intimidation factor rising.
`,
  35: `
Level 35 Alpha.
Big, broad, elite-looking, confident gym boss vibe beginning.
`,
  40: `
Level 40 Titan.
Bigger, denser, dominant, very strong and impressive physique.
`,
  50: `
Level 50 Beast.
Massive muscular presence, serious power fantasy, dangerous confidence.
`,
  60: `
Level 60 Monster.
Very large, elite, brutal gym presence, almost boss-tier.
`,
  70: `
Level 70 Kingpin.
Huge frame, premium dominant energy, high-status elite vibe.
`,
  80: `
Level 80 Elite.
Extremely advanced physique, top-tier confidence, powerful presence, prestige energy.
`,
  90: `
Level 90 Mythic.
Near-final form, enormous physical presence, cinematic legend aura.
`,
  100: `
Level 100 Legend.
Final form. Most powerful, most iconic, most dominant. Maximum prestige, maximum aura, maximum elite fantasy.
`,
};

export function buildRatPrompt(level: number, identity: 'male' | 'female' | 'nonbinary') {
  return `
${BASE_STYLE_PROMPT}
${VARIANT_RULES}
${COMPOSITION_RULES}

Generate the ${identity} version.
${LEVEL_PROMPTS[level]}

Important:
- transparent background
- no text
- no watermark
- no extra props outside outfit
- no cut off ears, tail, shoes, or hands
- same universe as previous levels
- visual progression must be obvious
`;
}

export const BACKGROUND_PROMPTS: Record<string, string> = {
  'bg-underground-1': `
Dark underground beginner gym, raw concrete walls, modest equipment, moody lighting, empty center stage for character, premium game background, no character, vertical mobile-app composition.
`,
  'bg-underground-2': `
Upgraded underground gym, slightly cleaner, more equipment, more atmosphere, stronger light shaping in center, no character.
`,
  'bg-grind-1': `
Hardcore neon gym interior, purple accents, stronger ambition, premium game environment, center space open for character.
`,
  'bg-grind-2': `
Stylized high-energy training gym with neon purple and magenta, stronger status vibe, clean center area for character.
`,
  'bg-grind-3': `
Dark elite training room with more equipment, premium game look, sharp lighting, center composition for character.
`,
  'bg-alpha-1': `
Gold-accent elite gym scene, dramatic lighting, polished equipment, boss atmosphere, empty center stage.
`,
  'bg-alpha-2': `
Premium strength arena interior, cinematic warm highlights, prestige fitness environment, empty character stage.
`,
  'bg-elite-1': `
Luxury gym environment with elite atmosphere, modern premium equipment, dramatic center spotlight.
`,
  'bg-elite-2': `
Top-tier elite gym scene, rich lighting, dark premium vibe, cinematic empty center.
`,
  'bg-king-1': `
Legendary gym penthouse atmosphere, elite city-adjacent vibe, premium dark environment, center stage open.
`,
  'bg-mythic-1': `
Mythic purple energy gym environment, premium endgame feel, cinematic depth, open center.
`,
  'bg-legend-1': `
Final legendary environment, most premium and cinematic gym scene, dark luxury plus aura energy, open stage for final character.
`,
};