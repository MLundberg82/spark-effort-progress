export default function PremiumPage() {
  const features = [
    'Exclusive aura effects',
    'Premium-only cosmetic drops',
    'Advanced workout history',
    'Full nutrition tracking',
    'Macro goals and premium insights',
    'Higher-status visual unlocks',
  ];

  return (
    <div className="min-h-screen bg-zinc-950 px-4 pb-24 pt-6 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[32px] border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/12 via-violet-500/8 to-white/[0.04] p-6 sm:p-8">
          <div className="text-[10px] uppercase tracking-[0.28em] text-fuchsia-200/80">
            Premium
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight">
            Unlock the full GymRat fantasy
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300">
            Premium should not feel like a tiny upgrade. It should feel like access to the
            deeper progression layer of the whole app.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
              >
                <div className="text-sm font-semibold text-white">{feature}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button className="rounded-2xl bg-white px-5 py-4 text-sm font-bold text-zinc-950 transition hover:scale-[1.01]">
              Start Monthly Premium
            </button>
            <button className="rounded-2xl border border-white/12 bg-white/5 px-5 py-4 text-sm font-bold text-white transition hover:bg-white/10">
              Start Yearly Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}