import { useMemo, useState } from 'react';
import { Check, Crown, Sparkles, X } from 'lucide-react';
import {
  clearPremiumPreview,
  getPremiumState,
  purchasePremium,
  restorePremiumPurchases,
  unlockPremiumPreview,
  type PremiumPlan,
} from '@/lib/premiumStore';

type PremiumPaywallProps = {
  isOpen: boolean;
  onClose: () => void;
};

const FEATURES = [
  'Nutrition tracking with goals and macro support',
  'Workout history and deeper progress overview',
  'Custom workouts and broader training control',
  'Premium cosmetics and stronger identity feel',
  'Future premium unlocks without cluttering free flow',
];

export default function PremiumPaywall({
  isOpen,
  onClose,
}: PremiumPaywallProps) {
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const premiumState = useMemo(() => getPremiumState(), [isOpen]);
  const isActive = premiumState.isActive;

  const handlePurchase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await purchasePremium(selectedPlan);

      if (result.ok) {
        onClose();
        return;
      }

      if (result.reason === 'preview-only') {
        unlockPremiumPreview(selectedPlan);
        onClose();
        return;
      }

      if (result.reason === 'not-supported') {
        setError('Purchases are only available on device builds right now. In browser, use preview mode from Settings.');
        return;
      }

      if (result.reason === 'package-not-found') {
        setError('RevenueCat package not found. Check monthly/yearly offering setup.');
        return;
      }

      setError('Purchase failed. Please try again.');
    } catch {
      setError('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const restored = await restorePremiumPurchases();

      if (restored.ok) {
        onClose();
        return;
      }

      if (restored.reason === 'nothing-to-restore') {
        setError('No purchases found to restore.');
        return;
      }

      setError('Restore failed. Please try again.');
    } catch {
      setError('Restore failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewUnlock = () => {
    unlockPremiumPreview(selectedPlan);
    onClose();
  };

  const handlePreviewClear = () => {
    clearPremiumPreview();
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[430px] rounded-t-[2rem] border border-white/10 bg-[#09090b] p-4 text-white shadow-[0_-24px_80px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/80">
              Premium
            </div>
            <h2 className="mt-1 text-2xl font-black">Level up harder</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
            aria-label="Close paywall"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-[1.75rem] border border-amber-400/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.12),rgba(255,255,255,0.03))] p-5">
          <div className="inline-flex rounded-2xl bg-amber-400/10 p-3 text-amber-200">
            <Crown className="h-5 w-5" />
          </div>

          <h3 className="mt-4 text-2xl font-black">GymRat Premium</h3>
          <p className="mt-2 text-sm text-zinc-300">
            Keep free simple. Unlock the deeper systems only when the user wants more.
          </p>

          <div className="mt-4 space-y-2">
            {FEATURES.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-3"
              >
                <div className="mt-0.5 inline-flex rounded-full bg-emerald-400/10 p-1 text-emerald-300">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm text-zinc-200">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedPlan('monthly')}
            className={`rounded-3xl border p-4 text-left transition ${
              selectedPlan === 'monthly'
                ? 'border-emerald-400/20 bg-emerald-400/10'
                : 'border-white/10 bg-white/[0.04]'
            }`}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
              Monthly
            </div>
            <div className="mt-1 text-lg font-black">1 month</div>
            <div className="mt-1 text-sm text-zinc-400">Flexible entry</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan('yearly')}
            className={`rounded-3xl border p-4 text-left transition ${
              selectedPlan === 'yearly'
                ? 'border-emerald-400/20 bg-emerald-400/10'
                : 'border-white/10 bg-white/[0.04]'
            }`}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
              Yearly
            </div>
            <div className="mt-1 text-lg font-black">12 months</div>
            <div className="mt-1 text-sm text-zinc-400">Best long-term value</div>
          </button>
        </div>

        {isActive ? (
          <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <div className="flex items-center gap-2 text-emerald-200">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Premium is active</span>
            </div>
            <p className="mt-2 text-sm text-zinc-200">
              Source: {premiumState.source ?? 'unknown'}
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div className="mt-4 grid gap-3">
          <button
            type="button"
            onClick={handlePurchase}
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-400 px-4 py-4 text-sm font-black uppercase tracking-[0.14em] text-black transition disabled:opacity-60"
          >
            {isLoading ? 'Working...' : selectedPlan === 'monthly' ? 'Start monthly premium' : 'Start yearly premium'}
          </button>

          <button
            type="button"
            onClick={handleRestore}
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-semibold transition hover:bg-white/[0.08] disabled:opacity-60"
          >
            Restore purchases
          </button>

          <button
            type="button"
            onClick={handlePreviewUnlock}
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/15 disabled:opacity-60"
          >
            Preview unlock
          </button>

          {isActive ? (
            <button
              type="button"
              onClick={handlePreviewClear}
              className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-transparent px-4 py-4 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.04]"
            >
              Clear preview premium
            </button>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-transparent px-4 py-2 text-sm text-zinc-400 transition hover:text-white"
          >
            Continue without premium
          </button>
        </div>
      </div>
    </div>
  );
}