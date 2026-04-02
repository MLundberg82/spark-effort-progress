import { useState, useCallback, useMemo, useEffect } from 'react';
import { exercises, MuscleGroup, muscleGroupLabels } from '@/lib/exerciseData';
import { saveWorkout, getWorkouts, WorkoutEntry, WorkoutLog, WorkoutSet } from '@/lib/workoutStore';
import { getRecommendedPlan, getTrainingLevel } from '@/lib/trainingStore';
import { calculateWorkoutXP, addXP, XPBreakdown } from '@/lib/gamificationStore';
import { muscleGroupIconMap } from '@/lib/muscleGroupIcons';
import { Plus, Trash2, ChevronDown, ChevronLeft, Zap, Check, Lock } from 'lucide-react';
import { toast } from 'sonner';
import MiniTimer from './MiniTimer';
import { isPremium } from '@/lib/gamificationStore';
import { saveAutosaveState, clearAutosaveState } from '@/lib/autosaveStore';
import { trackEvent } from '@/lib/analytics';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface WorkoutFlowProps {
  onComplete: (breakdown: XPBreakdown, oldLevel: number, newLevel: number) => void;
  onCancel: () => void;
}

type FlowPhase = 'select' | 'logging';

const muscleGroups: MuscleGroup[] = ['chest', 'back', 'shoulders', 'legs', 'arms', 'core', 'warmup', 'stretching'];

/** Get last logged weight/reps for an exercise from history */
function getLastValues(exerciseId: string): { weight: number; reps: number } {
  const workouts = getWorkouts();
  for (let i = workouts.length - 1; i >= 0; i--) {
    const entry = workouts[i].entries.find(e => e.exerciseId === exerciseId);
    if (entry && entry.sets.length > 0) {
      const lastSet = entry.sets[entry.sets.length - 1];
      return { weight: lastSet.weight || 0, reps: lastSet.reps || 0 };
    }
  }
  return { weight: 0, reps: 0 };
}

