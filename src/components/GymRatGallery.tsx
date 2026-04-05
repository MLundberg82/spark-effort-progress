import { useMemo } from 'react';
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
    <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 shadow-[0_14px_34px_rgba(0,0,0,0.22)]">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
        <span className="text-lime-300">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-xl font-black text-white">{value}</div>
    </div>
  );
}

function getCardAccent(level: number) {
  if (level >= 90) return 'from-yellow-300/20 via-orange-300/8 to-transparent';
  if (level >= 70) return 'from-fuchsia-300/18 via-violet-300/8 to-transparent';
  if (level >= 50) return 'from-lime-300/18 via-emerald-300/8 to-transparent';
  if (level >= 30) return 'from-sky-300/16 via-cyan-300/8 to-transparent';
  if (level >= 15) return 'from-white/12 via-lime-300/6 to-transparent';
  return 'from-white/10 via-white/5 to-transparent';
}

function MilestoneCard({
  level,
  currentLevel,
}: {
  level: number;
  currentLevel: number;
}) {
  const unlocked = currentLevel >= level;
  const current = currentLevel === level;
  const visual = getLevelVisual(level);

  return (
    <div
      className={`relative overflow-hidden rounded-[26px] border p-4 transition ${
        current
          ? 'border-lime-300/25 bg-lime-300/[0.06] shadow-[0_0_0_1px_rgba(163,230,53,0.08),0_18px_50px_rgba(0,0,0,0.24)]'
          : unlocked
          ? 'border-white/10 bg-white/[0.045] shadow-[0_16px_40px_rgba(0,0,0,0.2)]'
          : 'border-white/8 bg-white/[0.025] opacity-90'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${getCardAccent(level)}`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">
              Level milestone
            </div>
            <div className="mt-1 text-xl font-black text-white">LVL {level}</div>
          </div>

          <div
            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
              current
                ? 'border border-lime-300/20 bg-lime-300/10 text-lime-300'
                : unlocked
                ? 'border border-white/10 bg-white/[0.06] text-white/75'
                : 'border border-white/10 bg-black/20 text-white/45'
            }`}
          >
            {current ? 'Current' : unlocked ? 'Unlocked' : 'Locked'}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[22px] border border-white/10 bg-black/20">
            {unlocked ? (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(163,230,53,0.14),transparent_70%)]" />
                <EquippedRatPreview
                  level={level}
                  className="relative z-10 h-full w-full scale-[1.08] object-contain p-2"
                />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/30">
                <Lock className="h-7 w-7" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-black text-white">
              {unlocked ? visual.title : `Unlock at level ${level}`}
            </div>
            <div className="mt-1 text-sm leading-5 text-white/55">
              {unlocked
                ? visual.subtitle.replace(/\n/g, ' ')
                : 'Still ahead. Keep training and stacking XP to reach this form.'}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/70">
                {visual.tierLabel}
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/70">
                {visual.milestone}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GymRatGallery({ onBack }: GymRatGalleryProps) {
  const totalXP = getTotalXP();
  const currentLevel = getLevelFromXP(totalXP);
  const currentVisual = getLevelVisual(currentLevel);

  const milestoneColumns = useMemo(() => {
    const rows: number[][] = [];
    for (let i = 0; i < milestoneLevels.length; i += 2) {
      rows.push(milestoneLevels.slice(i, i + 2));
    }
    return rows;
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,rgba(132,204,22,0.14),transparent_28%),linear-gradient(180deg,#050505_0%,#0d0d0f_58%,#09090b_100%)] px-4 pb-8 pt-5 text-white">
      <div className="mx-auto max-w-md">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mt-4 overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-300">
            Progression archive
          </div>

          <h1 className="mt-2 text-3xl font-black leading-none text-white">
            Your GymRat evolution
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/60">
            See how every milestone form looks without turning the page into a long endless scroll.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <StatBadge
              icon={<Trophy className="h-3.5 w-3.5" />}
              label="Current level"
              value={`LVL ${currentLevel}`}
            />
            <StatBadge
              icon={<Star className="h-3.5 w-3.5" />}
              label="Current tier"
              value={currentVisual.tierLabel}
            />
            <StatBadge
              icon={<Zap className="h-3.5 w-3.5" />}
              label="Total XP"
              value={totalXP}
            />
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">
            Current hero
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(163,230,53,0.16),transparent_70%)]" />
              <EquippedRatPreview
                level={currentLevel}
                className="relative z-10 h-full w-full scale-[1.06] object-contain p-2"
              />
            </div>

            <div className="min-w-0">
              <div className="text-xl font-black text-white">{currentVisual.title}</div>
              <div className="mt-1 text-sm leading-5 text-white/55">
                {currentVisual.subtitle.replace(/\n/g, ' ')}
              </div>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-lime-300">
                <Sparkles className="h-3.5 w-3.5" />
                Active form
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">
            Archive
          </div>
          <div className="mt-2 text-2xl font-black text-white">Milestones</div>
          <div className="mt-2 text-sm leading-6 text-white/55">
            Compact two-column layout so you can preview each level without excessive scrolling.
          </div>

          <div className="mt-5 space-y-3">
            {milestoneColumns.map((pair, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {pair.map((level) => (
                  <MilestoneCard
                    key={level}
                    level={level}
                    currentLevel={currentLevel}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-[26px] border border-white/10 bg-black/20 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">
            Why this matters
          </div>
          <div className="mt-2 text-sm leading-6 text-white/58">
            Real progression should stay visible. You are not just gaining XP — you are evolving how your rat looks across the whole journey.
          </div>
        </div>
      </div>
    </div>
  );
}