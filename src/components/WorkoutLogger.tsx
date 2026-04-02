import { exercises, MuscleGroup, muscleGroupLabels } from '@/lib/exerciseData';
import { saveWorkout, WorkoutEntry, WorkoutLog, WorkoutSet } from '@/lib/workoutStore';
import { getRecommendedPlan, getPlansForLevel, getTrainingLevel } from '@/lib/trainingStore';
import { calculateWorkoutXP, addXP, XPBreakdown, isPremium } from '@/lib/gamificationStore';
import { muscleGroupIconMap } from '@/lib/muscleGroupIcons';
import { useT } from '@/lib/i18n';
import { Plus, Trash2, Save, ChevronDown, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import ShareButton from '@/components/ShareButton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface WorkoutLoggerProps {
  onSaved?: () => void;
  entries: WorkoutEntry[];
  onEntriesChange: (entries: WorkoutEntry[]) => void;
  onXPAwarded?: (breakdown: XPBreakdown, oldLevel: number, newLevel: number) => void;
}

const muscleGroups: MuscleGroup[] = ['chest', 'back', 'shoulders', 'legs', 'arms', 'core', 'warmup', 'stretching'];

const WorkoutLogger = ({ onSaved, entries, onEntriesChange, onXPAwarded }: WorkoutLoggerProps) => {
  const t = useT();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [showPresets, setShowPresets] = useState(entries.length === 0);

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

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const loadPreset = (preset: typeof presetDays[0]) => {
    const newEntries: WorkoutEntry[] = preset.exercises.map(ex => ({
      exerciseId: ex.id,
      sets: [{ weight: 0, reps: 0 }, { weight: 0, reps: 0 }, { weight: 0, reps: 0 }],
    }));
    onEntriesChange(newEntries);
    setShowPresets(false);
    toast.success(`Loaded ${preset.label} preset`);
  };

  const addExercise = (exerciseId: string) => {
    if (entries.some(e => e.exerciseId === exerciseId)) return;
    onEntriesChange([...entries, { exerciseId, sets: [{ weight: 0, reps: 0 }] }]);
  };

  const addSet = (entryIndex: number) => {
    const updated = [...entries];
    const lastSet = updated[entryIndex].sets[updated[entryIndex].sets.length - 1];
    updated[entryIndex].sets.push({ ...lastSet });
    onEntriesChange(updated);
  };

  const removeEntry = (entryIndex: number) => {
    onEntriesChange(entries.filter((_, i) => i !== entryIndex));
  };

  const updateSet = (entryIndex: number, setIndex: number, field: keyof WorkoutSet, value: number) => {
    const updated = [...entries];
    updated[entryIndex].sets[setIndex][field] = value;
    onEntriesChange(updated);
  };

  const removeSet = (entryIndex: number, setIndex: number) => {
    const updated = [...entries];
    updated[entryIndex].sets.splice(setIndex, 1);
    if (updated[entryIndex].sets.length === 0) {
      updated.splice(entryIndex, 1);
    }
    onEntriesChange(updated);
  };

  const saveCurrentWorkout = () => {
    if (entries.length === 0) {
      toast.error('Add at least one exercise');
      return;
    }
    const workout: WorkoutLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      entries,
    };
    saveWorkout(workout);

    const breakdown = calculateWorkoutXP(workout);
    const { oldLevel, newLevel } = addXP(breakdown.total);
    onXPAwarded?.(breakdown, oldLevel, newLevel);

    toast.success(`${t('workoutSaved')} +${breakdown.total} XP`);
    onSaved?.();
  };

  return (
    <div className="space-y-4">
      {/* Preset quick-start */}
      {showPresets && presetDays.length > 0 && (
        <div className="space-y-3">
          {/* Custom workout button - ABOVE presets */}
          <button
            onClick={() => setShowPresets(false)}
            className={`w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 ${
              isPremium()
                ? 'gradient-accent text-accent-foreground btn-gold'
                : 'card-3d glow-border text-primary hover:shadow-glow'
            }`}
          >
            {isPremium() ? <Crown className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {t('customWorkout')}
          </button>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-accent" /> {t('quickStartPresets')}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {presetDays.map((preset, i) => {
              const icons = [...new Set(preset.muscleGroups)].slice(0, 3);
              return (
                <button
                  key={i}
                  onClick={() => loadPreset(preset)}
                  className="card-3d rounded-xl p-3 text-left hover:bg-secondary/50 transition-all"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {icons.map(mg => {
                      const Icon = muscleGroupIconMap[mg];
                      return <Icon key={mg} className="w-3.5 h-3.5 text-primary" />;
                    })}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{preset.label}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">
                    {preset.muscleGroups.map(g => muscleGroupLabels[g]).join(', ')}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{preset.exercises.length} {t('exercisesCount')}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!showPresets && entries.length === 0 && presetDays.length > 0 && (
        <button onClick={() => setShowPresets(true)} className="w-full card-3d rounded-xl p-3 text-sm text-primary font-medium hover:bg-secondary/50 transition-all flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" /> {t('usePreset')}
        </button>
      )}

      {/* Collapsible muscle group categories */}
      <div className="space-y-2">
        {muscleGroups.map(group => {
          const groupExercises = exercises.filter(e => e.muscleGroup === group);
          const isOpen = !!openGroups[group];
          const addedCount = groupExercises.filter(ex => entries.some(e => e.exerciseId === ex.id)).length;
          const Icon = muscleGroupIconMap[group];

          return (
            <Collapsible key={group} open={isOpen} onOpenChange={() => toggleGroup(group)}>
              <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-xl card-3d hover:bg-secondary/50 transition-all">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{muscleGroupLabels[group]}</span>
                  {addedCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full gradient-primary text-primary-foreground font-medium shadow-button">
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
                      <button
                        key={ex.id}
                        onClick={() => addExercise(ex.id)}
                        disabled={isAdded}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all text-sm ${
                          isAdded
                            ? 'bg-primary/10 border border-primary/30 text-primary shadow-glow'
                            : 'bg-secondary/50 hover:bg-secondary/80 text-secondary-foreground shadow-elevated'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="font-medium block">{ex.name}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">{ex.description}</span>
                        </div>
                        {isAdded && <span className="text-[10px] ml-auto text-primary font-medium">{t('added')}</span>}
                      </button>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {/* Logged exercises */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-foreground text-sm">{t('yourWorkout')}</h3>
            <ShareButton text={`🏋️ About to crush ${entries.length} exercises! #GymRat 🐀`} compact />
          </div>
          {entries.map((entry, ei) => {
            const ex = exercises.find(e => e.id === entry.exerciseId)!;
            return (
              <div key={ei} className="card-3d rounded-xl p-4 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-foreground text-sm">{ex.name}</span>
                  <button onClick={() => removeEntry(ei)} className="text-destructive/70 hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-[1.5rem_1fr_1fr_1.5rem] gap-2 text-xs text-muted-foreground font-medium">
                    <span>#</span><span>{t('weight')}</span><span>{t('reps')}</span><span />
                  </div>
                  {entry.sets.map((set, si) => (
                    <div key={si} className="grid grid-cols-[1.5rem_1fr_1fr_1.5rem] gap-2 items-center">
                      <span className="text-xs text-muted-foreground">{si + 1}</span>
                      <input
                        type="number"
                        value={set.weight || ''}
                        onChange={e => updateSet(ei, si, 'weight', Number(e.target.value))}
                        className="bg-muted rounded-lg px-2 py-1.5 text-sm text-foreground w-full outline-none focus:ring-1 focus:ring-primary input-3d"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        value={set.reps || ''}
                        onChange={e => updateSet(ei, si, 'reps', Number(e.target.value))}
                        className="bg-muted rounded-lg px-2 py-1.5 text-sm text-foreground w-full outline-none focus:ring-1 focus:ring-primary input-3d"
                        placeholder="0"
                      />
                      <button onClick={() => removeSet(ei, si)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addSet(ei)}
                  className="mt-2 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="w-3 h-3" /> {t('addSet')}
                </button>
              </div>
            );
          })}

          <Button onClick={saveCurrentWorkout} className="w-full gradient-primary text-primary-foreground font-semibold btn-3d">
            <Save className="w-4 h-4 mr-2" /> {t('saveWorkout')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkoutLogger;
