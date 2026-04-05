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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#0f1713_0%,#0a0f0c_100%)] text-white shadow-[0_30px_100px_rgba(0,0,0,0.52)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.22),transparent_70%)]" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
          aria-label="Close premium"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative p-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-emerald-300">
            <Crown className="h-3.5 w-3.5" />
            <span>Premium</span>
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-white">
            Level up harder
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/65">
            Keep free simple. Unlock the deeper systems only when the user wants more.
          </p>

          <div className="mt-5 space-y-3">
            {FEATURES.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
              >
                <div className="mt-0.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 p-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-300" />
                </div>
                <p className="text-sm text-white/78">{feature}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`rounded-3xl border p-4 text-left transition ${
                selectedPlan === 'monthly'
                  ? 'border-emerald-400/20 bg-emerald-400/10'
                  : 'border-white/10 bg-white/[0.04]'
              }`}
            >
              <p className="text-sm font-black uppercase tracking-[0.12em] text-white">
                Monthly
              </p>
              <p className="mt-1 text-xs text-white/55">1 month</p>
              <p className="mt-3 text-sm font-semibold text-emerald-300">
                Flexible entry
              </p>
            </button>

            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`rounded-3xl border p-4 text-left transition ${
                selectedPlan === 'yearly'
                  ? 'border-emerald-400/20 bg-emerald-400/10'
                  : 'border-white/10 bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-black uppercase tracking-[0.12em] text-white">
                  Yearly
                </p>
                <span className="rounded-full bg-emerald-300 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.12em] text-black">
                  Best value
                </span>
              </div>
              <p className="mt-1 text-xs text-white/55">12 months</p>
              <p className="mt-3 text-sm font-semibold text-emerald-300">
                Commit to growth
              </p>
            </button>
          </div>

          {isActive ? (
            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200">
              Premium is already active on this account.
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-3">
            <button
              onClick={handlePurchase}
              disabled={isLoading || isActive}
              className="flex items-center justify-center gap-2 rounded-[1.4rem] border border-emerald-300/20 bg-[linear-gradient(90deg,rgba(16,185,129,0.95),rgba(132,204,22,0.95))] px-5 py-4 text-base font-black tracking-[0.04em] text-black shadow-[0_18px_45px_rgba(16,185,129,0.28)] transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isLoading ? 'Processing...' : 'Unlock Premium'}</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleRestore}
                disabled={isLoading}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.1] disabled:opacity-50"
              >
                Restore
              </button>

              <button
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm font-bold text-white/85 transition hover:bg-white/[0.05]"
              >
                Not now
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/45">
              Dev / preview tools
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                onClick={handlePreviewUnlock}
                className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200 transition hover:bg-emerald-400/15"
              >
                Preview unlock
              </button>

              <button
                onClick={handlePreviewClear}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]"
              >
                Clear preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}