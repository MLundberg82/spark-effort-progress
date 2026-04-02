import { exercises, muscleGroupLabels, MuscleGroup } from '@/lib/exerciseData';
import { getRecommendedMuscleGroups } from '@/lib/workoutStore';
import { useT } from '@/lib/i18n';
import { Sparkles } from 'lucide-react';

interface Props {
  onSelectExercise?: (id: string) => void;
}

const WorkoutRecommendation = ({ onSelectExercise }: Props) => {
  const t = useT();
  const recommended = getRecommendedMuscleGroups();
  const recommendedExercises = exercises.filter(e => recommended.includes(e.muscleGroup));

  return (
    <div className="card-3d rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5 text-accent" />
        <h3 className="font-display font-semibold text-foreground">{t('recommendedNext')}</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Based on your recent workouts, focus on{' '}
        <span className="text-primary font-semibold">{recommended.map(r => muscleGroupLabels[r]).join(' & ')}</span>
      </p>
      <div className="grid grid-cols-1 gap-2">
        {recommendedExercises.slice(0, 4).map(ex => (
          <button
            key={ex.id}
            onClick={() => onSelectExercise?.(ex.id)}
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-all text-left shadow-elevated hover:-translate-y-0.5 duration-200"
          >
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shadow-button">
              {ex.name[0]}
            </div>
            <div>
              <span className="text-sm font-medium text-foreground block">{ex.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{ex.muscleGroup}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WorkoutRecommendation;
