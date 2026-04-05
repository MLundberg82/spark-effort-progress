export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-emerald-400/20 bg-[radial-gradient(circle_at_top,rgba(74,222,128,0.25),rgba(255,255,255,0.04))] shadow-[0_0_80px_rgba(74,222,128,0.18)]">
          <span className="text-4xl">🐀</span>
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.34em] text-emerald-300/80">
          GymRat
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight">
          LEVEL UP IRL
        </h1>

        <p className="mt-3 text-sm text-white/60">
          Loading gains...
        </p>

        <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full animate-pulse rounded-full bg-emerald-400" />
        </div>
      </div>
    </div>
  );
}