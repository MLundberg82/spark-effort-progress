import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Dumbbell,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Timer,
} from 'lucide-react';
import WorkoutComplete from '@/components/WorkoutComplete';

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

type WorkoutCompleteSummary = {
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
  earnedXP: number;
  prs: Array<{
    exercise: string;
    newWeight: number;
    previousBest: number;
  }>;
};

const REST_TIMER_KEY = 'gymrat-rest-timer-seconds';
const SET_TIMER_KEY = 'gymrat-set-timer-seconds';
const TIMER_AUTO_LOOP_KEY = 'gymrat-timer-auto-loop';

const PRESETS: WorkoutPreset[] = [
  {
    id: 'chest',
    title: 'Chest',
    subtitle: 'Push strength & upper chest',
    description: 'A clean chest-focused session built for tension, pump and progression.',
    vibe: 'Heavy push session',
    exercises: ['Bench Press', 'Incline Dumbbell Press', 'Chest Fly', 'Cable Press'],
  },
  {
    id: 'back',
    title: 'Back',
    subtitle: 'Thickness, width & posture',
    description: 'A back day that hits lats, upper back and pulling strength with control.',
    vibe: 'Wide + dense back',
    exercises: ['Lat Pulldown', 'Barbell Row', 'Seated Cable Row', 'Face Pull'],
  },
  {
    id: 'arms',
    title: 'Arms',
    subtitle: 'Biceps, triceps & sleeve pump',
    description: 'Direct volume, clean structure and a satisfying pump-driven finish.',
    vibe: 'Peak pump session',
    exercises: ['Barbell Curl', 'Hammer Curl', 'Tricep Pushdown', 'Overhead Extension'],
  },
  {
    id: 'legs',
    title: 'Legs',
    subtitle: 'Strength, drive & lower body work',
    description: 'A lower body session for quads, glutes and strong basics that move the needle.',
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
    <div className="min-h-screen bg-black px-4 pb-6 pt-4 text-white">
      <div className="mx-auto max-w-4xl">{children}</div>
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
    <div className="mb-4 flex items-start justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/78 transition hover:bg-white/[0.08]"
      >
        <ArrowLeft className="h-4.5 w-4.5" />
      </button>

      <div className="min-w-0 flex-1 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-300/85">
          Workout Flow
        </p>
        <h1 className="mt-1 text-[28px] font-black tracking-tight text-white">
          {title}
        </h1>
        {subtitle ? <p className="mt-2 text-sm leading-5 text-white/72">{subtitle}</p> : null}
      </div>

      <div className="h-10 w-10 shrink-0" />
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
      className="rounded-[22px] border border-white/10 bg-[#0d0d0d] p-4 text-left transition hover:bg-[#141414]"
    >
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-lime-300/90">
        {preset.vibe}
      </div>
      <h3 className="mt-1 text-[22px] font-black tracking-tight text-white">
        {preset.title}
      </h3>
      <p className="mt-1 text-sm text-white/72">{preset.subtitle}</p>
      <p className="mt-3 text-sm leading-6 text-white/72">{preset.description}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {preset.exercises.map((exercise) => (
          <span
            key={exercise}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-white/78"
          >
            {exercise}
          </span>
        ))}
      </div>

      <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-white">
        Select
        <ChevronRight className="h-4 w-4" />
      </div>
    </button>
  );
}

function PreviewExerciseRow({ index, label }: { index: number; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.03] px-3 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.04] text-xs font-black text-white">
        {index + 1}
      </div>
      <div className="min-w-0 text-sm font-bold text-white">{label}</div>
    </div>
  );
}

