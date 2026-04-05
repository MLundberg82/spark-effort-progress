import { useEffect, useState } from 'react';
import {
  getRecommendedNextFocusArea,
  getWorkoutFocusBreakdown,
  getPRProximity,
} from '@/lib/historyStore';

type MuscleGroup =
  | 'chest'
  | 'back'
  | 'arms'
  | 'legs'
  | 'shoulders'
  | 'core';

type Props = {
  onStartWorkout: (focus?: MuscleGroup) => void;
  onClose: () => void;
};

const muscleLabels: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  arms: 'Arms',
  legs: 'Legs',
  shoulders: 'Shoulders',
  core: 'Core',
};

export default function DailyCheckInScreen({
  onStartWorkout,
  onClose,
}: Props) {
  const [recommended, setRecommended] =
    useState<MuscleGroup>('chest');

  const [breakdown, setBreakdown] =
    useState<Record<MuscleGroup, number> | null>(null);

  const [proximity, setProximity] = useState<
    ReturnType<typeof getPRProximity>
  >([]);

  useEffect(() => {
    setRecommended(getRecommendedNextFocusArea());
    setBreakdown(getWorkoutFocusBreakdown(10));
    setProximity(getPRProximity());
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card rounded-2xl p-6 shadow-xl relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-sm opacity-60"
        >
          ✕
        </button>

        {/* TITLE */}
        <h2 className="text-xl font-bold text-center mb-2">
          Daily Check-In
        </h2>

        <p className="text-center text-sm text-muted-foreground mb-6">
          Based on your recent workouts
        </p>

        {/* 🔥 PR PROXIMITY */}
        {proximity.length > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4 text-center">
            <p className="text-xs text-muted-foreground">
              Close to a PR
            </p>
            <p className="font-semibold text-sm">
              {proximity[0].exercise} (+{proximity[0].diff} kg)
            </p>
          </div>
        )}

        {/* RECOMMENDATION */}
        <div className="bg-muted rounded-xl p-4 text-center mb-6">
          <p className="text-sm text-muted-foreground mb-1">
            Recommended focus
          </p>

          <p className="text-2xl font-bold">
            {muscleLabels[recommended]}
          </p>
        </div>

        {/* BREAKDOWN */}
        {breakdown && (
          <div className="mb-6 space-y-2">
            {(Object.keys(breakdown) as MuscleGroup[]).map(
              (group) => (
                <div key={group}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{muscleLabels[group]}</span>
                    <span>{Math.round(breakdown[group])}</span>
                  </div>

                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${Math.min(
                          100,
                          breakdown[group] / 10
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ACTIONS */}
        <button
          onClick={() => onStartWorkout(recommended)}
          className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold"
        >
          Start Recommended Workout
        </button>

        <button
          onClick={() => onStartWorkout()}
          className="w-full mt-2 py-3 text-sm opacity-70"
        >
          Start Anyway
        </button>
      </div>
    </div>
  );
}