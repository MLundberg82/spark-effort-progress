import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Clock3,
  Crown,
  RefreshCw,
  RotateCcw,
  Settings,
  User,
} from 'lucide-react';
import { getProfile } from '../lib/profileStore';
import { activatePremium, checkPremium, deactivatePremium, subscribePremium } from '../lib/premiumStore';
import { getTimerSettings, resetTimerSettings, saveTimerSettings } from '../lib/timerStore';

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
  const [premiumState, setPremiumState] = useState(checkPremium());
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
    'rounded-2xl px-4 py-3 text-sm font-bold transition hover:scale-[1.01]';

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

  const handleActivatePremium = () => {
    activatePremium({ source: 'test' });
    setMessage('Preview premium activated.');
  };

  const handleClearPremium = () => {
    deactivatePremium();
    setMessage('Preview premium cleared.');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.16),_transparent_30%),linear-gradient(180deg,_#09090b_0%,_#111113_100%)] px-4 py-5 text-white">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-400">
            <Settings className="h-4 w-4 text-emerald-300" />
            Control
          </div>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Profile, timer and premium
          </h1>

          <p className="mt-3 max-w-3xl text-sm text-zinc-300 sm:text-base">
            Clean control over your workout flow, recovery timing and premium progression.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className={cardClass}>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-300" />
              <p className={smallLabelClass}>Profile</p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div>
                <p className={smallLabelClass}>Identity</p>
                <p className={valueClass}>{identityLabel}</p>
              </div>
              <div>
                <p className={smallLabelClass}>Training level</p>
                <p className={valueClass}>{trainingLabel}</p>
              </div>
              <div>
                <p className={smallLabelClass}>Age</p>
                <p className={valueClass}>{profile?.age ?? '-'}</p>
              </div>
              <div>
                <p className={smallLabelClass}>Weight</p>
                <p className={valueClass}>{profile?.weight ?? '-'} kg</p>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-emerald-300" />
              <p className={smallLabelClass}>Workout timer</p>
            </div>

            <div className="mt-5">
              <p className={smallLabelClass}>Enable workout timer</p>
              <button
                type="button"
                onClick={() => setTimerEnabled((current) => !current)}
                className={`relative mt-2 h-8 w-14 rounded-full transition ${
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

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={smallLabelClass}>Set time (seconds)</label>
                <input
                  type="number"
                  value={setSeconds}
                  onChange={(e) => setSetSeconds(clampSeconds(e.target.value, setSeconds))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={smallLabelClass}>Rest time (seconds)</label>
                <input
                  type="number"
                  value={restSeconds}
                  onChange={(e) => setRestSeconds(clampSeconds(e.target.value, restSeconds))}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleSaveTimer}
                className={`${buttonClass} flex-1 bg-emerald-400 text-black`}
              >
                <Check className="mr-2 inline h-4 w-4" />
                Save timer
              </button>

              <button
                type="button"
                onClick={handleResetTimer}
                className={`${buttonClass} flex-1 border border-white/10 bg-white/[0.04] text-white`}
              >
                <RotateCcw className="mr-2 inline h-4 w-4" />
                Reset default
              </button>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-300" />
            <p className={smallLabelClass}>Premium</p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div>
              <p className={smallLabelClass}>Status</p>
              <p className={valueClass}>{premiumState.isActive ? 'Active' : 'Free'}</p>
            </div>
            <div>
              <p className={smallLabelClass}>Source</p>
              <p className={valueClass}>{premiumState.source}</p>
            </div>
            <div>
              <p className={smallLabelClass}>Tier</p>
              <p className={valueClass}>{premiumLabel}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleActivatePremium}
              className={`${buttonClass} bg-emerald-400 text-black`}
            >
              <Crown className="mr-2 inline h-4 w-4" />
              Preview unlock
            </button>

            <button
              type="button"
              onClick={handleClearPremium}
              className={`${buttonClass} border border-white/10 bg-transparent text-zinc-300`}
            >
              <RefreshCw className="mr-2 inline h-4 w-4" />
              Clear preview
            </button>
          </div>

          {message ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-200">
              {message}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}