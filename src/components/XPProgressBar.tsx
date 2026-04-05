type Props = {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  progressPercent: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function XPProgressBar({
  level,
  currentXP,
  nextLevelXP,
  progressPercent,
}: Props) {
  const safePercent = clamp(progressPercent, 0, 100);
  const xpLeft = Math.max(0, nextLevelXP - currentXP);

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/40">
            Progression
          </p>
          <h3 className="mt-1 text-lg font-black text-white">Level {level}</h3>
        </div>

        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
          {safePercent}%
        </div>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#4ade80,#22c55e,#86efac)] transition-all duration-500"
          style={{ width: `${safePercent}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-white/55">
        <span>
          {currentXP} / {nextLevelXP} XP
        </span>
        <span>{xpLeft} XP left</span>
      </div>
    </div>
  );
}