type Props = {
  level: number;
  currentXP: number;
  nextLevelXP: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function XPProgressBar({
  level,
  currentXP,
  nextLevelXP,
}: Props) {
  const safeNext = Math.max(1, nextLevelXP);
  const progressPercent = clamp((currentXP / safeNext) * 100, 0, 100);
  const xpLeft = Math.max(0, safeNext - currentXP);

  return (
    <div className="rounded-[24px] border border-white/10 bg-zinc-950/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500">
            Progression
          </p>
          <h3 className="mt-1 text-lg font-black text-white">Level {level}</h3>
        </div>

        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            Progress
          </p>
          <p className="mt-1 text-lg font-black text-emerald-300">
            {progressPercent.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="mt-4 h-4 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-300 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            Current XP
          </p>
          <p className="mt-1 font-semibold text-white">
            {currentXP} / {safeNext}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            Next level in
          </p>
          <p className="mt-1 font-semibold text-white">{xpLeft} XP</p>
        </div>
      </div>

      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
        Status · Keep stacking reps
      </p>
    </div>
  );
}