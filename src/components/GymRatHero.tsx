import { useState, useEffect, useCallback } from 'react';
import { getTotalXP, getLevelFromXP, getRatTier } from '@/lib/gamificationStore';
import { getActiveGlowClass, getEquipped, shopItems } from '@/lib/shopStore';
import { shopItemImages } from '@/lib/shopImages';
import { getItemPreviewImage } from '@/lib/shopPreviewImages';
import GymRatGallery from './GymRatGallery';
import RatShop from './RatShop';
import { getCurrentTierImage } from '@/lib/ratImages';

const tierGlowClasses: Record<string, string> = {
  baby: '',
  rookie: '',
  regular: 'shadow-glow',
  strong: 'shadow-glow',
  buff: 'shadow-glow',
  beast: 'shadow-glow animate-pulse',
  legend: 'shadow-glow animate-pulse',
  mythic: 'shadow-glow animate-pulse',
};

const GymRatHero = () => {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  // Re-read equipped state whenever localStorage changes (e.g. from shop)
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('storage', handler);
    window.addEventListener('gymrat-equip-changed', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('gymrat-equip-changed', handler);
    };
  }, [refresh]);

  const totalXP = getTotalXP();
  const { level, currentXP, xpToNext, progress } = getLevelFromXP(totalXP);
  const ratTier = getRatTier(level);
  const customGlow = getActiveGlowClass();
  const equipped = getEquipped();

  // Find equipped items
  const equippedClothing = equipped.clothing ? shopItems.find(i => i.id === equipped.clothing) : null;
  const equippedAccessory = equipped.accessory ? shopItems.find(i => i.id === equipped.accessory) : null;
  const equippedBackground = equipped.background ? shopItems.find(i => i.id === equipped.background) : null;

  // Check for pre-rendered preview of equipped clothing or accessory
  const clothingPreview = equippedClothing ? getItemPreviewImage(equippedClothing.id, ratTier.tier) : null;
  const accessoryPreview = equippedAccessory ? getItemPreviewImage(equippedAccessory.id, ratTier.tier) : null;

  // Use pre-rendered image if clothing is equipped and has a preview
  const heroImage = clothingPreview || getCurrentTierImage(ratTier.tier);

  const renderOverlayItem = (item: typeof equippedClothing) => {
    if (!item || !item.position) return null;
    const pos = item.position;
    const imageSrc = shopItemImages[item.id];

    if (imageSrc) {
      return (
        <img
          src={imageSrc}
          alt={item.name}
          className="absolute pointer-events-none z-[15]"
          style={{
            top: pos.top,
            left: pos.left,
            right: pos.right,
            bottom: pos.bottom,
            width: pos.fontSize ? `${parseFloat(pos.fontSize) * 2.5}rem` : '4rem',
            height: pos.fontSize ? `${parseFloat(pos.fontSize) * 2.5}rem` : '4rem',
            transform: `translate(-50%, -50%) ${pos.rotate ? `rotate(${pos.rotate})` : ''}`,
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
          }}
        />
      );
    }

    return (
      <span
        className="absolute drop-shadow-lg pointer-events-none z-[15]"
        style={{
          top: pos.top,
          left: pos.left,
          right: pos.right,
          bottom: pos.bottom,
          fontSize: `calc(${pos.fontSize || '1.5rem'} * 1.5)`,
          transform: `translate(-50%, -50%) ${pos.rotate ? `rotate(${pos.rotate})` : ''}`,
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
        }}
      >
        {item.icon}
      </span>
    );
  };

  return (
    <div className="relative flex flex-col items-center -mx-4 -mt-2">
      {/* Large rat image - nearly full width */}
      <div className={`relative w-full flex items-center justify-center rounded-3xl overflow-hidden ${customGlow || tierGlowClasses[ratTier.tier]}`} style={{ minHeight: '55vh' }}>
        {/* Background image or radial glow */}
        {equippedBackground && shopItemImages[equippedBackground.id] ? (
          <img
            src={shopItemImages[equippedBackground.id]}
            alt={equippedBackground.name}
            className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none rounded-3xl"
          />
        ) : equippedBackground ? (
          <div className="absolute inset-0 flex items-center justify-center text-[12rem] opacity-20 select-none pointer-events-none">
            {equippedBackground.icon}
          </div>
        ) : (
          <div 
            className="absolute inset-0 rounded-3xl"
            style={{ 
              background: 'radial-gradient(circle at center 60%, hsl(var(--primary) / 0.12) 0%, transparent 70%)',
            }} 
          />
        )}
        
        <div className="relative z-10" style={{ width: '85%', maxHeight: '50vh' }}>
          <img
            src={heroImage}
            alt={ratTier.label}
            className="w-full h-full object-contain drop-shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all duration-700"
            style={{ maxHeight: '50vh' }}
          />
          {/* Overlay clothing emoji if no pre-rendered preview */}
          {!clothingPreview && equippedClothing && renderOverlayItem(equippedClothing)}
          {/* Overlay accessory (always emoji-based unless we had accessory previews) */}
          {!accessoryPreview && equippedAccessory && renderOverlayItem(equippedAccessory)}
        </div>

        {/* Level badge */}
        <div className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-card/80 backdrop-blur border border-border flex items-center justify-center shadow-elevated">
          <span className="text-sm font-bold text-primary">{level}</span>
        </div>

        {/* Tier label */}
        <div className="absolute top-3 left-3 z-20">
          <span className="text-xs px-3 py-1 rounded-full bg-card/80 backdrop-blur border border-border text-primary font-bold shadow-elevated">
            {ratTier.label}
          </span>
        </div>

        {/* XP badge - just under the rat */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
          <span className="text-xs px-4 py-1.5 rounded-full bg-card/80 backdrop-blur border border-border text-primary font-bold shadow-elevated">
            {totalXP} XP
          </span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="w-full mt-2 px-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-primary whitespace-nowrap">Lv.{level}</span>
          <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden shadow-inset">
            <div className="h-full gradient-primary transition-all duration-700 rounded-full" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{currentXP}/{xpToNext} XP</span>
        </div>
      </div>

      {/* Gallery + Shop links */}
      <div className="flex justify-center gap-2 mt-3">
        <GymRatGallery />
        <RatShop />
      </div>
    </div>
  );
};

export default GymRatHero;
