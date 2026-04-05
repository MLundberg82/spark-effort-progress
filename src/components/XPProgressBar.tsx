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
    <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.24em] text-emerald-300/80">
            Progression
          </p>
          <h3 className="mt-1 text-lg font-black tracking-tight text-white">
            Level {level}
          </h3>
        </div>

        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-emerald-300">
          {safePercent.toFixed(0)}%
        </div>
      </div>

      <div className="relative overflow-hidden rounded-full border border-white/10 bg-white/5 p-1">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_60%)]" />
        <div className="h-4 overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#34d399_0%,#22c55e_45%,#a3e635_100%)] shadow-[0_0_22px_rgba(52,211,153,0.55)] transition-all duration-700 ease-out"
            style={{ width: `${safePercent}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
        <div>
          <p className="text-white/50">Current XP</p>
          <p className="font-bold text-white">
            {currentXP} <span className="text-white/35">/ {nextLevelXP}</span>
          </p>
        </div>

        <div className="text-right">
          <p className="text-white/50">Next level in</p>
          <p className="font-bold text-emerald-300">{xpLeft} XP</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/45">
          Status
        </span>
        <span className="text-[0.78rem] font-black uppercase tracking-[0.14em] text-white">
          Keep stacking reps
        </span>
      </div>
    </div>
  );
}