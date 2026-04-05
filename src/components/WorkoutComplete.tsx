import { useEffect, useState } from 'react';
import type { PRResult } from '@/lib/historyStore';

type Props = {
  summary: {
    durationMinutes: number;
    exercisesCompleted: number;
    volume: number;
    prs?: PRResult[];
  };
  onContinue: () => void;
};

export default function WorkoutComplete({
  summary,
  onContinue,
}: Props) {
  const [showPR, setShowPR] = useState(false);

  useEffect(() => {
    if (summary.prs && summary.prs.length > 0) {
      setShowPR(true);
    }
  }, [summary.prs]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">

      {/* 🎉 PR CELEBRATION */}
      {showPR && summary.prs && summary.prs.length > 0 && (
        <div className="mb-6 w-full max-w-sm">

          <div className="bg-gradient-to-br from-yellow-400/20 to-green-400/20 border border-yellow-300/30 rounded-2xl p-5 shadow-[0_0_40px_rgba(255,215,0,0.2)] animate-fade-in">

            <h2 className="text-center font-bold text-lg mb-2">
              🎉 New Personal Record!
            </h2>

            <p className="text-center text-xs opacity-70 mb-4">
              You're getting stronger 💪
            </p>

            <div className="space-y-3">
              {summary.prs.map((pr, i) => (
                <div
                  key={i}
                  className="bg-background/60 rounded-xl p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {pr.exercise}
                    </p>
                    <p className="text-xs opacity-60">
                      {pr.previousBest} → {pr.newWeight} kg
                    </p>
                  </div>

                  <span className="text-lg">✨</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUMMARY */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">
          Workout Complete
        </h1>

        <p className="text-sm opacity-70">
          {summary.durationMinutes} min • {summary.exercisesCompleted} exercises
        </p>
      </div>

      {/* STATS */}
      <div className="bg-card rounded-2xl p-5 w-full max-w-sm shadow mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm opacity-70">Volume</span>
          <span className="font-semibold">
            {summary.volume} kg
          </span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onContinue}
        className="w-full max-w-sm bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg"
      >
        Continue
      </button>
    </div>
  );
}