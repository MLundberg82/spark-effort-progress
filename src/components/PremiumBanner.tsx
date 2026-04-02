import { isPremium } from '@/lib/gamificationStore';
import { Crown, Lock, Sparkles, BarChart3, Dumbbell, Zap, Palette, Brain } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PremiumBadgeProps {
  feature?: string;
  children?: React.ReactNode;
}

export const PremiumBadge = ({ feature, children }: PremiumBadgeProps) => {
  const [open, setOpen] = useState(false);

  if (isPremium()) return <>{children}</>;

  return (
    <>
      <div className="relative" onClick={() => setOpen(true)}>
        <div className="opacity-50 pointer-events-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl cursor-pointer">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full gradient-primary shadow-button">
            <Crown className="w-3.5 h-3.5 text-primary-foreground" />
            <span className="text-xs font-bold text-primary-foreground">PREMIUM</span>
          </div>
        </div>
      </div>
      <PremiumModal open={open} onClose={() => setOpen(false)} feature={feature} />
    </>
  );
};

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
}

const premiumFeatures = [
  { icon: Dumbbell, title: 'Custom Workouts', desc: 'Create your own workouts & advanced splits' },
  { icon: Zap, title: 'XP Boosts', desc: 'Extra XP & PB multipliers for faster leveling' },
  { icon: Sparkles, title: 'Cosmetics', desc: 'Exclusive skins, outfits & gear for your GymRat' },
  { icon: BarChart3, title: 'Advanced Stats', desc: 'Detailed graphs, history analysis & insights' },
];

export const PremiumModal = ({ open, onClose, feature }: PremiumModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-center">
            <span className="text-gradient text-2xl">GymRat Premium</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-center">
            <Crown className="w-12 h-12 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {feature ? `Unlock ${feature} and more with Premium` : 'Take your training to the next level'}
            </p>
          </div>

          <div className="space-y-2">
            {premiumFeatures.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30">
                <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Button className="w-full gradient-primary text-primary-foreground font-bold btn-3d text-base py-6">
            <Crown className="w-5 h-5 mr-2" />
            Upgrade to Premium
          </Button>
          <p className="text-center text-[10px] text-muted-foreground">Coming soon • No charges yet</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/** Premium teaser: shows faded preview of premium content with CTA */
export const PremiumTeaser = ({ children, label }: { children: React.ReactNode; label?: string }) => {
  const [open, setOpen] = useState(false);

  if (isPremium()) return <>{children}</>;

  return (
    <>
      <div className="relative">
        <div className="premium-fade-mask pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute bottom-0 inset-x-0 flex flex-col items-center gap-2 pb-3 pt-8 bg-gradient-to-t from-background via-background/80 to-transparent">
          <button
            onClick={() => setOpen(true)}
            className="px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground font-display font-bold text-sm btn-3d shadow-button flex items-center gap-2"
          >
            <Crown className="w-4 h-4" />
            {label || 'Unlock with Premium'}
          </button>
        </div>
      </div>
      <PremiumModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

/** Inline premium features preview for home screen */
export const PremiumFeaturesPreview = () => {
  const [open, setOpen] = useState(false);

  if (isPremium()) return null;

  const teaserFeatures = [
    { icon: Zap, label: 'Double XP', desc: 'Level up twice as fast' },
    { icon: Brain, label: 'Smart Progression', desc: 'AI-powered workout plans' },
    { icon: Palette, label: 'Exclusive Skins', desc: 'Rare GymRat cosmetics' },
    { icon: BarChart3, label: 'Advanced Stats', desc: 'Deep performance insights' },
  ];

  return (
    <>
      <div className="relative card-3d rounded-2xl overflow-hidden">
        {/* Faded feature cards */}
        <div className="premium-fade-mask p-4 space-y-2">
          {teaserFeatures.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/30">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground">{desc}</p>
              </div>
              <Lock className="w-3.5 h-3.5 text-muted-foreground/50 ml-auto" />
            </div>
          ))}
        </div>

        {/* Overlay CTA */}
        <div className="absolute bottom-0 inset-x-0 flex flex-col items-center gap-2 pb-4 pt-12 bg-gradient-to-t from-card via-card/90 to-transparent">
          <p className="text-xs text-muted-foreground mb-1">You're putting in the work. Make it count.</p>
          <button
            onClick={() => setOpen(true)}
            className="px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-display font-bold text-sm btn-3d shadow-button flex items-center gap-2"
          >
            <Crown className="w-4 h-4" />
            Unlock Premium
          </button>
          <p className="text-[10px] text-muted-foreground">7-day free trial • Cancel anytime</p>
        </div>
      </div>
      <PremiumModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

const PremiumBanner = () => {
  const [open, setOpen] = useState(false);

  if (isPremium()) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full card-3d rounded-2xl p-4 text-left hover:shadow-glow transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-button group-hover:scale-110 transition-transform">
            <Crown className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-foreground text-sm">Go Premium</h3>
            <p className="text-[10px] text-muted-foreground">Unlock XP boosts, cosmetics & advanced stats</p>
          </div>
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
      </button>
      <PremiumModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default PremiumBanner;
