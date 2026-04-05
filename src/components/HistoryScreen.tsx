import { ArrowLeft, CalendarDays, Dumbbell, Flame, Trophy } from 'lucide-react';
import { getWorkoutHistory } from '../lib/historyStore';

export default function HistoryScreen({ onBack }: { onBack: () => void }) {
  const workouts = getWorkoutHistory();
  const totalMinutes = workouts.reduce(
    (sum, workout) => sum + workout.durationMinutes,
    0
  );
  const totalVolume = workouts.reduce((sum, workout) => sum + workout.volume, 0);
  const averageMinutes =
    workouts.length > 0 ? Math.round(totalMinutes / workouts.length) : 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.14),_transparent_30%),linear-gradient(180deg,_#09090b_0%,_#111113_100%)] px-4 py-5 text-white">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            History
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Your momentum
          </h1>
          <p className="mt-3 text-sm text-zinc-300 sm:text-base">
            A clean progress view that makes effort feel real, not forgotten.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              <Trophy className="h-4 w-4 text-emerald-300" />
              Workouts
            </div>
            <p className="mt-3 text-2xl font-black text-white">{workouts.length}</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              <CalendarDays className="h-4 w-4 text-sky-300" />
              Avg time
            </div>
            <p className="mt-3 text-2xl font-black text-white">{averageMinutes} min</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              <Dumbbell className="h-4 w-4 text-yellow-300" />
              Total time
            </div>
            <p className="mt-3 text-2xl font-black text-white">{totalMinutes} min</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              <Flame className="h-4 w-4 text-orange-300" />
              Volume
            </div>
            <p className="mt-3 text-2xl font-black text-white">{totalVolume} kg</p>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.3)]">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Recent sessions
            </p>
            <h2 className="mt-2 text-2xl font-black">Latest first</h2>
          </div>

          {workouts.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-6 text-center">
              <h3 className="text-lg font-black text-white">No workouts yet</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Finish your first session and your progress history starts here.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-black text-white">
                        {workout.workoutName}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        {new Date(workout.completedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                      Done
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                        Duration
                      </p>
                      <p className="mt-1 font-semibold text-white">
                        {workout.durationMinutes} min
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                        Exercises
                      </p>
                      <p className="mt-1 font-semibold text-white">
                        {workout.exercisesCompleted}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                        Volume
                      </p>
                      <p className="mt-1 font-semibold text-white">
                        {workout.volume} kg
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}