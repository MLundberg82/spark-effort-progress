import { ArrowLeft, Lock, Sparkles, Star, Trophy, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import EquippedRatPreview from '@/components/EquippedRatPreview';
import { getLevelFromXP, getMilestoneLevels, getTotalXP } from '@/lib/gamificationStore';
import { getLevelVisual } from '@/lib/levelVisuals';

type GymRatGalleryProps = {
  onBack: () => void;
};

function StatBadge({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.035] px-3 py-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function getCardAccent(level: number) {
  if (level >= 90) return 'from-yellow-300/18 via-orange-300/6 to-transparent';
  if (level >= 70) return 'from-fuchsia-300/16 via-violet-300/6 to-transparent';
  if (level >= 50) return 'from-lime-300/16 via-emerald-300/6 to-transparent';
  if (level >= 30) return 'from-sky-300/14 via-cyan-300/6 to-transparent';
  if (level >= 15) return 'from-white/10 via-lime-300/5 to-transparent';
  return 'from-white/8 via-white/4 to-transparent';
}

function LevelTile({
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
    <div className="relative overflow-hidden rounded-[24px] border border-white/8 p-3">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${getCardAccent(level)} opacity-90`} />
      <div
        className={`relative overflow-hidden rounded-[24px] border p-3 ${
          unlocked
            ? 'border-white/12 bg-[#080a10] shadow-[0_16px_36px_rgba(0,0,0,0.25)]'
            : 'border-white/8 bg-[#05070c] opacity-80'
        }`}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">{visual.tierLabel}</div>
            <div className="mt-1 text-xs font-semibold text-white/60">LVL {level}</div>
          </div>
          <div
            className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
              current
                ? 'border border-lime-300/20 bg-lime-300/[0.08] text-lime-200'
                : unlocked
                  ? 'border border-white/10 bg-white/[0.04] text-white/70'
                  : 'border border-white/8 bg-white/[0.03] text-white/45'
            }`}
          >
            {current ? 'Current' : unlocked ? 'Unlocked' : 'Locked'}
          </div>
        </div>

        <div className="relative mb-3 overflow-hidden rounded-[20px] border border-white/10 bg-black/30 p-2">
          <div className={unlocked ? '' : 'grayscale'}>
            <EquippedRatPreview level={level} className="mx-auto aspect-square w-full max-w-[160px]" />
          </div>
          {!unlocked ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/28 backdrop-blur-[1px]">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-black/45 text-white/80">
                <Lock className="h-5 w-5" />
              </div>
            </div>
          ) : null}
        </div>

        <div className="text-sm font-semibold text-white">{visual.title}</div>
        <div className="mt-1 min-h-[38px] text-xs leading-5 text-white/58">
          {unlocked ? visual.subtitle.replace(/\n/g, ' ') : `Unlock at level ${level} to reveal this form.`}
        </div>
      </div>
    </div>
  );
}

export default function GymRatGallery({ onBack }: GymRatGalleryProps) {
  const totalXP = getTotalXP();
  const currentLevel = getLevelFromXP(totalXP);
  const milestoneLevels = getMilestoneLevels();

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,rgba(132,204,22,0.08),transparent_26%),linear-gradient(180deg,#05070c_0%,#04050a_100%)] px-4 pb-5 pt-4 text-white">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white transition hover:border-white/16 hover:bg-white/[0.06]"
          aria-label="Back to menu"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex-1 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-lime-200/80">Gallery</div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">All level forms</h1>
          <p className="mt-1 text-sm text-white/55">Compact overview of every main milestone with visible thumbnails.</p>
        </div>

        <div className="h-11 w-11" />
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2.5">
        <StatBadge icon={<Zap className="h-3.5 w-3.5 text-lime-300" />} label="XP" value={totalXP} />
        <StatBadge icon={<Trophy className="h-3.5 w-3.5 text-amber-300" />} label="Level" value={currentLevel} />
        <StatBadge icon={<Star className="h-3.5 w-3.5 text-white/65" />} label="Forms" value={milestoneLevels.length} />
      </div>

      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">
        <Sparkles className="h-4 w-4 text-lime-300" />
        <span>Milestones</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {milestoneLevels.map((level) => (
          <LevelTile key={level} level={level} currentLevel={currentLevel} />
        ))}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-5 inline-flex w-full items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.035] px-4 py-3.5 text-sm font-semibold text-white transition hover:border-white/16 hover:bg-white/[0.06]"
      >
        Back to menu
      </button>
    </div>
  );
}
