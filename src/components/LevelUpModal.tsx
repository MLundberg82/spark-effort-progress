import { useEffect, useState, useMemo } from 'react';
import { getRatTier, milestones, RatTier, isPremium } from '@/lib/gamificationStore';
import { getTierImagesForGender } from '@/lib/ratImages';

interface Props {
  oldLevel: number;
  newLevel: number;
  onClose: () => void;
}

const tierOrder: RatTier[] = ['baby', 'rookie', 'regular', 'strong', 'buff', 'beast', 'legend', 'mythic'];

const LevelUpModal = ({ oldLevel, newLevel, onClose }: Props) => {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<'intro' | 'morph' | 'reveal' | 'details'>('intro');
  const oldTier = getRatTier(oldLevel);
  const newTier = getRatTier(newLevel);
  const milestone = milestones.find(m => m.level > oldLevel && m.level <= newLevel);
  const tierChanged = oldTier.tier !== newTier.tier;

  const [morphIndex, setMorphIndex] = useState(0);
  const oldTierIdx = tierOrder.indexOf(oldTier.tier);
  const newTierIdx = tierOrder.indexOf(newTier.tier);
  const morphTiers = tierChanged ? tierOrder.slice(oldTierIdx, newTierIdx + 1) : [oldTier.tier, newTier.tier];
  const morphStepMs = 2000;
  const totalMorphMs = morphTiers.length * morphStepMs;

  const morphScales = useMemo(() => {
    return morphTiers.map((_, i) => 0.5 + (i / Math.max(morphTiers.length - 1, 1)) * 0.7);
  }, [morphTiers.length]);

  // Firework bursts for level up
  const fireworkBursts = useMemo(() => Array.from({ length: 6 }, (_, bi) => ({
    x: 10 + (bi * 80 / 6) + Math.random() * 10,
    y: 10 + Math.random() * 35,
    delay: 400 + bi * 500,
    particles: Array.from({ length: 24 }, (_, i) => ({
      angle: (i / 24) * 360 + Math.random() * 15,
      distance: 60 + Math.random() * 160,
      size: 3 + Math.random() * 5,
      hue: [0, 30, 50, 138, 200, 280, 320][Math.floor(Math.random() * 7)],
      duration: 900 + Math.random() * 700,
    })),
  })), []);

  // Fire columns rising from bottom
  const fireColumns = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    x: Math.random() * 100,
    width: 4 + Math.random() * 12,
    height: 40 + Math.random() * 120,
    hue: [0, 15, 25, 40, 50][i % 5],
    delay: i * 60,
    duration: 1200 + Math.random() * 1500,
  })), []);

  // Explosion debris
  const debris = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    angle: (i / 30) * 360 + Math.random() * 12,
    distance: 100 + Math.random() * 200,
    size: 4 + Math.random() * 8,
    hue: [0, 30, 50, 138][i % 4],
    rotation: Math.random() * 720,
    delay: Math.random() * 300,
    duration: 1000 + Math.random() * 800,
  })), []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('morph'), 1500),
      setTimeout(() => setPhase('reveal'), 1500 + totalMorphMs + 1000),
      setTimeout(() => setPhase('details'), 1500 + totalMorphMs + 2500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [totalMorphMs]);

  useEffect(() => {
    if (phase !== 'morph') return;
    setMorphIndex(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= morphTiers.length - 1) { setMorphIndex(morphTiers.length - 1); clearInterval(interval); }
      else setMorphIndex(step);
    }, morphStepMs);
    return () => clearInterval(interval);
  }, [phase, morphTiers.length, morphStepMs]);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 500); };

  const genderedTierImages = getTierImagesForGender();
  const currentMorphTier = morphTiers[morphIndex] || newTier.tier;
  const showingMorph = phase === 'morph';
  const currentScale = showingMorph ? morphScales[morphIndex] : 1;

  return (
    <div className={`fixed inset-0 z-[110] flex items-center justify-center transition-opacity duration-500 ${
      visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      {/* Initial flash + camera shake */}
      {phase === 'intro' && (
        <div className="absolute inset-0 z-50 animate-[flash-hard_0.6s_ease-out_forwards]"
          style={{ background: 'radial-gradient(circle, hsl(50 100% 90%), hsl(30 100% 60%), hsl(0 90% 40%))' }} />
      )}

      <div className={`absolute inset-0 transition-all duration-700 ${
        phase === 'intro' ? 'bg-orange-900/60 backdrop-blur-sm'
        : phase === 'morph' ? 'bg-background/90 backdrop-blur-xl'
        : 'bg-background/95 backdrop-blur-xl'
      }`} />

      {/* Fire columns rising from bottom */}
      {(phase === 'morph' || phase === 'reveal') && (
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

      {/* Explosion debris flying outward */}
      {(phase === 'intro' || phase === 'morph') && (
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
          {/* Central explosion flash */}
          <div className="absolute w-32 h-32 rounded-full animate-[explosion-blast_0.8s_ease-out_forwards]"
            style={{ background: 'radial-gradient(circle, hsl(50 100% 85%), hsl(30 100% 55%), hsl(0 90% 50%), transparent)' }} />
        </div>
      )}

      {/* Firework bursts */}
      {(phase === 'reveal' || phase === 'details') && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {fireworkBursts.map((burst, bi) => (
            <div key={`fburst-${bi}`} className="absolute" style={{ left: `${burst.x}%`, top: `${burst.y}%` }}>
              {burst.particles.map((p, pi) => (
                <div key={`fp-${bi}-${pi}`} className="absolute rounded-full animate-pb-particle"
                  style={{
                    width: p.size, height: p.size,
                    backgroundColor: `hsl(${p.hue} 100% 60%)`,
                    boxShadow: `0 0 ${p.size * 3}px hsl(${p.hue} 100% 60%)`,
                    animationDelay: `${burst.delay + pi * 10}ms`,
                    animationDuration: `${p.duration}ms`,
                    '--angle': `${p.angle}deg`,
                    '--distance': `${p.distance}px`,
                  } as React.CSSProperties} />
              ))}
              <div className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full animate-[flash-hard_0.4s_ease-out_forwards]"
                style={{
                  background: 'radial-gradient(circle, hsl(50 100% 85%), hsl(30 100% 55%), transparent)',
                  animationDelay: `${burst.delay}ms`,
                }} />
            </div>
          ))}
        </div>
      )}

      {/* Heat distortion shimmer during morph */}
      {showingMorph && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`heat-${i}`} className="absolute left-1/2 top-1/2 origin-left animate-[energy-streak_0.8s_ease-out_forwards]"
              style={{
                width: '120vw', height: 3,
                background: `linear-gradient(90deg, hsl(${[0, 30, 50, 138][i % 4]} 100% 60% / 0.4), transparent 30%)`,
                transform: `rotate(${i * 30}deg)`,
                animationDelay: `${i * 100}ms`,
              }} />
          ))}
        </div>
      )}

      {/* Main content */}
      <div className={`relative z-10 text-center space-y-5 transition-all duration-700 ${
        phase === 'intro' ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* Rat morph container */}
        <div className="relative mx-auto w-52 h-52">
          {/* Pulsing ring of fire */}
          <div className="absolute -inset-4 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"
            style={{
              background: 'radial-gradient(circle, transparent 55%, hsl(30 100% 55% / 0.3) 65%, hsl(0 90% 50% / 0.2) 80%, transparent 100%)',
            }} />
          
          {/* Orbiting embers */}
          <svg className="absolute -inset-8 w-[calc(100%+64px)] h-[calc(100%+64px)] animate-[spin_6s_linear_infinite]" viewBox="0 0 280 280">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <circle key={`ember-orbit-${i}`}
                cx={140 + 125 * Math.cos(angle * Math.PI / 180)}
                cy={140 + 125 * Math.sin(angle * Math.PI / 180)}
                r={2 + (i % 3)}
                fill={['hsl(0 100% 55%)', 'hsl(30 100% 55%)', 'hsl(50 100% 60%)', 'hsl(138 90% 66%)',
                       'hsl(0 90% 60%)', 'hsl(40 100% 55%)', 'hsl(280 80% 60%)', 'hsl(200 100% 65%)'][i]}
                className="animate-pulse" />
            ))}
          </svg>

          {/* Rat image with morph */}
          <div className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: showingMorph
                ? 'radial-gradient(circle, hsl(30 100% 15%), hsl(0 80% 10%), hsl(150 10% 7%))'
                : 'linear-gradient(135deg, hsl(138 90% 66% / 0.2), hsl(40 55% 55% / 0.2))',
              border: '3px solid',
              borderColor: showingMorph ? 'hsl(30 100% 55% / 0.6)' : 'hsl(138 90% 66% / 0.5)',
              boxShadow: showingMorph
                ? '0 0 80px hsl(30 100% 55% / 0.5), 0 0 40px hsl(0 90% 50% / 0.3), inset 0 0 40px hsl(30 100% 55% / 0.2)'
                : '0 0 60px hsl(138 90% 66% / 0.4)',
            }}>
            {showingMorph ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Power surge flash on each morph step */}
                <div key={`surge-${morphIndex}`} className="absolute inset-0 animate-[flash-hard_0.4s_ease-out_forwards]"
                  style={{ background: 'radial-gradient(circle, hsl(50 100% 80% / 0.6), transparent)' }} />
                {/* Rat growing */}
                <img key={`morph-${morphIndex}`} src={genderedTierImages[currentMorphTier]} alt={currentMorphTier}
                  className="object-contain"
                  style={{
                    width: `${currentScale * 140}px`,
                    height: `${currentScale * 140}px`,
                    filter: `drop-shadow(0 0 25px hsl(30 100% 55% / 0.7)) drop-shadow(0 0 10px hsl(0 90% 55% / 0.4))`,
                    transition: 'width 0.8s ease, height 0.8s ease',
                  }} />
              </div>
            ) : (
              <img src={genderedTierImages[newTier.tier]} alt={newTier.label}
                className="w-36 h-36 object-contain"
                style={{ filter: 'drop-shadow(0 0 30px hsl(138 90% 66% / 0.5))' }} />
            )}
          </div>
        </div>

        {showingMorph && (
          <p className="text-sm font-black uppercase tracking-[0.2em] animate-pulse"
            style={{
              background: 'linear-gradient(90deg, hsl(0 90% 55%), hsl(30 100% 55%), hsl(50 100% 60%))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
            🔥 EVOLVING... 🔥
          </p>
        )}

        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em]"
            style={{
              background: 'linear-gradient(90deg, hsl(0 90% 55%), hsl(30 100% 55%), hsl(50 100% 60%), hsl(138 90% 66%))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>⚡ LEVEL UP ⚡</p>
          <h1 className="font-display text-8xl font-black text-gradient drop-shadow-[0_0_40px_hsl(138_90%_66%/0.6)]"
            style={{ textShadow: '0 0 60px hsl(138 90% 66% / 0.4)' }}>{newLevel}</h1>
          <p className="text-sm text-muted-foreground mt-1 font-semibold">{newTier.label}</p>
          {tierChanged && (
            <p className="text-xs font-bold mt-1 animate-fade-in"
              style={{
                background: 'linear-gradient(90deg, hsl(30 100% 55%), hsl(138 90% 66%))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>🐀 {oldTier.label} → {newTier.label}</p>
          )}
        </div>

        {milestone && phase === 'details' && (
          <div className="card-3d glow-border rounded-2xl p-5 mx-auto max-w-xs space-y-2 animate-scale-in">
            <p className="text-4xl drop-shadow-lg">{milestone.icon}</p>
            <p className="font-display font-black text-foreground text-lg">{milestone.title}</p>
            <p className="text-xs text-accent font-bold">{milestone.reward}</p>
          </div>
        )}

        {phase === 'details' && (
          <div className="space-y-3 animate-fade-in pt-2">
            <button onClick={handleClose}
              className="w-full max-w-xs mx-auto py-3.5 rounded-2xl gradient-primary text-primary-foreground font-display font-bold text-base shadow-lg flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelUpModal;
