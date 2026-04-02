import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Zap, Brain, Target, Palette, BarChart3, Flame, Star, ChevronRight, Play, Check } from 'lucide-react';
import logo from '@/assets/logo.png';
import tier1 from '@/assets/rats/tier-1-baby.png';
import tier4 from '@/assets/rats/tier-4-strong.png';
import tier8 from '@/assets/rats/tier-8-mythic.png';

const promoVideoUrl = '/__l5e/assets-v1/86cd92ea-e3e5-4114-9ac2-9450a3e269f0/gymrat-promo.mp4';

const features = [
  { icon: Zap, title: 'Double XP', desc: 'Level up twice as fast with boosted XP on every workout' },
  { icon: Brain, title: 'Smart Progression', desc: 'AI-powered plans that adapt to your strength gains' },
  { icon: Target, title: 'Custom Workouts', desc: 'Build your own routines with any exercise combination' },
  { icon: Palette, title: 'Exclusive Skins', desc: 'Rare GymRat cosmetics, glow effects & gear' },
  { icon: BarChart3, title: 'Advanced Stats', desc: 'Deep performance analytics and progress insights' },
  { icon: Flame, title: 'Streak Rewards', desc: 'Bonus XP multipliers for consecutive training days' },
];

const evolutionSteps = [
  { img: tier1, label: 'Baby Rat', level: 'Lv. 1' },
  { img: tier4, label: 'Strong Rat', level: 'Lv. 25' },
  { img: tier8, label: 'Mythic Rat', level: 'Lv. 90' },
];

const Promo = () => {
  const [playingVideo, setPlayingVideo] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-16">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-accent/8 blur-[100px]" />
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={logo} alt="GymRat" className="w-14 h-14 drop-shadow-[0_0_20px_hsl(138_90%_66%/0.5)]" />
            <h1 className="font-display text-4xl font-black">
              Gym<span className="text-gradient">Rat</span>
            </h1>
          </div>

          <p className="text-lg text-muted-foreground font-medium leading-relaxed">
            Turn every rep into <span className="text-primary font-bold">XP</span>.<br />
            Watch your rat <span className="text-accent font-bold">evolve</span>.<br />
            <span className="text-foreground font-bold">Level up for real.</span>
          </p>

          {/* Video section */}
          <div className="relative rounded-3xl overflow-hidden border border-border/50 shadow-card aspect-[9/16] max-w-[280px] mx-auto">
            {!playingVideo ? (
              <div className="absolute inset-0 gradient-card flex items-center justify-center cursor-pointer group" onClick={() => setPlayingVideo(true)}>
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-button group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 text-primary-foreground fill-current ml-1" />
                </div>
                <p className="absolute bottom-6 text-xs text-muted-foreground font-medium">Watch the trailer</p>
              </div>
            ) : (
              <video
                src={promoVideoUrl}
                autoPlay
                loop
                playsInline
                controls
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="flex flex-col items-center gap-3 pt-4">
            <Link
              to="/"
              className="px-8 py-4 rounded-2xl gradient-primary text-primary-foreground font-display font-bold text-lg btn-3d shadow-button flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Start Training Free
            </Link>
            <a
              href={promoVideoUrl}
              download="gymrat-promo.mp4"
              className="px-6 py-3 rounded-2xl bg-secondary text-secondary-foreground font-display font-bold text-sm hover:bg-secondary/80 transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Download Promo Video
            </a>
            <p className="text-xs text-muted-foreground">No account needed • Free forever</p>
          </div>
        </div>
      </section>

      {/* Evolution showcase */}
      <section className="py-16 px-4">
        <div className="max-w-lg mx-auto text-center space-y-8">
          <div>
            <p className="text-xs text-accent font-bold uppercase tracking-[0.3em] mb-2">Your Journey</p>
            <h2 className="font-display text-3xl font-black text-foreground">Watch Your Rat Evolve</h2>
            <p className="text-sm text-muted-foreground mt-2">From tiny baby to legendary god-tier beast</p>
          </div>

          <div className="flex items-end justify-center gap-6">
            {evolutionSteps.map((step, i) => (
              <div key={step.label} className="flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: `${i * 200}ms` }}>
                <div className={`rounded-2xl gradient-primary flex items-center justify-center border border-primary/30 ${
                  i === 2 ? 'w-28 h-28 shadow-glow animate-pulse' : i === 1 ? 'w-20 h-20' : 'w-14 h-14'
                }`}>
                  <img src={step.img} alt={step.label} className="w-[85%] h-[85%] object-contain" />
                </div>
                <p className="text-xs font-bold text-foreground">{step.label}</p>
                <p className="text-[10px] text-muted-foreground">{step.level}</p>
                {i < evolutionSteps.length - 1 && (
                  <ChevronRight className="absolute w-4 h-4 text-primary/40" style={{ display: 'none' }} />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className={`h-1 rounded-full transition-all ${i <= 2 ? 'w-6 gradient-primary' : 'w-3 bg-secondary'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 relative">
        <div className="absolute inset-0 bg-card/50 pointer-events-none" />
        <div className="relative max-w-lg mx-auto space-y-8">
          <div className="text-center">
            <p className="text-xs text-primary font-bold uppercase tracking-[0.3em] mb-2">Premium Features</p>
            <h2 className="font-display text-3xl font-black text-foreground">Make Every Rep Count</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="card-3d rounded-2xl p-4 space-y-2 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-button">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-display font-bold text-foreground text-sm">{title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4">
        <div className="max-w-lg mx-auto space-y-8">
          <div className="text-center">
            <Crown className="w-10 h-10 text-accent mx-auto mb-3" />
            <h2 className="font-display text-3xl font-black text-foreground">Go Premium</h2>
            <p className="text-sm text-muted-foreground mt-2">You're already putting in the work. Now make it count.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Monthly */}
            <div className="card-3d rounded-2xl p-5 space-y-3 text-center">
              <p className="text-xs text-muted-foreground font-medium">Monthly</p>
              <div>
                <span className="font-display text-3xl font-black text-foreground">79</span>
                <span className="text-sm text-muted-foreground ml-1">kr/mo</span>
              </div>
              <button className="w-full py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors">
                Choose
              </button>
            </div>

            {/* Yearly */}
            <div className="relative card-3d glow-border rounded-2xl p-5 space-y-3 text-center">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full gradient-accent text-accent-foreground text-[10px] font-bold">
                Save 37%
              </span>
              <p className="text-xs text-muted-foreground font-medium">Yearly</p>
              <div>
                <span className="font-display text-3xl font-black text-foreground">599</span>
                <span className="text-sm text-muted-foreground ml-1">kr/yr</span>
              </div>
              <button className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground font-bold text-sm btn-3d shadow-button">
                Choose
              </button>
            </div>
          </div>

          <div className="space-y-2 px-2">
            {['7-day free trial', 'Cancel anytime', 'All premium features included'].map(item => (
              <div key={item} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl gradient-primary text-primary-foreground font-display font-bold text-base btn-3d shadow-button"
            >
              <Star className="w-5 h-5" />
              Start Free Trial
            </Link>
            <p className="text-[10px] text-muted-foreground mt-3">No commitment • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/30">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <img src={logo} alt="GymRat" className="w-8 h-8" />
            <span className="font-display font-bold text-foreground">GymRat</span>
          </div>
          <p className="text-xs text-muted-foreground">Real life leveling hits different.</p>
          <Link to="/" className="text-xs text-primary font-medium hover:underline">
            Open App →
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Promo;
