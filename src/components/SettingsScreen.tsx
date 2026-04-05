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
  Zap,
} from 'lucide-react';
import { getProfile } from '../lib/profileStore';
import {
  clearPremiumPreview,
  getPremiumManagementURL,
  getPremiumPlan,
  getPremiumState,
  purchasePremium,
  refreshPremiumStatus,
  restorePremium,
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

    refreshPremiumStatus().then((state) => {
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
    return 'Premium Active';
  }, [premiumState]);

  const currentPlan = getPremiumPlan();
  const managementURL = getPremiumManagementURL();

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

  const handleRefreshPremium = async () => {
    setPremiumLoading(true);
    setMessage('');

    const state = await refreshPremiumStatus();
    setPremiumState(state);

    setPremiumLoading(false);
    setMessage(
      state.isActive
        ? 'Premium status refreshed.'
        : 'No active premium entitlement found.'
    );
  };

  const handlePurchase = async (plan: 'monthly' | 'yearly') => {
    setPremiumLoading(true);
    setMessage('');

    const result = await purchasePremium(plan);

    setPremiumLoading(false);

    if (result.ok) {
      setPremiumState(result.state);
      setMessage(
        plan === 'yearly'
          ? 'Yearly premium activated.'
          : 'Monthly premium activated.'
      );
      return;
    }

    if (result.reason === 'cancelled') {
      setMessage('Purchase cancelled.');
      return;
    }

    if (result.reason === 'not-native') {
      setMessage(
        'RevenueCat purchases only run on native iOS/Android builds. Use preview mode in browser.'
      );
      return;
    }

    if (result.reason === 'package-not-found') {
      setMessage(
        'Could not find the RevenueCat package. Check your offering identifiers.'
      );
      return;
    }

    setMessage('Premium purchase failed.');
  };

  const handleRestore = async () => {
    setPremiumLoading(true);
    setMessage('');

    const result = await restorePremium();

    setPremiumLoading(false);

    if (result.ok) {
      setPremiumState(result.state);
      setMessage(
        result.state.isActive
          ? 'Purchases restored successfully.'
          : 'Restore completed, but no active premium entitlement was found.'
      );
      return;
    }

    if (result.reason === 'not-native') {
      setMessage(
        'Restore only works on native iOS/Android builds. Browser can use preview mode.'
      );
      return;
    }

    setMessage('Restore failed.');
  };

  return (
    <div className="min-h-screen bg-[#0a0d12] px-4 pb-8 pt-5 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
            type="button"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
            <Settings size={16} />
            Settings
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(245,158,11,0.12),rgba(255,255,255,0.03))] p-6 shadow-[0_16px_60px_rgba(0,0,0,0.3)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/65">
                <Sparkles size={14} />
                GymRat Control Center
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight">
                Profile, timer and premium
              </h1>
              <p className="mt-2 max-w-xl text-sm text-white/65">
                Clean control over your workout flow, recovery timing and premium progression.
              </p>
            </div>

            <div className="hidden rounded-3xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-right md:block">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/70">
                Current tier
              </div>
              <div className="mt-1 flex items-center justify-end gap-2 text-sm font-bold text-amber-200">
                <Crown size={16} />
                {premiumLabel}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className={cardClass}>
            <div className="flex items-center gap-2 text-white">
              <User size={18} />
              <h2 className="text-lg font-bold">Profile</h2>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/20 p-4">
                <div className={smallLabelClass}>Identity</div>
                <div className={valueClass}>{identityLabel}</div>
              </div>

              <div className="rounded-2xl bg-black/20 p-4">
                <div className={smallLabelClass}>Training level</div>
                <div className={valueClass}>{trainingLabel}</div>
              </div>

              <div className="rounded-2xl bg-black/20 p-4">
                <div className={smallLabelClass}>Age</div>
                <div className={valueClass}>{profile?.age ?? '-'}</div>
              </div>

              <div className="rounded-2xl bg-black/20 p-4">
                <div className={smallLabelClass}>Weight</div>
                <div className={valueClass}>{profile?.weight ?? '-'} kg</div>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center gap-2 text-white">
              <Clock3 size={18} />
              <h2 className="text-lg font-bold">Workout timer</h2>
            </div>

            <div className="mt-4 rounded-2xl bg-black/20 p-4">
              <label className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">
                    Enable workout timer
                  </div>
                  <div className="mt-1 text-xs text-white/55">
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
              </label>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className={smallLabelClass}>Set time (seconds)</label>
                <input
                  type="number"
                  min={5}
                  max={600}
                  step={5}
                  value={setSeconds}
                  onChange={(e) =>
                    setSetSeconds(clampSeconds(e.target.value, setSeconds))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={smallLabelClass}>Rest time (seconds)</label>
                <input
                  type="number"
                  min={5}
                  max={600}
                  step={5}
                  value={restSeconds}
                  onChange={(e) =>
                    setRestSeconds(clampSeconds(e.target.value, restSeconds))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
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
                <span className="inline-flex items-center gap-2">
                  <RotateCcw size={16} />
                  Reset default
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-2 text-white">
            <Crown size={18} />
            <h2 className="text-lg font-bold">Premium</h2>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-black/20 p-4">
              <div className={smallLabelClass}>Status</div>
              <div className={valueClass}>
                {premiumState.isActive ? 'Active' : 'Free'}
              </div>
            </div>

            <div className="rounded-2xl bg-black/20 p-4">
              <div className={smallLabelClass}>Plan</div>
              <div className={valueClass}>
                {currentPlan === 'yearly'
                  ? 'Yearly'
                  : currentPlan === 'monthly'
                  ? 'Monthly'
                  : '-'}
              </div>
            </div>

            <div className="rounded-2xl bg-black/20 p-4">
              <div className={smallLabelClass}>Source</div>
              <div className={valueClass}>{premiumState.source}</div>
            </div>

            <div className="rounded-2xl bg-black/20 p-4">
              <div className={smallLabelClass}>Sync</div>
              <div className={valueClass}>
                {premiumState.lastSyncedAt ? 'Updated' : 'Not synced'}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-300/10 bg-amber-300/[0.06] p-4">
            <div className="flex items-start gap-3">
              <Zap className="mt-0.5 text-amber-200" size={18} />
              <div>
                <div className="text-sm font-bold text-white">
                  Premium should feel visible
                </div>
                <div className="mt-1 text-sm text-white/65">
                  Nutrition, history, custom workouts and premium cosmetics should all route from
                  this entitlement state.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handlePurchase('monthly')}
              disabled={premiumLoading}
              className={`${buttonClass} bg-amber-300 text-black`}
            >
              Monthly premium
            </button>

            <button
              type="button"
              onClick={() => handlePurchase('yearly')}
              disabled={premiumLoading}
              className={`${buttonClass} bg-white text-black`}
            >
              Yearly premium
            </button>

            <button
              type="button"
              onClick={handleRestore}
              disabled={premiumLoading}
              className={`${buttonClass} border border-white/10 bg-white/[0.04] text-white`}
            >
              Restore purchases
            </button>

            <button
              type="button"
              onClick={handleRefreshPremium}
              disabled={premiumLoading}
              className={`${buttonClass} border border-emerald-400/30 bg-emerald-400/10 text-emerald-300`}
            >
              <span className="inline-flex items-center gap-2">
                <RefreshCw size={16} />
                Refresh status
              </span>
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                unlockPremiumPreview('monthly');
                setPremiumState(getPremiumState());
                setMessage('Preview monthly enabled.');
              }}
              className={`${buttonClass} border border-white/10 bg-white/[0.04] text-white`}
            >
              Preview monthly
            </button>

            <button
              type="button"
              onClick={() => {
                unlockPremiumPreview('yearly');
                setPremiumState(getPremiumState());
                setMessage('Preview yearly enabled.');
              }}
              className={`${buttonClass} border border-white/10 bg-white/[0.04] text-white`}
            >
              Preview yearly
            </button>

            <button
              type="button"
              onClick={() => {
                clearPremiumPreview();
                setPremiumState(getPremiumState());
                setMessage('Preview premium cleared.');
              }}
              className={`${buttonClass} border border-red-400/20 bg-red-400/10 text-red-200`}
            >
              Clear preview
            </button>
          </div>

          {managementURL ? (
            <div className="mt-4 rounded-2xl bg-black/20 p-4 text-sm text-white/65">
              Manage subscription in store settings:
              <div className="mt-2 break-all text-white">{managementURL}</div>
            </div>
          ) : null}

          {message ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-300">
              <Check size={16} />
              {message}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}