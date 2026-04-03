const mockHistory = [
  { date: '2026-04-01', workout: 'Push Session', xp: 120, duration: '52 min' },
  { date: '2026-03-31', workout: 'Leg Day', xp: 150, duration: '61 min' },
  { date: '2026-03-29', workout: 'Pull Session', xp: 110, duration: '48 min' },
  { date: '2026-03-27', workout: 'Upper Hypertrophy', xp: 130, duration: '57 min' },
];

export default function WorkoutHistoryPage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 pb-24 pt-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
            Training
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Workout History
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            This page should later connect to the real log system and become much richer,
            but this gives you the right visual structure already.
          </p>
        </div>

        <div className="grid gap-4">
          {mockHistory.map((entry) => (
            <div
              key={`${entry.date}-${entry.workout}`}
              className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-bold text-white">{entry.workout}</div>
                  <div className="mt-1 text-xs text-zinc-400">{entry.date}</div>
                </div>

                <div className="flex gap-3">
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm font-semibold text-white">
                    {entry.duration}
                  </div>
                  <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-3 text-sm font-semibold text-fuchsia-100">
                    +{entry.xp} XP
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}