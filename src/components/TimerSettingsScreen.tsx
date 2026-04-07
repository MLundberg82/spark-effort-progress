import { useEffect, useState } from 'react';
import { ArrowLeft, Clock3, Minus, Plus, Save } from 'lucide-react';

type TimerSettingsScreenProps = {
  onBack: () => void;
};

type TimerLoopOption = 'auto' | 'manual';

const REST_TIMER_KEY = 'gymrat-rest-timer-seconds';
const SET_TIMER_KEY = 'gymrat-set-timer-seconds';
const TIMER_AUTO_LOOP_KEY = 'gymrat-timer-auto-loop';

function readTimerNumber(key: string, fallback: number) {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(key);
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

function readTimerBoolean(key: string, fallback: boolean) {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(key);
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return fallback;
}

function clampTimerValue(value: number) {
  return Math.max(10, Math.min(900, Math.round(value)));
}

function persistTimerSettings(
  setSeconds: number,
  restSeconds: number,
  autoLoop: boolean,
) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(SET_TIMER_KEY, String(setSeconds));
  localStorage.setItem(REST_TIMER_KEY, String(restSeconds));
  localStorage.setItem(TIMER_AUTO_LOOP_KEY, String(autoLoop));

  window.dispatchEvent(new Event('gymrat-timer-updated'));
  window.dispatchEvent(new Event('timer-settings-updated'));
}

function TimerRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;

  return (
    <div className="rounded-[20px] border border-white/12 bg-[#111111] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
            {label}
          </p>
          <p className="mt-1 text-[22px] font-black text-white">
            {minutes}:{String(seconds).padStart(2, '0')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(clampTimerValue(value - 5))}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/10 bg-black/45 text-white/82 transition hover:bg-[#161616] hover:text-white"
            aria-label={`Decrease ${label}`}
          >
            <Minus className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onChange(clampTimerValue(value + 5))}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/10 bg-black/45 text-white/82 transition hover:bg-[#161616] hover:text-white"
            aria-label={`Increase ${label}`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="w-full rounded-[16px] border border-white/10 bg-[#111111] px-3 py-3 text-sm font-semibold text-white outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function TimerSettingsScreen({
  onBack,
}: TimerSettingsScreenProps) {
  const [setSeconds, setSetSeconds] = useState(() =>
    readTimerNumber(SET_TIMER_KEY, 45),
  );
  const [restSeconds, setRestSeconds] = useState(() =>
    readTimerNumber(REST_TIMER_KEY, 90),
  );
  const [autoLoop, setAutoLoop] = useState(() =>
    readTimerBoolean(TIMER_AUTO_LOOP_KEY, true),
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timeout = window.setTimeout(() => setSaved(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [saved]);

  const handleSave = () => {
    persistTimerSettings(setSeconds, restSeconds, autoLoop);
    setSaved(true);
  };

  return (
    <div
      className="absolute inset-y-0 right-0 flex w-[80%] max-w-[420px] flex-col border-l border-white/12 bg-[#040404] shadow-[-24px_0_80px_rgba(0,0,0,0.72)]"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 pb-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-black/40 px-4 text-[11px] font-black uppercase tracking-[0.16em] text-white/82 transition hover:bg-[#161616] hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>

        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
            Menu
          </p>
          <h1 className="text-base font-black uppercase tracking-[0.16em] text-white">
            Timer
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        <div className="space-y-3">
          <div className="rounded-[24px] border border-white/12 bg-[#0f0f0f] p-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-black/40 text-white/76">
                <Clock3 className="h-4 w-4" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                  Timer
                </p>
                <h2 className="text-sm font-black uppercase tracking-[0.12em] text-white">
                  Workout timing
                </h2>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <TimerRow
                label="Set timer"
                value={setSeconds}
                onChange={setSetSeconds}
              />

              <TimerRow
                label="Rest timer"
                value={restSeconds}
                onChange={setRestSeconds}
              />

              <SelectField<TimerLoopOption>
                label="Timer loop"
                value={autoLoop ? 'auto' : 'manual'}
                onChange={(value) => setAutoLoop(value === 'auto')}
                options={[
                  { value: 'auto', label: 'Auto loop' },
                  { value: 'manual', label: 'Manual' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#040404] px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-lime-300 text-[11px] font-black uppercase tracking-[0.16em] text-black transition hover:brightness-105"
        >
          <Save className="h-4 w-4" />
          Save timer
        </button>

        {saved ? (
          <div className="mt-2 text-center text-[10px] font-black uppercase tracking-[0.18em] text-lime-200">
            Saved
          </div>
        ) : null}
      </div>
    </div>
  );
}