import { ArrowLeft, Lock, Sparkles, Star, Trophy, Zap } from 'lucide-react';
import EquippedRatPreview from '@/components/EquippedRatPreview';
import { getLevelFromXP, getTotalXP } from '@/lib/gamificationStore';
import { getLevelVisual } from '@/lib/levelVisuals';

type GymRatGalleryProps = {
  onBack: () => void;
};

const milestoneLevels = [1, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 100];

function StatBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-4 shadow-[0_12px_35px_rgba(0,0,0,0.22)]">
      <div className="mb-2 flex items-center gap-2 text-white/55">
        <div className="rounded-full border border-white/10 bg-black/20 p-2">
          {icon}
        </div>
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em]">
          {label}
        </span>
      </div>

      <p className="text-xl font-black tracking-tight text-white">{value}</p>
    </div>
  );
}

export default function GymRatGallery({ onBack }: GymRatGalleryProps) {
  const totalXP = getTotalXP();
  const currentLevel = getLevelFromXP(totalXP);
  const currentVisual = getLevelVisual(currentLevel);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_28%),linear-gradient(180deg,#07110d_0%,#0b1511_38%,#050806_100%)] px-4 pb-8 pt-5 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-emerald-300">
            Level Gallery
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/75">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Progression archive</span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
            Your GymRat evolution
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/65">
            Every form should feel earned. This gallery shows the long-term path,
            while your current hero reflects your active identity, gear and background.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatBadge
              icon={<Zap className="h-4 w-4" />}
              label="Current level"
              value={`LVL ${currentLevel}`}
            />
            <StatBadge
              icon={<Trophy className="h-4 w-4" />}
              label="Current tier"
              value={currentVisual.tierLabel}
            />
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/45">
                  Current hero
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  Live preview with active equipment and background
                </p>
              </div>

              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-emerald-300">
                Active
              </div>
            </div>

            <div className={`rounded-[1.6rem] border border-white/10 p-3 ${currentVisual.backgroundClass}`}>
              <div className="mx-auto max-w-[14rem]">
                <EquippedRatPreview level={currentLevel} />
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className={`text-sm font-black ${currentVisual.accentClass}`}>
                {currentVisual.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-white/62">
                {currentVisual.subtitle}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Milestones</h2>
                <p className="mt-1 text-sm text-white/55">
                  These are the forms your GymRat grows through over time.
                </p>
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/45">
                Archive
              </div>
            </div>

            <div className="space-y-3">
              {milestoneLevels.map((level) => {
                const unlocked = currentLevel >= level;
                const current = currentLevel === level;
                const visual = getLevelVisual(level);

                return (
                  <div
                    key={level}
                    className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_12px_35px_rgba(0,0,0,0.20)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/45">
                          Level milestone
                        </p>
                        <h3 className="mt-1 text-lg font-black tracking-tight text-white">
                          LVL {level}
                        </h3>
                      </div>

                      <div
                        className={`rounded-full px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] ${
                          current
                            ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                            : unlocked
                            ? 'border border-white/10 bg-white/[0.06] text-white'
                            : 'border border-yellow-400/20 bg-yellow-400/10 text-yellow-300'
                        }`}
                      >
                        {current ? 'Current' : unlocked ? 'Unlocked' : 'Locked'}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-[96px_1fr] gap-4">
                      <div
                        className={`relative overflow-hidden rounded-[1.2rem] border border-white/10 p-2 ${visual.backgroundClass}`}
                      >
                        <div className="mx-auto max-w-[5rem]">
                          {unlocked ? (
                            <EquippedRatPreview level={level} />
                          ) : (
                            <div className="flex aspect-square items-center justify-center rounded-[1rem] border border-dashed border-white/10 bg-black/20">
                              <Lock className="h-5 w-5 text-yellow-300" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className={`text-base font-black ${visual.accentClass}`}>
                          {unlocked ? visual.title : `Unlock at level ${level}`}
                        </p>

                        <p className="mt-2 text-sm leading-6 text-white/60">
                          {unlocked
                            ? 'Reached. Your GymRat has already crossed this stage.'
                            : 'Still ahead. Keep training and stacking XP to reach this form.'}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/45">
                            {visual.tierLabel}
                          </span>

                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/45">
                            milestone {visual.milestone}
                          </span>

                          {current ? (
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-emerald-300">
                              current form
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 p-2">
                <Star className="h-4 w-4 text-emerald-300" />
              </div>

              <div>
                <p className="text-base font-bold text-white">
                  Real progression should stay visible
                </p>
                <p className="mt-2 text-sm leading-6 text-white/62">
                  The point of this gallery is to make the long journey feel real.
                  You are not just gaining XP. You are evolving your identity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}