import { Crown, Dumbbell, Flame, Lock, Plus, Sparkles, Target } from 'lucide-react';
import { useMemo, useState } from 'react';
import { isPremiumUnlocked } from '../lib/premiumStore';

type ExerciseRow = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  muscleGroup: string;
};

type WorkoutTemplate = {
  id: string;
  name: string;
  subtitle: string;
  focus: string;
  exercises: ExerciseRow[];
};

const workoutTemplates: WorkoutTemplate[] = [
  {
    id: 'upper-power',
    name: 'Upper Power',
    subtitle: 'Chest, back, shoulders',
    focus: 'Strength-focused upper session',
    exercises: [
      { id: '1', name: 'Bench Press', sets: 4, reps: 6, weight: 70, muscleGroup: 'Chest' },
      { id: '2', name: 'Barbell Row', sets: 4, reps: 8, weight: 65, muscleGroup: 'Back' },
      { id: '3', name: 'Shoulder Press', sets: 3, reps: 8, weight: 40, muscleGroup: 'Shoulders' },
      { id: '4', name: 'Lat Pulldown', sets: 3, reps: 10, weight: 55, muscleGroup: 'Back' },
    ],
  },
  {
    id: 'lower-strength',
    name: 'Lower Strength',
    subtitle: 'Quads, glutes, hamstrings',
    focus: 'Heavy lower body session',
    exercises: [
      { id: '1', name: 'Squat', sets: 4, reps: 6, weight: 90, muscleGroup: 'Legs' },
      { id: '2', name: 'Romanian Deadlift', sets: 4, reps: 8, weight: 80, muscleGroup: 'Hamstrings' },
      { id: '3', name: 'Leg Press', sets: 3, reps: 12, weight: 160, muscleGroup: 'Legs' },
      { id: '4', name: 'Calf Raise', sets: 3, reps: 15, weight: 60, muscleGroup: 'Calves' },
    ],
  },
  {
    id: 'push-hypertrophy',
    name: 'Push Hypertrophy',
    subtitle: 'Chest, shoulders, triceps',
    focus: 'Pump and volume',
    exercises: [
      { id: '1', name: 'Incline Dumbbell Press', sets: 4, reps: 10, weight: 26, muscleGroup: 'Chest' },
      { id: '2', name: 'Machine Chest Press', sets: 3, reps: 12, weight: 65, muscleGroup: 'Chest' },
      { id: '3', name: 'Lateral Raise', sets: 4, reps: 15, weight: 10, muscleGroup: 'Shoulders' },
      { id: '4', name: 'Tricep Pushdown', sets: 3, reps: 12, weight: 30, muscleGroup: 'Triceps' },
    ],
  },
  {
    id: 'pull-hypertrophy',
    name: 'Pull Hypertrophy',
    subtitle: 'Back, biceps, rear delts',
    focus: 'Thickness and width',
    exercises: [
      { id: '1', name: 'Lat Pulldown', sets: 4, reps: 10, weight: 55, muscleGroup: 'Back' },
      { id: '2', name: 'Seated Cable Row', sets: 4, reps: 10, weight: 55, muscleGroup: 'Back' },
      { id: '3', name: 'Rear Delt Fly', sets: 3, reps: 15, weight: 12, muscleGroup: 'Shoulders' },
      { id: '4', name: 'EZ Bar Curl', sets: 3, reps: 12, weight: 25, muscleGroup: 'Biceps' },
    ],
  },
  {
    id: 'full-body',
    name: 'Full Body',
    subtitle: 'Balanced all-round session',
    focus: 'Best simple starting point',
    exercises: [
      { id: '1', name: 'Bench Press', sets: 3, reps: 8, weight: 60, muscleGroup: 'Chest' },
      { id: '2', name: 'Lat Pulldown', sets: 3, reps: 10, weight: 50, muscleGroup: 'Back' },
      { id: '3', name: 'Leg Press', sets: 3, reps: 12, weight: 120, muscleGroup: 'Legs' },
      { id: '4', name: 'Shoulder Press', sets: 3, reps: 10, weight: 35, muscleGroup: 'Shoulders' },
    ],
  },
];

