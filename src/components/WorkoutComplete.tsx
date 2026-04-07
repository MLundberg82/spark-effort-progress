import { Flame, Sparkles, Trophy } from 'lucide-react';

type WorkoutCompleteSummary = {
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
  earnedXP: number;
  prs?: Array<{
    exercise: string;
    newWeight: number;
    previousBest: number;
  }>;
};

type WorkoutCompleteProps = {
  summary: WorkoutCompleteSummary;
  onContinue: () => void;
  onOpenPaywall: () => void;
};

function StatTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 text-[22px] font-black text-white">{value}</div>
    </div>
  );
}

export default function WorkoutComplete({
  summary,
  onContinue,
  onOpenPaywall,
}: WorkoutCompleteProps) {
  const hasPRs = Boolean(summary.prs && summary.prs.length > 0);

  return (
    <div className="min-h-screen bg-black px-5 py-5 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-md flex-col">
        <div className="rounded-[28px] border border-white/10 bg-zinc-950/90 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.48)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-lime-200">
            <Flame className="h-3.5 w-3.5" />
            Workout complete
          </div>

          <h1 className="mt-3 text-[30px] font-black tracking-tight text-white">
            Nice. You moved the rat forward.
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-300">
            {summary.workoutName} is done. Clean finish, stable save, and progress counted.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatTile label="Duration" value={`${summary.durationMinutes} min`} />
            <StatTile label="Exercises" value={String(summary.exercisesCompleted)} />
            <StatTile
              label="XP earned"
              value={`+${summary.earnedXP}`}
              icon={<Sparkles className="h-3.5 w-3.5" />}
            />
            <StatTile
              label="Volume"
              value={String(Math.round(summary.volume))}
              icon={<Trophy className="h-3.5 w-3.5" />}
            />
          </div>

          {hasPRs ? (
            <button
              type="button"
              onClick={onOpenPaywall}
              className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[16px] border border-yellow-300/20 bg-yellow-300/12 px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-yellow-50 transition hover:bg-yellow-300/16"
            >
              See premium
            </button>
          ) : null}
        </div>

        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex min-h-[68px] w-full items-center justify-center rounded-[20px] bg-lime-300 px-5 py-4 text-[14px] font-black uppercase tracking-[0.16em] text-black shadow-[0_20px_50px_rgba(163,230,53,0.16)] transition hover:brightness-105"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}