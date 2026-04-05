import EquippedRatPreview from '@/components/EquippedRatPreview';
import { getLevelVisual } from '@/lib/levelVisuals';
import type { RatVariant } from '@/lib/assetTypes';

type GymRatStageProps = {
  level: number;
  variant?: RatVariant;
  className?: string;
  showMeta?: boolean;
  compact?: boolean;
};

export default function GymRatStage({
  level,
  variant,
  className = '',
  showMeta = true,
  compact = false,
}: GymRatStageProps) {
  const visual = getLevelVisual(level);

  return (
    <div className={`rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 ${className}`}>
      {showMeta ? (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              {visual.tierLabel}
            </p>
            <h3 className="mt-1 text-xl font-black text-white">
              {visual.title}
            </h3>
            <p className="mt-1 text-sm text-zinc-400">{visual.subtitle}</p>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
              LVL
            </p>
            <p className="text-lg font-black text-white">{level}</p>
          </div>
        </div>
      ) : null}

      <div className={compact ? 'scale-[0.94]' : ''}>
        <EquippedRatPreview level={level} variant={variant} />
      </div>

      {showMeta ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              Milestone
            </p>
            <p className="mt-1 font-semibold text-white">{visual.milestone}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              Tier
            </p>
            <p className="mt-1 font-semibold text-white">{visual.tierLabel}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}