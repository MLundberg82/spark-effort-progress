import { CalendarDays, Dumbbell, Flame, Trophy } from 'lucide-react';
import { getWorkoutHistory } from '../lib/historyStore';

export default function HistoryScreen({ onBack }: { onBack: () => void }) {
  const workouts = getWorkoutHistory();

  const totalMinutes = workouts.reduce((sum, workout) => sum + workout.durationMinutes, 0);
  const totalVolume = workouts.reduce((sum, workout) => sum + workout.volume, 0);
  const averageMinutes = workouts.length > 0 ? Math.round(totalMinutes / workouts.length) : 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_24%),linear-gradient(180deg,_#09090b_0%,_#0f172a_100%)] px-4 py-4 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-400">History</p>
            <h1 className="mt-1 text-2xl font-black">Your momentum</h1>
          </div>

          <button
            onClick={onBack}
            type="button"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition hover:bg-white/10"
          >
            Back
          </button>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(52,211,153,0.14),transparent_18%),radial-gradient(circle_at_85%_20%,rgba(250,204,21,0.08),transparent_18%)]" />

          <div className="relative z-10">
            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Progress snapshot</p>
            <h2 className="mt-1 text-2xl font-black">Proof of consistency</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Every logged workout becomes visible momentum.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="mb-3 inline-flex rounded-2xl bg-emerald-400/10 p-2.5 text-emerald-300">
                  <Dumbbell className="h-4 w-4" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">Workouts</p>
                <p className="mt-1 text-2xl font-black">{workouts.length}</p>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="mb-3 inline-flex rounded-2xl bg-orange-500/10 p-2.5 text-orange-300">
                  <Flame className="h-4 w-4" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">Total minutes</p>
                <p className="mt-1 text-2xl font-black">{totalMinutes}</p>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="mb-3 inline-flex rounded-2xl bg-yellow-300/10 p-2.5 text-yellow-200">
                  <Trophy className="h-4 w-4" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">Total volume</p>
                <p className="mt-1 text-2xl font-black">{totalVolume}</p>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="mb-3 inline-flex rounded-2xl bg-emerald-400/10 p-2.5 text-emerald-300">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">Avg/session</p>
                <p className="mt-1 text-2xl font-black">{averageMinutes}m</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {workouts.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.24)]">
              <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-400">No history yet</p>
              <h3 className="mt-2 text-xl font-black">Start your first session</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Your workout history will turn into visible progression here.
              </p>
            </div>
          ) : (
            workouts.map((workout, index) => (
              <div
                key={workout.id}
                className={`overflow-hidden rounded-[28px] border p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)] ${
                  index === 0
                    ? 'border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 to-white/[0.05]'
                    : 'border-white/10 bg-white/[0.06]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-black">{workout.workoutName}</h2>
                      {index === 0 && (
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-300">
                          Latest
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-zinc-400">
                      {new Date(workout.completedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-right">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Duration</p>
                    <p className="text-sm font-bold">{workout.durationMinutes} min</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Exercises</p>
                    <p className="mt-1 text-2xl font-black">{workout.exercisesCompleted}</p>
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Volume</p>
                    <p className="mt-1 text-2xl font-black">{workout.volume}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.05] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
          <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-400">GymRat mindset</p>
          <h3 className="mt-2 text-xl font-black">Consistency becomes identity</h3>
          <p className="mt-2 text-sm text-zinc-400">
            One workout feels small. Repeated workouts become proof of who you are becoming.
          </p>
        </div>
      </div>
    </div>
  );
}