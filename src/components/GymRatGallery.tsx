import { ArrowLeft, Lock, Sparkles, Star, Trophy, Zap } from 'lucide-react';
import type { ReactNode } from 'react';

import EquippedRatPreview from '@/components/EquippedRatPreview';
import { getLevelFromXP, getTotalXP } from '@/lib/gamificationStore';
import { getLevelVisual, MILESTONE_LEVELS } from '@/lib/levelVisuals';

type GymRatGalleryProps = {
  onBack: () => void;
};

type StatBadgeProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
};

function StatBadge({ icon, label, value }: StatBadgeProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm">
      <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-lg font-semibold text-white">{value}</div>
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

function LevelTile({ level, currentLevel }: { level: number; currentLevel: number }) {
  const unlocked = currentLevel >= level;
  const current = currentLevel === level;
  const visual = getLevelVisual(level);

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border px-4 py-4 transition-all ${{
        true: 'border-lime-300/30 bg-white/[0.06] shadow-[0_20px_40px_rgba(132,204,22,0.14)]',
        false: unlocked
          ? 'border-white/10 bg-white/[0.04] shadow-[0_16px_34px_rgba(0,0,0,0.24)]'
          : 'border-white/8 bg-white/[0.025] shadow-[0_12px_28px_rgba(0,0,0,0.24)]',
      }[String(current) as 'true' | 'false']}`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${getCardAccent(level)}`} />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
            {visual.tierLabel}
          </div>
          <div className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            LVL {level}
          </div>
        </div>

        <div
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
            current
              ? 'border-lime-300/35 bg-lime-300/10 text-lime-200'
              : unlocked
                ? 'border-white/15 bg-white/10 text-white/70'
                : 'border-white/10 bg-black/20 text-white/45'
          }`}
        >
          {!unlocked ? <Lock className="h-3.5 w-3.5" /> : null}
          <span>{current ? 'Current' : unlocked ? 'Unlocked' : 'Locked'}</span>
        </div>
      </div>

      <div className="relative z-10 mt-4 rounded-[24px] border border-white/8 bg-black/20 p-3">
        <div className={`relative mx-auto h-40 w-full overflow-hidden rounded-[20px] ${unlocked ? '' : 'grayscale opacity-55'}`}>
          <EquippedRatPreview level={level} className="h-full w-full" />
          {!unlocked ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/28">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                <Lock className="h-3.5 w-3.5" />
                <span>Locked</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 mt-4">
        <div className="text-lg font-semibold text-white">{visual.title}</div>
        <p className="mt-2 text-sm leading-6 text-white/62">
          {unlocked ? visual.subtitle.replace(/\n/g, ' ') : `Unlock at level ${level} to reveal this form.`}
        </p>
      </div>
    </div>
  );
}

export default function GymRatGallery({ onBack }: GymRatGalleryProps) {
  const totalXP = getTotalXP();
  const currentLevel = getLevelFromXP(totalXP);
  const unlockedForms = MILESTONE_LEVELS.filter((level) => currentLevel >= level).length;

  return (
    <div className="relative min-h-full overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(163,230,53,0.10),_transparent_32%),linear-gradient(180deg,_rgba(14,14,16,0.98),_rgba(5,5,5,1))] p-4 text-white shadow-[0_28px_70px_rgba(0,0,0,0.45)] sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_36%)]" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/45">
            Gallery
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">All level forms</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/62">
            Every main rat form is visible here. Unlocked forms stay clear, locked forms stay greyed out with a small lock.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          aria-label="Back to menu"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-3 gap-3">
        <StatBadge icon={<Zap className="h-3.5 w-3.5" />} label="XP" value={totalXP} />
        <StatBadge icon={<Star className="h-3.5 w-3.5" />} label="Level" value={currentLevel} />
        <StatBadge icon={<Trophy className="h-3.5 w-3.5" />} label="Forms" value={`${unlockedForms}/${MILESTONE_LEVELS.length}`} />
      </div>

      <div className="relative z-10 mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
          <Sparkles className="h-3.5 w-3.5 text-lime-300/80" />
          <span>Milestones</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {MILESTONE_LEVELS.map((level) => (
            <LevelTile key={level} level={level} currentLevel={currentLevel} />
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to menu</span>
        </button>
      </div>
    </div>
  );
}
