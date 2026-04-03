import { X, Crown, Check, Sparkles } from 'lucide-react';

type PremiumPaywallProps = {
  open: boolean;
  onClose: () => void;
  onMonthly?: () => void;
  onYearly?: () => void;
  onRestore?: () => void;
};

const PREMIUM_FEATURES = [
  'Training history and progress overview',
  'Nutrition logging with macro targets',
  '2x XP boost on completed workouts',
  'Premium gear, auras and exclusive cosmetics',
  'Advanced workout tools and premium unlocks',
];

export default function PremiumPaywall({
  open,
  onClose,
  onMonthly,
  onYearly,
  onRestore,
}: PremiumPaywallProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close paywall"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
      />

      <div className="relative z-10 w-full max-w-sm rounded-[28px] border border-white/10 bg-zinc-950/96 p-4 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/80 transition hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pr-10">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <Crown className="h-5 w-5" />
          </div>

          <div className="mt-3 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
            GymRat Premium
          </div>

          <h2 className="mt-1 text-xl font-black tracking-tight text-white">
            Unlock more without blocking the app
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Premium adds the deeper features. You can always close this and keep using the free version.
          </p>
        </div>

        <div className="mt-4 rounded-3xl border border-white/8 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
            <Sparkles className="h-4 w-4" />
            Included in Premium
          </div>

          <div className="space-y-2">
            {PREMIUM_FEATURES.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div className="text-sm text-white/90">{feature}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={onMonthly}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
          >
            Go Premium Monthly
          </button>

          <button
            type="button"
            onClick={onYearly}
            className="w-full rounded-xl gradient-accent px-4 py-2.5 text-sm font-bold text-accent-foreground shadow-gold transition hover:scale-[1.01]"
          >
            Go Premium Yearly
          </button>

          <button
            type="button"
            onClick={onRestore}
            className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.04]"
          >
            Restore purchases
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 transition hover:text-white"
          >
            Continue with free version
          </button>
        </div>
      </div>
    </div>
  );
}