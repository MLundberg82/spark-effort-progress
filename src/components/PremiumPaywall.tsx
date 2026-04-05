import { useEffect, useMemo, useState } from 'react';
import { Crown, Check, Sparkles, Dumbbell, History, Apple, Wand2, X, Loader2 } from 'lucide-react';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  checkPremium,
} from '@/lib/premiumStore';
import {
  getPaywallHeadline,
  getPaywallSubheadline,
  markPaywallShown,
  type PaywallTrigger,
} from '@/lib/paywallStore';

type RevenueCatPackage = {
  identifier: string;
  packageType?: string;
  product: {
    identifier: string;
    title?: string;
    priceString?: string;
  };
};

type PremiumPaywallProps = {
  open: boolean;
  onClose: () => void;
  trigger?: PaywallTrigger;
  onUnlocked?: () => void;
};

function normalizePackageType(value?: string) {
  return (value || '').toUpperCase();
}

function findMonthlyPackage(packages: RevenueCatPackage[]) {
  return (
    packages.find((pkg) => normalizePackageType(pkg.packageType) === 'MONTHLY') ||
    packages.find((pkg) => pkg.product.identifier.toLowerCase().includes('month')) ||
    packages[0] ||
    null
  );
}

function findYearlyPackage(packages: RevenueCatPackage[]) {
  return (
    packages.find((pkg) => normalizePackageType(pkg.packageType) === 'ANNUAL') ||
    packages.find((pkg) => normalizePackageType(pkg.packageType) === 'YEARLY') ||
    packages.find((pkg) => {
      const id = pkg.product.identifier.toLowerCase();
      return id.includes('year') || id.includes('annual');
    }) ||
    null
  );
}

export default function PremiumPaywall({
  open,
  onClose,
  trigger = 'manual',
  onUnlocked,
}: PremiumPaywallProps) {
  const [packages, setPackages] = useState<RevenueCatPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const benefits = useMemo(
    () => [
      {
        icon: <Apple className="h-4 w-4" />,
        title: 'Nutrition',
        text: 'Macros, tracking and food progress.',
      },
      {
        icon: <History className="h-4 w-4" />,
        title: 'History',
        text: 'Full workout history and better progress review.',
      },
      {
        icon: <Dumbbell className="h-4 w-4" />,
        title: 'Custom Workouts',
        text: 'Build your own sessions your way.',
      },
      {
        icon: <Sparkles className="h-4 w-4" />,
        title: 'XP Boost',
        text: 'Faster progression and stronger reward feeling.',
      },
      {
        icon: <Wand2 className="h-4 w-4" />,
        title: 'Premium Cosmetics',
        text: 'Exclusive visual upgrades included with Premium.',
      },
      {
        icon: <Crown className="h-4 w-4" />,
        title: 'Premium Identity',
        text: 'More status, better look, more reward.',
      },
    ],
    []
  );

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const loadOfferings = async () => {
      setError(null);

      try {
        const offerings = await getOfferings();
        const available = (offerings?.current?.availablePackages || []) as RevenueCatPackage[];

        if (!cancelled) {
          setPackages(available);
          markPaywallShown();
        }
      } catch (err) {
        if (!cancelled) {
          setError('Could not load Premium offers right now.');
        }
      }
    };

    void loadOfferings();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const monthlyPackage = useMemo(() => findMonthlyPackage(packages), [packages]);
  const yearlyPackage = useMemo(() => findYearlyPackage(packages), [packages]);

  const handlePurchase = async (pkg: RevenueCatPackage | null) => {
    if (!pkg || loading) return;

    setLoading(true);
    setError(null);

    try {
      const success = await purchasePackage(pkg);

      if (success || checkPremium()) {
        onUnlocked?.();
        onClose();
        return;
      }

      setError('Purchase was not completed.');
    } catch (err) {
      setError('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (restoring) return;

    setRestoring(true);
    setError(null);

    try {
      const restored = await restorePurchases();

      if (restored || checkPremium()) {
        onUnlocked?.();
        onClose();
        return;
      }

      setError('No active purchase was found to restore.');
    } catch (err) {
      setError('Restore failed. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  if (!open) return null;

  const headline = getPaywallHeadline(trigger);
  const subheadline = getPaywallSubheadline(trigger);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-3 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative flex h-[82vh] w-full max-w-md flex-col overflow-hidden rounded-[32px] border border-white/10 bg-zinc-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(163,230,53,0.18),transparent_70%)] pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Close premium paywall"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex-1 overflow-hidden px-5 pb-5 pt-6 sm:px-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-lime-400/20 bg-lime-400/10 text-lime-300">
            <Crown className="h-7 w-7" />
          </div>

          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lime-300/80">
              GymRat Premium
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              {headline}
            </h2>
            <p className="mx-auto mt-2 max-w-[28rem] text-sm leading-6 text-zinc-300">
              {subheadline}
            </p>
          </div>

          <div className="mt-5 grid gap-2.5">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-3"
              >
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-lime-400/10 text-lime-300">
                  {benefit.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{benefit.title}</p>
                  <p className="text-xs leading-5 text-zinc-400">{benefit.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/8 px-4 py-3">
            <p className="text-sm font-semibold text-amber-200">
              Premium should feel visible
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-100/80">
              Premium is not only features. It should also unlock cosmetics, identity and cleaner status visuals in the app.
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="border-t border-white/8 bg-black/20 px-5 py-4 sm:px-6">
          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => void handlePurchase(monthlyPackage)}
              disabled={!monthlyPackage || loading || restoring}
              className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 px-4 py-3 text-sm font-bold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {monthlyPackage
                ? `Start Monthly • ${monthlyPackage.product.priceString || ''}`.trim()
                : 'Monthly package not found'}
            </button>

            <button
              type="button"
              onClick={() => void handlePurchase(yearlyPackage)}
              disabled={!yearlyPackage || loading || restoring}
              className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
              {yearlyPackage
                ? `Best Value • ${yearlyPackage.product.priceString || ''}`.trim()
                : 'Yearly package not found'}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-xs">
            <button
              type="button"
              onClick={() => void handleRestore()}
              disabled={loading || restoring}
              className="font-medium text-zinc-300 transition hover:text-white disabled:opacity-60"
            >
              {restoring ? 'Restoring…' : 'Restore purchases'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="font-medium text-zinc-500 transition hover:text-zinc-300"
            >
              Continue free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}