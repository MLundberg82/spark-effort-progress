type XPProgressBarProps = {
  currentXP: number;
  nextLevelXP: number;
  level?: number;
  className?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function XPProgressBar({
  currentXP,
  nextLevelXP,
  level,
  className = '',
}: XPProgressBarProps) {
  const safeNext = Math.max(1, nextLevelXP);
  const progress = clamp((currentXP / safeNext) * 100, 0, 100);
  const xpLeft = Math.max(0, safeNext - currentXP);

  return (
    <div
      className={[
        'w-full rounded-[26px] border border-white/10 bg-black/35 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl',
        className,
      ].join(' ')}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
            XP Progress
          </p>
          <p className="truncate text-sm font-semibold text-white">
            {currentXP} / {safeNext} XP
          </p>
        </div>

        <div className="shrink-0 text-right">
          {typeof level === 'number' ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-lime-300/75">
              Level {level}
            </p>
          ) : null}
          <p className="text-xs text-white/55">{xpLeft} XP left</p>
        </div>
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-lime-300 via-emerald-400 to-yellow-300 transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
        <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/8" />
      </div>
    </div>
  );
}