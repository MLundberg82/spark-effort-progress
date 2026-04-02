import { getTotalXP, getLevelFromXP, getRatTier, getNextMilestone, getStreak } from '@/lib/gamificationStore';
import { getActiveGlowClass } from '@/lib/shopStore';
import { Flame, Star, Zap } from 'lucide-react';
import { getCurrentTierImage } from '@/lib/ratImages';

interface Props {
  compact?: boolean;
}

const tierBorderClasses: Record<string, string> = {
  baby: 'border-border/50',
  rookie: 'border-border/50',
  regular: 'border-primary/30',
  strong: 'border-primary/50',
  buff: 'border-primary/70',
  beast: 'border-accent/50',
  legend: 'border-accent/70',
  mythic: 'border-primary',
};

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

const GymRatAvatar = ({ compact = false }: Props) => {
  const totalXP = getTotalXP();
  const { level, currentXP, xpToNext, progress } = getLevelFromXP(totalXP);
  const ratTier = getRatTier(level);
  const nextMilestone = getNextMilestone(level);
  const streak = getStreak();
  const customGlow = getActiveGlowClass();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full bg-[hsl(220_15%_12%)] flex items-center justify-center border ${tierBorderClasses[ratTier.tier]} ${customGlow || tierGlowClasses[ratTier.tier]}`}>
          <img src={getCurrentTierImage(ratTier.tier)} alt={ratTier.label} className="w-6 h-6 object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-foreground">Lv.{level}</span>
            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full gradient-primary transition-all duration-500" style={{ width: `${progress * 100}%` }} />
            </div>
            <span className="text-[9px] text-muted-foreground">{currentXP}/{xpToNext}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-3d rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-4">
        <div className={`relative w-16 h-16 rounded-2xl bg-[hsl(220_15%_12%)] flex items-center justify-center border-2 ${tierBorderClasses[ratTier.tier]} ${customGlow || tierGlowClasses[ratTier.tier]}`}>
          <img src={getCurrentTierImage(ratTier.tier)} alt={ratTier.label} className="w-12 h-12 object-contain" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary">{level}</span>
          </div>
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-foreground text-sm">{ratTier.label}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold">
              {totalXP} XP
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Level {level}</span>
              <span className="text-muted-foreground">{currentXP}/{xpToNext} XP</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden shadow-inset">
              <div className="h-full gradient-primary transition-all duration-700 rounded-full" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-secondary/50 p-2 text-center">
          <Flame className="w-3.5 h-3.5 text-destructive mx-auto mb-0.5" />
          <p className="text-xs font-bold text-foreground">{streak}</p>
          <p className="text-[9px] text-muted-foreground">Streak</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-2 text-center">
          <Star className="w-3.5 h-3.5 text-primary mx-auto mb-0.5" />
          <p className="text-xs font-bold text-foreground">{totalXP}</p>
          <p className="text-[9px] text-muted-foreground">Total XP</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-2 text-center">
          <Zap className="w-3.5 h-3.5 text-accent mx-auto mb-0.5" />
          <p className="text-xs font-bold text-foreground">{nextMilestone ? `Lv.${nextMilestone.level}` : 'MAX'}</p>
          <p className="text-[9px] text-muted-foreground">Next {nextMilestone?.icon || '🏆'}</p>
        </div>
      </div>
    </div>
  );
};

export default GymRatAvatar;
