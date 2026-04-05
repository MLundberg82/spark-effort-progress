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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-lg font-black text-white">{value}</div>
    </div>
  );
}

export default function GymRatGallery({ onBack }: GymRatGalleryProps) {
  const totalXP = getTotalXP();
  const currentLevel = getLevelFromXP(totalXP);
  const currentVisual = getLevelVisual(currentLevel);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.16),_transparent_30%),linear-gradient(180deg,_#09090b_0%,_#111113_100%)] px-4 py-5 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">
            <Sparkles className="h-4 w-4" />
            <span>Progression archive</span>
          </div>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Your GymRat evolution
          </h1>

          <p className="mt-3 max-w-3xl text-sm text-zinc-300 sm:text-base">
            Every form should feel earned. This gallery shows the long-term path,
            while your current hero reflects your active identity, gear and background.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatBadge
              icon={<Zap className="h-4 w-4 text-emerald-300" />}
              label="Current level"
              value={`LVL ${currentLevel}`}
            />
            <StatBadge
              icon={<Star className="h-4 w-4 text-yellow-300" />}
              label="Current tier"
              value={currentVisual.tierLabel}
            />
            <StatBadge
              icon={<Trophy className="h-4 w-4 text-orange-300" />}
              label="Total XP"
              value={totalXP}
            />
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.3)]">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Current hero
            </p>
            <h2 className="mt-2 text-2xl font-black">Live preview with active equipment and background</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Active form · {currentVisual.title} · {currentVisual.subtitle}
            </p>
          </div>

          <div className="mx-auto max-w-md">
            <EquippedRatPreview level={currentLevel} />
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.3)]">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Archive
            </p>
            <h2 className="mt-2 text-2xl font-black">Milestones</h2>
            <p className="mt-2 text-sm text-zinc-400">
              These are the forms your GymRat grows through over time.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {milestoneLevels.map((level) => {
              const unlocked = currentLevel >= level;
              const current = currentLevel === level;
              const visual = getLevelVisual(level);

              return (
                <div
                  key={level}
                  className={`rounded-[26px] border p-4 ${
                    current
                      ? 'border-emerald-400/30 bg-emerald-400/10'
                      : 'border-white/10 bg-black/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                        Level milestone
                      </p>
                      <h3 className="mt-2 text-xl font-black text-white">
                        LVL {level}
                      </h3>
                    </div>

                    <div
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                        current
                          ? 'bg-emerald-400 text-black'
                          : unlocked
                          ? 'bg-white text-black'
                          : 'bg-white/10 text-zinc-300'
                      }`}
                    >
                      {current ? 'Current' : unlocked ? 'Unlocked' : 'Locked'}
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]">
                    {unlocked ? (
                      <EquippedRatPreview level={level} className="border-0 bg-transparent" />
                    ) : (
                      <div className="flex aspect-square items-center justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] text-zinc-500">
                        <div className="text-center">
                          <Lock className="mx-auto h-10 w-10" />
                          <p className="mt-3 text-sm font-semibold">Locked form</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="font-bold text-white">
                      {unlocked ? visual.title : `Unlock at level ${level}`}
                    </p>
                    <p className="mt-2 text-sm text-zinc-400">
                      {unlocked
                        ? 'Reached. Your GymRat has already crossed this stage.'
                        : 'Still ahead. Keep training and stacking XP to reach this form.'}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-300">
                      {visual.tierLabel}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-300">
                      {visual.milestone}
                    </span>
                    {current ? (
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                        Current form
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 text-zinc-300">
          <h3 className="text-lg font-black text-white">
            Real progression should stay visible
          </h3>
          <p className="mt-2 text-sm">
            The point of this gallery is to make the long journey feel real. You are not just gaining XP.
            You are evolving your identity.
          </p>
        </div>
      </div>
    </div>
  );
}