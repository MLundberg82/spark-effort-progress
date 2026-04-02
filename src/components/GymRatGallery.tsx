import { useState } from 'react';
import { getRatTier, getLevelFromXP, getTotalXP, RatTier } from '@/lib/gamificationStore';
import { Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getTierImagesForGender } from '@/lib/ratImages';

// Re-export for backward compat - now gender-aware
export function getTierImages(): Record<RatTier, string> {
  return getTierImagesForGender();
}

// Keep legacy export name but make it a getter
export const tierImages = new Proxy({} as Record<RatTier, string>, {
  get(_target, prop: string) {
    return getTierImagesForGender()[prop as RatTier];
  },
});

const tiers: { tier: RatTier; label: string; minLevel: number; description: string }[] = [
  { tier: 'baby', label: 'Baby Rat', minLevel: 1, description: 'Just getting started. Every legend begins here.' },
  { tier: 'rookie', label: 'Rookie Rat', minLevel: 5, description: 'Starting to find your rhythm.' },
  { tier: 'regular', label: 'Gym Rat', minLevel: 15, description: 'A true gym regular.' },
  { tier: 'strong', label: 'Strong Rat', minLevel: 25, description: 'Serious strength gains.' },
  { tier: 'buff', label: 'Buff Rat', minLevel: 40, description: 'Absolutely shredded.' },
  { tier: 'beast', label: 'Beast Rat', minLevel: 55, description: 'The weights fear you.' },
  { tier: 'legend', label: 'Legend Rat', minLevel: 70, description: 'Your name echoes through gym halls.' },
  { tier: 'mythic', label: 'Mythic Rat', minLevel: 90, description: 'A living myth. GymRat God.' },
];

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

const GymRatGallery = () => {
  const [open, setOpen] = useState(false);

  const totalXP = getTotalXP();
  const { level } = getLevelFromXP(totalXP);
  const currentTier = getRatTier(level);

  const isUnlocked = (minLevel: number) => level >= minLevel;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary/60 text-secondary-foreground hover:bg-secondary transition-all shadow-elevated"
      >
        <Sparkles className="w-3 h-3 text-accent" />
        Level Gallery
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground flex items-center gap-2">
              <span className="text-2xl">🐀</span> Level Gallery
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            {tiers.map((t) => {
              const unlocked = isUnlocked(t.minLevel);
              const isCurrent = currentTier.tier === t.tier;

              return (
                <div
                  key={t.tier}
                  className={`relative rounded-2xl p-4 flex flex-col items-center gap-2 transition-all ${
                    unlocked ? 'card-3d' : 'bg-secondary/30 border border-border/30'
                  } ${isCurrent ? 'glow-border ring-1 ring-primary/30' : ''}`}
                >
                  {isCurrent && (
                    <span className="absolute top-2 right-2 text-[8px] px-1.5 py-0.5 rounded-full gradient-primary text-primary-foreground font-bold uppercase">
                      You
                    </span>
                  )}

                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center bg-secondary/40 ${
                    unlocked ? tierGlowClasses[t.tier] : ''
                  }`}>
                    <img
                      src={tierImages[t.tier]}
                      alt={t.label}
                      className={`w-18 h-18 object-contain ${
                        unlocked ? 'drop-shadow-[0_0_12px_hsl(var(--primary)/0.4)]' : 'grayscale opacity-50'
                      }`}
                    />
                  </div>

                  <div className="text-center">
                    <p className={`text-xs font-bold ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {t.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {unlocked ? '✓ Unlocked' : `Lv. ${t.minLevel}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GymRatGallery;