const premiumExerciseLibrary: Record<string, string[]> = {
  Chest: [
    'Bench Press',
    'Incline Bench Press',
    'Decline Bench Press',
    'Dumbbell Press',
    'Incline Dumbbell Press',
    'Machine Chest Press',
    'Cable Fly',
    'Pec Deck',
  ],
  Back: [
    'Lat Pulldown',
    'Pull-Up',
    'Assisted Pull-Up',
    'Barbell Row',
    'Dumbbell Row',
    'Chest Supported Row',
    'Seated Cable Row',
    'Straight Arm Pulldown',
  ],
  Shoulders: [
    'Shoulder Press',
    'Dumbbell Shoulder Press',
    'Machine Shoulder Press',
    'Lateral Raise',
    'Cable Lateral Raise',
    'Rear Delt Fly',
    'Front Raise',
  ],
  Biceps: [
    'EZ Bar Curl',
    'Barbell Curl',
    'Dumbbell Curl',
    'Incline Curl',
    'Hammer Curl',
    'Cable Curl',
  ],
  Triceps: [
    'Tricep Pushdown',
    'Overhead Tricep Extension',
    'Skull Crusher',
    'Close Grip Bench Press',
    'Dips',
    'Single Arm Pushdown',
  ],
  Legs: [
    'Squat',
    'Front Squat',
    'Hack Squat',
    'Leg Press',
    'Bulgarian Split Squat',
    'Walking Lunges',
    'Leg Extension',
  ],
  Hamstrings: [
    'Romanian Deadlift',
    'Stiff Leg Deadlift',
    'Lying Leg Curl',
    'Seated Leg Curl',
    'Good Morning',
  ],
  Glutes: [
    'Hip Thrust',
    'Glute Bridge',
    'Cable Kickback',
    'Smith Machine Lunge',
  ],
  Calves: [
    'Standing Calf Raise',
    'Seated Calf Raise',
    'Leg Press Calf Raise',
  ],
  Core: [
    'Crunch',
    'Cable Crunch',
    'Hanging Leg Raise',
    'Plank',
    'Ab Wheel',
    'Russian Twist',
  ],
};

function cloneExercises(rows: ExerciseRow[]) {
  return rows.map((row, index) => ({
    ...row,
    id: `${row.name}-${index}-${crypto.randomUUID()}`,
  }));
}

