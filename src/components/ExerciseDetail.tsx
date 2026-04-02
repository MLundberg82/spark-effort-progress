import { Exercise } from '@/lib/exerciseData';
import ExerciseAnimation from './ExerciseAnimation';
import ProgressChart from './ProgressChart';
import { useT } from '@/lib/i18n';
import { ArrowLeft, Info } from 'lucide-react';

interface Props {
  exercise: Exercise;
  onBack: () => void;
}

const ExerciseDetail = ({ exercise, onBack }: Props) => {
  const t = useT();
  return (
    <div className="space-y-4 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> {t('back')}
      </button>

      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">{exercise.name}</h2>
        <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold gradient-primary text-primary-foreground capitalize shadow-button">
          {exercise.muscleGroup}
        </span>
      </div>

      <ExerciseAnimation exercise={exercise} />

      <div className="card-3d rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">{t('howToPerform')}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{exercise.description}</p>
        <div className="space-y-1.5">
          {exercise.animationSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold shadow-button">
                {i + 1}
              </span>
              <span className="text-sm text-foreground/90">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-3d rounded-2xl p-4">
        <h3 className="font-display font-semibold text-foreground text-sm mb-2">💡 {t('proTips')}</h3>
        <ul className="space-y-1">
          {exercise.tips.map((tip, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <ProgressChart exerciseId={exercise.id} />
    </div>
  );
};

export default ExerciseDetail;
