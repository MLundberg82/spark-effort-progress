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
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
            Progression
          </div>
          <div className="mt-1 text-xl font-black tracking-tight">Level {level}</div>
        </div>

        <div className="text-right">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
            Progress
          </div>
          <div className="mt-1 text-xl font-black tracking-tight">
            {progressPercent.toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-lime-300 transition-[width] duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
            Current XP
          </div>
          <div className="mt-1 text-lg font-black">
            {currentXP} / {safeNext}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
            Next level in
          </div>
          <div className="mt-1 text-lg font-black">{xpLeft} XP</div>
        </div>
      </div>

      <div className="mt-3 text-xs font-bold text-white/45">
        Status · Keep stacking reps
      </div>
    </div>
  );
}