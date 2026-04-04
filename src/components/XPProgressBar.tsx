type Props = {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  progressPercent: number;
};

export default function XPProgressBar({
  level,
  currentXP,
  nextLevelXP,
  progressPercent,
}: Props) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">Progression</p>
          <h3 className="mt-1 text-2xl font-black">Level {level}</h3>
        </div>

        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-300">XP</p>
          <p className="text-sm font-bold text-white">
            {currentXP} / {nextLevelXP}
          </p>
        </div>
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-yellow-300 transition-all duration-700"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
        <span>Lv. {level}</span>
        <span>{progressPercent}% to next level</span>
      </div>
    </div>
  );
}