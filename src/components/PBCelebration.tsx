import { useEffect, useState, useMemo } from 'react';
import { exercises } from '@/lib/exerciseData';
import { XPBreakdown, isPremium } from '@/lib/gamificationStore';
import { useT } from '@/lib/i18n';

interface Props {
  xpBreakdown: XPBreakdown;
  onClose: () => void;
  onBuyPremium?: () => void;
}

const PBCelebration = ({ xpBreakdown, onClose, onBuyPremium }: Props) => {
  const t = useT();
  const [phase, setPhase] = useState<'flash' | 'explode' | 'fireworks' | 'details'>('flash');
  const hasPB = xpBreakdown.newPBs.length > 0;
  const premium = isPremium();

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('explode'), 200),
      setTimeout(() => setPhase('fireworks'), hasPB ? 800 : 500),
      setTimeout(() => setPhase('details'), hasPB ? 2500 : 1200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [hasPB]);

  useEffect(() => {
    if (phase === 'flash' || phase === 'explode') {
      const el = document.documentElement;
      el.style.animation = 'screen-shake 0.5s ease-out';
      const timer = setTimeout(() => { el.style.animation = ''; }, 500);
      return () => { clearTimeout(timer); el.style.animation = ''; };
    }
  }, [phase]);

  // Firework particles - multi-color explosions
  const fireworks = useMemo(() => {
    const bursts = hasPB ? 5 : 2;
    return Array.from({ length: bursts }, (_, burstIdx) => ({
      x: 15 + (burstIdx * 70 / bursts) + Math.random() * 15,
      y: 15 + Math.random() * 40,
      delay: burstIdx * 400,
      particles: Array.from({ length: 20 }, (_, i) => ({
        angle: (i / 20) * 360 + Math.random() * 18,
        distance: 80 + Math.random() * 180,
        size: 3 + Math.random() * 5,
        hue: [0, 30, 50, 138, 200, 280, 320][Math.floor(Math.random() * 7)],
        duration: 800 + Math.random() * 600,
      })),
    }));
  }, [hasPB]);

  // Fire/ember particles
  const embers = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    x: 5 + Math.random() * 90,
    size: 2 + Math.random() * 6,
    hue: [0, 15, 30, 40, 50][i % 5],
    delay: i * 80,
    duration: 1500 + Math.random() * 2000,
  })), []);

  // Explosion rings
  const explosionColors = ['hsl(0 90% 55%)', 'hsl(30 100% 55%)', 'hsl(50 100% 60%)', 'hsl(138 90% 66%)', 'hsl(280 80% 60%)'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* White flash */}
      {phase === 'flash' && (
        <div className="absolute inset-0 bg-white z-50 animate-[flash-hard_0.3s_ease-out_forwards]" />
      )}

      {/* Background */}
      <div className={`absolute inset-0 transition-all duration-700 ${
        phase === 'explode' ? 'bg-orange-900/40 backdrop-blur-sm' : 'bg-background/95 backdrop-blur-lg'
      }`} />

      {/* Explosion shockwaves - multi-color */}
      {(phase === 'explode') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {explosionColors.map((color, i) => (
            <div key={`ring-${i}`} className="absolute rounded-full animate-[shockwave-expand_1s_ease-out_forwards]"
              style={{ width: 20, height: 20, animationDelay: `${i * 120}ms`,
                border: `3px solid ${color}`, opacity: 0.7 }} />
          ))}
          <div className="absolute w-40 h-40 rounded-full bg-orange-500/50 animate-[ping_1s_ease-out_forwards]" />
          <div className="absolute w-24 h-24 rounded-full bg-red-500/40 animate-[ping_0.8s_ease-out_forwards]" />
        </div>
      )}

      {/* Firework bursts */}
      {(phase === 'fireworks' || phase === 'details') && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {fireworks.map((burst, bi) => (
            <div key={`burst-${bi}`} className="absolute" style={{ left: `${burst.x}%`, top: `${burst.y}%` }}>
              {burst.particles.map((p, pi) => (
                <div key={`fp-${bi}-${pi}`} className="absolute rounded-full animate-pb-particle"
                  style={{
                    width: p.size, height: p.size,
                    backgroundColor: `hsl(${p.hue} 100% 60%)`,
                    boxShadow: `0 0 ${p.size * 3}px hsl(${p.hue} 100% 60%)`,
                    animationDelay: `${burst.delay + pi * 15}ms`,
                    animationDuration: `${p.duration}ms`,
                    '--angle': `${p.angle}deg`,
                    '--distance': `${p.distance}px`,
                  } as React.CSSProperties} />
              ))}
              {/* Firework flash center */}
              <div className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full animate-[flash-hard_0.5s_ease-out_forwards]"
                style={{
                  background: `radial-gradient(circle, hsl(50 100% 80%), hsl(30 100% 50%), transparent)`,
                  animationDelay: `${burst.delay}ms`,
                }} />
            </div>
          ))}
        </div>
      )}

      {/* Fire embers rising */}
      {hasPB && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {embers.map((e, i) => (
            <div key={`ember-${i}`} className="absolute rounded-full animate-pb-ember"
              style={{
                width: e.size, height: e.size,
                backgroundColor: `hsl(${e.hue} 100% ${50 + (e.hue > 40 ? 15 : 0)}%)`,
                boxShadow: `0 0 ${e.size * 2}px hsl(${e.hue} 100% 55%)`,
                left: `${e.x}%`, bottom: '-5%',
                animationDelay: `${e.delay}ms`,
                animationDuration: `${e.duration}ms`,
              }} />
          ))}
        </div>
      )}

      {/* Light rays - multi-color */}
      {hasPB && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={`ray-${i}`} className="absolute left-1/2 top-1/2 origin-left animate-pb-ray"
              style={{
                width: '150vw', height: 2,
                background: `linear-gradient(90deg, hsl(${[0, 30, 50, 138, 200, 280, 320, 40][i % 8]} 90% 60% / 0.5), transparent)`,
                transform: `rotate(${i * 22.5}deg)`,
                animationDelay: `${i * 40}ms`,
              }} />
          ))}
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 text-center space-y-4 transition-all duration-700 ${
        phase === 'flash' ? 'scale-[5] opacity-0'
        : phase === 'explode' ? 'scale-[3] opacity-0'
        : phase === 'fireworks' ? 'scale-110 opacity-80'
        : 'scale-100 opacity-100'
      }`}>
        {hasPB && (
          <>
            <div className="text-8xl animate-bounce drop-shadow-[0_0_40px_hsl(30_100%_55%)]" style={{ animationDuration: '0.8s' }}>🏆</div>
            <h1 className="font-display text-6xl font-black animate-pulse drop-shadow-[0_0_30px_hsl(30_100%_55%/0.6)]"
              style={{
                background: 'linear-gradient(135deg, hsl(50 100% 60%), hsl(30 100% 55%), hsl(0 90% 55%), hsl(280 80% 60%))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                textShadow: 'none',
              }}>
              NEW PB!
            </h1>
            <div className="space-y-1.5">
              {xpBreakdown.newPBs.map((pb, i) => {
                const ex = exercises.find(e => e.id === pb.exerciseId);
                return (
                  <p key={i} className="text-sm text-foreground/80 animate-fade-in" style={{ animationDelay: `${i * 200}ms` }}>
                    <span className="text-accent font-bold">{ex?.name}</span>
                    {' '}<span className="text-primary font-semibold">({pb.type})</span>
                  </p>
                );
              })}
            </div>
          </>
        )}

        <div className="card-3d glow-border rounded-2xl p-5 mx-auto max-w-xs space-y-3 animate-scale-in" style={{ animationDelay: '200ms' }}>
          <h2 className="font-display text-xl font-black text-gradient">⚡ XP Earned</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Workout Complete</span>
              <span className="text-primary font-black text-base">+{xpBreakdown.workoutComplete} XP</span>
            </div>
            {xpBreakdown.newPBs.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">New PBs ({xpBreakdown.newPBs.length})</span>
                <span className="text-accent font-black text-base">+{xpBreakdown.newPBs.length * 20} XP</span>
              </div>
            )}
            {xpBreakdown.repImprovements > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Rep Improvements</span>
                <span className="text-primary font-black text-base">+{xpBreakdown.repImprovements * 5} XP</span>
              </div>
            )}
            {xpBreakdown.streakBonus > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Streak Bonus 🔥</span>
                <span className="text-accent font-black text-base">+{xpBreakdown.streakBonus} XP</span>
              </div>
            )}
            <div className="border-t border-primary/30 pt-2 flex justify-between font-black">
              <span className="text-foreground text-base">Total {xpBreakdown.premiumMultiplied ? '(2x Premium)' : ''}</span>
              <span className="text-gradient text-2xl drop-shadow-[0_0_10px_hsl(138_90%_66%/0.4)]">+{xpBreakdown.total} XP</span>
            </div>
          </div>
        </div>

        {phase === 'details' && (
          <div className="space-y-3 animate-fade-in pt-2">
            <button onClick={onClose}
              className="w-full max-w-xs mx-auto py-3.5 rounded-2xl gradient-primary text-primary-foreground font-display font-bold text-base shadow-lg flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PBCelebration;
