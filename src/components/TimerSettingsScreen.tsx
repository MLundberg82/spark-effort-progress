import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Clock3,
  Minus,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCcw,
  Repeat,
} from 'lucide-react';
import {
  getTimerSettings,
  getWorkoutTimerState,
  pauseWorkoutTimer,
  resetWorkoutTimerToPhase,
  setTimerSettings,
  startWorkoutTimer,
  stopWorkoutTimer,
  subscribeTimerSettings,
  subscribeWorkoutTimer,
  switchWorkoutTimerPhase,
  tickWorkoutTimer,
  type TimerPhase,
} from '@/lib/timerStore';

type TimerSettingsScreenProps = {
  onBack: () => void;
};

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0',
  )}`;
}

function clampSeconds(value: number) {
  return Math.max(5, Math.min(60 * 60, Math.round(value)));
}

function IconButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/80 transition hover:bg-white/[0.10] hover:text-white"
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function StepperRow({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  onChange: (next: number) => void;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.06] px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
            {label}
          </p>
          <p className="mt-1 text-lg font-black text-white">
            {value} {suffix}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <IconButton
            icon={<Minus size={16} />}
            label={`Decrease ${label}`}
            onClick={() => onChange(clampSeconds(value - 5))}
          />
          <IconButton
            icon={<Plus size={16} />}
            label={`Increase ${label}`}
            onClick={() => onChange(clampSeconds(value + 5))}
          />
        </div>
      </div>
    </div>
  );
}

function ToggleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-[18px] border px-3 py-2.5 text-sm font-black uppercase tracking-[0.1em] transition',
        active
          ? 'border-lime-300/30 bg-lime-300/14 text-white'
          : 'border-white/10 bg-white/[0.05] text-white/65 hover:text-white',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export default function TimerSettingsScreen({
  onBack,
}: TimerSettingsScreenProps) {
  const [settings, setSettings] = useState(getTimerSettings());
  const [timerState, setTimerState] = useState(getWorkoutTimerState());

  useEffect(() => {
    const unsubscribeSettings = subscribeTimerSettings(() => {
      setSettings(getTimerSettings());
    });

    const unsubscribeTimer = subscribeWorkoutTimer(() => {
      setTimerState(getWorkoutTimerState());
    });

    return () => {
      unsubscribeSettings();
      unsubscribeTimer();
    };
  }, []);

  useEffect(() => {
    if (!timerState.running) return;

    const interval = window.setInterval(() => {
      setTimerState(tickWorkoutTimer());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerState.running]);

  const activePhase: TimerPhase = timerState.phase;

  const updateSetSeconds = (next: number) => {
    const updated = setTimerSettings({ setSeconds: next });
    setSettings(updated);
    setTimerState(getWorkoutTimerState());
  };

  const updateRestSeconds = (next: number) => {
    const updated = setTimerSettings({ restSeconds: next });
    setSettings(updated);
    setTimerState(getWorkoutTimerState());
  };

  const toggleEnabled = () => {
    const updated = setTimerSettings({ enabled: !settings.enabled });
    setSettings(updated);
    setTimerState(getWorkoutTimerState());
  };

  const toggleAutoLoop = () => {
    const updated = setTimerSettings({ autoLoop: !settings.autoLoop });
    setSettings(updated);
    setTimerState(getWorkoutTimerState());
  };

  const handlePlayPause = () => {
    if (timerState.running) {
      pauseWorkoutTimer();
    } else {
      startWorkoutTimer();
    }

    setTimerState(getWorkoutTimerState());
  };

  const handleResetCurrent = () => {
    resetWorkoutTimerToPhase(activePhase);
    setTimerState(getWorkoutTimerState());
  };

  const handleSwitchPhase = () => {
    switchWorkoutTimerPhase();
    setTimerState(getWorkoutTimerState());
  };

  const handleStop = () => {
    stopWorkoutTimer();
    setTimerState(getWorkoutTimerState());
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-[4px]"
      onClick={onBack}
    >
      <div
        className="min-h-full px-4 pb-6 pt-[max(env(safe-area-inset-top),16px)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto w-full max-w-[440px] rounded-[32px] border border-white/10 bg-[#0b0b0b]/98 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/55 transition hover:text-white"
              >
                <ArrowLeft size={14} />
                Back
              </button>

              <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/42">
                Timer
              </p>
              <h2 className="mt-1 text-[28px] font-black leading-none text-white">
                Rest & set flow
              </h2>
              <p className="mt-2 max-w-[28rem] text-sm leading-relaxed text-white/62">
                Dedicated timer controls. Cleaner than keeping it jammed into
                the main menu.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-white/75">
              <Clock3 size={18} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <ToggleButton
              label={settings.enabled ? 'Timer on' : 'Timer off'}
              active={settings.enabled}
              onClick={toggleEnabled}
            />
            <ToggleButton
              label={settings.autoLoop ? 'Loop on' : 'Loop off'}
              active={settings.autoLoop}
              onClick={toggleAutoLoop}
            />
          </div>

          <div className="mt-4 space-y-3">
            <StepperRow
              label="Set duration"
              value={settings.setSeconds}
              suffix="sec"
              onChange={updateSetSeconds}
            />

            <StepperRow
              label="Rest duration"
              value={settings.restSeconds}
              suffix="sec"
              onChange={updateRestSeconds}
            />
          </div>

          <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.06] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                  Current phase
                </p>
                <p className="mt-1 text-lg font-black text-white">
                  {activePhase === 'set' ? 'Set phase' : 'Rest phase'}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-base font-black text-white">
                {formatSeconds(timerState.remainingSeconds)}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <ToggleButton
                label="Set"
                active={activePhase === 'set'}
                onClick={() => {
                  resetWorkoutTimerToPhase('set');
                  setTimerState(getWorkoutTimerState());
                }}
              />
              <ToggleButton
                label="Rest"
                active={activePhase === 'rest'}
                onClick={() => {
                  resetWorkoutTimerToPhase('rest');
                  setTimerState(getWorkoutTimerState());
                }}
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handlePlayPause}
                className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-[20px] bg-lime-300 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:brightness-105"
              >
                {timerState.running ? (
                  <PauseCircle size={18} />
                ) : (
                  <PlayCircle size={18} />
                )}
                {timerState.running ? 'Pause' : 'Start'}
              </button>

              <button
                type="button"
                onClick={handleResetCurrent}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.09]"
              >
                <RefreshCcw size={16} />
                Reset
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleSwitchPhase}
                className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.09]"
              >
                <Repeat size={15} />
                Switch phase
              </button>

              <button
                type="button"
                onClick={handleStop}
                className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white/82 transition hover:bg-white/[0.09] hover:text-white"
              >
                <PauseCircle size={15} />
                Stop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}