const WorkoutFlow = ({ onComplete, onCancel }: WorkoutFlowProps) => {
  const [phase, setPhase] = useState<FlowPhase>('select');
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [xpPopups, setXpPopups] = useState<{ id: number; text: string }[]>([]);
  const [setsLogged, setSetsLogged] = useState(0);

  // Autosave whenever entries or exercise index changes
  useEffect(() => {
    if (phase === 'logging' && entries.length > 0) {
      saveAutosaveState({
        entries,
        currentExerciseIdx,
        startedAt: new Date().toISOString(),
      });
    }
  }, [entries, currentExerciseIdx, phase]);

  const level = getTrainingLevel();
  const plan = level ? getRecommendedPlan(level) : null;

  const presetDays = useMemo(() => {
    if (!plan) return [];
    return plan.days.map(day => ({
      label: day.label,
      muscleGroups: day.muscleGroups,
      exercises: day.muscleGroups.flatMap(mg =>
        exercises.filter(ex => ex.muscleGroup === mg).slice(0, 3)
      ),
    }));
  }, [plan]);

  const loadPreset = (preset: typeof presetDays[0]) => {
    const newEntries: WorkoutEntry[] = preset.exercises.map(ex => {
      const last = getLastValues(ex.id);
      return {
        exerciseId: ex.id,
        sets: [
          { weight: last.weight, reps: last.reps || 10 },
          { weight: last.weight, reps: last.reps || 10 },
          { weight: last.weight, reps: last.reps || 10 },
        ],
      };
    });
    setEntries(newEntries);
    setCurrentExerciseIdx(0);
    setPhase('logging');
  };

  const addExercise = (exerciseId: string) => {
    if (entries.some(e => e.exerciseId === exerciseId)) return;
    const last = getLastValues(exerciseId);
    setEntries(prev => [...prev, {
      exerciseId,
      sets: [{ weight: last.weight, reps: last.reps || 10 }],
    }]);
  };

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const startLogging = () => {
    if (entries.length === 0) {
      toast.error('Add at least one exercise');
      return;
    }
    setCurrentExerciseIdx(0);
    setPhase('logging');
  };

  // --- Logging phase helpers ---
  const currentEntry = entries[currentExerciseIdx];
  const currentExercise = currentEntry ? exercises.find(e => e.id === currentEntry.exerciseId) : null;

  const updateSet = (setIndex: number, field: keyof WorkoutSet, value: number) => {
    setEntries(prev => {
      const updated = [...prev];
      updated[currentExerciseIdx] = {
        ...updated[currentExerciseIdx],
        sets: updated[currentExerciseIdx].sets.map((s, i) =>
          i === setIndex ? { ...s, [field]: value } : s
        ),
      };
      return updated;
    });
  };

  const showXpPopup = (text: string) => {
    const id = Date.now();
    setXpPopups(prev => [...prev, { id, text }]);
    setTimeout(() => setXpPopups(prev => prev.filter(p => p.id !== id)), 1500);
  };

  const logSet = () => {
    // Add another set (copy current values for next)
    const lastSet = currentEntry.sets[currentEntry.sets.length - 1];
    setEntries(prev => {
      const updated = [...prev];
      updated[currentExerciseIdx] = {
        ...updated[currentExerciseIdx],
        sets: [...updated[currentExerciseIdx].sets, { ...lastSet }],
      };
      return updated;
    });
    setSetsLogged(prev => prev + 1);
    showXpPopup('+5 XP 🔥');
  };

  const nextExercise = () => {
    if (currentExerciseIdx < entries.length - 1) {
      setCurrentExerciseIdx(prev => prev + 1);
    }
  };

  const prevExercise = () => {
    if (currentExerciseIdx > 0) {
      setCurrentExerciseIdx(prev => prev - 1);
    }
  };

  const finishWorkout = () => {
    if (entries.length === 0) return;
    const workout: WorkoutLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      entries,
    };
    saveWorkout(workout);
    clearAutosaveState();
    const breakdown = calculateWorkoutXP(workout);
    const { oldLevel, newLevel } = addXP(breakdown.total);
    trackEvent('workout_completed', {
      exercises: entries.length,
      totalSets: entries.reduce((a, e) => a + e.sets.length, 0),
      xpEarned: breakdown.total,
    });
    if (newLevel > oldLevel) {
      trackEvent('level_up', { oldLevel, newLevel });
    }
    onComplete(breakdown, oldLevel, newLevel);
  };

  // --- SELECTION PHASE ---
  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={onCancel} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-xl font-bold text-foreground">Choose Exercises</h1>
          </div>

          {/* Quick presets */}
          {presetDays.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-accent" /> Quick Start
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {presetDays.map((preset, i) => {
                  const icons = [...new Set(preset.muscleGroups)].slice(0, 3);
                  return (
                    <button key={i} onClick={() => loadPreset(preset)}
                      className="card-3d rounded-xl p-3 text-left hover:shadow-glow transition-all active:scale-[0.97]">
                      <div className="flex items-center gap-1.5 mb-1">
                        {icons.map(mg => {
                          const Icon = muscleGroupIconMap[mg];
                          return <Icon key={mg} className="w-3.5 h-3.5 text-primary" />;
                        })}
                      </div>
                      <p className="text-sm font-bold text-foreground">{preset.label}</p>
                      <p className="text-[10px] text-muted-foreground">{preset.exercises.length} exercises</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom workout (premium) */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Custom Workout</h3>
            {!isPremium() && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Premium
              </span>
            )}
          </div>
          {isPremium() ? (
            <div className="space-y-2">
              {muscleGroups.map(group => {
                const groupExercises = exercises.filter(e => e.muscleGroup === group);
                const isOpen = !!openGroups[group];
                const addedCount = groupExercises.filter(ex => entries.some(e => e.exerciseId === ex.id)).length;
                const Icon = muscleGroupIconMap[group];

                return (
                  <Collapsible key={group} open={isOpen} onOpenChange={() => toggleGroup(group)}>
                    <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-xl card-3d hover:shadow-glow transition-all">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">{muscleGroupLabels[group]}</span>
                        {addedCount > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full gradient-primary text-primary-foreground font-bold">
                            {addedCount}
                          </span>
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-1 space-y-1 pl-2">
                        {groupExercises.map(ex => {
                          const isAdded = entries.some(e => e.exerciseId === ex.id);
                          return (
                            <button key={ex.id} onClick={() => addExercise(ex.id)} disabled={isAdded}
                              className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all text-sm ${
                                isAdded
                                  ? 'bg-primary/10 border border-primary/30 text-primary'
                                  : 'bg-secondary/50 hover:bg-secondary/80 text-secondary-foreground'
                              }`}>
                              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="font-medium">{ex.name}</span>
                              {isAdded && <Check className="w-3.5 h-3.5 ml-auto text-primary" />}
                            </button>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          ) : (
            <div className="card-3d rounded-2xl p-6 text-center space-y-3">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-bold text-foreground">Custom Workout Builder</p>
              <p className="text-xs text-muted-foreground">Unlock Premium to build your own workouts from individual exercises</p>
              <span className="inline-block px-4 py-2 rounded-xl gradient-accent text-accent-foreground font-bold text-xs">
                🔒 Premium Feature
              </span>
            </div>
          )}

          {/* Start button */}
          {entries.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-lg border-t border-border/50 z-50">
              <div className="max-w-lg mx-auto">
                <button onClick={startLogging}
                  className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-display font-bold text-lg btn-3d shadow-button flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
                  Start ({entries.length} exercises)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- LOGGING PHASE ---
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 pt-0 pb-32">
        <MiniTimer />

        {/* Exercise navigation */}
        <div className="flex items-center justify-between py-4">
          <button onClick={prevExercise} disabled={currentExerciseIdx === 0}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              {currentExerciseIdx + 1} / {entries.length}
            </p>
            <h2 className="font-display text-xl font-black text-foreground">
              {currentExercise?.name}
            </h2>
          </div>
          <button onClick={nextExercise} disabled={currentExerciseIdx === entries.length - 1}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all rotate-180">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Sets logged */}
        <div className="space-y-3 mb-6">
          {currentEntry.sets.map((set, si) => (
            <div key={si} className="card-3d rounded-xl p-4 animate-fade-in flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-black text-primary">
                {si + 1}
              </span>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground font-bold uppercase">Weight</label>
                  <input
                    type="number"
                    value={set.weight || ''}
                    onChange={e => updateSet(si, 'weight', Number(e.target.value))}
                    className="w-full bg-muted rounded-lg px-3 py-2 text-lg font-bold text-foreground outline-none focus:ring-2 focus:ring-primary input-3d"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-bold uppercase">Reps</label>
                  <input
                    type="number"
                    value={set.reps || ''}
                    onChange={e => updateSet(si, 'reps', Number(e.target.value))}
                    className="w-full bg-muted rounded-lg px-3 py-2 text-lg font-bold text-foreground outline-none focus:ring-2 focus:ring-primary input-3d"
                    placeholder="0"
                  />
                </div>
              </div>
              {si > 0 && (
                <button onClick={() => {
                  setEntries(prev => {
                    const updated = [...prev];
                    updated[currentExerciseIdx] = {
                      ...updated[currentExerciseIdx],
                      sets: updated[currentExerciseIdx].sets.filter((_, i) => i !== si),
                    };
                    return updated;
                  });
                }} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* XP popups */}
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          {xpPopups.map(popup => (
            <div key={popup.id} className="text-2xl font-black text-gradient animate-[fade-out_1.5s_ease-out_forwards] drop-shadow-[0_0_20px_hsl(138_90%_66%/0.6)]"
              style={{ animation: 'fade-out 1.5s ease-out forwards, scale-out 1.5s ease-out forwards' }}>
              {popup.text}
            </div>
          ))}
        </div>

        {/* Bottom action bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-lg border-t border-border/50 z-40">
          <div className="max-w-lg mx-auto space-y-3">
            {/* ADD SET button */}
            <button onClick={logSet}
              className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-display font-bold text-xl btn-3d shadow-button flex items-center justify-center gap-3 active:scale-[0.95] transition-transform">
              <Plus className="w-6 h-6" />
              ADD SET
            </button>

            {/* Finish / Next controls */}
            <div className="flex gap-3">
              {currentExerciseIdx < entries.length - 1 ? (
                <button onClick={nextExercise}
                  className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm active:scale-[0.97] transition-transform">
                  Next Exercise →
                </button>
              ) : (
                <div className="flex-1" />
              )}
              <button onClick={finishWorkout}
                className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-bold text-sm btn-gold active:scale-[0.97] transition-transform">
                🏁 Finish Workout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutFlow;
