import { useMemo, useState } from 'react';
import {
  Crown,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  Zap,
} from 'lucide-react';
import {
  checkPremium,
  getPremiumPackages,
  getSelectedPremiumPackage,
  purchasePremiumPackage,
  restorePremiumPurchases,
  setSelectedPremiumPackage,
  type PremiumPackageType,
} from '@/lib/premiumStore';

type PremiumPaywallProps = {
  open: boolean;
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
    <div className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white">
        {icon}
      </div>

      <div>
        <div className="text-sm font-black uppercase tracking-[0.08em] text-white">
          {title}
        </div>
        <div className="mt-1 text-sm leading-5 text-white/55">{subtitle}</div>
      </div>
    </div>
  );
}

function PackageCard({
  title,
  durationLabel,
  badge,
  priceFallback,
  selected,
  onClick,
}: {
  title: string;
  durationLabel: string;
  badge: string;
  priceFallback: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-[22px] border px-4 py-4 text-left transition ${
        selected
          ? 'border-lime-300/25 bg-lime-300/[0.08] shadow-[0_0_0_1px_rgba(163,230,53,0.08)]'
          : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]'
      }`}
    >
      <div>
        <div className="text-sm font-black uppercase tracking-[0.1em] text-white">
          {title}
        </div>
        <div className="mt-1 text-sm text-white/55">{durationLabel}</div>
        <div className="mt-2 text-sm font-semibold text-white/72">{priceFallback}</div>
      </div>

      <div
        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
          selected
            ? 'border border-lime-300/20 bg-lime-300/10 text-lime-300'
            : 'border border-white/10 bg-black/20 text-white/60'
        }`}
      >
        {badge}
      </div>
    </button>
  );
}

export default function PremiumPaywall({
  open,
  onClose,
}: PremiumPaywallProps) {
  const premiumState = checkPremium();
  const packages = useMemo(() => getPremiumPackages(), []);
  const [selectedPackage, setSelectedPackageState] = useState<PremiumPackageType>(
    getSelectedPremiumPackage(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    premiumState.isActive ? 'Premium is already active on this account.' : '',
  );

  if (!open) return null;

  const handleSelectPackage = (packageType: PremiumPackageType) => {
    setSelectedPackageState(packageType);
    setSelectedPremiumPackage(packageType);
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    setStatusMessage('');

    try {
      const result = await purchasePremiumPackage(selectedPackage);

      if (result.ok) {
        setStatusMessage(
          selectedPackage === 'monthly'
            ? 'Monthly premium activated.'
            : 'Yearly premium activated.',
        );
        onClose();
        return;
      }

      setStatusMessage('Could not activate premium right now.');
    } catch {
      setStatusMessage('Something went wrong while starting premium.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    setStatusMessage('');

    try {
      const result = await restorePremiumPurchases();

      if (result.ok) {
        setStatusMessage('Premium restored.');
        onClose();
        return;
      }

      setStatusMessage(result.reason ?? 'No premium purchase found.');
    } catch {
      setStatusMessage('Could not restore purchases right now.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-[3px]"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="relative max-h-[80dvh] w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,#0b0b0d_0%,#111214_100%)] shadow-[0_28px_100px_rgba(0,0,0,0.5)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Premium Paywall"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(163,230,53,0.16),transparent_30%)]" />
        <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-yellow-300/10 blur-3xl" />
        <div className="absolute -left-10 top-24 h-36 w-36 rounded-full bg-lime-300/10 blur-3xl" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white transition hover:border-white/20 hover:bg-white/[0.1] active:scale-[0.98]"
          aria-label="Close premium"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-10 flex max-h-[80dvh] flex-col overflow-hidden">
          <div className="px-5 pb-4 pt-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-yellow-200">
              <Crown className="h-3.5 w-3.5 text-yellow-300" />
              Premium
            </div>

            <h1 className="mt-4 text-3xl font-black leading-none text-white">
              Unlock the
              <span className="ml-2 text-lime-300">heavier version</span>
            </h1>

            <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">
              More identity. More progression. More reasons to keep training.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5">
            <div className="space-y-3">
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  title={pkg.title}
                  durationLabel={pkg.durationLabel}
                  badge={pkg.badge}
                  priceFallback={pkg.priceFallback}
                  selected={selectedPackage === (pkg.id.includes('monthly') ? 'monthly' : 'yearly')}
                  onClick={() =>
                    handleSelectPackage(
                      pkg.id.includes('monthly') ? 'monthly' : 'yearly',
                    )
                  }
                />
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <PerkRow
                icon={<Zap className="h-4 w-4 text-lime-300" />}
                title="Custom workouts"
                subtitle="Build your own sessions instead of only preset flows."
              />

              <PerkRow
                icon={<Sparkles className="h-4 w-4 text-violet-300" />}
                title="Premium cosmetics"
                subtitle="Unlock stronger visual identity, outfits, aura and backgrounds."
              />

              <PerkRow
                icon={<Star className="h-4 w-4 text-sky-300" />}
                title="History and nutrition"
                subtitle="Get the deeper progression tools that make the app feel complete."
              />

              <PerkRow
                icon={<ShieldCheck className="h-4 w-4 text-yellow-300" />}
                title="Premium momentum"
                subtitle="A cleaner, more rewarding version built to keep you engaged."
              />
            </div>

            {statusMessage ? (
              <div className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75">
                {statusMessage}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handlePurchase}
              disabled={isLoading}
              className="mt-5 inline-flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[24px] bg-lime-300 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[0_20px_55px_rgba(163,230,53,0.2)] transition hover:brightness-105 active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Crown className="h-4 w-4" />
              {isLoading
                ? 'Starting…'
                : selectedPackage === 'monthly'
                ? 'Get Premium Monthly'
                : 'Get Premium Yearly'}
            </button>

            <button
              type="button"
              onClick={handleRestore}
              disabled={isLoading}
              className="mt-3 inline-flex min-h-[52px] w-full items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white/80 transition hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Restore Purchases
            </button>

            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex min-h-[52px] w-full items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white/80 transition hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.995]"
            >
              Continue Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}