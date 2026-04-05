import { ArrowLeft, CalendarDays, Dumbbell, Flame, Trophy } from 'lucide-react';
import { getWorkoutHistory } from '../lib/historyStore';

export default function HistoryScreen({ onBack }: { onBack: () => void }) {
  const workouts = getWorkoutHistory();
  const totalMinutes = workouts.reduce((sum, workout) => sum + workout.durationMinutes, 0);
  const totalVolume = workouts.reduce((sum, workout) => sum + workout.volume, 0);
  const averageMinutes = workouts.length > 0 ? Math.round(totalMinutes / workouts.length) : 0;

  return (
    <div className="min-h-screen bg-[#09090b] px-4 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-[430px]">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/10 px-3 py-2 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
              History
            </div>
            <div className="text-lg font-black leading-none">Momentum</div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
            Progress snapshot
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Your momentum</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Every logged workout becomes visible momentum.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
                <Trophy className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-xs text-zinc-400">Workouts</div>
              <div className="mt-1 text-lg font-bold">{workouts.length}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
                <Flame className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-xs text-zinc-400">Total minutes</div>
              <div className="mt-1 text-lg font-bold">{totalMinutes}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
                <Dumbbell className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-xs text-zinc-400">Total volume</div>
              <div className="mt-1 text-lg font-bold">{totalVolume}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
                <CalendarDays className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-xs text-zinc-400">Avg/session</div>
              <div className="mt-1 text-lg font-bold">{averageMinutes}m</div>
            </div>
          </div>

          {workouts.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="text-lg font-bold text-white">No history yet</div>
              <p className="mt-2 text-sm text-zinc-400">
                Start your first session and your workout history will turn into visible progression here.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {workouts.map((workout, index) => (
                <div
                  key={workout.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-white">{workout.workoutName}</h2>
                      <div className="mt-1 text-xs text-zinc-500">
                        {new Date(workout.completedAt).toLocaleString()}
                      </div>
                    </div>

                    {index === 0 ? (
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
                        Latest
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-zinc-400">Duration</div>
                      <div className="mt-1 font-semibold text-white">
                        {workout.durationMinutes} min
                      </div>
                    </div>

                    <div>
                      <div className="text-zinc-400">Exercises</div>
                      <div className="mt-1 font-semibold text-white">
                        {workout.exercisesCompleted}
                      </div>
                    </div>

                    <div>
                      <div className="text-zinc-400">Volume</div>
                      <div className="mt-1 font-semibold text-white">{workout.volume}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
              GymRat mindset
            </div>
            <h3 className="mt-2 text-lg font-bold text-white">Consistency becomes identity</h3>
            <p className="mt-2 text-sm text-zinc-400">
              One workout feels small. Repeated workouts become proof of who you are becoming.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}