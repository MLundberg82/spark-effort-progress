import { CalendarDays, ChevronLeft, Dumbbell, Flame, Trophy } from 'lucide-react';
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_30%),linear-gradient(180deg,#07110d_0%,#0b1511_38%,#050806_100%)] px-4 pb-8 pt-5 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-emerald-300">
            History
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-md">
          <h1 className="text-3xl font-black tracking-tight text-white">
            Your momentum
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/65">
            A clean progress view that makes effort feel real, not forgotten.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 flex items-center gap-2 text-white/55">
                <Dumbbell className="h-4 w-4" />
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em]">
                  Workouts
                </span>
              </div>
              <p className="text-2xl font-black tracking-tight text-white">
                {workouts.length}
              </p>
            </div>

            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 flex items-center gap-2 text-white/55">
                <Flame className="h-4 w-4" />
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em]">
                  Avg time
                </span>
              </div>
              <p className="text-2xl font-black tracking-tight text-white">
                {averageMinutes} min
              </p>
            </div>

            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 flex items-center gap-2 text-white/55">
                <CalendarDays className="h-4 w-4" />
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em]">
                  Total time
                </span>
              </div>
              <p className="text-2xl font-black tracking-tight text-emerald-300">
                {totalMinutes} min
              </p>
            </div>

            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 flex items-center gap-2 text-white/55">
                <Trophy className="h-4 w-4" />
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em]">
                  Volume
                </span>
              </div>
              <p className="text-2xl font-black tracking-tight text-yellow-300">
                {totalVolume} kg
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Recent sessions</h2>
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/40">
                Latest first
              </span>
            </div>

            {workouts.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center">
                <p className="text-base font-bold text-white">No workouts yet</p>
                <p className="mt-2 text-sm text-white/55">
                  Finish your first session and your progress history starts here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...workouts].reverse().map((workout, index) => (
                  <div
                    key={`${workout.completedAt}-${index}`}
                    className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-bold text-white">
                          {workout.workoutName}
                        </p>
                        <p className="mt-1 text-sm text-white/55">
                          {new Date(workout.completedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-emerald-300">
                        Done
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center">
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                          Duration
                        </p>
                        <p className="mt-1 text-sm font-bold text-white">
                          {workout.durationMinutes} min
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center">
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                          Exercises
                        </p>
                        <p className="mt-1 text-sm font-bold text-white">
                          {workout.exercisesCompleted}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center">
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                          Volume
                        </p>
                        <p className="mt-1 text-sm font-bold text-white">
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
    </div>
  );
}