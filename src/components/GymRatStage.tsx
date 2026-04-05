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
    <div className={`w-full ${className}`}>
      {showMeta ? (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
              {visual.tierLabel}
            </div>
            <h3 className="mt-1 text-2xl font-black tracking-tight text-white">
              {visual.title}
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-300">
              {visual.subtitle}
            </p>
          </div>

          <div className="shrink-0 rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
              LVL
            </div>
            <div className="mt-1 text-2xl font-black text-white">{level}</div>
          </div>
        </div>
      ) : null}

      <EquippedRatPreview
        level={level}
        variant={variant}
        className={compact ? 'mx-auto max-w-[320px]' : 'mx-auto'}
      />

      {showMeta ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
              Milestone
            </div>
            <div className="mt-1 text-lg font-black text-white">{visual.milestone}</div>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
              Tier
            </div>
            <div className="mt-1 text-lg font-black text-white">{visual.tierLabel}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}