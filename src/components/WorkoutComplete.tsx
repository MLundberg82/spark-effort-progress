import { useEffect, useState, useMemo } from 'react';
import { exercises } from '@/lib/exerciseData';
import { XPBreakdown, getLevelFromXP, getTotalXP, getRatTier, isPremium } from '@/lib/gamificationStore';
import { getCurrentTierImage, getTierImagesForGender } from '@/lib/ratImages';
import { RatTier } from '@/lib/gamificationStore';
import { shouldShowPaywall } from "@/lib/paywallStore";
interface Props {
  xpBreakdown: XPBreakdown;
  oldLevel: number;
  newLevel: number;
  onContinue: () => void;
}

const tierOrder: RatTier[] = ['baby', 'rookie', 'regular', 'strong', 'buff', 'beast', 'legend', 'mythic'];

function triggerVibration(pattern: number | number[]) {
  try {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  } catch {}
}

const WorkoutComplete = ({ xpBreakdown, oldLevel, newLevel, onContinue }: Props) => {
  const [phase, setPhase] = useState<'flash' | 'explode' | 'reveal' | 'xp' | 'levelup' | 'done'>('flash');
  const [xpAnimated, setXpAnimated] = useState(0);
  const hasPB = xpBreakdown.newPBs.length > 0;
  const leveledUp = newLevel > oldLevel;
  const totalXP = getTotalXP();
  const { progress, currentXP, xpToNext } = getLevelFromXP(totalXP);
  const ratTier = getRatTier(newLevel);
  const oldTier = getRatTier(oldLevel);
  const tierChanged = oldTier.tier !== ratTier.tier;
  const genderedImages = getTierImagesForGender();

  // Vibrate on PB or level up
  useEffect(() => {
    if (hasPB) triggerVibration([100, 50, 100, 50, 200]);
  }, [hasPB]);

  useEffect(() => {
    if (leveledUp && (phase === 'levelup')) {
      triggerVibration([200, 100, 200, 100, 400]);
    }
  }, [leveledUp, phase]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('explode'), 300),
      setTimeout(() => setPhase('reveal'), hasPB ? 1200 : 800),
      setTimeout(() => setPhase('xp'), hasPB ? 2500 : 1500),
      setTimeout(() => {
        if (leveledUp) setPhase('levelup');
        else setPhase('done');
      }, hasPB ? 4000 : 3000),
      ...(leveledUp ? [setTimeout(() => setPhase('done'), hasPB ? 7000 : 6000)] : []),
    ];
    return () => timers.forEach(clearTimeout);
  }, [hasPB, leveledUp]);

  // Animate XP counting up
  useEffect(() => {
    if (phase !== 'xp' && phase !== 'levelup' && phase !== 'done') return;
    let current = 0;
    const target = xpBreakdown.total;
    const steps = 30;
    const stepTime = 1000 / steps;
    const increment = target / steps;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setXpAnimated(target);
        clearInterval(interval);
      } else {
        setXpAnimated(Math.floor(current));
      }
    }, stepTime);
    return () => clearInterval(interval);
  }, [phase === 'xp']);

  // Screen shake
  useEffect(() => {
    if (phase === 'flash' || phase === 'explode') {
      const el = document.documentElement;
      el.style.animation = 'screen-shake 0.5s ease-out';
      const timer = setTimeout(() => { el.style.animation = ''; }, 500);
      return () => { clearTimeout(timer); el.style.animation = ''; };
    }
  }, [phase]);

  // Morph state for level up
  const [morphIndex, setMorphIndex] = useState(0);
  const oldTierIdx = tierOrder.indexOf(oldTier.tier);
  const newTierIdx = tierOrder.indexOf(ratTier.tier);
  const morphTiers = tierChanged ? tierOrder.slice(oldTierIdx, newTierIdx + 1) : [ratTier.tier];
  const morphScales = useMemo(() => morphTiers.map((_, i) => 0.5 + (i / Math.max(morphTiers.length - 1, 1)) * 0.6), [morphTiers.length]);

  useEffect(() => {
    if (phase !== 'levelup' || !tierChanged) return;
    setMorphIndex(0);
    let step = 0;
    const stepMs = 800;
    const interval = setInterval(() => {
      step++;
      if (step >= morphTiers.length - 1) { setMorphIndex(morphTiers.length - 1); clearInterval(interval); }
      else setMorphIndex(step);
    }, stepMs);
    return () => clearInterval(interval);
  }, [phase, tierChanged, morphTiers.length]);

  // Firework particles
  const fireworks = useMemo(() => Array.from({ length: hasPB ? 6 : 3 }, (_, bi) => ({
    x: 10 + (bi * 80 / (hasPB ? 6 : 3)) + Math.random() * 10,
    y: 10 + Math.random() * 30,
    delay: 200 + bi * 350,
    particles: Array.from({ length: 24 }, (_, i) => ({
      angle: (i / 24) * 360 + Math.random() * 15,
      distance: 60 + Math.random() * 180,
      size: 3 + Math.random() * 6,
      hue: [0, 30, 50, 138, 200, 280, 320][Math.floor(Math.random() * 7)],
      duration: 800 + Math.random() * 700,
    })),
  })), [hasPB]);

  // Embers
  const embers = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    x: 5 + Math.random() * 90,
    size: 2 + Math.random() * 6,
    hue: [0, 15, 30, 40, 138][i % 5],
    delay: i * 50,
    duration: 1500 + Math.random() * 2000,
  })), []);

  // Fire columns for level up
  const fireColumns = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    x: Math.random() * 100,
    width: 4 + Math.random() * 14,
    hue: [0, 15, 25, 40, 50][i % 5],
    delay: i * 40,
    duration: 1200 + Math.random() * 1500,
  })), []);

  // Explosion debris
  const debris = useMemo(() => Array.from({ length: 35 }, (_, i) => ({
    angle: (i / 35) * 360 + Math.random() * 10,
    distance: 100 + Math.random() * 250,
    size: 4 + Math.random() * 8,
    hue: [0, 30, 50, 138][i % 4],
    rotation: Math.random() * 720,
    delay: Math.random() * 200,
    duration: 1000 + Math.random() * 800,
  })), []);

  const currentMorphTier = morphTiers[morphIndex] || ratTier.tier;
  const showingMorph = phase === 'levelup' && tierChanged;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden">
      {/* Flash */}
      {phase === 'flash' && (
        <div className="absolute inset-0 z-50 animate-[flash-hard_0.4s_ease-out_forwards]"
          style={{ background: leveledUp ? 'radial-gradient(circle, hsl(50 100% 90%), hsl(30 100% 60%), hsl(0 90% 40%))' : 'white' }} />
      )}

      {/* Background */}
      <div className={`absolute inset-0 transition-all duration-700 ${
        phase === 'explode' ? 'bg-orange-900/30 backdrop-blur-sm' : 'bg-background/95 backdrop-blur-xl'
      }`} />

      {/* Explosion shockwaves */}
      {phase === 'explode' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {['hsl(0 90% 55%)', 'hsl(30 100% 55%)', 'hsl(50 100% 60%)', 'hsl(138 90% 66%)', 'hsl(280 80% 60%)'].map((color, i) => (
            <div key={i} className="absolute rounded-full animate-[shockwave-expand_1s_ease-out_forwards]"
              style={{ width: 20, height: 20, border: `3px solid ${color}`, opacity: 0.7, animationDelay: `${i * 120}ms` }} />
          ))}
          <div className="absolute w-40 h-40 rounded-full bg-orange-500/50 animate-[ping_1s_ease-out_forwards]" />
        </div>
      )}

      {/* Fire columns during level up */}
      {(phase === 'levelup') && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {fireColumns.map((f, i) => (
            <div key={`fire-${i}`} className="absolute bottom-0 rounded-t-full animate-[fire-rise_var(--dur)_ease-out_forwards]"
              style={{
                left: `${f.x}%`, width: f.width, height: 0,
                background: `linear-gradient(to top, hsl(${f.hue} 100% 55%), hsl(${f.hue + 15} 100% 65% / 0.6), transparent)`,
                '--dur': `${f.duration}ms`,
                animationDelay: `${f.delay}ms`,
                filter: `blur(${1 + Math.random() * 2}px)`,
              } as React.CSSProperties} />
          ))}
        </div>
      )}

      {/* Explosion debris during level up */}
      {(phase === 'levelup') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {debris.map((d, i) => (
            <div key={`debris-${i}`} className="absolute rounded-sm animate-[debris-fly_var(--dur)_ease-out_forwards]"
              style={{
                width: d.size, height: d.size * 0.6,
                backgroundColor: `hsl(${d.hue} 90% 55%)`,
                boxShadow: `0 0 ${d.size * 2}px hsl(${d.hue} 100% 55%)`,
                '--angle': `${d.angle}deg`,
                '--distance': `${d.distance}px`,
                '--rotation': `${d.rotation}deg`,
                '--dur': `${d.duration}ms`,
                animationDelay: `${d.delay}ms`,
              } as React.CSSProperties} />
          ))}
          <div className="absolute w-32 h-32 rounded-full animate-[explosion-blast_0.8s_ease-out_forwards]"
            style={{ background: 'radial-gradient(circle, hsl(50 100% 85%), hsl(30 100% 55%), hsl(0 90% 50%), transparent)' }} />
        </div>
      )}

      {/* Firework bursts */}
      {(phase === 'reveal' || phase === 'xp' || phase === 'levelup' || phase === 'done') && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {fireworks.map((burst, bi) => (
            <div key={bi} className="absolute" style={{ left: `${burst.x}%`, top: `${burst.y}%` }}>
              {burst.particles.map((p, pi) => (
                <div key={pi} className="absolute rounded-full animate-pb-particle"
                  style={{
                    width: p.size, height: p.size,
                    backgroundColor: `hsl(${p.hue} 100% 60%)`,
                    boxShadow: `0 0 ${p.size * 3}px hsl(${p.hue} 100% 60%)`,
                    animationDelay: `${burst.delay + pi * 12}ms`,
                    animationDuration: `${p.duration}ms`,
                    '--angle': `${p.angle}deg`,
                    '--distance': `${p.distance}px`,
                  } as React.CSSProperties} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Rising embers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {embers.map((e, i) => (
          <div key={i} className="absolute rounded-full animate-pb-ember"
            style={{
              width: e.size, height: e.size,
              backgroundColor: `hsl(${e.hue} 100% 55%)`,
              boxShadow: `0 0 ${e.size * 2}px hsl(${e.hue} 100% 55%)`,
              left: `${e.x}%`, bottom: '-5%',
              animationDelay: `${e.delay}ms`,
              animationDuration: `${e.duration}ms`,
            }} />
        ))}
      </div>

      {/* Light rays during level up */}
      {phase === 'levelup' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={`ray-${i}`} className="absolute left-1/2 top-1/2 origin-left animate-pb-ray"
              style={{
                width: '150vw', height: 3,
                background: `linear-gradient(90deg, hsl(${[0, 30, 50, 138, 200, 280, 320, 40][i % 8]} 90% 60% / 0.5), transparent)`,
                transform: `rotate(${i * 22.5}deg)`,
                animationDelay: `${i * 40}ms`,
              }} />
          ))}
        </div>
      )}

      {/* Main content */}
      <div className={`relative z-10 text-center space-y-5 px-6 w-full max-w-sm my-auto py-8 transition-all duration-700 ${
        phase === 'flash' ? 'scale-[3] opacity-0'
        : phase === 'explode' ? 'scale-150 opacity-0'
        : 'scale-100 opacity-100'
      }`}>
        {/* Level up morph — replaces simple rat display when leveling */}
        {showingMorph ? (
          <div className="relative mx-auto w-44 h-44">
            {/* Pulsing ring of fire */}
            <div className="absolute -inset-6 rounded-full animate-[pulse_1s_ease-in-out_infinite]"
              style={{ background: 'radial-gradient(circle, transparent 50%, hsl(30 100% 55% / 0.4) 65%, hsl(0 90% 50% / 0.3) 80%, transparent 100%)' }} />
            
            {/* Orbiting embers */}
            <svg className="absolute -inset-8 w-[calc(100%+64px)] h-[calc(100%+64px)] animate-[spin_4s_linear_infinite]" viewBox="0 0 280 280">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <circle key={i}
                  cx={140 + 125 * Math.cos(angle * Math.PI / 180)}
                  cy={140 + 125 * Math.sin(angle * Math.PI / 180)}
                  r={2 + (i % 3)}
                  fill={['hsl(0 100% 55%)', 'hsl(30 100% 55%)', 'hsl(50 100% 60%)', 'hsl(138 90% 66%)',
                         'hsl(0 90% 60%)', 'hsl(40 100% 55%)', 'hsl(280 80% 60%)', 'hsl(200 100% 65%)'][i]}
                  className="animate-pulse" />
              ))}
            </svg>

            <div className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: 'radial-gradient(circle, hsl(30 100% 15%), hsl(0 80% 10%), hsl(150 10% 7%))',
                border: '3px solid hsl(30 100% 55% / 0.6)',
                boxShadow: '0 0 80px hsl(30 100% 55% / 0.5), 0 0 40px hsl(0 90% 50% / 0.3), inset 0 0 40px hsl(30 100% 55% / 0.2)',
              }}>
              <div className="relative w-full h-full flex items-center justify-center">
                <div key={`surge-${morphIndex}`} className="absolute inset-0 animate-[flash-hard_0.4s_ease-out_forwards]"
                  style={{ background: 'radial-gradient(circle, hsl(50 100% 80% / 0.6), transparent)' }} />
                <img key={`morph-${morphIndex}`} src={genderedImages[currentMorphTier]} alt={currentMorphTier}
                  className="object-contain"
                  style={{
                    width: `${(morphScales[morphIndex] || 1) * 140}px`,
                    height: `${(morphScales[morphIndex] || 1) * 140}px`,
                    filter: 'drop-shadow(0 0 25px hsl(30 100% 55% / 0.7)) drop-shadow(0 0 10px hsl(0 90% 55% / 0.4))',
                    transition: 'width 0.6s ease, height 0.6s ease',
                  }} />
              </div>
            </div>

            <p className="absolute -bottom-8 left-0 right-0 text-sm font-black uppercase tracking-[0.2em] animate-pulse text-center"
              style={{
                background: 'linear-gradient(90deg, hsl(0 90% 55%), hsl(30 100% 55%), hsl(50 100% 60%))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>🔥 EVOLVING... 🔥</p>
          </div>
        ) : (
          <>
            {/* Big headline */}
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">⚡ WORKOUT ⚡</p>
              <h1 className="font-display text-5xl font-black text-gradient drop-shadow-[0_0_30px_hsl(138_90%_66%/0.5)]">
                COMPLETE
              </h1>
            </div>

            {/* Rat character */}
            <div className="relative mx-auto w-36 h-36">
              <div className="absolute -inset-4 rounded-full animate-[pulse_2s_ease-in-out_infinite]"
                style={{ background: 'radial-gradient(circle, transparent 55%, hsl(138 90% 66% / 0.2) 70%, transparent 100%)' }} />
              <img src={getCurrentTierImage(ratTier.tier)} alt={ratTier.label}
                className="w-full h-full object-contain drop-shadow-[0_0_25px_hsl(138_90%_66%/0.5)] animate-scale-in" />
            </div>
          </>
        )}

        {/* PB callout */}
        {hasPB && (phase === 'reveal' || phase === 'xp' || phase === 'levelup' || phase === 'done') && (
          <div className="animate-scale-in">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent/20 border border-accent/40">
              <span className="text-2xl">🏆</span>
              <span className="font-display font-black text-accent text-lg">NEW PB!</span>
            </div>
            <div className="mt-2 space-y-0.5">
              {xpBreakdown.newPBs.map((pb, i) => {
                const ex = exercises.find(e => e.id === pb.exerciseId);
                return (
                  <p key={i} className="text-xs text-muted-foreground">
                    <span className="text-accent font-bold">{ex?.name}</span> — {pb.type}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* XP earned */}
        {(phase === 'xp' || phase === 'levelup' || phase === 'done') && !showingMorph && (
          <div className="card-3d glow-border rounded-2xl p-5 space-y-3 animate-scale-in">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-bold">XP Earned</span>
              <span className="font-display text-3xl font-black text-gradient drop-shadow-[0_0_10px_hsl(138_90%_66%/0.4)]">
                +{xpAnimated}
              </span>
            </div>
            {xpBreakdown.premiumMultiplied && (
              <span className="text-[10px] text-accent font-bold">2x Premium Bonus Applied</span>
            )}
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-primary font-bold">Level {newLevel}</span>
                <span className="text-muted-foreground">{currentXP}/{xpToNext} XP</span>
              </div>
              <div className="h-3 rounded-full bg-secondary overflow-hidden shadow-inset">
                <div className="h-full gradient-primary transition-all duration-1000 rounded-full"
                  style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Workout</span>
                <span className="text-primary font-bold">+{xpBreakdown.workoutComplete}</span>
              </div>
              {xpBreakdown.newPBs.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PBs ({xpBreakdown.newPBs.length})</span>
                  <span className="text-accent font-bold">+{xpBreakdown.newPBs.length * 20}</span>
                </div>
              )}
              {xpBreakdown.streakBonus > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Streak 🔥</span>
                  <span className="text-accent font-bold">+{xpBreakdown.streakBonus}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Level up text */}
        {leveledUp && (phase === 'levelup' || phase === 'done') && (
          <div className="animate-scale-in space-y-2">
            <p className="text-sm font-black uppercase tracking-[0.2em]"
              style={{
                background: 'linear-gradient(90deg, hsl(0 90% 55%), hsl(30 100% 55%), hsl(50 100% 60%), hsl(138 90% 66%))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>⚡ LEVEL UP ⚡</p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-display text-3xl font-black text-muted-foreground">{oldLevel}</span>
              <span className="text-xl text-primary">→</span>
              <span className="font-display text-6xl font-black text-gradient drop-shadow-[0_0_30px_hsl(138_90%_66%/0.5)]">{newLevel}</span>
            </div>
            {tierChanged && (
              <p className="text-sm font-bold text-accent animate-pulse">🐀 {oldTier.label} → {ratTier.label}</p>
            )}
          </div>
        )}

        {/* Continue button */}
        {phase === 'done' && (
          <button onClick={onContinue}
            className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-display font-bold text-lg btn-3d shadow-button animate-fade-in active:scale-[0.97] transition-transform">
            CONTINUE
          </button>
        )}
      </div>
    </div>
  );
};

export default WorkoutComplete;
