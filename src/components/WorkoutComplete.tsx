import { Crown, Dumbbell, Flame, Sparkles, Trophy } from 'lucide-react';

export default function WorkoutComplete({
  summary,
  onGoHome,
  onOpenPaywall,
}: {
  summary: {
    workoutName: string;
    durationMinutes: number;
    exercisesCompleted: number;
    volume: number;
    earnedXP: number;
  };
  onGoHome: () => void;
  onOpenPaywall: () => void;
}) {
  const coinsEarned = Math.max(10, Math.floor(summary.earnedXP / 5));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_28%),linear-gradient(180deg,_#09090b_0%,_#0f172a_100%)] px-4 py-8 text-white">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.06] p-6 text-center shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(52,211,153,0.18),transparent_20%),radial-gradient(circle_at_50%_62%,rgba(250,204,21,0.12),transparent_26%)]" />
          <div className="absolute left-1/2 top-20 h-40 w-40 -translate-x-1/2 rounded-full bg-emerald-400/12 blur-3xl" />
          <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-yellow-300/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 shadow-[0_0_60px_rgba(52,211,153,0.18)]">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-zinc-950/80 text-5xl">
                ⚡
              </div>
            </div>

            <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-400">Workout complete</p>
            <h1 className="mt-3 text-4xl font-black leading-none">+{summary.earnedXP} XP</h1>
            <p className="mt-2 text-sm text-zinc-400">{summary.workoutName}</p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-yellow-300/15 bg-yellow-300/10 px-4 py-2 text-sm font-semibold text-yellow-200">
              <Sparkles className="h-4 w-4" />
              Real effort turned into progression
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-left">
                <div className="mb-3 inline-flex rounded-2xl bg-emerald-400/10 p-2.5 text-emerald-300">
                  <Dumbbell className="h-4 w-4" />
                </div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">Exercises</p>
                <p className="mt-1 text-2xl font-black">{summary.exercisesCompleted}</p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-left">
                <div className="mb-3 inline-flex rounded-2xl bg-orange-500/10 p-2.5 text-orange-300">
                  <Flame className="h-4 w-4" />
                </div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">Minutes</p>
                <p className="mt-1 text-2xl font-black">{summary.durationMinutes}</p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-left">
                <div className="mb-3 inline-flex rounded-2xl bg-yellow-400/10 p-2.5 text-yellow-300">
                  <Trophy className="h-4 w-4" />
                </div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">Volume</p>
                <p className="mt-1 text-2xl font-black">{summary.volume}</p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-left">
                <div className="mb-3 inline-flex rounded-2xl bg-lime-400/10 p-2.5 text-lime-300">
                  <Sparkles className="h-4 w-4" />
                </div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">Coins earned</p>
                <p className="mt-1 text-2xl font-black">+{coinsEarned}</p>
              </div>
            </div>

            <div className="mt-5 rounded-[26px] border border-emerald-400/15 bg-emerald-400/8 p-4 text-left">
              <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-300">GymRat feedback</p>
              <h2 className="mt-2 text-xl font-black">You showed up. You progressed.</h2>
              <p className="mt-2 text-sm text-zinc-300">
                This is the core of GymRat: every real session builds your body, your streak and your identity.
              </p>
            </div>

            <button
              onClick={onGoHome}
              type="button"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[24px] bg-gradient-to-r from-emerald-400 via-lime-300 to-yellow-300 px-5 py-4 text-base font-black text-black shadow-[0_12px_40px_rgba(132,204,22,0.25)] transition hover:scale-[1.01]"
            >
              <Dumbbell className="h-5 w-5" />
              Back home
            </button>

            <button
              onClick={onOpenPaywall}
              type="button"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-[24px] border border-amber-300/20 bg-gradient-to-r from-amber-300/12 to-yellow-300/10 px-5 py-4 font-semibold text-amber-200 transition hover:bg-amber-300/15"
            >
              <Crown className="h-5 w-5" />
              Unlock XP Boost with Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}