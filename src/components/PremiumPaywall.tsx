import { Crown, Sparkles, X } from 'lucide-react';
import { activatePremium, checkPremium, deactivatePremium } from '@/lib/premiumStore';

type PremiumPaywallProps = {
  onClose: () => void;
};

const FEATURES = [
  'Nutrition tracking with goals and macro support',
  'Workout history and deeper progress overview',
  'Custom workouts and broader training control later',
  'Premium cosmetics and stronger identity feel',
  'Future premium unlocks without cluttering the free flow',
];

export default function PremiumPaywall({ onClose }: PremiumPaywallProps) {
  const premiumState = checkPremium();
  const isActive = premiumState.isActive;

  const handleActivatePreview = () => {
    activatePremium({ source: 'test' });
    onClose();
  };

  const handleClearPreview = () => {
    deactivatePremium();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 px-4 pb-4 pt-10 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#111113] p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-yellow-300">
              Premium
            </p>
            <h2 className="mt-2 text-3xl font-black">Level up harder</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-sm text-zinc-300">
          Keep free simple. Unlock the deeper systems only when the user wants more.
        </p>

        <div className="mt-5 grid gap-3">
          {FEATURES.map((feature) => (
            <div
              key={feature}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-200"
            >
              {feature}
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-left"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
              Monthly
            </p>
            <p className="mt-2 text-lg font-black text-white">1 month</p>
            <p className="mt-1 text-sm text-zinc-300">Flexible entry</p>
          </button>

          <button
            type="button"
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
              Yearly
            </p>
            <p className="mt-2 text-lg font-black text-white">12 months</p>
            <p className="mt-1 text-sm text-zinc-300">Best value</p>
          </button>
        </div>

        {isActive ? (
          <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            Premium is already active on this account.
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleActivatePreview}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-300 px-5 py-4 text-sm font-black text-black shadow-[0_12px_35px_rgba(74,222,128,0.35)]"
        >
          <Sparkles className="h-4 w-4" />
          Unlock Premium
        </button>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleClearPreview}
            className="flex-1 rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm font-bold text-zinc-300"
          >
            Clear preview
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white"
          >
            Not now
          </button>
        </div>

        <p className="mt-4 text-xs text-zinc-500">
          Stable preview shell for now. Native purchases can be wired in after the app flow is fully testable.
        </p>
      </div>
    </div>
  );
}