export default function WorkoutFlow({
  onCancel,
  onFinish,
  onOpenPaywall,
}: {
  onCancel: () => void;
  onFinish: (result: {
    workoutName: string;
    durationMinutes: number;
    exercisesCompleted: number;
    volume: number;
  }) => void;
  onOpenPaywall: () => void;
}) {
  const premium = isPremiumUnlocked();
  const [mode, setMode] = useState<'template' | 'custom'>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(workoutTemplates[0].id);
  const selectedTemplate = workoutTemplates.find((t) => t.id === selectedTemplateId) ?? workoutTemplates[0];

  const [workoutName, setWorkoutName] = useState(selectedTemplate.name);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [rows, setRows] = useState<ExerciseRow[]>(cloneExercises(selectedTemplate.exercises));

  const groupedPremiumExercises = useMemo(() => Object.entries(premiumExerciseLibrary), []);

  const totalVolume = useMemo(
    () => rows.reduce((sum, row) => sum + row.sets * row.reps * row.weight, 0),
    [rows]
  );

  const applyTemplate = (templateId: string) => {
    const template = workoutTemplates.find((item) => item.id === templateId);
    if (!template) return;

    setSelectedTemplateId(template.id);
    setWorkoutName(template.name);
    setRows(cloneExercises(template.exercises));
  };

  const updateRow = (id: string, field: keyof ExerciseRow, value: string) => {
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: field === 'name' || field === 'muscleGroup' ? value : Number(value),
            }
          : row
      )
    );
  };

  const removeRow = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id));
  };

  const addCustomExercise = (exerciseName: string, muscleGroup: string) => {
    if (!premium) {
      onOpenPaywall();
      return;
    }

    setRows((current) => [
      ...current,
      {
        id: `${exerciseName}-${crypto.randomUUID()}`,
        name: exerciseName,
        sets: 3,
        reps: 10,
        weight: 20,
        muscleGroup,
      },
    ]);
  };

  const switchToCustom = () => {
    if (!premium) {
      onOpenPaywall();
      return;
    }
    setMode('custom');
  };

  const switchToTemplate = () => {
    setMode('template');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_24%),linear-gradient(180deg,_#09090b_0%,_#0f172a_100%)] px-4 py-4 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-400">Workout</p>
            <h1 className="mt-1 text-2xl font-black">Log real-life effort</h1>
          </div>

          <button
            onClick={onCancel}
            type="button"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition hover:bg-white/10"
          >
            Cancel
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <button
            onClick={switchToTemplate}
            type="button"
            className={`rounded-[24px] border px-4 py-4 text-left transition ${
              mode === 'template'
                ? 'border-emerald-400/20 bg-emerald-400/10'
                : 'border-white/10 bg-white/[0.06]'
            }`}
          >
            <div className="mb-2 inline-flex rounded-2xl bg-emerald-400/10 p-2.5 text-emerald-300">
              <Dumbbell className="h-4 w-4" />
            </div>
            <p className="font-black">Quick start</p>
            <p className="mt-1 text-sm text-zinc-400">Choose a base workout and train fast.</p>
          </button>

          <button
            onClick={switchToCustom}
            type="button"
            className={`rounded-[24px] border px-4 py-4 text-left transition ${
              mode === 'custom'
                ? 'border-amber-300/20 bg-amber-300/10'
                : 'border-white/10 bg-white/[0.06]'
            }`}
          >
            <div className="mb-2 inline-flex rounded-2xl bg-amber-300/10 p-2.5 text-amber-200">
              <Crown className="h-4 w-4" />
            </div>
            <p className="font-black">Custom workout</p>
            <p className="mt-1 text-sm text-zinc-400">
              Premium unlock with full exercise library.
            </p>
          </button>
        </div>

        {mode === 'template' && (
          <div className="space-y-3">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)]">
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Choose workout type</p>

              <div className="mt-4 space-y-3">
                {workoutTemplates.map((template) => {
                  const active = template.id === selectedTemplateId;

                  return (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template.id)}
                      type="button"
                      className={`w-full rounded-[24px] border p-4 text-left transition ${
                        active
                          ? 'border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 to-white/[0.04]'
                          : 'border-white/10 bg-black/20 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black">{template.name}</p>
                          <p className="mt-1 text-sm text-zinc-400">{template.subtitle}</p>
                          <p className="mt-2 text-xs text-zinc-500">{template.focus}</p>
                        </div>

                        {active && (
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-300">
                            Active
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)]">
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Template info</p>
              <h2 className="mt-2 text-2xl font-black">{selectedTemplate.name}</h2>
              <p className="mt-1 text-sm text-zinc-400">{selectedTemplate.subtitle}</p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="mb-3 inline-flex rounded-2xl bg-emerald-400/10 p-2.5 text-emerald-300">
                    <Target className="h-4 w-4" />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">Focus</p>
                  <p className="mt-1 text-sm font-bold">{selectedTemplate.focus}</p>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="mb-3 inline-flex rounded-2xl bg-orange-500/10 p-2.5 text-orange-300">
                    <Flame className="h-4 w-4" />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">Exercises</p>
                  <p className="mt-1 text-2xl font-black">{rows.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'custom' && (
          <>
            <div className="mb-4 rounded-[28px] border border-amber-300/20 bg-gradient-to-r from-amber-300/12 to-yellow-300/10 p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-amber-200">Premium builder</p>
                  <h2 className="mt-2 text-xl font-black text-amber-100">Custom workout mode</h2>
                  <p className="mt-2 text-sm text-zinc-300">
                    Build your own workout from a larger exercise library divided by muscle group.
                  </p>
                </div>

                <div className="inline-flex rounded-2xl bg-amber-300/15 p-3 text-amber-200">
                  <Crown className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="mb-4 rounded-[28px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)]">
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Exercise library</p>

              <div className="mt-4 space-y-4">
                {groupedPremiumExercises.map(([group, exercises]) => (
                  <div key={group} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <p className="text-sm font-black">{group}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {exercises.map((exercise) => (
                        <button
                          key={`${group}-${exercise}`}
                          onClick={() => addCustomExercise(exercise, group)}
                          type="button"
                          className={`rounded-full px-3 py-2 text-sm transition ${
                            premium
                              ? 'border border-white/10 bg-white/5 hover:bg-white/10'
                              : 'border border-amber-300/20 bg-amber-300/10 text-amber-200'
                          }`}
                        >
                          {premium ? exercise : `🔒 ${exercise}`}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)]">
          <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Session setup</p>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">Workout name</label>
              <input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none transition focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Duration (minutes)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none transition focus:border-emerald-400"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-[28px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)]"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400">{row.muscleGroup}</p>
                  <p className="mt-1 font-black">{row.name}</p>
                </div>

                {mode === 'custom' && premium && (
                  <button
                    onClick={() => removeRow(row.id)}
                    type="button"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs transition hover:bg-white/10"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                value={row.name}
                onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                className="mb-3 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none transition focus:border-emerald-400"
              />

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={row.sets}
                  onChange={(e) => updateRow(row.id, 'sets', e.target.value)}
                  className="rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 outline-none transition focus:border-emerald-400"
                  placeholder="Sets"
                />
                <input
                  type="number"
                  value={row.reps}
                  onChange={(e) => updateRow(row.id, 'reps', e.target.value)}
                  className="rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 outline-none transition focus:border-emerald-400"
                  placeholder="Reps"
                />
                <input
                  type="number"
                  value={row.weight}
                  onChange={(e) => updateRow(row.id, 'weight', e.target.value)}
                  className="rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 outline-none transition focus:border-emerald-400"
                  placeholder="Weight"
                />
              </div>
            </div>
          ))}
        </div>

        {!premium && (
          <button
            onClick={onOpenPaywall}
            type="button"
            className="mt-4 flex w-full items-center justify-between rounded-[26px] border border-amber-300/20 bg-gradient-to-r from-amber-300/12 to-yellow-300/10 p-4 text-left shadow-[0_14px_30px_rgba(0,0,0,0.24)] transition hover:scale-[1.01]"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-amber-200">Premium feature</p>
              <p className="mt-1 font-black text-amber-100">Unlock custom workouts</p>
              <p className="mt-1 text-sm text-zinc-300">
                Build sessions your way and choose from 40+ exercises.
              </p>
            </div>
            <div className="inline-flex rounded-2xl bg-amber-300/15 p-3 text-amber-200">
              <Lock className="h-5 w-5" />
            </div>
          </button>
        )}

        <div className="mt-4 rounded-[28px] border border-emerald-400/15 bg-emerald-400/8 p-4">
          <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-300">Session summary</p>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Exercises</p>
              <p className="mt-1 text-2xl font-black">{rows.length}</p>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Volume</p>
              <p className="mt-1 text-2xl font-black">{totalVolume}</p>
            </div>
          </div>

          <button
            onClick={() =>
              onFinish({
                workoutName,
                durationMinutes,
                exercisesCompleted: rows.length,
                volume: totalVolume,
              })
            }
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[24px] bg-gradient-to-r from-emerald-400 via-lime-300 to-yellow-300 px-5 py-4 text-base font-black text-black shadow-[0_12px_40px_rgba(132,204,22,0.25)] transition hover:scale-[1.01]"
          >
            <Plus className="h-5 w-5" />
            Finish workout
          </button>
        </div>
      </div>
    </div>
  );
}