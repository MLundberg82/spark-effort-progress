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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/45">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-black tracking-tight text-white">{value}</div>
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
      className={`relative overflow-hidden rounded-[26px] border p-4 ${
        unlocked
          ? 'border-white/10 bg-white/[0.05]'
          : 'border-white/8 bg-white/[0.03]'
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${getCardAccent(
          level,
        )}`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
              Level milestone
            </div>
            <div className="mt-2 text-2xl font-black tracking-tight text-white">
              LVL {level}
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
              current
                ? 'border-lime-300/25 bg-lime-300/12 text-lime-100'
                : unlocked
                ? 'border-white/10 bg-white/[0.06] text-white/75'
                : 'border-white/8 bg-white/[0.04] text-white/45'
            }`}
          >
            {current ? 'Current' : unlocked ? 'Unlocked' : 'Locked'}
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-black/25 p-2">
          {unlocked ? (
            <EquippedRatPreview forcedLevel={level} />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center rounded-[18px] border border-dashed border-white/10 bg-black/30">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/45">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="text-xs font-black uppercase tracking-[0.12em] text-white/45">
                  Unlock at level {level}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/70">
            <Sparkles className="h-3 w-3" />
            {visual.tierLabel}
          </div>
        </div>

        <div className="mt-3 text-lg font-black tracking-tight text-white">
          {unlocked ? visual.title : `Unlock at level ${level}`}
        </div>

        <div className="mt-2 text-sm leading-6 text-white/60">
          {unlocked
            ? visual.subtitle.replace(/\n/g, ' ')
            : 'Still ahead. Keep training and stacking XP to reach this form.'}
        </div>
      </div>
    </div>
  );
}

export default function GymRatGallery({ onBack }: GymRatGalleryProps) {
  const totalXP = getTotalXP();
  const currentLevel = getLevelFromXP(totalXP);

  return (
    <div className="min-h-screen bg-black px-5 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/80 transition hover:bg-white/[0.08]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mt-5 rounded-[30px] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-lime-300/80">
            Gallery
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">All level forms</h1>
          <p className="mt-2 text-sm leading-6 text-white/65">
            See exactly how your GymRat evolves across every main milestone, even before it is unlocked.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatBadge
              icon={<Zap className="h-3.5 w-3.5" />}
              label="XP"
              value={totalXP}
            />
            <StatBadge
              icon={<Trophy className="h-3.5 w-3.5" />}
              label="Level"
              value={currentLevel}
            />
            <StatBadge
              icon={<Star className="h-3.5 w-3.5" />}
              label="Forms"
              value={milestoneLevels.length}
            />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {milestoneLevels.map((level) => (
              <MilestoneCard
                key={level}
                level={level}
                currentLevel={currentLevel}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}