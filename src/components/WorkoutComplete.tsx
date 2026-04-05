import { Crown, Flame, Sparkles, Trophy } from 'lucide-react';

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

type Props = {
  summary: WorkoutCompleteSummary;
  onContinue: () => void;
  onOpenPaywall: () => void;
};

export default function WorkoutComplete({
  summary,
  onContinue,
  onOpenPaywall,
}: Props) {
  const hasPRs = Boolean(summary.prs && summary.prs.length > 0);

  return (
    <div className="min-h-screen bg-black px-5 py-5 text-white">
      <div className="mx-auto max-w-md">
        <div className="rounded-[32px] border border-white/10 bg-zinc-950/90 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.48)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-lime-200">
            <Flame className="h-3.5 w-3.5" />
            Workout complete
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight">
            Nice. You moved the rat forward.
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            {summary.workoutName} is done. Clean finish, stable save, and progress counted.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                Duration
              </div>
              <div className="mt-1 text-2xl font-black text-white">
                {summary.durationMinutes} min
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                Exercises
              </div>
              <div className="mt-1 text-2xl font-black text-white">
                {summary.exercisesCompleted}
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                <Sparkles className="h-3.5 w-3.5" />
                XP earned
              </div>
              <div className="mt-1 text-2xl font-black text-white">
                +{summary.earnedXP}
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                <Trophy className="h-3.5 w-3.5" />
                Volume
              </div>
              <div className="mt-1 text-2xl font-black text-white">
                {Math.round(summary.volume)}
              </div>
            </div>
          </div>

          {hasPRs ? (
            <div className="mt-5 rounded-[26px] border border-yellow-300/20 bg-yellow-300/10 p-4">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-yellow-100">
                <Trophy className="h-3.5 w-3.5" />
                PR unlocked
              </div>

              <div className="space-y-3">
                {summary.prs?.map((pr) => (
                  <div
                    key={`${pr.exercise}-${pr.newWeight}`}
                    className="rounded-[20px] border border-yellow-300/15 bg-black/20 px-4 py-3"
                  >
                    <div className="text-base font-black text-white">{pr.exercise}</div>
                    <div className="mt-1 text-sm text-yellow-100">
                      New best: {pr.newWeight} kg
                      {pr.previousBest > 0 ? ` · Previous: ${pr.previousBest} kg` : ' · First logged PR'}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={onOpenPaywall}
                className="mt-4 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[20px] border border-yellow-300/20 bg-yellow-300/10 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-yellow-100 transition hover:bg-yellow-300/15"
              >
                <Crown className="h-4 w-4" />
                See premium
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={onContinue}
            className="mt-5 inline-flex min-h-[58px] w-full items-center justify-center rounded-[24px] bg-lime-300 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.2)] transition hover:brightness-105"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}