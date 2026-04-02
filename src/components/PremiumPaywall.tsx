import { useMemo, useState } from 'react';
import { X, Check, Crown, Sparkles, BarChart3, Dumbbell, Apple } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import {
  PaywallTrigger,
  getPaywallHeadline,
  getPaywallSubheadline,
  markPaywallShown,
} from '@/lib/paywallStore';
import { hasUsedTrial } from '@/lib/premiumStore';

type PremiumPaywallProps = {
  open: boolean;
  trigger?: PaywallTrigger;
  onClose: () => void;
  onPurchaseMonthly?: () => Promise<void> | void;
  onPurchaseYearly?: () => Promise<void> | void;
  onStartTrial?: () => Promise<void> | void;
  onRestorePurchases?: () => Promise<void> | void;
};

const PremiumPaywall = ({
  open,
  trigger = 'manual',
  onClose,
  onPurchaseMonthly,
  onPurchaseYearly,
  onStartTrial,
  onRestorePurchases,
}: PremiumPaywallProps) => {
  const [loadingPlan, setLoadingPlan] = useState<'trial' | 'monthly' | 'yearly' | 'restore' | null>(null);

  const headline = useMemo(() => getPaywallHeadline(trigger), [trigger]);
  const subheadline = useMemo(() => getPaywallSubheadline(trigger), [trigger]);
  const trialUsed = hasUsedTrial();

  if (!open) return null;

  const handleClose = () => {
    markPaywallShown();
    trackEvent('paywall_dismissed', { trigger });
    onClose();
  };

  const handleAction = async (
    plan: 'trial' | 'monthly' | 'yearly' | 'restore',
    action?: () => Promise<void> | void
  ) => {
    try {
      setLoadingPlan(plan);

      if (plan !== 'restore') {
        markPaywallShown();
        trackEvent('paywall_cta_clicked', {
          trigger,
          plan,
        });
      }

      await action?.();
    } catch (error) {
      console.error(`Paywall ${plan} action failed`, error);
    } finally {
      setLoadingPlan(null);
    }
  };

  const benefits = [
    {
      icon: <BarChart3 size={16} />,
      title: 'Full Progress Tracking',
      text: 'See your workout history, stats, streaks, and long-term improvement.',
    },
    {
      icon: <Apple size={16} />,
      title: 'Nutrition & Macros',
      text: 'Unlock food tracking, daily targets, and better body-composition control.',
    },
    {
      icon: <Dumbbell size={16} />,
      title: 'Custom Workouts',
      text: 'Build your own training setup and train exactly the way you want.',
    },
    {
      icon: <Sparkles size={16} />,
      title: 'Exclusive Premium Rewards',
      text: 'Get access to premium items, upgrades, and a better GymRat experience.',
    },
  ];

  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-center bg-black/75 px-4 py-6 sm:items-center">
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950 text-white shadow-2xl">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_40%)]" />

        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close paywall"
        >
          <X size={18} />
        </button>

        <div className="relative px-6 pb-6 pt-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <Crown size={14} />
            GYMRAT PREMIUM
          </div>

          <h2 className="text-3xl font-bold leading-tight">{headline}</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-300">{subheadline}</p>

          <div className="mt-6 space-y-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-emerald-400/15 p-2 text-emerald-300">
                    {benefit.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{benefit.title}</div>
                    <div className="mt-1 text-xs leading-5 text-zinc-400">{benefit.text}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/8 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">Yearly Premium</div>
                <div className="text-xs text-emerald-200/80">Best value • Save 58%</div>
              </div>
              <div className="rounded-full bg-emerald-400 px-2.5 py-1 text-[10px] font-bold text-black">
                MOST POPULAR
              </div>
            </div>
          </div>
        </div>

        <div className="relative space-y-3 px-6 pb-6">
          {!trialUsed && (
            <button
              onClick={() => handleAction('trial', onStartTrial)}
              disabled={loadingPlan !== null}
              className="w-full rounded-2xl bg-emerald-500 px-4 py-4 text-center font-semibold text-black transition hover:scale-[1.01] hover:bg-emerald-400 disabled:opacity-60"
            >
              {loadingPlan === 'trial' ? 'Starting...' : 'Start 7-Day Free Trial'}
            </button>
          )}

          <button
            onClick={() => handleAction('yearly', onPurchaseYearly)}
            disabled={loadingPlan !== null}
            className="w-full rounded-2xl border border-emerald-400/30 bg-white/5 px-4 py-4 text-left transition hover:bg-white/10 disabled:opacity-60"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold">Yearly Premium</div>
                <div className="text-sm text-zinc-400">Lower monthly cost</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">$29.99</div>
                <div className="text-xs text-zinc-400">per year</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleAction('monthly', onPurchaseMonthly)}
            disabled={loadingPlan !== null}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:bg-white/10 disabled:opacity-60"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold">Monthly Premium</div>
                <div className="text-sm text-zinc-400">Flexible access</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">$6.99</div>
                <div className="text-xs text-zinc-400">per month</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleAction('restore', onRestorePurchases)}
            disabled={loadingPlan !== null}
            className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-center text-sm font-medium text-zinc-300 transition hover:bg-white/5 disabled:opacity-60"
          >
            {loadingPlan === 'restore' ? 'Restoring...' : 'Restore Purchases'}
          </button>

          <div className="pt-1 text-center">
            <div className="inline-flex items-center gap-2 text-[11px] text-zinc-500">
              <Check size={12} />
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPaywall;