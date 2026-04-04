import { ArrowLeft, Crown, Sparkles, Star, Trophy, Zap } from 'lucide-react';

type Props = {
  onBack: () => void;
};

type Milestone = {
  level: number;
  title: string;
  vibe: string;
  reward: string;
};

const milestones: Milestone[] = [
  { level: 1, title: 'Rookie Rat', vibe: 'You started. That matters.', reward: 'Base form unlocked' },
  { level: 5, title: 'Momentum Rat', vibe: 'Consistency starts showing.', reward: 'Minor glow tier' },
  { level: 10, title: 'Iron Rat', vibe: 'People notice the grind now.', reward: 'Gallery milestone' },
  { level: 15, title: 'Alpha Rat', vibe: 'You are no longer casual.', reward: 'Premium aura path' },
  { level: 20, title: 'Steel Rat', vibe: 'Your identity is changing.', reward: 'Cosmetic milestone' },
  { level: 25, title: 'Elite Rat', vibe: 'You train like this is who you are.', reward: 'Elite badge' },
  { level: 30, title: 'Savage Rat', vibe: 'Serious discipline unlocked.', reward: 'Elite glow' },
  { level: 35, title: 'Apex Rat', vibe: 'High effort becomes your normal.', reward: 'Rare cosmetic tier' },
  { level: 40, title: 'Titan Rat', vibe: 'You feel stronger in real life.', reward: 'Titan identity' },
  { level: 50, title: 'Legend Rat', vibe: 'Long-term progress is obvious.', reward: 'Legend status' },
  { level: 60, title: 'Mythic Rat', vibe: 'Very few stay this consistent.', reward: 'Mythic visuals' },
  { level: 70, title: 'Dominus Rat', vibe: 'You move like someone who built himself.', reward: 'Premium prestige' },
  { level: 80, title: 'Ascended Rat', vibe: 'You train above average. Far above.', reward: 'Ascended aura' },
  { level: 90, title: 'Immortal Rat', vibe: 'This is identity now, not motivation.', reward: 'Immortal status' },
  { level: 100, title: 'GymRat King', vibe: 'Peak real-life leveling.', reward: 'Final prestige form' },
];

export default function GymRatGallery({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-[#07110d] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-8 pt-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_50px_rgba(170,255,140,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-lime-300/75">
                Gallery
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight">Evolution path</h1>
              <p className="mt-2 text-sm leading-6 text-white/65">
                This is the roadmap of who you become by showing up.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-black/20 text-lime-200">
              <Sparkles className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-lime-300/20 bg-gradient-to-r from-lime-300/10 via-white/[0.04] to-yellow-300/10 p-4">
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <Zap className="h-4 w-4 text-lime-300" />
              Leveling up in real life
            </div>
            <p className="mt-2 text-sm leading-6 text-white/68">
              Each milestone should feel like identity progression, not just a number.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {milestones.map((item, index) => (
              <div
                key={item.level}
                className="rounded-[24px] border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-black text-white">Level {item.level}</div>
                      {item.level >= 50 && (
                        <span className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-200">
                          Prestige
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-sm font-bold text-lime-200">{item.title}</div>
                    <div className="mt-2 text-sm leading-6 text-white/65">{item.vibe}</div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/75">
                      {item.level >= 100 ? (
                        <Crown className="h-3.5 w-3.5 text-yellow-300" />
                      ) : item.level >= 50 ? (
                        <Trophy className="h-3.5 w-3.5 text-lime-300" />
                      ) : (
                        <Star className="h-3.5 w-3.5 text-lime-300" />
                      )}
                      {item.reward}
                    </div>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-sm font-black text-white/75">
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}