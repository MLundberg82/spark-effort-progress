import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const SETTINGS_KEY = 'gymrat-timer-settings';

interface TimerSettings {
  setDuration: number;
  restDuration: number;
  autoStart: boolean;
}

type TimerPhase = 'rest' | 'set';

function getTimerSettings(): TimerSettings {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (data) {
    try { return JSON.parse(data); } catch {}
  }
  return { setDuration: 45, restDuration: 120, autoStart: false };
}

const MiniTimer = () => {
  const settings = getTimerSettings();
  const [seconds, setSeconds] = useState(settings.restDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(settings.restDuration);
  const [phase, setPhase] = useState<TimerPhase>('rest');
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/timerWorker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e: MessageEvent) => {
      const { type, seconds: s } = e.data;
      if (type === 'tick') {
        setSeconds(s);
      } else if (type === 'done') {
        setSeconds(0);
        setIsRunning(false);
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          osc.frequency.value = phase === 'rest' ? 880 : 660;
          osc.connect(ctx.destination);
          osc.start();
          setTimeout(() => osc.stop(), 200);
        } catch {}

        const currentSettings = getTimerSettings();
        if (currentSettings.autoStart) {
          setTimeout(() => {
            setPhase(prev => {
              const nextPhase: TimerPhase = prev === 'rest' ? 'set' : 'rest';
              const nextDuration = nextPhase === 'rest' ? currentSettings.restDuration : currentSettings.setDuration;
              setSeconds(nextDuration);
              setInitialSeconds(nextDuration);
              setIsRunning(true);
              worker.postMessage({ type: 'set', value: nextDuration });
              worker.postMessage({ type: 'start' });
              return nextPhase;
            });
          }, 500);
        }
      }
    };

    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  useEffect(() => {
    if (!workerRef.current) return;
    if (isRunning) {
      workerRef.current.postMessage({ type: 'set', value: seconds });
      workerRef.current.postMessage({ type: 'start' });
    } else {
      workerRef.current.postMessage({ type: 'stop' });
    }
  }, [isRunning]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setPhase('rest');
    const s = getTimerSettings().restDuration;
    setSeconds(s);
    setInitialSeconds(s);
    workerRef.current?.postMessage({ type: 'reset', value: s });
  }, []);

  const progress = initialSeconds > 0 ? (seconds / initialSeconds) * 100 : 0;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds <= 5 && isRunning;

  return (
    <div className="sticky top-0 z-40 -mx-4 px-4 py-2 bg-card/90 backdrop-blur-md border-b border-border/50 shadow-elevated">
      <div className="flex items-center gap-3">
        {/* Mini circular progress */}
        <div className="relative w-10 h-10 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="17" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
            <circle
              cx="20" cy="20" r="17" fill="none"
              stroke={phase === 'set' ? 'hsl(var(--accent))' : 'hsl(var(--primary))'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 17}`}
              strokeDashoffset={`${2 * Math.PI * 17 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${isLow ? 'text-destructive' : 'text-foreground'}`}>
            {mins}:{secs.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Phase label */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          phase === 'set' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
        }`}>
          {phase === 'set' ? 'SET' : 'REST'}
        </span>

        <div className="flex-1" />

        {/* Controls */}
        <button onClick={reset} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="w-9 h-9 rounded-full gradient-primary text-primary-foreground flex items-center justify-center shadow-button"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
      </div>
    </div>
  );
};

export default MiniTimer;