function NumberPillInput({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      inputMode="numeric"
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ''))}
      placeholder={placeholder}
      className="h-10 min-w-0 rounded-[12px] border border-white/10 bg-black/20 px-2.5 text-center text-sm font-bold text-white outline-none placeholder:text-white/28"
    />
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
    <div className="rounded-[20px] border border-white/10 bg-[#0d0d0d] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/52">
            Exercise {index + 1}
          </div>
          <h3 className="mt-1 text-[18px] font-black text-white">{label}</h3>
        </div>

        <button
          type="button"
          onClick={onAddSet}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-3 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
        >
          <Plus className="h-4 w-4" />
          Set
        </button>
      </div>

      <div className="space-y-2">
        {sets.map((set, setIndex) => (
          <div
            key={`${label}-${setIndex}`}
            className="grid grid-cols-[54px_1fr_1fr] items-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.03] px-2.5 py-2.5"
          >
            <div className="text-center text-[11px] font-black uppercase tracking-[0.14em] text-white/72">
              {setIndex + 1}
            </div>

            <NumberPillInput
              value={set.weight}
              placeholder="kg"
              onChange={(value) => onUpdateSet(setIndex, 'weight', value)}
            />

            <NumberPillInput
              value={set.reps}
              placeholder="reps"
              onChange={(value) => onUpdateSet(setIndex, 'reps', value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WorkoutFlow({
  initialFocus,
  onBack,
  onComplete,
}: WorkoutFlowProps) {
  const initialPreset = initialFocus
    ? PRESETS.find((preset) => preset.id === initialFocus) ?? null
    : null;

  const [step, setStep] = useState<Step>(initialPreset ? 'preview' : 'choose');
  const [selectedPreset, setSelectedPreset] = useState<WorkoutPreset | null>(initialPreset);
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog>(
    initialPreset ? createInitialLog(initialPreset.exercises) : {},
  );
  const [timerMode, setTimerMode] = useState<TimerMode>('rest');
  const [isRunning, setIsRunning] = useState(false);
  const [setSeconds, setSetSeconds] = useState(() => readTimerNumber(SET_TIMER_KEY, 45));
  const [restSeconds, setRestSeconds] = useState(() => readTimerNumber(REST_TIMER_KEY, 90));
  const [autoLoop, setAutoLoop] = useState(() => readTimerBoolean(TIMER_AUTO_LOOP_KEY, true));
  const [remainingSeconds, setRemainingSeconds] = useState(restSeconds);
  const [summary, setSummary] = useState<WorkoutCompleteSummary>({
    workoutName: initialPreset?.title ?? 'Workout',
    durationMinutes: 42,
    exercisesCompleted: initialPreset?.exercises.length ?? 0,
    volume: 0,
    earnedXP: 75,
    prs: [],
  });

  useEffect(() => {
    const syncTimerSettings = () => {
      const nextSet = clampTimerValue(readTimerNumber(SET_TIMER_KEY, 45));
      const nextRest = clampTimerValue(readTimerNumber(REST_TIMER_KEY, 90));
      const nextAutoLoop = readTimerBoolean(TIMER_AUTO_LOOP_KEY, true);

      setSetSeconds(nextSet);
      setRestSeconds(nextRest);
      setAutoLoop(nextAutoLoop);
      setRemainingSeconds((current) => {
        if (timerMode === 'set') return Math.min(current, nextSet);
        return Math.min(current, nextRest);
      });
    };

    window.addEventListener('gymrat-timer-updated', syncTimerSettings);
    window.addEventListener('timer-settings-updated', syncTimerSettings);
    window.addEventListener('storage', syncTimerSettings);

    return () => {
      window.removeEventListener('gymrat-timer-updated', syncTimerSettings);
      window.removeEventListener('timer-settings-updated', syncTimerSettings);
      window.removeEventListener('storage', syncTimerSettings);
    };
  }, [timerMode]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current > 1) return current - 1;

        if (autoLoop) {
          if (timerMode === 'set') {
            setTimerMode('rest');
            return restSeconds;
          }

          setTimerMode('set');
          return setSeconds;
        }

        setIsRunning(false);
        return 0;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, autoLoop, timerMode, setSeconds, restSeconds]);

  const totalVolume = useMemo(() => {
    if (!selectedPreset) return 0;

    return Object.values(workoutLog).reduce((sum, sets) => {
      return (
        sum +
        sets.reduce((exerciseSum, entry) => {
          const weight = Number(entry.weight) || 0;
          const reps = Number(entry.reps) || 0;
          return exerciseSum + weight * reps;
        }, 0)
      );
    }, 0);
  }, [workoutLog, selectedPreset]);

  const choosePreset = (preset: WorkoutPreset) => {
    setSelectedPreset(preset);
    setWorkoutLog(createInitialLog(preset.exercises));
    setSummary((prev) => ({
      ...prev,
      workoutName: preset.title,
      exercisesCompleted: preset.exercises.length,
    }));
    setStep('preview');
  };

  const startWorkout = () => {
    if (!selectedPreset) return;
    setStep('active');
    setTimerMode('rest');
    setRemainingSeconds(restSeconds);
  };

  const completeWorkout = () => {
    if (!selectedPreset) return;

    setIsRunning(false);
    setSummary({
      workoutName: selectedPreset.title,
      durationMinutes: 42,
      exercisesCompleted: selectedPreset.exercises.length,
      volume: totalVolume,
      earnedXP: totalVolume > 0 ? 120 : 60,
      prs: [],
    });
    setStep('complete');
  };

  const updateSet = (
    exerciseName: string,
    setIndex: number,
    field: 'weight' | 'reps',
    value: string,
  ) => {
    setWorkoutLog((prev) => ({
      ...prev,
      [exerciseName]: prev[exerciseName].map((entry, index) =>
        index === setIndex ? { ...entry, [field]: value } : entry,
      ),
    }));
  };

  const addSet = (exerciseName: string) => {
    setWorkoutLog((prev) => ({
      ...prev,
      [exerciseName]: [...prev[exerciseName], { weight: '', reps: '' }],
    }));
  };

  if (step === 'complete') {
    return (
      <WorkoutComplete
        summary={summary}
        onContinue={onComplete}
        onOpenPaywall={() => undefined}
      />
    );
  }

  if (step === 'choose') {
    return (
      <ScreenShell>
        <TopBar
          title="Choose workout"
          subtitle="Cleaner layout, tighter inputs, faster flow."
          onBack={onBack}
        />

        <div className="grid gap-3 md:grid-cols-2">
          {PRESETS.map((preset) => (
            <PresetCard key={preset.id} preset={preset} onSelect={() => choosePreset(preset)} />
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

        <div className="rounded-[22px] border border-white/10 bg-[#0d0d0d] p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-lime-300/85">
            {selectedPreset.vibe}
          </div>
          <p className="mt-2 text-sm leading-6 text-white/74">{selectedPreset.description}</p>

          <div className="mt-4 space-y-2">
            {selectedPreset.exercises.map((exercise, index) => (
              <PreviewExerciseRow key={exercise} index={index} label={exercise} />
            ))}
          </div>

          <button
            type="button"
            onClick={startWorkout}
            className="mt-4 inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[18px] bg-lime-300 px-5 py-4 text-[13px] font-black uppercase tracking-[0.16em] text-black transition hover:brightness-105"
          >
            <Dumbbell className="h-4.5 w-4.5" />
            Start workout
          </button>
        </div>
      </ScreenShell>
    );
  }

  if (!selectedPreset) return null;

  return (
    <ScreenShell>
      <TopBar
        title={`${selectedPreset.title} session`}
        subtitle="Smaller weight and reps controls. Faster active view."
        onBack={() => setStep('preview')}
      />

      <div className="mb-4 rounded-[20px] border border-white/10 bg-[#0d0d0d] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/52">
              Timer
            </div>
            <div className="mt-1 text-[28px] font-black tracking-tight text-white">
              {formatSeconds(remainingSeconds)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextMode = timerMode === 'set' ? 'rest' : 'set';
                setTimerMode(nextMode);
                setRemainingSeconds(nextMode === 'set' ? setSeconds : restSeconds);
                setIsRunning(false);
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.04] px-3 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
            >
              <Timer className="h-4 w-4" />
              {timerMode === 'set' ? 'Set' : 'Rest'}
            </button>

            <button
              type="button"
              onClick={() => setIsRunning((prev) => !prev)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] bg-lime-300 px-4 text-[11px] font-black uppercase tracking-[0.14em] text-black transition hover:brightness-105"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? 'Pause' : 'Start'}
            </button>

            <button
              type="button"
              onClick={() => {
                setRemainingSeconds(timerMode === 'set' ? setSeconds : restSeconds);
                setIsRunning(false);
              }}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-bold text-white/78">
            {timerMode === 'set' ? 'Set phase' : 'Rest phase'}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-bold text-white/78">
            Auto loop {autoLoop ? 'on' : 'off'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {selectedPreset.exercises.map((exercise, index) => (
          <ActiveExerciseCard
            key={exercise}
            index={index}
            label={exercise}
            sets={workoutLog[exercise] ?? []}
            onUpdateSet={(setIndex, field, value) => updateSet(exercise, setIndex, field, value)}
            onAddSet={() => addSet(exercise)}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setTimerMode('set');
            setRemainingSeconds(setSeconds);
            setIsRunning(false);
          }}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
        >
          <Minus className="h-4 w-4" />
          Set
        </button>

        <button
          type="button"
          onClick={() => {
            setTimerMode('rest');
            setRemainingSeconds(restSeconds);
            setIsRunning(false);
          }}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
        >
          <Plus className="h-4 w-4" />
          Rest
        </button>
      </div>

      <button
        type="button"
        onClick={completeWorkout}
        className="mt-4 inline-flex min-h-[60px] w-full items-center justify-center gap-2 rounded-[18px] bg-lime-300 px-5 py-4 text-[13px] font-black uppercase tracking-[0.16em] text-black transition hover:brightness-105"
      >
        <Check className="h-4.5 w-4.5" />
        Complete workout
      </button>
    </ScreenShell>
  );
}