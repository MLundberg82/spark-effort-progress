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
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
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
    <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-zinc-950/90 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <div className={`absolute inset-0 bg-gradient-to-br ${getCardAccent(level)}`} />
      <div className="relative z-10">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
              Level milestone
            </div>
            <div className="mt-1 text-2xl font-black tracking-tight text-white">LVL {level}</div>
          </div>

          <div
            className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${
              current
                ? 'border-lime-300/30 bg-lime-300/14 text-lime-200'
                : unlocked
                  ? 'border-white/10 bg-white/[0.06] text-white'
                  : 'border-white/10 bg-white/[0.04] text-zinc-400'
            }`}
          >
            {current ? 'Current' : unlocked ? 'Unlocked' : 'Locked'}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-3">
          {unlocked ? (
            <EquippedRatPreview level={level} className="mx-auto max-w-[260px]" />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center rounded-[20px] border border-dashed border-white/10 bg-black/20 text-zinc-400">
              <div className="text-center">
                <Lock className="mx-auto h-8 w-8" />
                <div className="mt-2 text-sm font-semibold">Unlock at level {level}</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
            {visual.tierLabel}
          </div>
          <div className="mt-1 text-xl font-black tracking-tight text-white">
            {unlocked ? visual.title : `Unlock at level ${level}`}
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {unlocked
              ? visual.subtitle.replace(/\n/g, ' ')
              : 'Still ahead. Keep training and stacking XP to reach this form.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GymRatGallery({ onBack }: GymRatGalleryProps) {
  const totalXP = getTotalXP();
  const currentLevel = getLevelFromXP(totalXP);

  return (
    <div className="min-h-screen bg-black px-5 py-5 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-lime-200">
            <Sparkles className="h-3.5 w-3.5" />
            Gallery
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-zinc-950/90 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.48)]">
          <h1 className="text-3xl font-black tracking-tight">All level forms</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            See exactly how your GymRat evolves across the main milestones.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <StatBadge icon={<Zap className="h-3.5 w-3.5" />} label="XP" value={totalXP} />
            <StatBadge icon={<Trophy className="h-3.5 w-3.5" />} label="Level" value={currentLevel} />
            <StatBadge icon={<Star className="h-3.5 w-3.5" />} label="Forms" value={milestoneLevels.length} />
          </div>

          <div className="mt-5 space-y-4">
            {milestoneLevels.map((level) => (
              <MilestoneCard key={level} level={level} currentLevel={currentLevel} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}