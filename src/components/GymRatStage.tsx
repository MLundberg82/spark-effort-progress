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
  className,
  showMeta = true,
  compact = false,
}: GymRatStageProps) {
  const visual = getLevelVisual(level);

  return (
    <div className={`relative w-full ${className ?? ''}`}>
      <div
        className={`relative overflow-hidden border border-white/10 ${
          compact ? 'rounded-[1.8rem] p-3' : 'rounded-[2rem] p-4'
        } ${visual.backgroundClass} shadow-[0_24px_80px_rgba(0,0,0,0.42)]`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.08),transparent_24%)]" />
        <div
          className={`pointer-events-none absolute left-1/2 top-10 h-40 w-40 -translate-x-1/2 rounded-full bg-white/5 blur-3xl ${visual.glowClass}`}
        />

        {showMeta ? (
          <div className="relative z-10 mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/50">
                {visual.tierLabel}
              </p>
              <h3 className={`mt-1 font-black tracking-tight ${compact ? 'text-lg' : 'text-xl'} ${visual.accentClass}`}>
                {visual.title}
              </h3>
              <p className={`mt-1 max-w-[16rem] text-white/62 ${compact ? 'text-xs leading-5' : 'text-sm leading-6'}`}>
                {visual.subtitle}
              </p>
            </div>

            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white">
              LVL {level}
            </div>
          </div>
        ) : null}

        <div className={`relative z-10 mx-auto ${compact ? 'max-w-[12rem]' : 'max-w-[16rem]'}`}>
          <EquippedRatPreview
            level={level}
            variant={variant}
            className={compact ? 'scale-[1.02]' : 'scale-[1.08]'}
          />
        </div>

        {showMeta ? (
          <div className="relative z-10 mt-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-sm">
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/45">
                Milestone
              </p>
              <p className="mt-1 text-sm font-bold text-white">
                {visual.milestone}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/45">
                Tier
              </p>
              <p className={`mt-1 text-sm font-black ${visual.accentClass}`}>
                {visual.tierLabel}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}