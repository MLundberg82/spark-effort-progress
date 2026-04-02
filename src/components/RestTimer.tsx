import { useState, useEffect, useCallback, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const REST_PRESETS = [60, 90, 120, 150, 180, 240];
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

function saveTimerSettings(settings: TimerSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

const RestTimer = () => {
  const t = useT();
  const [settings, setSettings] = useState(getTimerSettings);
  const [seconds, setSeconds] = useState(settings.restDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(settings.restDuration);
  const [phase, setPhase] = useState<TimerPhase>('rest');
  const [showSettings, setShowSettings] = useState(false);
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
        // Play sound
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          osc.frequency.value = phase === 'rest' ? 880 : 660;
          osc.connect(ctx.destination);
          osc.start();
          setTimeout(() => osc.stop(), 200);
        } catch {}

        // Auto-loop: switch phase if autoStart is enabled
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

  const selectPreset = (s: number) => {
    setSeconds(s);
    setInitialSeconds(s);
    setIsRunning(false);
    setPhase('rest');
    workerRef.current?.postMessage({ type: 'reset', value: s });
  };

  const updateSettings = (partial: Partial<TimerSettings>) => {
    const newSettings = { ...settings, ...partial };
    setSettings(newSettings);
    saveTimerSettings(newSettings);
    if (partial.restDuration) {
      selectPreset(partial.restDuration);
    }
  };

  const progress = initialSeconds > 0 ? (seconds / initialSeconds) * 100 : 0;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const phaseColor = phase === 'set' ? 'hsl(var(--accent))' : 'hsl(var(--primary))';
  const phaseLabel = phase === 'set' ? (t('setDuration' as any) || 'Set') : (t('restTimer') || 'Rest');

  return (
    <div className="space-y-4">
      <div className="card-3d rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">{t('restTimer')}</h3>
          </div>
          {/* Phase indicator */}
          <span className={`text-xs px-3 py-1 rounded-full font-bold ${
            phase === 'set' 
              ? 'bg-accent/20 text-accent' 
              : 'bg-primary/20 text-primary'
          }`}>
            {phaseLabel}
          </span>
        </div>

        <div className="relative w-36 h-36 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke={phaseColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-linear"
              style={{ filter: `drop-shadow(0 0 8px ${phaseColor})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-display text-3xl font-bold text-foreground ${seconds <= 5 && isRunning ? 'animate-count-down text-destructive' : ''}`} key={seconds}>
              {mins}:{secs.toString().padStart(2, '0')}
            </span>
            {settings.autoStart && isRunning && (
              <span className="text-[10px] text-muted-foreground mt-1">Auto-loop ON</span>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-3 mb-4">
          <Button
            size="icon"
            variant="outline"
            onClick={reset}
            className="rounded-full border-border shadow-elevated"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            onClick={() => setIsRunning(!isRunning)}
            className="rounded-full w-14 h-14 gradient-primary text-primary-foreground btn-3d"
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          {REST_PRESETS.map(p => (
            <button
              key={p}
              onClick={() => selectPreset(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                initialSeconds === p && phase === 'rest'
                  ? 'gradient-primary text-primary-foreground shadow-button'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-elevated'
              }`}
            >
              {p >= 60 ? `${Math.floor(p / 60)}:${(p % 60).toString().padStart(2, '0')}` : `${p}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Timer Settings */}
      <Collapsible open={showSettings} onOpenChange={setShowSettings}>
        <div className="card-3d rounded-2xl overflow-hidden">
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">{t('timerSettings' as any) || 'Timer Settings'}</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4">
              {/* Set Duration */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t('setDuration' as any) || 'Set Duration'}</span>
                  <span className="text-foreground font-semibold">{settings.setDuration}s</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={120}
                  step={5}
                  value={settings.setDuration}
                  onChange={e => updateSettings({ setDuration: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>30s</span>
                  <span>2 min</span>
                </div>
              </div>

              {/* Rest Duration */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t('restDuration' as any) || 'Rest Duration'}</span>
                  <span className="text-foreground font-semibold">{Math.floor(settings.restDuration / 60)}:{(settings.restDuration % 60).toString().padStart(2, '0')}</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={240}
                  step={15}
                  value={settings.restDuration}
                  onChange={e => updateSettings({ restDuration: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>1 min</span>
                  <span>4 min</span>
                </div>
              </div>

              {/* Auto-start toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground block">{t('autoStartRest' as any) || 'Auto-loop timer'}</span>
                  <span className="text-[10px] text-muted-foreground/70">Cycles: Rest → Set → Rest...</span>
                </div>
                <button
                  onClick={() => updateSettings({ autoStart: !settings.autoStart })}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors shadow-inset ${settings.autoStart ? 'bg-primary' : 'bg-secondary'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-foreground transition-transform shadow-elevated ${settings.autoStart ? 'translate-x-4' : ''}`} />
                </button>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};

export default RestTimer;
