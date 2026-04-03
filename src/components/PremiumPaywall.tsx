import { X, Crown, Check } from 'lucide-react';

type PremiumPaywallProps = {
  open: boolean;
  onClose: () => void;
  onMonthly?: () => void;
  onYearly?: () => void;
  onRestore?: () => void;
};

export default function PremiumPaywall({
  open,
  onClose,
  onMonthly,
  onYearly,
  onRestore,
}: PremiumPaywallProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <button
        aria-label="Close paywall"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
      />

      <div className="relative z-10 w-full max-w-md rounded-[32px] border border-white/10 bg-zinc-950/95 p-5 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/80 transition hover:bg-white/10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 pr-10">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <Crown className="h-6 w-6" />
          </div>

          <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
            Premium
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
            Unlock the full GymRat experience
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Get nutrition tracking, workout history, premium gear and a more complete progression system.
          </p>
        </div>

        <div className="mb-5 space-y-2 rounded-3xl border border-white/8 bg-white/[0.03] p-4">
          {[
            'Nutrition tracking and macro support',
            'Workout history and progress overview',
            'Premium items and exclusive gear',
            'A smoother long-term progression experience',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Check className="h-4 w-4" />
              </div>
              <div className="text-sm text-white/90">{feature}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={onMonthly}
            className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-zinc-950 transition hover:scale-[1.01]"
          >
            Go Premium Monthly
          </button>

          <button
            onClick={onYearly}
            className="w-full rounded-2xl gradient-accent px-4 py-3 text-sm font-bold text-accent-foreground shadow-gold transition hover:scale-[1.01]"
          >
            Go Premium Yearly
          </button>

          <button
            onClick={onRestore}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.06]"
          >
            Restore purchases
          </button>

          <button
            onClick={onClose}
            className="w-full rounded-2xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:text-white"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}