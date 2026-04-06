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
      className={`rounded-2xl px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition ${
        active
          ? 'border border-lime-300/25 bg-lime-300/12 text-lime-100'
          : 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
      }`}
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
    <div className="fixed bottom-4 right-4 z-50 w-[min(92vw,300px)] rounded-[24px] border border-white/10 bg-black/88 p-3.5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-lime-300/80">
            Workout timer
          </div>
          <div className="mt-1 text-[11px] font-bold text-white/55">
            Manual start · {settings.autoLoop ? 'Auto loop on' : 'Single cycle'}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            stopWorkoutTimer();
            setTimerState(getWorkoutTimerState());
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/65 transition hover:bg-white/10 hover:text-white"
          aria-label="Stop timer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <PhasePill
          label={`Set · ${settings.setSeconds}s`}
          active={setActive}
          onClick={() => {
            resetWorkoutTimerToPhase('set');
            setTimerState(getWorkoutTimerState());
          }}
        />

        <PhasePill
          label={`Rest · ${settings.restSeconds}s`}
          active={!setActive}
          onClick={() => {
            resetWorkoutTimerToPhase('rest');
            setTimerState(getWorkoutTimerState());
          }}
        />
      </div>

      <div className="mt-3 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-center">
        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
          {setActive ? 'Set phase' : 'Rest phase'}
        </div>
        <div className="mt-1 text-4xl font-black tracking-tight">
          {formatSeconds(timerState.remainingSeconds)}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
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
          className="inline-flex h-10 items-center justify-center rounded-2xl bg-lime-300 text-black transition hover:brightness-105"
          aria-label={timerState.running ? 'Pause timer' : 'Start timer'}
        >
          {timerState.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={() => {
            resetWorkoutTimerToPhase(activePhase);
            setTimerState(getWorkoutTimerState());
          }}
          className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10"
          aria-label="Reset current phase"
        >
          <TimerReset className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            switchWorkoutTimerPhase();
            setTimerState(getWorkoutTimerState());
          }}
          className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10"
          aria-label="Switch phase"
        >
          <RefreshCcw className="h-4 w-4" />
        </button>

        <button
          type="button"
          className={`inline-flex h-10 items-center justify-center rounded-2xl border transition ${
            settings.autoLoop
              ? 'border-lime-300/25 bg-lime-300/12 text-lime-100'
              : 'border-white/10 bg-white/5 text-white/60'
          }`}
          aria-label="Auto loop indicator"
          disabled
        >
          <Repeat className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}