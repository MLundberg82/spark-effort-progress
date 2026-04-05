import { ChevronLeft, Crown, Flame, Lock, Target, Zap } from 'lucide-react';

type NutritionScreenProps = {
  onBack: () => void;
  onOpenPaywall: () => void;
};

function MacroCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/45">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-1 text-sm text-white/55">{hint}</p>
    </div>
  );
}

export default function NutritionScreen({
  onBack,
  onOpenPaywall,
}: NutritionScreenProps) {
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

          <div className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-yellow-300">
            Premium
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-md">
          <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.16),transparent_70%)]" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-yellow-300">
              <Crown className="h-3.5 w-3.5" />
              <span>Nutrition system</span>
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
              Fuel the progress
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/65">
              Nutrition is part of the deeper progression layer. Keep the free app clean,
              then unlock food tracking, macro goals and consistency tools when you want more.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <MacroCard
                label="Calories"
                value="2,450"
                hint="Daily target example"
              />
              <MacroCard
                label="Protein"
                value="180g"
                hint="Muscle-focused target"
              />
              <MacroCard
                label="Carbs"
                value="240g"
                hint="Training support"
              />
              <MacroCard
                label="Fat"
                value="70g"
                hint="Recovery + balance"
              />
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full border border-yellow-400/20 bg-yellow-400/10 p-2">
                  <Lock className="h-4 w-4 text-yellow-300" />
                </div>

                <div>
                  <p className="text-base font-bold text-white">
                    Included in Premium
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/62">
                    Unlock nutrition targets based on your goal, better daily tracking,
                    macro follow-up and more complete progress support.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center">
                  <Target className="mx-auto h-4 w-4 text-emerald-300" />
                  <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/45">
                    Goal based
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center">
                  <Flame className="mx-auto h-4 w-4 text-orange-300" />
                  <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/45">
                    Daily streak
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center">
                  <Zap className="mx-auto h-4 w-4 text-yellow-300" />
                  <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/45">
                    Macro focus
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenPaywall}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-[1.4rem] border border-yellow-300/20 bg-[linear-gradient(90deg,rgba(250,204,21,0.95),rgba(253,224,71,0.95))] px-5 py-4 text-base font-black tracking-[0.04em] text-black shadow-[0_18px_45px_rgba(250,204,21,0.18)] transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Crown className="h-5 w-5" />
              <span>Unlock Premium</span>
            </button>

            <p className="mt-3 text-center text-xs text-white/42">
              Premium should feel like a deeper layer — not friction for the free user.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}