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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-yellow-300/20 bg-yellow-300/10 text-yellow-100">
        {icon}
      </div>

      <div>
        <div className="text-sm font-black uppercase tracking-[0.12em] text-white">
          {title}
        </div>
        <div className="mt-1 text-xs leading-5 text-white/58">{subtitle}</div>
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
    <div className="fixed inset-0 z-50 bg-black/75 px-4 py-4 text-white">
      <div
        className="mx-auto flex h-full w-full max-w-2xl items-center justify-center"
        onClick={onClose}
      >
        <div
          onClick={(event) => event.stopPropagation()}
          className="w-full rounded-[30px] border border-yellow-300/15 bg-[#0d0d0d] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-yellow-100">
                <Crown className="h-3.5 w-3.5" />
                Premium
              </div>

              <h2 className="mt-3 text-2xl font-black tracking-tight">
                Unlock the heavier version
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/62">
                More identity, deeper tracking and a stronger progression layer without
                bloating the screen.
              </p>
            </div>

            <button
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.05] transition hover:bg-white/[0.08]"
              aria-label="Close premium"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <PerkRow
              icon={<Zap className="h-4 w-4" />}
              title="Progression boost"
              subtitle="Premium identity, cleaner progression moments and a stronger reward layer."
            />
            <PerkRow
              icon={<Star className="h-4 w-4" />}
              title="Deeper tracking"
              subtitle="History, nutrition and other premium tools live behind the upgrade layer."
            />
            <PerkRow
              icon={<Sparkles className="h-4 w-4" />}
              title="Cosmetic flex"
              subtitle="More ways to shape the rat through cosmetics, visual upgrades and status."
            />
            <PerkRow
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Trial ready"
              subtitle="Built to work with your premium flow and RevenueCat-ready purchase handling."
            />
          </div>

          <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
              Included
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-bold text-white/70 sm:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                Nutrition
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                History
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                Cosmetics
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                Premium aura
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onClose}
              className="inline-flex min-h-[50px] flex-1 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.05] px-5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
            >
              Continue free
            </button>

            <button
              onClick={onClose}
              className="inline-flex min-h-[50px] flex-[1.2] items-center justify-center rounded-[18px] bg-yellow-300 px-5 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:brightness-105"
            >
              Get premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}