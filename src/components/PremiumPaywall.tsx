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
    <div className="flex items-start gap-3 rounded-[16px] border border-white/10 bg-white/[0.03] px-3 py-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-yellow-300/20 bg-yellow-300/10 text-yellow-100">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-black text-white">{title}</div>
        <div className="mt-1 text-xs leading-5 text-white/72">{subtitle}</div>
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
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/72 px-4 py-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-[420px] rounded-[28px] border border-yellow-300/18 bg-[#0a0a0a] p-4 text-white shadow-[0_30px_100px_rgba(0,0,0,0.56)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close premium"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/78 transition hover:bg-white/[0.08]"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="pr-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/18 bg-yellow-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-100">
            <Crown className="h-3.5 w-3.5" />
            Premium
          </div>

          <h2 className="mt-3 text-[28px] font-black tracking-tight text-white">
            Go heavier
          </h2>

          <p className="mt-2 text-sm leading-5 text-white/74">
            More progression, better identity and stronger retention hooks.
          </p>
        </div>

        <div className="mt-4 space-y-2.5">
          <PerkRow
            icon={<Zap className="h-4 w-4" />}
            title="XP boost"
            subtitle="Push progression faster with premium momentum."
          />
          <PerkRow
            icon={<Sparkles className="h-4 w-4" />}
            title="Cosmetics"
            subtitle="Better glows, outfits and premium identity."
          />
          <PerkRow
            icon={<ShieldCheck className="h-4 w-4" />}
            title="More tools"
            subtitle="History, nutrition and premium utility stack."
          />
          <PerkRow
            icon={<Star className="h-4 w-4" />}
            title="Premium feel"
            subtitle="The fuller GymRat experience."
          />
        </div>

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            className="inline-flex min-h-[52px] items-center justify-center rounded-[16px] bg-lime-300 px-4 py-3 text-[12px] font-black uppercase tracking-[0.16em] text-black transition hover:brightness-105"
          >
            Get premium
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[48px] items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-white/[0.08]"
          >
            Continue free
          </button>
        </div>
      </div>
    </div>
  );
}