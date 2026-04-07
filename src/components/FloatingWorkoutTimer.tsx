import { useEffect, useState } from 'react';
import {
  Pause,
  Play,
  RefreshCcw,
  Repeat,
  TimerReset,
  X,
} from 'lucide-react';
import {
  getTimerSettings,
  getWorkoutTimerState,
  pauseWorkoutTimer,
  resetWorkoutTimerToPhase,
  startWorkoutTimer,
  stopWorkoutTimer,
  subscribeTimerSettings,
  subscribeWorkoutTimer,
  switchWorkoutTimerPhase,
  tickWorkoutTimer,
  type TimerPhase,
} from '@/lib/timerStore';

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function PhasePill({
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
        'rounded-[14px] border px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] transition',
        active
          ? 'border-lime-300/30 bg-lime-300/[0.10] text-white'
          : 'border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.08] hover:text-white',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export default function FloatingWorkoutTimer() {
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

  if (!settings.enabled) return null;

  const activePhase: TimerPhase = timerState.phase;
  const setActive = activePhase === 'set';

  return (
    <div className="fixed left-1/2 top-3 z-[70] w-[calc(100%-24px)] max-w-[420px] -translate-x-1/2 rounded-[24px] border border-white/10 bg-[#070707]/96 px-3.5 py-3 text-white shadow-[0_18px_60px_rgba(0,0,0,0.42)] backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-lime-300/85">
            Workout timer
          </div>
          <div className="mt-1 text-[12px] text-white/58">
            Manual start · {settings.autoLoop ? 'Auto loop on' : 'Single cycle'}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            stopWorkoutTimer();
            setTimerState(getWorkoutTimerState());
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/65 transition hover:bg-white/[0.08] hover:text-white"
          aria-label="Stop timer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <PhasePill
          label="Set"
          active={setActive}
          onClick={() => {
            resetWorkoutTimerToPhase('set');
            setTimerState(getWorkoutTimerState());
          }}
        />
        <PhasePill
          label="Rest"
          active={!setActive}
          onClick={() => {
            resetWorkoutTimerToPhase('rest');
            setTimerState(getWorkoutTimerState());
          }}
        />
      </div>

      <div className="mt-3 rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-4 text-center">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
          {setActive ? 'Set phase' : 'Rest phase'}
        </div>
        <div className="mt-1 text-[36px] font-black tracking-tight text-white">
          {formatSeconds(timerState.remainingSeconds)}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            if (timerState.running) {
              pauseWorkoutTimer();
            } else {
              startWorkoutTimer();
            }
            setTimerState(getWorkoutTimerState());
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] bg-lime-300 text-[11px] font-black uppercase tracking-[0.14em] text-black transition hover:brightness-105"
          aria-label={timerState.running ? 'Pause timer' : 'Start timer'}
        >
          {timerState.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {timerState.running ? 'Pause' : 'Start'}
        </button>

        <button
          type="button"
          onClick={() => {
            resetWorkoutTimerToPhase(activePhase);
            setTimerState(getWorkoutTimerState());
          }}
          className="inline-flex h-11 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
          aria-label="Reset current phase"
        >
          <RefreshCcw className="h-4 w-4 text-white" />
        </button>

        <button
          type="button"
          onClick={() => {
            switchWorkoutTimerPhase();
            setTimerState(getWorkoutTimerState());
          }}
          className="inline-flex h-11 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
          aria-label="Switch phase"
        >
          {settings.autoLoop ? (
            <Repeat className="h-4 w-4 text-white" />
          ) : (
            <TimerReset className="h-4 w-4 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}