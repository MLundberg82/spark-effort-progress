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
    window.addEventListener('storage', syncSettings);
    window.addEventListener('storage', syncTimer);

    return () => {
      window.removeEventListener('timer-settings-updated', syncSettings);
      window.removeEventListener('workout-timer-updated', syncTimer);
      window.removeEventListener('storage', syncSettings);
      window.removeEventListener('storage', syncTimer);
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
    <div className="fixed bottom-4 right-4 z-30 w-[min(92vw,360px)] rounded-[28px] border border-white/10 bg-[#111113]/95 p-4 text-white shadow-[0_20px_70px_rgba(0,0,0,0.4)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            Workout timer
          </p>
          <h3 className="mt-1 text-xl font-black">
            {isSet ? 'Set' : 'Rest'}
          </h3>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
            isSet
              ? 'bg-emerald-400/15 text-emerald-300'
              : 'bg-sky-400/15 text-sky-300'
          }`}
        >
          {timerState.running ? 'Running' : 'Paused'}
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-4 text-center">
        <p className="text-4xl font-black tracking-tight text-white">
          {formatSeconds(timerState.remainingSeconds)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            if (timerState.running) {
              const next = pauseWorkoutTimer();
              setTimerState(next);
            } else {
              const next = startWorkoutTimer();
              setTimerState(next);
            }
          }}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-lime-400 font-semibold text-black"
        >
          {timerState.running ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            const next = resetWorkoutTimerToPhase('set');
            setTimerState(next);
          }}
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            const next = resetWorkoutTimerToPhase('rest');
            setTimerState(next);
          }}
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
        >
          <TimerReset className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}