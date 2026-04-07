import { useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Settings2,
  Timer,
} from 'lucide-react';

type Focus = 'chest' | 'back' | 'arms' | 'legs' | 'walk';

type WorkoutFlowProps = {
  initialFocus?: Focus;
  onBack: () => void;
  onComplete: () => void;
};

type Step = 'choose' | 'active' | 'complete';
type FieldMode = 'strength' | 'walk';

type WorkoutPreset = {
  id: Focus;
  title: string;
  subtitle: string;
  description: string;
  vibe: string;
  mode: FieldMode;
  exercises: string[];
};

type SetEntry = {
  primary: string;
  secondary: string;
};

type WorkoutLog = Record<string, SetEntry[]>;

type WorkoutCompleteSummary = {
  workoutName: string;
  exercisesCompleted: number;
  setsLogged: number;
};

const REST_TIMER_KEY = 'gymrat-rest-timer-seconds';
const SET_TIMER_KEY = 'gymrat-set-timer-seconds';

const PRESETS: WorkoutPreset[] = [
  {
    id: 'chest',
    title: 'Chest',
    subtitle: 'Push strength & upper chest',
    description: 'A clean chest-focused session built for tension, pump and progression.',
    vibe: 'Heavy push session',
    mode: 'strength',
    exercises: ['Bench Press', 'Incline Dumbbell Press', 'Chest Fly', 'Cable Press'],
  },
  {
    id: 'back',
    title: 'Back',
    subtitle: 'Thickness, width & posture',
    description: 'A back day that hits lats, upper back and pulling strength with control.',
    vibe: 'Wide + dense back',
    mode: 'strength',
    exercises: ['Lat Pulldown', 'Barbell Row', 'Seated Cable Row', 'Face Pull'],
  },
  {
    id: 'arms',
    title: 'Arms',
    subtitle: 'Biceps, triceps & sleeve pump',
    description: 'Direct volume, clean structure and a satisfying pump-driven finish.',
    vibe: 'Peak pump session',
    mode: 'strength',
    exercises: ['Barbell Curl', 'Hammer Curl', 'Tricep Pushdown', 'Overhead Extension'],
  },
  {
    id: 'legs',
    title: 'Legs',
    subtitle: 'Strength, drive & lower body work',
    description: 'A lower body session for quads, glutes and strong basics that move the needle.',
    vibe: 'Serious lower body',
    mode: 'strength',
    exercises: ['Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Curl'],
  },
  {
    id: 'walk',
    title: 'Walk',
    subtitle: 'Low friction cardio & streak saver',
    description: 'Perfect for recovery days, step goals and keeping momentum alive.',
    vibe: 'Outdoor or treadmill',
    mode: 'walk',
    exercises: ['Warm-up Walk', 'Main Walk', 'Cooldown Walk'],
  },
];

function readTimerNumber(key: string, fallback: number) {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(key);
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

function createInitialLog(exercises: string[]): WorkoutLog {
  return exercises.reduce<WorkoutLog>((acc, exercise) => {
    acc[exercise] = Array.from({ length: 4 }, () => ({
      primary: '',
      secondary: '',
    }));
    return acc;
  }, {});
}

function ScreenShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-6 pt-4">
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-3">
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
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
        aria-label="Back"
      >
        <ArrowLeft className="h-4.5 w-4.5" />
      </button>

      <div className="min-w-0">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
          Workout Flow
        </div>
        <h1 className="mt-1 text-[1.55rem] font-black uppercase tracking-tight text-white">
          {title}
        </h1>
        {subtitle ? <p className="mt-1 text-sm text-white/70">{subtitle}</p> : null}
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
      className="rounded-[18px] border border-white/10 bg-black p-3 text-left transition hover:bg-[#0b0b0b]"
    >
      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-lime-200/75">
        {preset.vibe}
      </div>

      <div className="mt-1 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-white">{preset.title}</h3>
          <p className="text-sm text-white/78">{preset.subtitle}</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.04] text-white/80">
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-2 text-sm text-white/82">{preset.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {preset.exercises.map((exercise) => (
          <span
            key={exercise}
            className="rounded-full border border-white/10 bg-[#090909] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/86"
          >
            {exercise}
          </span>
        ))}
      </div>

      <div className="mt-3 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[14px] border border-lime-300/35 bg-lime-500 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:brightness-110">
        Start workout
        <ChevronRight className="h-4 w-4" />
      </div>
    </button>
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
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/[^\d.]/g, ''))}
      placeholder={placeholder}
      className="h-10 min-w-0 rounded-[12px] border border-white/10 bg-[#0a0a0a] px-2 text-center text-sm font-bold text-white outline-none placeholder:text-white/35"
    />
  );
}

