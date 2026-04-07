import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Dumbbell,
  Flame,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Timer,
} from 'lucide-react';

type Focus = 'chest' | 'back' | 'arms' | 'legs';

type WorkoutFlowProps = {
  initialFocus?: Focus;
  onBack: () => void;
  onComplete: () => void;
};

type Step = 'choose' | 'preview' | 'active' | 'complete';
type TimerMode = 'set' | 'rest';

type WorkoutPreset = {
  id: Focus;
  title: string;
  subtitle: string;
  description: string;
  vibe: string;
  exercises: string[];
};

type SetEntry = {
  weight: string;
  reps: string;
};

type WorkoutLog = Record<string, SetEntry[]>;

const REST_TIMER_KEY = 'gymrat-rest-timer-seconds';
const SET_TIMER_KEY = 'gymrat-set-timer-seconds';
const TIMER_AUTO_LOOP_KEY = 'gymrat-timer-auto-loop';

const PRESETS: WorkoutPreset[] = [
  {
    id: 'chest',
    title: 'Chest',
    subtitle: 'Push strength & upper chest',
    description:
      'A clean chest-focused session built for tension, pump and progression.',
    vibe: 'Heavy push session',
    exercises: [
      'Bench Press',
      'Incline Dumbbell Press',
      'Chest Fly',
      'Cable Press',
    ],
  },
  {
    id: 'back',
    title: 'Back',
    subtitle: 'Thickness, width & posture',
    description:
      'A back day that hits lats, upper back and pulling strength with control.',
    vibe: 'Wide + dense back',
    exercises: [
      'Lat Pulldown',
      'Barbell Row',
      'Seated Cable Row',
      'Face Pull',
    ],
  },
  {
    id: 'arms',
    title: 'Arms',
    subtitle: 'Biceps, triceps & sleeve pump',
    description:
      'Direct volume, clean structure and a satisfying pump-driven finish.',
    vibe: 'Peak pump session',
    exercises: [
      'Barbell Curl',
      'Hammer Curl',
      'Tricep Pushdown',
      'Overhead Extension',
    ],
  },
  {
    id: 'legs',
    title: 'Legs',
    subtitle: 'Strength, drive & lower body work',
    description:
      'A lower body session for quads, glutes and strong basics that move the needle.',
    vibe: 'Serious lower body',
    exercises: ['Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Curl'],
  },
];

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

function writeTimerNumber(key: string, value: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, String(value));
  window.dispatchEvent(new Event('gymrat-timer-updated'));
  window.dispatchEvent(new Event('timer-settings-updated'));
}

function formatSeconds(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function clampTimerValue(value: number) {
  return Math.max(10, Math.min(900, Math.round(value)));
}

function createInitialLog(exercises: string[]): WorkoutLog {
  return exercises.reduce<WorkoutLog>((acc, exercise) => {
    acc[exercise] = Array.from({ length: 4 }, () => ({
      weight: '',
      reps: '',
    }));
    return acc;
  }, {});
}

function ScreenShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[460px] flex-col px-4 pb-7 pt-4">
        {children}
      </div>
    </div>
  );
}

function TopBar({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
        aria-label="Back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1 text-right">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
          Workout Flow
        </p>
        <h1 className="mt-1 text-[22px] font-black leading-none text-white">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm leading-5 text-white/55">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function PresetCard({
  preset,
  onSelect,
}: {
  preset: WorkoutPreset;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.07]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-lime-300/80">
            {preset.vibe}
          </p>
          <h3 className="mt-2 text-[20px] font-black leading-none text-white">
            {preset.title}
          </h3>
          <p className="mt-2 text-sm text-white/55">{preset.subtitle}</p>
        </div>

        <div className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.05] text-white/70">
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-white/68">
        {preset.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {preset.exercises.map((exercise) => (
          <span
            key={exercise}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-white/72"
          >
            {exercise}
          </span>
        ))}
      </div>
    </button>
  );
}

function PreviewExerciseRow({
  index,
  label,
}: {
  index: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.03] px-3 py-3">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.04] text-[11px] font-black text-white/75">
        {index + 1}
      </div>
      <span className="text-sm font-semibold text-white/86">{label}</span>
    </div>
  );
}

