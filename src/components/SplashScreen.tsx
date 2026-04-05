export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.18),_transparent_30%),linear-gradient(180deg,_#09090b_0%,_#111113_100%)] px-6 text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 shadow-[0_0_60px_rgba(74,222,128,0.22)]">
          <span className="text-4xl">🐀</span>
        </div>

        <h1 className="mt-6 text-4xl font-black tracking-tight">
          GymRat
        </h1>

        <p className="mt-2 text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">
          Level up IRL
        </p>

        <p className="mt-4 max-w-xs text-sm text-zinc-400">
          Loading gains...
        </p>

        <div className="mt-8 h-2 w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-300" />
        </div>
      </div>
    </div>
  );
}