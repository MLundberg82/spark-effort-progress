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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-black text-white">{value}</div>
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
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-3">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${getCardAccent(
          level,
        )}`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
              {visual.tierLabel}
            </div>
            <div className="mt-1 text-sm font-black text-white">LVL {level}</div>
          </div>

          <div
            className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${
              current
                ? 'border border-lime-400/30 bg-lime-400/12 text-lime-100'
                : unlocked
                  ? 'border border-white/10 bg-white/[0.08] text-white/75'
                  : 'border border-white/10 bg-black/25 text-white/45'
            }`}
          >
            {current ? 'Current' : unlocked ? 'Unlocked' : 'Locked'}
          </div>
        </div>

        <div className="mt-3">
          <div className="mx-auto aspect-square w-full max-w-[112px] overflow-hidden rounded-[20px] border border-white/10 bg-black/25">
            {unlocked ? (
              <EquippedRatPreview level={level} className="h-full w-full" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-white/45">
                  <Lock className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.14em]">
                    Unlock
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="truncate text-xs font-black uppercase tracking-[0.12em] text-white/80">
            {visual.title}
          </div>
          <div className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/55">
            {unlocked
              ? visual.subtitle.replace(/\n/g, ' ')
              : `Unlock at level ${level} to reveal this form.`}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GymRatGallery({ onBack }: GymRatGalleryProps) {
  const totalXP = getTotalXP();
  const currentLevel = getLevelFromXP(totalXP);

  return (
    <div className="min-h-screen bg-black px-4 pb-6 pt-4 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-5xl flex-col">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-start justify-between gap-3">
            <button
              onClick={onBack}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.05] transition hover:bg-white/[0.08]"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1 text-center">
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-lime-300/80">
                Gallery
              </div>
              <h1 className="mt-1 text-2xl font-black tracking-tight">All level forms</h1>
              <p className="mt-2 text-sm text-white/62">
                Compact overview of every main milestone with visible thumbnails.
              </p>
            </div>

            <div className="h-11 w-11" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <StatBadge icon={<Zap className="h-3.5 w-3.5" />} label="XP" value={totalXP} />
            <StatBadge
              icon={<Star className="h-3.5 w-3.5" />}
              label="Level"
              value={currentLevel}
            />
            <StatBadge
              icon={<Trophy className="h-3.5 w-3.5" />}
              label="Forms"
              value={milestoneLevels.length}
            />
          </div>

          <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-3">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
              <Sparkles className="h-3.5 w-3.5" />
              Milestones
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {milestoneLevels.map((level) => (
                <LevelTile key={level} level={level} currentLevel={currentLevel} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto flex justify-end pt-4">
          <button
            onClick={onBack}
            className="inline-flex min-h-[48px] items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.05] px-5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
          >
            Back to menu
          </button>
        </div>
      </div>
    </div>
  );
}