function ActiveExerciseCard({
  index,
  label,
  sets,
  onUpdateSet,
  onAddSet,
}: {
  index: number;
  label: string;
  sets: SetEntry[];
  onUpdateSet: (
    setIndex: number,
    field: 'weight' | 'reps',
    value: string,
  ) => void;
  onAddSet: () => void;
}) {
  return (
    <section className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
            Exercise {index + 1}
          </p>
          <h3 className="mt-1 text-base font-black text-white">{label}</h3>
        </div>

        <div className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
          Preset
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {sets.map((setEntry, setIndex) => (
          <div
            key={`${label}-${setIndex}`}
            className="grid grid-cols-[58px_1fr_1fr] items-center gap-2 rounded-[16px] border border-white/10 bg-black/20 px-2.5 py-2.5"
          >
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white/42">
              Set {setIndex + 1}
            </div>

            <label className="flex min-w-0 items-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.04] px-3 py-2">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                KG
              </span>
              <input
                value={setEntry.weight}
                onChange={(event) =>
                  onUpdateSet(setIndex, 'weight', event.target.value)
                }
                inputMode="decimal"
                placeholder="0"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/20"
              />
            </label>

            <label className="flex min-w-0 items-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.04] px-3 py-2">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                Reps
              </span>
              <input
                value={setEntry.reps}
                onChange={(event) =>
                  onUpdateSet(setIndex, 'reps', event.target.value)
                }
                inputMode="numeric"
                placeholder="0"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/20"
              />
            </label>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddSet}
        className="mt-2.5 inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-4 text-[11px] font-black uppercase tracking-[0.16em] text-white/78 transition hover:bg-white/[0.08] hover:text-white"
      >
        <Plus className="h-4 w-4" />
        Add set
      </button>
    </section>
  );
}

function FloatingTimer({
  mode,
  secondsLeft,
  isRunning,
  autoLoop,
  onToggle,
  onReset,
  onCycleMode,
  onAdjustCurrentMode,
}: {
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  autoLoop: boolean;
  onToggle: () => void;
  onReset: () => void;
  onCycleMode: () => void;
  onAdjustCurrentMode: (delta: number) => void;
}) {
  return (
    <div className="sticky top-0 z-30 mb-4 pt-[max(env(safe-area-inset-top),0px)]">
      <div className="rounded-[24px] border border-white/10 bg-black/75 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onCycleMode}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/72 transition hover:bg-white/[0.08] hover:text-white"
          >
            {mode === 'set' ? 'Set timer' : 'Rest timer'}
          </button>

          <div className="rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-lime-200">
            {autoLoop ? 'Auto loop' : 'Manual'}
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-white/55">
              <Timer className="h-4 w-4" />
              <span className="text-[11px] font-black uppercase tracking-[0.18em]">
                Active timer
              </span>
            </div>
            <div className="mt-1 text-[34px] font-black leading-none text-white">
              {formatSeconds(secondsLeft)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAdjustCurrentMode(-5)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/82 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Minus 5 seconds"
            >
              <Minus className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => onAdjustCurrentMode(5)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/82 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Plus 5 seconds"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] bg-lime-300 text-[11px] font-black uppercase tracking-[0.16em] text-black transition hover:brightness-105"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.04] text-[11px] font-black uppercase tracking-[0.16em] text-white/82 transition hover:bg-white/[0.08] hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkoutFlow({
  initialFocus,
  onBack,
  onComplete,
}: WorkoutFlowProps) {
  const [step, setStep] = useState<Step>(initialFocus ? 'preview' : 'choose');
  const [selectedId, setSelectedId] = useState<Focus | null>(
    initialFocus ?? null,
  );
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog>({});
  const [setSeconds, setSetSeconds] = useState(() =>
    readTimerNumber(SET_TIMER_KEY, 45),
  );
  const [restSeconds, setRestSeconds] = useState(() =>
    readTimerNumber(REST_TIMER_KEY, 90),
  );
  const [autoLoop, setAutoLoop] = useState(() =>
    readTimerBoolean(TIMER_AUTO_LOOP_KEY, true),
  );
  const [timerMode, setTimerMode] = useState<TimerMode>('set');
  const [secondsLeft, setSecondsLeft] = useState(() =>
    readTimerNumber(SET_TIMER_KEY, 45),
  );
  const [timerRunning, setTimerRunning] = useState(false);

  const selectedPreset = useMemo(
    () => PRESETS.find((preset) => preset.id === selectedId) ?? null,
    [selectedId],
  );

  const filledSetCount = useMemo(() => {
    if (!selectedPreset) return 0;

    return selectedPreset.exercises.reduce((count, exercise) => {
      const sets = workoutLog[exercise] ?? [];
      return (
        count +
        sets.filter(
          (setEntry) =>
            setEntry.weight.trim() !== '' || setEntry.reps.trim() !== '',
        ).length
      );
    }, 0);
  }, [selectedPreset, workoutLog]);

  useEffect(() => {
    const syncTimerSettings = () => {
      const nextSet = readTimerNumber(SET_TIMER_KEY, 45);
      const nextRest = readTimerNumber(REST_TIMER_KEY, 90);
      const nextAutoLoop = readTimerBoolean(TIMER_AUTO_LOOP_KEY, true);

      setSetSeconds(nextSet);
      setRestSeconds(nextRest);
      setAutoLoop(nextAutoLoop);

      setSecondsLeft((current) => {
        if (timerRunning) return current;
        return timerMode === 'set' ? nextSet : nextRest;
      });
    };

    window.addEventListener('storage', syncTimerSettings);
    window.addEventListener(
      'gymrat-timer-updated',
      syncTimerSettings as EventListener,
    );
    window.addEventListener(
      'timer-settings-updated',
      syncTimerSettings as EventListener,
    );

    return () => {
      window.removeEventListener('storage', syncTimerSettings);
      window.removeEventListener(
        'gymrat-timer-updated',
        syncTimerSettings as EventListener,
      );
      window.removeEventListener(
        'timer-settings-updated',
        syncTimerSettings as EventListener,
      );
    };
  }, [timerMode, timerRunning]);

  useEffect(() => {
    if (!timerRunning) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          if (autoLoop) {
            const nextMode: TimerMode = timerMode === 'set' ? 'rest' : 'set';
            setTimerMode(nextMode);
            return nextMode === 'set' ? setSeconds : restSeconds;
          }

          setTimerRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerRunning, timerMode, setSeconds, restSeconds, autoLoop]);

  const resetTimerToCurrentMode = (mode: TimerMode) => {
    setSecondsLeft(mode === 'set' ? setSeconds : restSeconds);
  };

  const handleCycleMode = () => {
    const nextMode: TimerMode = timerMode === 'set' ? 'rest' : 'set';
    setTimerMode(nextMode);
    setTimerRunning(false);
    setSecondsLeft(nextMode === 'set' ? setSeconds : restSeconds);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    resetTimerToCurrentMode(timerMode);
  };

  const handleAdjustCurrentMode = (delta: number) => {
    const key = timerMode === 'set' ? SET_TIMER_KEY : REST_TIMER_KEY;
    const currentBase = timerMode === 'set' ? setSeconds : restSeconds;
    const nextValue = clampTimerValue(currentBase + delta);

    if (timerMode === 'set') {
      setSetSeconds(nextValue);
    } else {
      setRestSeconds(nextValue);
    }

    writeTimerNumber(key, nextValue);
    setSecondsLeft(nextValue);
    setTimerRunning(false);
  };

  if (step === 'choose') {
    return (
      <ScreenShell>
        <TopBar
          title="Choose split"
          subtitle="Pick a focused session and go straight into the work."
          onBack={onBack}
        />

        <div className="mt-5 grid gap-3">
          {PRESETS.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onSelect={() => {
                setSelectedId(preset.id);
                setWorkoutLog(createInitialLog(preset.exercises));
                setStep('preview');
              }}
            />
          ))}
        </div>
      </ScreenShell>
    );
  }

  if (step === 'preview' && selectedPreset) {
    return (
      <ScreenShell>
        <TopBar
          title={`${selectedPreset.title} day`}
          subtitle={selectedPreset.description}
          onBack={() => setStep('choose')}
        />

        <div className="mt-5 rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-300/80">
                Session preview
              </p>
              <h2 className="mt-2 text-[24px] font-black leading-none text-white">
                {selectedPreset.title}
              </h2>
              <p className="mt-2 text-sm text-white/58">
                {selectedPreset.vibe}
              </p>
            </div>

            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] text-white/75">
              <Dumbbell className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-[18px] border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                Focus
              </p>
              <p className="mt-1 text-sm font-bold text-white/86">
                {selectedPreset.vibe}
              </p>
            </div>

            <div className="rounded-[18px] border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                Exercises
              </p>
              <p className="mt-1 text-sm font-bold text-white/86">
                {selectedPreset.exercises.length} included
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-2.5">
          {selectedPreset.exercises.map((exercise, index) => (
            <PreviewExerciseRow
              key={exercise}
              index={index}
              label={exercise}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setStep('active');
            setTimerMode('set');
            setSecondsLeft(setSeconds);
            setTimerRunning(false);
          }}
          className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-[20px] bg-lime-300 text-[12px] font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.2)] transition hover:brightness-105"
        >
          <Flame className="h-4 w-4" />
          Start workout
        </button>
      </ScreenShell>
    );
  }

  if (step === 'active' && selectedPreset) {
    return (
      <ScreenShell>
        <TopBar
          title={selectedPreset.title}
          subtitle={`${selectedPreset.exercises.length} exercises loaded`}
          onBack={() => {
            setTimerRunning(false);
            setStep('preview');
          }}
        />

        <FloatingTimer
          mode={timerMode}
          secondsLeft={secondsLeft}
          isRunning={timerRunning}
          autoLoop={autoLoop}
          onToggle={() => setTimerRunning((prev) => !prev)}
          onReset={handleResetTimer}
          onCycleMode={handleCycleMode}
          onAdjustCurrentMode={handleAdjustCurrentMode}
        />

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
              Logged sets
            </p>
            <p className="mt-1 text-lg font-black text-white">
              {filledSetCount}
            </p>
          </div>

          <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
              Timer mode
            </p>
            <p className="mt-1 text-lg font-black capitalize text-white">
              {timerMode}
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          {selectedPreset.exercises.map((exercise, index) => {
            const sets = workoutLog[exercise] ?? [];

            return (
              <ActiveExerciseCard
                key={exercise}
                index={index}
                label={exercise}
                sets={sets}
                onUpdateSet={(setIndex, field, value) => {
                  setWorkoutLog((prev) => {
                    const currentSets = prev[exercise] ?? [];
                    const nextSets = currentSets.map((entry, currentIndex) =>
                      currentIndex === setIndex
                        ? { ...entry, [field]: value }
                        : entry,
                    );

                    return {
                      ...prev,
                      [exercise]: nextSets,
                    };
                  });
                }}
                onAddSet={() => {
                  setWorkoutLog((prev) => {
                    const currentSets = prev[exercise] ?? [];
                    return {
                      ...prev,
                      [exercise]: [
                        ...currentSets,
                        {
                          weight: '',
                          reps: '',
                        },
                      ],
                    };
                  });
                }}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            setTimerRunning(false);
            setStep('complete');
          }}
          className="mt-4 inline-flex h-13 w-full items-center justify-center gap-2 rounded-[18px] bg-lime-300 text-[12px] font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.2)] transition hover:brightness-105"
        >
          <Check className="h-4 w-4" />
          Complete workout
        </button>
      </ScreenShell>
    );
  }

  if (step === 'complete' && selectedPreset) {
    return (
      <ScreenShell>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-[24px] border border-lime-300/20 bg-lime-300/10 text-lime-200">
            <Check className="h-7 w-7" />
          </div>

          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
            Session complete
          </p>
          <h1 className="mt-2 text-[34px] font-black leading-none text-white">
            Strong work.
          </h1>
          <p className="mt-4 max-w-[320px] text-sm leading-6 text-white/62">
            You completed your {selectedPreset.title.toLowerCase()} workout and
            kept the momentum alive.
          </p>

          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                Completed
              </p>
              <p className="mt-1 text-lg font-black text-white">
                {selectedPreset.exercises.length} exercises
              </p>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                Logged sets
              </p>
              <p className="mt-1 text-lg font-black text-white">
                {filledSetCount}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onComplete}
            className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-[20px] bg-lime-300 text-[12px] font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.2)] transition hover:brightness-105"
          >
            Back to home
          </button>
        </div>
      </ScreenShell>
    );
  }

  return null;
}