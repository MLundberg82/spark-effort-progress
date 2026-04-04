export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-400/15 shadow-[0_0_80px_rgba(52,211,153,0.25)]">
          <span className="text-4xl">🐀</span>
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-400">GymRat</p>
        <h1 className="mt-3 text-4xl font-black">LEVEL UP IRL</h1>
        <p className="mt-2 text-sm text-zinc-400">Loading gains...</p>
      </div>
    </div>
  );
}