import { ArrowLeft, Crown, Lock, Sparkles, Star, Trophy, Zap } from 'lucide-react';
import EquippedRatPreview from '@/components/EquippedRatPreview';
import { getLevelFromXP, getTotalXP } from '@/lib/gamificationStore';

type GymRatGalleryProps = {
  onBack: () => void;
};

const milestoneLevels = [1, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 100];

function getTierFromLevel(level: number) {
  if (level >= 100) return 'Mythic';
  if (level >= 80) return 'King';
  if (level >= 60) return 'Legend';
  if (level >= 40) return 'Beast';
  if (level >= 25) return 'Buff';
  if (level >= 15) return 'Strong';
  if (level >= 8) return 'Regular';
  if (level >= 3) return 'Rookie';
  return 'Baby';
}

function getMilestoneTitle(level: number) {
  if (level >= 100) return 'Mythic Form';
  if (level >= 80) return 'King Form';
  if (level >= 60) return 'Legend Form';
  if (level >= 40) return 'Beast Form';
  if (level >= 25) return 'Buff Form';
  if (level >= 15) return 'Strong Form';
  if (level >= 8) return 'Regular Form';
  if (level >= 3) return 'Rookie Form';
  return 'Baby Form';
}

export default function GymRatGallery({ onBack }: GymRatGalleryProps) {
  const totalXP = getTotalXP();
  const currentLevel = getLevelFromXP(totalXP);
  const currentTier = getTierFromLevel(currentLevel);

  return (
    <div className="min-h-screen bg-[#0a0d12] px-4 pb-8 pt-5 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80">
            <Sparkles size={16} />
            Level Gallery
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(245,158,11,0.10),rgba(255,255,255,0.03))] p-6 shadow-[0_16px_60px_rgba(0,0,0,0.35)]">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                <Zap size={14} />
                Progression archive
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight">
                Your GymRat evolution
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                Every level is supposed to feel like real progress. This gallery shows the long-term
                path, while your current hero reflects your active identity, gear and background.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/80">
                    Current level
                  </div>
                  <div className="mt-1 text-2xl font-black text-white">LVL {currentLevel}</div>
                </div>

                <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/80">
                    Current tier
                  </div>
                  <div className="mt-1 text-2xl font-black text-white">{currentTier}</div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/20 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.22)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-white">Current Hero</div>
                  <div className="mt-1 text-xs text-white/55">
                    Live preview with active equipment and background
                  </div>
                </div>

                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                  Active
                </div>
              </div>

              <EquippedRatPreview className="mx-auto w-full max-w-[360px]" />
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-200" />
            <h2 className="text-lg font-bold text-white">Milestones</h2>
          </div>

          <div className="mt-2 text-sm text-white/55">
            These are the forms your GymRat grows through over time.
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {milestoneLevels.map((level) => {
              const unlocked = currentLevel >= level;
              const current = currentLevel === level;

              return (
                <div
                  key={level}
                  className={`rounded-[26px] border p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition ${
                    current
                      ? 'border-emerald-400/25 bg-emerald-400/10'
                      : unlocked
                      ? 'border-white/10 bg-white/[0.04]'
                      : 'border-white/8 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                        Level milestone
                      </div>
                      <div className="mt-1 text-2xl font-black text-white">LVL {level}</div>
                    </div>

                    {current ? (
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                        Current
                      </span>
                    ) : unlocked ? (
                      <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
                        Unlocked
                      </span>
                    ) : (
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                        <span className="inline-flex items-center gap-1">
                          <Lock size={10} />
                          Locked
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex h-32 items-center justify-center rounded-[22px] border border-white/10 bg-black/20">
                    {unlocked ? (
                      <div className="flex flex-col items-center text-center">
                        <div className="text-5xl">🐀</div>
                        <div className="mt-2 text-sm font-bold text-white">
                          {getMilestoneTitle(level)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center text-white/45">
                        <Crown size={28} />
                        <div className="mt-2 text-sm font-semibold">
                          Unlock at level {level}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-bold text-white">
                      {getMilestoneTitle(level)}
                    </div>
                    <div className="mt-1 text-sm leading-6 text-white/55">
                      {unlocked
                        ? 'Reached. Your GymRat has already crossed this stage.'
                        : 'Still ahead. Keep training and stacking XP to reach this form.'}
                    </div>
                  </div>

                  {unlocked ? (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                      <Star size={11} />
                      Progress saved
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}