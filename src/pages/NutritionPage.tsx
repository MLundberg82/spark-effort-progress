const cards = [
  { label: 'Calories', value: '2,340', target: '2,600 target' },
  { label: 'Protein', value: '182g', target: '190g target' },
  { label: 'Carbs', value: '211g', target: '260g target' },
  { label: 'Fat', value: '71g', target: '80g target' },
];

export default function NutritionPage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 pb-24 pt-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
            Nutrition
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Fuel the build
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            This should later connect to your real food logging and macro system, but the structure
            below gives the page the right premium direction now.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                {card.label}
              </div>
              <div className="mt-2 text-3xl font-black text-white">{card.value}</div>
              <div className="mt-1 text-xs text-zinc-400">{card.target}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6">
          <div className="text-lg font-bold text-white">
            Premium nutrition should feel useful, not decorative.
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Macro targets, meal history, daily compliance score, visual streaks and smart suggestions
            are all things we can layer in next.
          </p>
        </div>
      </div>
    </div>
  );
}