import {
  Crown,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  Zap,
} from 'lucide-react';

type PremiumPaywallProps = {
  isOpen: boolean;
  onClose: () => void;
};

function PerkRow({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-yellow-300/20 bg-yellow-300/10 text-yellow-100">
        {icon}
      </div>

      <div className="min-w-0">
        <div className="text-sm font-black uppercase tracking-[0.08em] text-white">
          {title}
        </div>
        <div className="mt-1 text-xs leading-5 text-white/60">{subtitle}</div>
      </div>
    </div>
  );
}

export default function PremiumPaywall({
  isOpen,
  onClose,
}: PremiumPaywallProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close premium overlay"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      <div className="absolute inset-x-4 top-1/2 mx-auto w-auto max-w-xl -translate-y-1/2">
        <div
          className="overflow-hidden rounded-[30px] border border-white/10 bg-[#0a0a0a] text-white shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
          role="dialog"
          aria-modal="true"
          aria-label="Premium Paywall"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="relative border-b border-white/10 px-5 pb-5 pt-5">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Close premium paywall"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-yellow-100">
              <Crown className="h-3.5 w-3.5" />
              Premium
            </div>

            <h2 className="mt-3 max-w-md text-3xl font-black tracking-tight">
              Unlock the heavier version
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-white/65">
              More identity. More progression. More reasons to keep training.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-lime-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              Trial ready
            </div>
          </div>

          <div className="grid gap-3 px-5 py-4 sm:grid-cols-2">
            <PerkRow
              icon={<Zap className="h-4 w-4" />}
              title="Custom workouts"
              subtitle="Build your own sessions instead of only preset flows."
            />
            <PerkRow
              icon={<Sparkles className="h-4 w-4" />}
              title="Premium cosmetics"
              subtitle="Unlock stronger visual identity, outfits, aura and backgrounds."
            />
            <PerkRow
              icon={<Star className="h-4 w-4" />}
              title="History and nutrition"
              subtitle="Get the deeper progression tools that make the app feel complete."
            />
            <PerkRow
              icon={<Crown className="h-4 w-4" />}
              title="Premium momentum"
              subtitle="A cleaner, more rewarding version built to keep you engaged."
            />
          </div>

          <div className="border-t border-white/10 px-5 py-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="inline-flex min-h-[52px] items-center justify-center rounded-[22px] bg-lime-300 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.2)] transition hover:brightness-105"
              >
                Get Premium
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[52px] items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
              >
                Continue Free
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}