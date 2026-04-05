import type { RatVariant } from '@/lib/assetTypes';

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function tierColor(levelBucket: number) {
  if (levelBucket >= 100) return '#f59e0b';
  if (levelBucket >= 90) return '#eab308';
  if (levelBucket >= 80) return '#f97316';
  if (levelBucket >= 70) return '#ef4444';
  if (levelBucket >= 60) return '#8b5cf6';
  if (levelBucket >= 50) return '#3b82f6';
  if (levelBucket >= 40) return '#06b6d4';
  if (levelBucket >= 35) return '#14b8a6';
  if (levelBucket >= 30) return '#22c55e';
  if (levelBucket >= 25) return '#84cc16';
  if (levelBucket >= 20) return '#a3e635';
  if (levelBucket >= 15) return '#d9f99d';
  if (levelBucket >= 10) return '#86efac';
  if (levelBucket >= 5) return '#bbf7d0';
  return '#d4d4d8';
}

function levelFromRatId(id: string) {
  const match = id.match(/(\d{1,3})/);
  if (!match) return 1;
  return Number(match[1]);
}

function normalizeVariant(variant: RatVariant) {
  if (variant === 'non-binary') return 'NB';
  if (variant === 'female') return 'F';
  return 'M';
}

function makeRatSvg(levelBucket: number, variant: RatVariant) {
  const fill = tierColor(levelBucket);
  const badge = normalizeVariant(variant);

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420">
      <defs>
        <radialGradient id="bg" cx="50%" cy="28%" r="70%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.14)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="420" height="420" rx="56" fill="url(#bg)" />
      <ellipse cx="210" cy="360" rx="118" ry="26" fill="rgba(0,0,0,0.22)" />
      <circle cx="145" cy="110" r="48" fill="${fill}" opacity="0.92" />
      <circle cx="275" cy="110" r="48" fill="${fill}" opacity="0.92" />
      <ellipse cx="210" cy="212" rx="112" ry="128" fill="${fill}" />
      <ellipse cx="210" cy="224" rx="86" ry="100" fill="rgba(255,255,255,0.12)" />
      <circle cx="175" cy="185" r="10" fill="#111827" />
      <circle cx="245" cy="185" r="10" fill="#111827" />
      <ellipse cx="210" cy="205" rx="18" ry="12" fill="#fda4af" />
      <path d="M180 238 Q210 262 240 238" fill="none" stroke="#111827" stroke-width="8" stroke-linecap="round" />
      <text x="210" y="344" font-family="Arial, sans-serif" font-size="42" font-weight="800" text-anchor="middle" fill="white">LVL ${levelBucket}</text>
      <text x="210" y="76" font-family="Arial, sans-serif" font-size="22" font-weight="700" text-anchor="middle" fill="rgba(255,255,255,0.88)">${badge}</text>
    </svg>
  `);
}

function makeBackgroundSvg(label: string, colors: [string, string, string]) {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200">
      <defs>
        <radialGradient id="glow1" cx="30%" cy="20%" r="45%">
          <stop offset="0%" stop-color="${colors[1]}" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="${colors[1]}" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="glow2" cx="75%" cy="80%" r="42%">
          <stop offset="0%" stop-color="${colors[2]}" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="${colors[2]}" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${colors[0]}"/>
          <stop offset="55%" stop-color="${colors[1]}"/>
          <stop offset="100%" stop-color="${colors[2]}"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="1200" fill="url(#bg)" />
      <circle cx="320" cy="240" r="260" fill="url(#glow1)" />
      <circle cx="920" cy="900" r="280" fill="url(#glow2)" />
      <text x="600" y="1080" font-family="Arial, sans-serif" font-size="74" font-weight="800" fill="rgba(255,255,255,0.16)" text-anchor="middle">${label}</text>
    </svg>
  `);
}

function makeOverlaySvg(id: string) {
  const lower = id.toLowerCase();

  if (lower.includes('aura')) {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420">
        <circle cx="210" cy="210" r="164" fill="none" stroke="rgba(52,211,153,0.34)" stroke-width="26"/>
        <circle cx="210" cy="210" r="138" fill="none" stroke="rgba(196,181,253,0.22)" stroke-width="16"/>
      </svg>
    `);
  }

  if (lower.includes('head') || lower.includes('cap') || lower.includes('crown')) {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420">
        <path d="M124 128 L162 82 L210 122 L258 82 L296 128 L286 162 H134 Z" fill="rgba(250,204,21,0.92)" stroke="rgba(255,255,255,0.28)" stroke-width="8"/>
        <circle cx="162" cy="108" r="8" fill="white"/>
        <circle cx="210" cy="102" r="8" fill="white"/>
        <circle cx="258" cy="108" r="8" fill="white"/>
      </svg>
    `);
  }

  if (lower.includes('eyes')) {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420">
        <rect x="140" y="160" width="56" height="28" rx="14" fill="rgba(17,24,39,0.82)" />
        <rect x="224" y="160" width="56" height="28" rx="14" fill="rgba(17,24,39,0.82)" />
        <rect x="194" y="170" width="32" height="8" rx="4" fill="rgba(17,24,39,0.82)" />
      </svg>
    `);
  }

  if (lower.includes('neck')) {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420">
        <rect x="160" y="238" width="100" height="18" rx="9" fill="rgba(250,204,21,0.92)" />
      </svg>
    `);
  }

  if (lower.includes('pants')) {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420">
        <path d="M152 266 H268 L258 344 H218 L210 300 L202 344 H162 Z" fill="rgba(37,99,235,0.88)" />
      </svg>
    `);
  }

  if (lower.includes('feet') || lower.includes('shoe')) {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420">
        <rect x="150" y="334" width="62" height="18" rx="9" fill="rgba(245,245,245,0.94)" />
        <rect x="208" y="334" width="62" height="18" rx="9" fill="rgba(245,245,245,0.94)" />
      </svg>
    `);
  }

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420">
      <path d="M136 198 C154 154 190 138 210 138 C230 138 266 154 284 198 L270 286 H150 Z" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.28)" stroke-width="8"/>
    </svg>
  `);
}

const backgroundMap: Record<string, string> = {
  'bg-underground-1': makeBackgroundSvg('UNDERGROUND', ['#09090b', '#14532d', '#052e16']),
  'bg-grind-1': makeBackgroundSvg('GRIND', ['#111827', '#0f766e', '#022c22']),
  'bg-alpha-1': makeBackgroundSvg('ALPHA', ['#172554', '#2563eb', '#0f172a']),
  'bg-elite-1': makeBackgroundSvg('ELITE', ['#1e1b4b', '#7c3aed', '#111827']),
  'bg-king-1': makeBackgroundSvg('KING', ['#451a03', '#f59e0b', '#111827']),
  'bg-mythic-1': makeBackgroundSvg('MYTHIC', ['#3f0d2e', '#ec4899', '#1f2937']),
};

export function getBackgroundImage(id: string) {
  return backgroundMap[id] ?? makeBackgroundSvg(id.toUpperCase(), ['#111827', '#1f2937', '#0a0a0a']);
}

export function getRatImage(id: string) {
  const levelBucket = levelFromRatId(id);
  const lower = id.toLowerCase();

  let variant: RatVariant = 'male';
  if (lower.includes('female')) variant = 'female';
  if (lower.includes('non-binary') || lower.includes('nonbinary') || lower.includes('nb')) {
    variant = 'non-binary';
  }

  return makeRatSvg(levelBucket, variant);
}

export function getItemImage(id: string) {
  return makeOverlaySvg(id);
}