import { useEffect, useMemo, useState } from 'react';
import {
  Apple,
  Check,
  Crown,
  Dumbbell,
  History,
  Loader2,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';
import {
  isPremiumUnlocked,
  purchasePremium,
  refreshPremiumStatus,
  restorePremium,
} from '@/lib/premiumStore';
import {
  getPaywallHeadline,
  getPaywallSubheadline,
  markPaywallShown,
  type PaywallTrigger,
} from '@/lib/paywallStore';

type PremiumPaywallProps = {
  open: boolean;
  onClose: () => void;
  trigger?: PaywallTrigger;
  onUnlocked?: () => void;
};

export default function PremiumPaywall({
  open,
  onClose,
  trigger = 'manual',
  onUnlocked,
}: PremiumPaywallProps) {
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const benefits = useMemo(
    () => [
      {
        icon: <Apple size={18} className="text-lime-300" />,
        title: 'Nutrition',
        text: 'Macros, logging and cleaner food progress.',
      },
      {
        icon: <History size={18} className="text-cyan-300" />,
        title: 'History',
        text: 'Full workout history and clearer progression review.',
      },
      {
        icon: <Dumbbell size={18} className="text-orange-300" />,
        title: 'Custom Workouts',
        text: 'Build your own sessions without friction.',
      },
      {
        icon: <Sparkles size={18} className="text-fuchsia-300" />,
        title: 'XP Boost',
        text: 'More reward feeling and faster momentum.',
      },
      {
        icon: <Wand2 size={18} className="text-amber-300" />,
        title: 'Premium Cosmetics',
        text: 'Exclusive premium visuals and identity upgrades.',
      },
      {
        icon: <Crown size={18} className="text-yellow-300" />,
        title: 'Premium Status',
        text: 'More than features — visible value in the app.',
      },
    ],
    []
  );

  useEffect(() => {
    if (!open) return;
    markPaywallShown();
    setError(null);
  }, [open]);

  const headline = getPaywallHeadline(trigger);
  const subheadline = getPaywallSubheadline(trigger);

  const handlePurchase = async (plan: 'monthly' | 'yearly') => {
    if (loadingPlan || restoring) return;

    setLoadingPlan(plan);
    setError(null);

    try {
      const result = await purchasePremium(plan);

      if (result.ok) {
        await refreshPremiumStatus();

        if (isPremiumUnlocked()) {
          onUnlocked?.();
          onClose();
          return;
        }

        setError('Purchase completed, but premium did not unlock yet.');
        return;
      }

      if (result.reason === 'cancelled') {
        setError('Purchase cancelled.');
        return;
      }

      if (result.reason === 'not-native') {
        setError(
          'Purchases run in native iOS/Android builds. In browser, use preview mode from Settings.'
        );
        return;
      }

      if (result.reason === 'package-not-found') {
        setError('RevenueCat package not found. Check monthly/yearly offering setup.');
        return;
      }

      setError('Purchase failed. Please try again.');
    } catch (err) {
      setError('Purchase failed. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleRestore = async () => {
    if (loadingPlan || restoring) return;

    setRestoring(true);
    setError(null);

    try {
      const result = await restorePremium();

      if (result.ok) {
        await refreshPremiumStatus();

        if (isPremiumUnlocked()) {
          onUnlocked?.();
          onClose();
          return;
        }

        setError('Restore completed, but no active premium was found.');
        return;
      }

      if (result.reason === 'not-native') {
        setError('Restore only works in native iOS/Android builds.');
        return;
      }

      setError('Restore failed. Please try again.');
    } catch (err) {
      setError('Restore failed. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,22,0.98),rgba(11,12,16,0.98))] p-5 text-white shadow-[0_25px_100px_rgba(0,0,0,0.55)] md:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/75 transition hover:bg-white/[0.09] hover:text-white"
          aria-label="Close premium paywall"
        >
          <X size={18} />
        </button>

        <div className="pr-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-lime-300">
            <Crown size={14} />
            GymRat Premium
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-tight">
            {headline}
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
            {subheadline}
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl border border-white/8 bg-white/[0.04] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{benefit.icon}</div>
                <div>
                  <div className="text-sm font-bold text-white">{benefit.title}</div>
                  <div className="mt-1 text-sm leading-5 text-white/60">
                    {benefit.text}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-amber-300/10 bg-amber-300/[0.06] p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 text-amber-200" size={18} />
            <div>
              <div className="text-sm font-bold text-white">
                Premium should feel visible
              </div>
              <div className="mt-1 text-sm leading-5 text-white/65">
                Premium is not only features. It should also unlock cleaner visuals,
                stronger identity and exclusive cosmetics.
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={() => handlePurchase('monthly')}
            disabled={!!loadingPlan || restoring}
            className="inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 px-4 py-3 text-sm font-black text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingPlan === 'monthly' ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            Start Monthly
          </button>

          <button
            type="button"
            onClick={() => handlePurchase('yearly')}
            disabled={!!loadingPlan || restoring}
            className="inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingPlan === 'yearly' ? <Loader2 size={18} className="animate-spin" /> : <Crown size={18} />}
            Best Value • Yearly
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center gap-3 text-center">
          <button
            type="button"
            onClick={handleRestore}
            disabled={!!loadingPlan || restoring}
            className="text-sm font-medium text-white/70 transition hover:text-white disabled:opacity-60"
          >
            {restoring ? 'Restoring…' : 'Restore purchases'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-white/55 transition hover:text-white"
          >
            Continue free
          </button>
        </div>
      </div>
    </div>
  );
}