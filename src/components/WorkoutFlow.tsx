import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  Play,
  Sparkles,
  CheckCircle2,
  Lock,
  Pause,
  RotateCcw,
  Minus,
  Plus,
} from 'lucide-react';

type Focus = 'chest' | 'back' | 'arms' | 'legs';

type WorkoutFlowProps = {
  initialFocus?: Focus;
  onBack: () => void;
  onComplete: () => void;
};

type WorkoutPreset = {
  id: Focus;
  title: string;
  subtitle: string;
  description: string;
  exercises: string[];
  vibe: string;
};

type Step = 'choose' | 'preview' | 'active' | 'complete';
type TimerMode = 'set' | 'rest';

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
      'A clean chest-focused session built for pump, tension and progression.',
    exercises: [
      'Bench Press',
      'Incline Dumbbell Press',
      'Chest Fly',
      'Cable Press',
    ],
    vibe: 'Heavy push session',
  },
  {
    id: 'back',
    title: 'Back',
    subtitle: 'Thickness, width & posture',
    description:
      'A back day that hits lats, upper back and controlled pulling strength.',
    exercises: [
      'Lat Pulldown',
      'Barbell Row',
      'Seated Cable Row',
      'Face Pull',
    ],
    vibe: 'Wide + dense back',
  },
  {
    id: 'arms',
    title: 'Arms',
    subtitle: 'Biceps, triceps & sleeve pump',
    description:
      'A focused arm day with direct volume and a satisfying pump-driven finish.',
    exercises: [
      'Barbell Curl',
      'Hammer Curl',
      'Tricep Pushdown',
      'Overhead Extension',
    ],
    vibe: 'Peak pump session',
  },
  {
    id: 'legs',
    title: 'Legs',
    subtitle: 'Strength, drive & lower body work',
    description:
      'A lower body session for quads, glutes and leg power with strong basics.',
    exercises: [
      'Squat',
      'Leg Press',
      'Romanian Deadlift',
      'Leg Curl',
    ],
    vibe: 'Serious lower body',
  },
];

function createInitialLog(exercises: string[]): WorkoutLog {
  return exercises.reduce<WorkoutLog>((acc, exercise) => {
    acc[exercise] = Array.from({ length: 4 }, () => ({
      weight: '',
      reps: '',
    }));
    return acc;
  }, {});
}

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

function ScreenShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white">
      <div className="mx-auto w-full max-w-md px-4 pb-24 pt-4">{children}</div>
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
    <div className="mb-4 flex items-start gap-3">
      <button
        onClick={onBack}
        className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
        aria-label="Back"
      >
        <ArrowLeft className="h-4.5 w-4.5" />
      </button>

      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-300/85">
          Workout Flow
        </p>
        <h1 className="mt-1 text-[28px] font-black tracking-tight text-white">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm leading-6 text-white/60">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function ExerciseChip({ label }: { label: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-white/78">
      {label}
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
      onClick={onSelect}
      className="w-full rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-4 text-left shadow-[0_18px_48px_rgba(0,0,0,0.28)] transition hover:border-lime-300/20 hover:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/18 bg-lime-300/10 px-2.5 py-1">
            <Flame className="h-3.5 w-3.5 text-lime-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-lime-200">
              {preset.vibe}
            </span>
          </div>

          <h2 className="mt-3 text-[24px] font-black tracking-tight text-white">
            {preset.title}
          </h2>
          <p className="mt-1 text-sm font-medium text-white/70">
            {preset.subtitle}
          </p>
          <p className="mt-2.5 text-[13px] leading-6 text-white/56">
            {preset.description}
          </p>
        </div>

        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/80">
          <ChevronRight className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/42">
          Included exercises
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {preset.exercises.map((exercise) => (
            <ExerciseChip key={exercise} label={exercise} />
          ))}
        </div>
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
    <div className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <div className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime-300 text-[10px] font-black text-black">
        {index + 1}
      </div>
      <span className="text-[13px] font-semibold text-white/88">{label}</span>
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
  onUpdateSet: (setIndex: number, field: 'weight' | 'reps', value: string) => void;
  onAddSet: () => void;
}) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-white/[0.03] p-3 shadow-[0_10px_24px_rgba(0,0,0,0.14)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-lime-300/80">
            Exercise {index + 1}
          </p>
          <h3 className="mt-1 text-[16px] font-black tracking-tight text-white">
            {label}
          </h3>
        </div>

        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/25">
          <Dumbbell className="h-3.5 w-3.5 text-white/80" />
        </div>
      </div>

      <div className="mt-2.5 rounded-[14px] border border-yellow-300/16 bg-yellow-300/[0.06] px-3 py-2">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-yellow-200" />
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-yellow-100">
            Preset locked
          </p>
        </div>
        <p className="mt-1 text-[10px] leading-4 text-white/56">
          Exercises stay fixed. Custom workouts can be premium later.
        </p>
      </div>

      <div className="mt-2.5 space-y-2">
        {sets.map((setEntry, setIndex) => (
          <div
            key={`${label}-set-${setIndex}`}
            className="rounded-[14px] border border-white/10 bg-black/16 p-2.5"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-lime-300/80">
                Set {setIndex + 1}
              </p>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-white/44">
                Log
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.16em] text-white/40">
                  Weight
                </span>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    value={setEntry.weight}
                    onChange={(event) =>
                      onUpdateSet(setIndex, 'weight', event.target.value)
                    }
                    placeholder="0"
                    className="h-10 w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-3 pr-8 text-sm font-semibold text-white outline-none transition placeholder:text-white/24 focus:border-lime-300/35 focus:bg-white/[0.06]"
                  />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-[0.12em] text-white/36">
                    kg
                  </span>
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.16em] text-white/40">
                  Reps
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={setEntry.reps}
                  onChange={(event) =>
                    onUpdateSet(setIndex, 'reps', event.target.value)
                  }
                  placeholder="0"
                  className="h-10 w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/24 focus:border-lime-300/35 focus:bg-white/[0.06]"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onAddSet}
        className="mt-2.5 flex h-9 w-full items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.04] text-[10px] font-black uppercase tracking-[0.16em] text-white/82 transition hover:bg-white/[0.08]"
      >
        Add set
      </button>
    </div>
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
    <div className="fixed bottom-3 left-1/2 z-40 w-[calc(100%-24px)] max-w-md -translate-x-1/2 rounded-[18px] border border-white/10 bg-[#0a0a0a]/94 p-3 shadow-[0_22px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <button
        onClick={onCycleMode}
        className="w-full rounded-[14px] border border-transparent px-1 py-1 text-left transition hover:border-white/10 hover:bg-white/[0.03]"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-300/85">
              {mode === 'set' ? 'Set timer' : 'Rest timer'}
            </p>
            <p className="mt-1 text-[28px] font-black leading-none tracking-tight text-white">
              {formatSeconds(secondsLeft)}
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-right">
            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/40">
              Loop
            </p>
            <p className="mt-1 text-[10px] font-bold text-white">
              {autoLoop ? 'Auto' : 'Manual'}
            </p>
          </div>
        </div>
      </button>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          onClick={() => onAdjustCurrentMode(-5)}
          className="flex h-9 items-center justify-center gap-1.5 rounded-[12px] border border-white/10 bg-white/[0.04] text-[10px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
        >
          <Minus className="h-3.5 w-3.5" />
          5 sec
        </button>

        <button
          onClick={() => onAdjustCurrentMode(5)}
          className="flex h-9 items-center justify-center gap-1.5 rounded-[12px] border border-white/10 bg-white/[0.04] text-[10px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
        >
          <Plus className="h-3.5 w-3.5" />
          5 sec
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          onClick={onToggle}
          className="flex h-10 items-center justify-center gap-1.5 rounded-[12px] bg-lime-300 text-[11px] font-black uppercase tracking-[0.14em] text-black transition hover:brightness-105"
        >
          {isRunning ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-current" />
          )}
          {isRunning ? 'Pause' : 'Start'}
        </button>

        <button
          onClick={onReset}
          className="flex h-10 items-center justify-center gap-1.5 rounded-[12px] border border-white/10 bg-white/[0.04] text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
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
  const [selectedId, setSelectedId] = useState<Focus | null>(initialFocus ?? null);
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
          title="Choose workout"
          subtitle="Pick the focus for this session. Each pass shows what is included before you start."
          onBack={onBack}
        />

        <div className="space-y-3">
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
          title={selectedPreset.title}
          subtitle={selectedPreset.subtitle}
          onBack={() => setStep('choose')}
        />

        <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(180,255,90,0.10),rgba(255,255,255,0.025))] p-4.5 shadow-[0_18px_56px_rgba(0,0,0,0.28)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/18 bg-lime-300/10 px-2.5 py-1">
            <Sparkles className="h-3.5 w-3.5 text-lime-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-lime-200">
              Session Preview
            </span>
          </div>

          <h2 className="mt-4 text-[30px] font-black tracking-tight text-white">
            {selectedPreset.title} day
          </h2>
          <p className="mt-2 text-[13px] leading-6 text-white/66">
            {selectedPreset.description}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-[18px] border border-white/10 bg-black/20 p-3.5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                Focus
              </p>
              <p className="mt-1 text-[14px] font-bold text-white">
                {selectedPreset.vibe}
              </p>
            </div>

            <div className="rounded-[18px] border border-white/10 bg-black/20 p-3.5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                Exercises
              </p>
              <p className="mt-1 text-[14px] font-bold text-white">
                {selectedPreset.exercises.length}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[20px] border border-white/10 bg-black/20 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-lime-300/85">
                Included
              </p>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/16 bg-yellow-300/[0.07] px-2.5 py-1">
                <Lock className="h-3.5 w-3.5 text-yellow-200" />
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-yellow-100">
                  Preset locked
                </span>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {selectedPreset.exercises.map((exercise, index) => (
                <PreviewExerciseRow
                  key={exercise}
                  index={index}
                  label={exercise}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setStep('active');
              setTimerMode('set');
              setSecondsLeft(setSeconds);
              setTimerRunning(false);
            }}
            className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-[20px] bg-lime-300 text-[13px] font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.2)] transition hover:brightness-105"
          >
            <Play className="h-4.5 w-4.5 fill-current" />
            Start workout
          </button>
        </div>
      </ScreenShell>
    );
  }

  if (step === 'active' && selectedPreset) {
    return (
      <>
        <ScreenShell>
          <TopBar
            title={`${selectedPreset.title} workout`}
            subtitle="Log each set with weight and reps. The preset stays locked."
            onBack={() => {
              setTimerRunning(false);
              setStep('preview');
            }}
          />

          <div className="mb-3 rounded-[16px] border border-lime-300/18 bg-lime-300/10 p-3 shadow-[0_12px_28px_rgba(0,0,0,0.16)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-lime-200">
                  Active session
                </p>
                <p className="mt-1 text-[18px] font-black tracking-tight text-white">
                  {selectedPreset.title}
                </p>
                <p className="mt-1 text-[12px] text-white/64">
                  {selectedPreset.exercises.length} exercises loaded
                </p>
              </div>

              <div className="rounded-full border border-white/10 bg-black/22 px-3 py-1.5 text-right">
                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/45">
                  Logged
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {filledSetCount}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
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
            onClick={() => {
              setTimerRunning(false);
              setStep('complete');
            }}
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-lime-300 text-[12px] font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.2)] transition hover:brightness-105"
          >
            <CheckCircle2 className="h-4 w-4" />
            Complete workout
          </button>
        </ScreenShell>

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
      </>
    );
  }

  if (step === 'complete' && selectedPreset) {
    return (
      <ScreenShell>
        <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(180,255,90,0.14),rgba(255,255,255,0.025))] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.3)]">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-lime-300 text-black">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.22em] text-lime-200">
            Session complete
          </p>
          <h1 className="mt-2 text-[30px] font-black tracking-tight text-white">
            Strong work.
          </h1>
          <p className="mt-2 text-[13px] leading-6 text-white/66">
            You completed your {selectedPreset.title.toLowerCase()} workout and kept the momentum alive.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-[18px] border border-white/10 bg-black/20 p-3.5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                Completed
              </p>
              <p className="mt-1 text-[14px] font-bold text-white">
                {selectedPreset.exercises.length} exercises
              </p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-black/20 p-3.5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                Logged sets
              </p>
              <p className="mt-1 text-[14px] font-bold text-white">
                {filledSetCount}
              </p>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="mt-4 flex h-12 w-full items-center justify-center rounded-[16px] bg-lime-300 text-[12px] font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.2)] transition hover:brightness-105"
          >
            Back to home
          </button>
        </div>
      </ScreenShell>
    );
  }

  return null;
}