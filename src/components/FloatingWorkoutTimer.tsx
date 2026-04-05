import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, TimerReset } from 'lucide-react';
import {
  getTimerSettings,
  getWorkoutTimerState,
  pauseWorkoutTimer,
  resetWorkoutTimerToPhase,
  startWorkoutTimer,
  tickWorkoutTimer,
} from '@/lib/timerStore';

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function FloatingWorkoutTimer() {
  const [settings, setSettings] = useState(getTimerSettings());
  const [timerState, setTimerState] = useState(getWorkoutTimerState());

  useEffect(() => {
    const syncSettings = () => setSettings(getTimerSettings());
    const syncTimer = () => setTimerState(getWorkoutTimerState());

    window.addEventListener('timer-settings-updated', syncSettings);
    window.addEventListener('workout-timer-updated', syncTimer);

    return () => {
      window.removeEventListener('timer-settings-updated', syncSettings);
      window.removeEventListener('workout-timer-updated', syncTimer);
    };
  }, []);

  useEffect(() => {
    if (!timerState.running) return;

    const interval = window.setInterval(() => {
      const next = tickWorkoutTimer();
      setTimerState(next);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerState.running]);

  if (!settings.enabled) return null;

  const isSet = timerState.phase === 'set';

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-[220px] rounded-[24px] border border-white/10 bg-zinc-950/95 p-3 text-white shadow-2xl backdrop-blur">
      <div className="flex items-center gap-2">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isSet ? 'bg-lime-400/15 text-lime-300' : 'bg-sky-400/15 text-sky-300'}`}>
          <TimerReset className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            {isSet ? 'Set' : 'Rest'}
          </p>
          <p className="text-2xl font-bold tabular-nums">
            {formatSeconds(timerState.remainingSeconds)}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            if (timerState.running) {
              pauseWorkoutTimer();
              setTimerState(getWorkoutTimerState());
            } else {
              startWorkoutTimer();
              setTimerState(getWorkoutTimerState());
            }
          }}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-lime-400 font-semibold text-black"
        >
          {timerState.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={() => {
            resetWorkoutTimerToPhase('set');
            setTimerState(getWorkoutTimerState());
          }}
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
        >
          Set
        </button>

        <button
          type="button"
          onClick={() => {
            resetWorkoutTimerToPhase('rest');
            setTimerState(getWorkoutTimerState());
          }}
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}