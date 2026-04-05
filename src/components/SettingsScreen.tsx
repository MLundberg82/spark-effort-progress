import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Clock3,
  Crown,
  RefreshCw,
  RotateCcw,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';
import { getProfile } from '../lib/profileStore';
import {
  clearPremiumPreview,
  getPremiumState,
  restorePremiumPurchases,
  purchasePremium,
  subscribePremium,
  unlockPremiumPreview,
} from '../lib/premiumStore';
import {
  getTimerSettings,
  resetTimerSettings,
  saveTimerSettings,
} from '../lib/timerStore';

type SettingsScreenProps = {
  onBack: () => void;
};

function clampSeconds(value: string | number, fallback: number) {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(5, Math.min(600, Math.floor(parsed)));
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const profile = getProfile();

  const [timerEnabled, setTimerEnabled] = useState(true);
  const [setSeconds, setSetSeconds] = useState(45);
  const [restSeconds, setRestSeconds] = useState(90);
  const [premiumState, setPremiumState] = useState(getPremiumState());
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const timer = getTimerSettings();
    setTimerEnabled(timer.enabled);
    setSetSeconds(timer.setSeconds);
    setRestSeconds(timer.restSeconds);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribePremium((state) => {
      setPremiumState(state);
    });

    return unsubscribe;
  }, []);

  const identityLabel =
    profile?.gender === 'female'
      ? 'Female'
      : profile?.gender === 'non-binary'
      ? 'Non-binary'
      : 'Male';

  const trainingLabel =
    profile?.trainingLevel === 'advanced'
      ? 'Advanced'
      : profile?.trainingLevel === 'intermediate'
      ? 'Intermediate'
      : 'Beginner';

  const premiumLabel = useMemo(() => {
    if (!premiumState.isActive) return 'Free';
    if (premiumState.plan === 'yearly') return 'Premium Yearly';
    if (premiumState.plan === 'monthly') return 'Premium Monthly';
    if (premiumState.plan === 'lifetime') return 'Premium Lifetime';
    return 'Premium Active';
  }, [premiumState]);

  const cardClass =
    'rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur';
  const smallLabelClass =
    'text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45';
  const valueClass = 'mt-2 text-base font-semibold text-white';
  const inputClass =
    'mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-emerald-400/50';
  const buttonClass =
    'rounded-2xl px-4 py-3 text-sm font-bold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50';

  const handleSaveTimer = () => {
    saveTimerSettings({
      enabled: timerEnabled,
      setSeconds: clampSeconds(setSeconds, 45),
      restSeconds: clampSeconds(restSeconds, 90),
    });
    setMessage('Timer settings saved.');
  };

  const handleResetTimer = () => {
    resetTimerSettings();
    const next = getTimerSettings();
    setTimerEnabled(next.enabled);
    setSetSeconds(next.setSeconds);
    setRestSeconds(next.restSeconds);
    setMessage('Timer settings reset to default.');
  };

  const handlePurchase = async (plan: 'monthly' | 'yearly') => {
    setPremiumLoading(true);
    setMessage('');

    const result = await purchasePremium(plan);

    setPremiumLoading(false);

    if (result.ok) {
      setMessage(plan === 'yearly' ? 'Yearly premium activated.' : 'Monthly premium activated.');
      return;
    }

    if (result.reason === 'preview-only') {
      setMessage('No native purchase environment found. Use preview unlock in browser.');
      return;
    }

    if (result.reason === 'package-not-found') {
      setMessage('Could not find the RevenueCat package. Check offering identifiers.');
      return;
    }

    setMessage('Premium purchase failed.');
  };

  const handleRestore = async () => {
    setPremiumLoading(true);
    setMessage('');

    const result = await restorePremiumPurchases();

    setPremiumLoading(false);

    if (result.ok) {
      setMessage('Purchases restored successfully.');
      return;
    }

    setMessage('No active premium entitlement found to restore.');
  };

  return (
    <div className="min-h-screen bg-[#09090b] px-4 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-[430px]">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/10 px-3 py-2 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
              Settings
            </div>
            <div className="text-lg font-black leading-none">Control</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={cardClass}>
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl bg-white/[0.05] p-3">
                <Settings className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <div className={smallLabelClass}>Settings</div>
                <h1 className="mt-1 text-2xl font-black">Profile, timer and premium</h1>
              </div>
            </div>

            <p className="mt-4 text-sm text-zinc-400">
              Clean control over your workout flow, recovery timing and premium progression.
            </p>
          </div>

          <div className={cardClass}>
            <div className="mb-4 flex items-center gap-3">
              <div className="inline-flex rounded-2xl bg-white/[0.05] p-3">
                <User className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <div className={smallLabelClass}>Profile</div>
                <div className="mt-1 text-lg font-bold">Current setup</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={smallLabelClass}>Identity</div>
                <div className={valueClass}>{identityLabel}</div>
              </div>

              <div>
                <div className={smallLabelClass}>Training level</div>
                <div className={valueClass}>{trainingLabel}</div>
              </div>

              <div>
                <div className={smallLabelClass}>Age</div>
                <div className={valueClass}>{profile?.age ?? '-'}</div>
              </div>

              <div>
                <div className={smallLabelClass}>Weight</div>
                <div className={valueClass}>{profile?.weight ?? '-'} kg</div>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="mb-4 flex items-center gap-3">
              <div className="inline-flex rounded-2xl bg-white/[0.05] p-3">
                <Clock3 className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <div className={smallLabelClass}>Workout timer</div>
                <div className="mt-1 text-lg font-bold">Saved workout timing</div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
              <div>
                <div className="text-sm font-semibold text-white">Enable workout timer</div>
                <div className="mt-1 text-sm text-zinc-400">
                  Uses the same saved timer config during workouts.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTimerEnabled((current) => !current)}
                className={`relative h-8 w-14 rounded-full transition ${
                  timerEnabled ? 'bg-emerald-400/80' : 'bg-white/15'
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                    timerEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block">
                <span className={smallLabelClass}>Set time (seconds)</span>
                <input
                  type="number"
                  value={setSeconds}
                  onChange={(e) => setSetSeconds(clampSeconds(e.target.value, setSeconds))}
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className={smallLabelClass}>Rest time (seconds)</span>
                <input
                  type="number"
                  value={restSeconds}
                  onChange={(e) => setRestSeconds(clampSeconds(e.target.value, restSeconds))}
                  className={inputClass}
                />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSaveTimer}
                className={`${buttonClass} bg-emerald-400 text-black`}
              >
                Save timer
              </button>
              <button
                type="button"
                onClick={handleResetTimer}
                className={`${buttonClass} border border-white/10 bg-white/[0.04] text-white`}
              >
                Reset default
              </button>
            </div>
          </div>

          <div className={cardClass}>
            <div className="mb-4 flex items-center gap-3">
              <div className="inline-flex rounded-2xl bg-white/[0.05] p-3">
                <Crown className="h-5 w-5 text-amber-200" />
              </div>
              <div>
                <div className={smallLabelClass}>Premium</div>
                <div className="mt-1 text-lg font-bold">Status and access</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className={smallLabelClass}>Status</div>
                <div className="mt-2 font-semibold text-white">
                  {premiumState.isActive ? 'Active' : 'Free'}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className={smallLabelClass}>Plan</div>
                <div className="mt-2 font-semibold text-white">{premiumState.plan ?? '-'}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className={smallLabelClass}>Tier</div>
                <div className="mt-2 font-semibold text-white">{premiumLabel}</div>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={() => handlePurchase('monthly')}
                disabled={premiumLoading}
                className={`${buttonClass} bg-emerald-400 text-black`}
              >
                Monthly premium
              </button>

              <button
                type="button"
                onClick={() => handlePurchase('yearly')}
                disabled={premiumLoading}
                className={`${buttonClass} bg-emerald-400 text-black`}
              >
                Yearly premium
              </button>

              <button
                type="button"
                onClick={handleRestore}
                disabled={premiumLoading}
                className={`${buttonClass} border border-white/10 bg-white/[0.04] text-white`}
              >
                <span className="inline-flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Restore purchases
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  unlockPremiumPreview('monthly');
                  setMessage('Preview premium activated.');
                }}
                className={`${buttonClass} border border-amber-400/20 bg-amber-400/10 text-amber-100`}
              >
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Preview unlock
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  clearPremiumPreview();
                  setMessage('Preview premium cleared.');
                }}
                className={`${buttonClass} border border-white/10 bg-transparent text-zinc-300`}
              >
                <span className="inline-flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Clear preview premium
                </span>
              </button>
            </div>

            {message ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
                <div className="inline-flex items-center gap-2 text-white">
                  <Check className="h-4 w-4 text-emerald-300" />
                  <span>{message}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}