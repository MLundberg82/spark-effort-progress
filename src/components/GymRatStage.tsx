import { getLevelVisual } from '@/lib/levelVisuals';

type GymRatStageProps = {
  level: number;
  className?: string;
  showMeta?: boolean;
  compact?: boolean;
};

export default function GymRatStage({
  level,
  className = '',
  showMeta = true,
  compact = false,
}: GymRatStageProps) {
  const visual = getLevelVisual(level);

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] ${className}`}
    >
      <div className={`absolute inset-0 ${visual.auraClass}`} />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.45))]" />

      <div
        className={`relative flex flex-col items-center justify-center px-6 ${
          compact ? 'py-6' : 'py-8'
        }`}
      >
        {showMeta ? (
          <div className="mb-3 rounded-full border border-emerald-400/15 bg-black/20 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300">
            {visual.tierLabel}
          </div>
        ) : null}

        <div
          className={`relative flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] ${
            compact ? 'h-44 w-44' : 'h-56 w-56'
          } ${visual.glowClass}`}
        >
          <div className="absolute inset-6 rounded-full border border-white/10 bg-white/[0.03]" />
          <span className={`${compact ? 'text-7xl' : 'text-8xl'} relative`}>
            🐀
          </span>
        </div>

        {!compact ? (
          <p className="mt-5 text-center text-sm text-white/58">
            Bigger rat. Bigger momentum. Bigger identity.
          </p>
        ) : null}
      </div>
    </div>
  );
}