function TimerFloatingChip({
  onOpenSettings,
}: {
  onOpenSettings: () => void;
}) {
  const setSeconds = readTimerNumber(SET_TIMER_KEY, 45);
  const restSeconds = readTimerNumber(REST_TIMER_KEY, 90);

  return (
    <button
      type="button"
      onClick={onOpenSettings}
      className="sticky top-0 z-20 flex items-center justify-between gap-3 rounded-[18px] border border-white/12 bg-black/95 px-3.5 py-3 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/12 bg-[#121212] text-lime-300">
          <Timer className="h-4.5 w-4.5" />
        </div>

        <div className="text-left">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-lime-200">
            Workout timer
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            Set {setSeconds}s · Rest {restSeconds}s
          </div>
        </div>
      </div>

      <div className="inline-flex items-center gap-2 rounded-[12px] border border-white/10 bg-[#121212] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white">
        <Settings2 className="h-3.5 w-3.5 text-lime-300" />
        Settings
      </div>
    </button>
  );
}

function ActiveExerciseCard({
  title,
  mode,
  sets,
  onUpdateSet,
  onAddSet,
}: {
  title: string;
  mode: FieldMode;
  sets: SetEntry[];
  onUpdateSet: (setIndex: number, field: 'primary' | 'secondary', value: string) => void;
  onAddSet: () => void;
}) {
  const primaryLabel = mode === 'walk' ? 'minutes' : 'kg';
  const secondaryLabel = mode === 'walk' ? 'distance' : 'reps';

  return (
    <section className="rounded-[18px] border border-white/10 bg-black p-3">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
            Current exercise
          </div>
          <h3 className="mt-1 text-base font-black text-white">{title}</h3>
        </div>

        <button
          type="button"
          onClick={onAddSet}
          className="inline-flex h-9 items-center justify-center rounded-[12px] border border-lime-300/30 bg-lime-500 px-3 text-[10px] font-black uppercase tracking-[0.14em] text-white transition hover:brightness-110"
        >
          Add set
        </button>
      </div>

      <div className="space-y-2">
        {sets.map((set, setIndex) => (
          <div
            key={`${title}-${setIndex}`}
            className="grid grid-cols-[42px_1fr_1fr] items-center gap-2 rounded-[14px] border border-white/8 bg-[#080808] px-2.5 py-2.5"
          >
            <div className="text-center text-[10px] font-black uppercase tracking-[0.12em] text-white/55">
              {setIndex + 1}
            </div>

            <NumberPillInput
              value={set.primary}
              placeholder={primaryLabel}
              onChange={(value) => onUpdateSet(setIndex, 'primary', value)}
            />

            <NumberPillInput
              value={set.secondary}
              placeholder={secondaryLabel}
              onChange={(value) => onUpdateSet(setIndex, 'secondary', value)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function CompleteScreen({
  summary,
  onContinue,
}: {
  summary: WorkoutCompleteSummary;
  onContinue: () => void;
}) {
  return (
    <ScreenShell>
      <section className="rounded-[22px] border border-white/12 bg-black p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-lime-300/30 bg-lime-500/15 text-lime-200">
          <Check className="h-6 w-6" />
        </div>

        <div className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-lime-200">
          Workout complete
        </div>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">
          {summary.workoutName}
        </h1>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-[16px] border border-white/10 bg-[#090909] p-3">
            <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
              Exercises
            </div>
            <div className="mt-1 text-lg font-black text-white">
              {summary.exercisesCompleted}
            </div>
          </div>

          <div className="rounded-[16px] border border-white/10 bg-[#090909] p-3">
            <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
              Sets logged
            </div>
            <div className="mt-1 text-lg font-black text-white">
              {summary.setsLogged}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-4 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[16px] border border-lime-300/35 bg-lime-500 px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:brightness-110"
        >
          Back to home
          <ChevronRight className="h-4 w-4" />
        </button>
      </section>
    </ScreenShell>
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

  const [step, setStep] = useState<Step>(initialPreset ? 'active' : 'choose');
  const [selectedPreset, setSelectedPreset] = useState<WorkoutPreset | null>(initialPreset);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog>(
    initialPreset ? createInitialLog(initialPreset.exercises) : {},
  );

  const summary = useMemo<WorkoutCompleteSummary>(() => {
    if (!selectedPreset) {
      return {
        workoutName: 'Workout',
        exercisesCompleted: 0,
        setsLogged: 0,
      };
    }

    const setsLogged = Object.values(workoutLog).reduce((sum, sets) => {
      return (
        sum +
        sets.filter((entry) => entry.primary.trim() !== '' || entry.secondary.trim() !== '').length
      );
    }, 0);

    return {
      workoutName: selectedPreset.title,
      exercisesCompleted: selectedPreset.exercises.length,
      setsLogged,
    };
  }, [selectedPreset, workoutLog]);

  const currentExercise = selectedPreset?.exercises[exerciseIndex] ?? null;
  const isLastExercise =
    selectedPreset ? exerciseIndex === selectedPreset.exercises.length - 1 : false;

  const choosePreset = (preset: WorkoutPreset) => {
    setSelectedPreset(preset);
    setWorkoutLog(createInitialLog(preset.exercises));
    setExerciseIndex(0);
    setStep('active');
  };

  const updateSet = (
    exerciseName: string,
    setIndex: number,
    field: 'primary' | 'secondary',
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
      [exerciseName]: [...prev[exerciseName], { primary: '', secondary: '' }],
    }));
  };

  const openTimerSettings = () => {
    window.dispatchEvent(new CustomEvent('open-menu-timer'));
  };

  if (step === 'complete') {
    return <CompleteScreen summary={summary} onContinue={onComplete} />;
  }

  if (step === 'choose') {
    return (
      <ScreenShell>
        <TopBar
          title="Choose workout"
          subtitle="Pick a focused session and keep it lean."
          onBack={onBack}
        />

        <div className="space-y-2.5">
          {PRESETS.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onSelect={() => choosePreset(preset)}
            />
          ))}
        </div>
      </ScreenShell>
    );
  }

  if (!selectedPreset || !currentExercise) {
    return null;
  }

  return (
    <ScreenShell>
      <TimerFloatingChip onOpenSettings={openTimerSettings} />

      <TopBar
        title={selectedPreset.title}
        subtitle={selectedPreset.subtitle}
        onBack={() => {
          if (exerciseIndex > 0) {
            setExerciseIndex((prev) => prev - 1);
            return;
          }

          setStep('choose');
          setSelectedPreset(null);
          setWorkoutLog({});
        }}
      />

      <div className="rounded-[18px] border border-white/10 bg-black p-3">
        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-lime-200/75">
          {selectedPreset.vibe}
        </div>
        <p className="mt-2 text-sm text-white/82">{selectedPreset.description}</p>
      </div>

      <ActiveExerciseCard
        title={currentExercise}
        mode={selectedPreset.mode}
        sets={workoutLog[currentExercise] ?? []}
        onUpdateSet={(setIndex, field, value) =>
          updateSet(currentExercise, setIndex, field, value)
        }
        onAddSet={() => addSet(currentExercise)}
      />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setExerciseIndex((prev) => Math.max(0, prev - 1))}
          disabled={exerciseIndex === 0}
          className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-[#101010] px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#161616] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        {isLastExercise ? (
          <button
            type="button"
            onClick={() => setStep('complete')}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[16px] border border-lime-300/35 bg-lime-500 px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:brightness-110"
          >
            Finish workout
            <Check className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setExerciseIndex((prev) => prev + 1)}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[16px] border border-lime-300/35 bg-lime-500 px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:brightness-110"
          >
            Next exercise
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="rounded-[18px] border border-white/10 bg-black p-3">
        <div className="mb-2 flex items-center gap-2 text-white/86">
          <Clock3 className="h-4 w-4 text-lime-300" />
          <span className="text-[10px] font-black uppercase tracking-[0.14em]">
            Exercise progress
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {selectedPreset.exercises.map((exercise, index) => (
            <div
              key={exercise}
              className={[
                'rounded-[14px] border px-3 py-2 text-center text-[10px] font-black uppercase tracking-[0.12em]',
                index === exerciseIndex
                  ? 'border-lime-300/30 bg-lime-500/12 text-lime-200'
                  : 'border-white/10 bg-[#090909] text-white/75',
              ].join(' ')}
            >
              {exercise}
            </div>
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}