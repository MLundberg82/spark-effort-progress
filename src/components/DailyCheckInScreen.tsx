export default function DailyCheckInScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_24%),linear-gradient(180deg,_#09090b_0%,_#0f172a_100%)] px-4 py-4 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-400">Daily Check-in</p>
            <h1 className="mt-1 text-2xl font-black">Momentum lives here</h1>
          </div>

          <button
            onClick={onBack}
            type="button"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
          >
            Back
          </button>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5">
          <p className="text-sm text-zinc-300">
            Här lägger vi senare:
          </p>
          <div className="mt-3 space-y-2 text-sm text-zinc-400">
            <p>• streak</p>
            <p>• dagens check-in</p>
            <p>• workouts count</p>
            <p>• recovery / mood / consistency</p>
          </div>
        </div>
      </div>
    </div>
  );
}