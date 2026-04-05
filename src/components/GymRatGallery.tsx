import { ArrowLeft, Lock, Sparkles, Star, Trophy, Zap } from 'lucide-react';
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
    <div className="min-h-screen bg-[#09090b] px-4 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-[430px]">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/10 px-3 py-2 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
              Level Gallery
            </div>
            <div className="text-lg font-black leading-none">Archive</div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
            Progression archive
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Your GymRat evolution</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Every level is supposed to feel like real progress. This gallery shows the long-term path, while your current hero reflects your active identity, gear and background.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
                <Zap className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-xs text-zinc-400">Current level</div>
              <div className="mt-1 text-lg font-bold">LVL {currentLevel}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
                <Trophy className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-xs text-zinc-400">Current tier</div>
              <div className="mt-1 text-lg font-bold">{currentTier}</div>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">Current Hero</div>
                <div className="mt-1 text-xs text-zinc-400">
                  Live preview with active equipment and background
                </div>
              </div>

              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
                Active
              </span>
            </div>

            <EquippedRatPreview />
          </div>

          <div className="mt-5">
            <div className="text-sm font-semibold text-white">Milestones</div>
            <p className="mt-1 text-sm text-zinc-400">
              These are the forms your GymRat grows through over time.
            </p>

            <div className="mt-4 space-y-3">
              {milestoneLevels.map((level) => {
                const unlocked = currentLevel >= level;
                const current = currentLevel === level;

                return (
                  <div
                    key={level}
                    className={`rounded-3xl border p-4 ${
                      unlocked
                        ? 'border-emerald-400/15 bg-emerald-400/[0.07]'
                        : 'border-white/10 bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300/80">
                          Level milestone
                        </div>
                        <div className="mt-1 text-xl font-black">LVL {level}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {current ? (
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
                            Current
                          </span>
                        ) : unlocked ? (
                          <span className="rounded-full border border-white/10 bg-white/[0.08] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                            Unlocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/15 bg-yellow-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-yellow-200">
                            <Lock className="h-3 w-3" />
                            Locked
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-start gap-3">
                      <div className="inline-flex rounded-2xl bg-white/[0.05] p-3">
                        {unlocked ? (
                          <Star className="h-5 w-5 text-emerald-300" />
                        ) : (
                          <Sparkles className="h-5 w-5 text-zinc-500" />
                        )}
                      </div>

                      <div>
                        <div className="text-base font-bold text-white">
                          {unlocked ? getMilestoneTitle(level) : `Unlock at level ${level}`}
                        </div>
                        <p className="mt-1 text-sm text-zinc-400">
                          {unlocked
                            ? 'Reached. Your GymRat has already crossed this stage.'
                            : 'Still ahead. Keep training and stacking XP to reach this form.'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}