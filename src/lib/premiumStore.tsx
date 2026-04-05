import { useEffect, useMemo, useState } from 'react';
import {
  Crown,
  Dumbbell,
  Flame,
  LineChart,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  X,
} from 'lucide-react';

import {
  closePaywall,
  getLastPaywallTrigger,
  getPaywallHeadline,
  getPaywallSubtext,
  subscribePaywall,
} from '@/lib/PayWallStore';
import {
  getOfferings,
  getRevenueCatConfigSummary,
  getRevenueCatEntitlementStatus,
  purchasePackage,
  restoreRevenueCatPurchases,
  type RevenueCatPackage,
} from '@/revenuecat';

export type PremiumSource = 'manual' | 'test' | 'revenuecat' | 'restore';

export type PremiumState = {
  isActive: boolean;
  source: PremiumSource | null;
  entitlementId: string | null;
  packageIdentifier: string | null;
  activatedAt: string | null;
  updatedAt: string | null;
};

type PremiumPaywallProps = {
  open: boolean;
  onClose: () => void;
};

const STORAGE_KEY = 'gymrat-premium-state';
const EVENT_NAME = 'premium-updated';

const DEFAULT_STATE: PremiumState = {
  isActive: false,
  source: null,
  entitlementId: null,
  packageIdentifier: null,
  activatedAt: null,
  updatedAt: null,
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function readState(): PremiumState {
  if (!isBrowser()) return DEFAULT_STATE;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;

    const parsed = JSON.parse(raw) as Partial<PremiumState>;

    return {
      isActive: Boolean(parsed.isActive),
      source:
        parsed.source === 'manual' ||
        parsed.source === 'test' ||
        parsed.source === 'revenuecat' ||
        parsed.source === 'restore'
          ? parsed.source
          : null,
      entitlementId:
        typeof parsed.entitlementId === 'string' ? parsed.entitlementId : null,
      packageIdentifier:
        typeof parsed.packageIdentifier === 'string'
          ? parsed.packageIdentifier
          : null,
      activatedAt: typeof parsed.activatedAt === 'string' ? parsed.activatedAt : null,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(next: PremiumState) {
  if (!isBrowser()) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  localStorage.setItem('gymrat-premium-active', String(next.isActive));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
}

export function subscribePremium(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handler = () => callback();

  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

export function checkPremium(): PremiumState {
  return readState();
}

export function activatePremium(input?: {
  source?: PremiumSource;
  entitlementId?: string | null;
  packageIdentifier?: string | null;
}) {
  const current = readState();
  const timestamp = new Date().toISOString();

  const next: PremiumState = {
    isActive: true,
    source: input?.source ?? 'manual',
    entitlementId: input?.entitlementId ?? current.entitlementId ?? null,
    packageIdentifier: input?.packageIdentifier ?? current.packageIdentifier ?? null,
    activatedAt: current.activatedAt ?? timestamp,
    updatedAt: timestamp,
  };

  writeState(next);
  return next;
}

export function deactivatePremium() {
  const next: PremiumState = {
    ...DEFAULT_STATE,
    updatedAt: new Date().toISOString(),
  };

  writeState(next);
  return next;
}

export async function syncPremiumFromRevenueCat() {
  const entitlement = await getRevenueCatEntitlementStatus();

  if (entitlement.isActive) {
    return activatePremium({
      source: 'revenuecat',
      entitlementId: entitlement.entitlementId,
    });
  }

  return deactivatePremium();
}

export async function restorePremiumFromRevenueCat() {
  const restored = await restoreRevenueCatPurchases();

  if (!restored.ok) {
    return {
      ok: false as const,
      reason: restored.reason,
    };
  }

  const entitlement = await getRevenueCatEntitlementStatus();

  if (entitlement.isActive) {
    activatePremium({
      source: 'restore',
      entitlementId: entitlement.entitlementId,
    });

    return {
      ok: true as const,
      state: checkPremium(),
    };
  }

  return {
    ok: false as const,
    reason: 'failed' as const,
  };
}

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
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] text-white">
          {icon}
        </div>

        <div>
          <div className="text-sm font-black uppercase tracking-[0.14em] text-white">
            {title}
          </div>
          <div className="mt-1 text-sm leading-6 text-zinc-300">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

function PackageCard({
  title,
  subtitle,
  packageInfo,
  isRecommended = false,
  isBusy = false,
  onPress,
}: {
  title: string;
  subtitle: string;
  packageInfo: RevenueCatPackage | null;
  isRecommended?: boolean;
  isBusy?: boolean;
  onPress: () => void;
}) {
  const price = packageInfo?.priceString || 'Coming soon';

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={!packageInfo || isBusy}
      className={`w-full rounded-[26px] border p-4 text-left transition ${
        isRecommended
          ? 'border-lime-300/25 bg-lime-300/10 hover:bg-lime-300/14'
          : 'border-white/10 bg-white/[0.05] hover:bg-white/[0.08]'
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-black tracking-tight text-white">{title}</div>
          <div className="mt-1 text-sm text-zinc-300">{subtitle}</div>
        </div>

        {isRecommended ? (
          <div className="rounded-full border border-lime-300/25 bg-lime-300/14 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-lime-200">
            Best
          </div>
        ) : null}
      </div>

      <div className="mt-4 text-2xl font-black text-white">{price}</div>
    </button>
  );
}

function usePremiumPaywallModel(open: boolean) {
  const [premiumState, setPremiumState] = useState<PremiumState>(() => checkPremium());
  const [packages, setPackages] = useState<RevenueCatPackage[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [busyPackageId, setBusyPackageId] = useState<string | null>(null);
  const [restoreBusy, setRestoreBusy] = useState(false);
  const [statusText, setStatusText] = useState<string>('');

  useEffect(() => subscribePremium(() => setPremiumState(checkPremium())), []);

  useEffect(() => subscribePaywall(() => setStatusText('')), []);

  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    const load = async () => {
      setLoadingOffers(true);

      try {
        const offerings = await getOfferings();
        const nextPackages = offerings?.[0]?.availablePackages ?? [];

        if (isMounted) {
          setPackages(nextPackages);
        }

        await syncPremiumFromRevenueCat();

        const summary = getRevenueCatConfigSummary();
        if (!summary.isNative) {
          setStatusText('Web preview mode: native purchases work on Android/iPhone build.');
        } else if (!summary.hasAndroidKey && !summary.hasIosKey) {
          setStatusText('RevenueCat keys are missing in env.');
        } else {
          setStatusText('');
        }
      } finally {
        if (isMounted) {
          setLoadingOffers(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [open]);

  const monthlyPackage =
    packages.find((pkg) => pkg.identifier.toLowerCase().includes('monthly')) ??
    packages.find((pkg) => pkg.packageType.toLowerCase().includes('monthly')) ??
    packages[0] ??
    null;

  const yearlyPackage =
    packages.find((pkg) => pkg.identifier.toLowerCase().includes('annual')) ??
    packages.find((pkg) => pkg.identifier.toLowerCase().includes('yearly')) ??
    packages.find((pkg) => pkg.packageType.toLowerCase().includes('annual')) ??
    packages.find((pkg) => pkg.packageType.toLowerCase().includes('yearly')) ??
    null;

  return {
    premiumState,
    loadingOffers,
    monthlyPackage,
    yearlyPackage,
    busyPackageId,
    restoreBusy,
    statusText,
    setBusyPackageId,
    setRestoreBusy,
    setStatusText,
  };
}

export default function PremiumPaywall({ open, onClose }: PremiumPaywallProps) {
  const lastTrigger = getLastPaywallTrigger() ?? 'manual';
  const headline = getPaywallHeadline(lastTrigger);
  const subtext = getPaywallSubtext(lastTrigger);

  const {
    premiumState,
    loadingOffers,
    monthlyPackage,
    yearlyPackage,
    busyPackageId,
    restoreBusy,
    statusText,
    setBusyPackageId,
    setRestoreBusy,
    setStatusText,
  } = usePremiumPaywallModel(open);

  const primaryPackages = useMemo(
    () => [yearlyPackage, monthlyPackage].filter(Boolean) as RevenueCatPackage[],
    [monthlyPackage, yearlyPackage],
  );

  if (!open) return null;

  const closeBoth = () => {
    closePaywall();
    onClose();
  };

  const handlePackagePurchase = async (pkg: RevenueCatPackage | null) => {
    if (!pkg) {
      activatePremium({ source: 'test' });
      setStatusText('Preview purchase activated. Native purchase will work on device.');
      return;
    }

    setBusyPackageId(pkg.identifier);
    setStatusText('');

    try {
      const result = await purchasePackage(pkg.identifier);

      if (!result.ok) {
        if (result.reason === 'not_native') {
          activatePremium({
            source: 'test',
            packageIdentifier: pkg.identifier,
          });
          setStatusText('Web preview purchase activated. Test the real purchase flow on Android/iPhone.');
          closePaywall();
          return;
        }

        if (result.reason === 'cancelled') {
          setStatusText('Purchase cancelled.');
          return;
        }

        setStatusText('Purchase failed. Check RevenueCat setup and try again.');
        return;
      }

      activatePremium({
        source: 'revenuecat',
        packageIdentifier: pkg.identifier,
      });

      await syncPremiumFromRevenueCat();
      closeBoth();
    } finally {
      setBusyPackageId(null);
    }
  };

  const handleRestore = async () => {
    setRestoreBusy(true);
    setStatusText('');

    try {
      const result = await restorePremiumFromRevenueCat();

      if (!result.ok) {
        if (result.reason === 'not_native') {
          setStatusText('Restore works on native Android/iPhone builds.');
          return;
        }

        setStatusText('No active purchase found to restore yet.');
        return;
      }

      setStatusText('Premium restored.');
      closeBoth();
    } finally {
      setRestoreBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        aria-label="Close paywall backdrop"
        onClick={closeBoth}
        className="absolute inset-0 bg-black/70 backdrop-blur-[4px]"
      />

      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-md px-4 pb-4 sm:bottom-1/2 sm:translate-y-1/2">
        <div
          className="relative overflow-hidden rounded-[34px] border border-white/10 bg-zinc-950/96 p-5 text-white shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
          role="dialog"
          aria-modal="true"
          aria-label="Premium Paywall"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(163,230,53,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.06),transparent_30%)]" />

          <div className="relative z-10">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-yellow-100">
                  <Crown className="h-3.5 w-3.5" />
                  Premium
                </div>

                <h2 className="mt-3 text-3xl font-black tracking-tight">{headline}</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-300">{subtext}</p>
              </div>

              <button
                type="button"
                onClick={closeBoth}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/[0.08]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <PerkRow
                icon={<Dumbbell className="h-5 w-5" />}
                title="Custom workouts"
                subtitle="Build your own sessions instead of only using preset flows."
              />
              <PerkRow
                icon={<Sparkles className="h-5 w-5" />}
                title="Premium cosmetics"
                subtitle="Unlock stronger identity, exclusive backgrounds, aura and visual upgrades."
              />
              <PerkRow
                icon={<LineChart className="h-5 w-5" />}
                title="History and progression"
                subtitle="See the deeper stats that make consistency feel real."
              />
              <PerkRow
                icon={<UtensilsCrossed className="h-5 w-5" />}
                title="Nutrition"
                subtitle="Unlock macro support and better daily consistency systems."
              />
              <PerkRow
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Momentum layer"
                subtitle="A cleaner, stronger version designed to keep the streak alive."
              />
            </div>

            <div className="mt-5 space-y-3">
              <PackageCard
                title="Yearly"
                subtitle="Best value and strongest commitment"
                packageInfo={yearlyPackage}
                isRecommended
                isBusy={busyPackageId === yearlyPackage?.identifier}
                onPress={() => void handlePackagePurchase(yearlyPackage)}
              />

              <PackageCard
                title="Monthly"
                subtitle="Flexible entry if you want to start lighter"
                packageInfo={monthlyPackage}
                isBusy={busyPackageId === monthlyPackage?.identifier}
                onPress={() => void handlePackagePurchase(monthlyPackage)}
              />

              {!primaryPackages.length && loadingOffers ? (
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-zinc-300">
                  Loading RevenueCat offerings...
                </div>
              ) : null}

              {premiumState.isActive ? (
                <div className="rounded-[22px] border border-lime-300/20 bg-lime-300/10 px-4 py-4 text-sm text-lime-100">
                  Premium is already active on this account.
                </div>
              ) : null}

              {statusText ? (
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-zinc-200">
                  {statusText}
                </div>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => void handleRestore()}
                disabled={restoreBusy}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08] disabled:opacity-60"
              >
                <RefreshCcw className="h-4 w-4" />
                Restore
              </button>

              <button
                type="button"
                onClick={closeBoth}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
              >
                <Flame className="h-4 w-4" />
                Continue free
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}