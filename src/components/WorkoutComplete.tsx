import { useEffect, useMemo, useState } from 'react';
import { Trophy, Flame, Sparkles, Crown, ArrowRight } from 'lucide-react';
import { exercises } from '@/lib/exerciseData';
import type { XPBreakdown } from '@/lib/gamificationStore';
import { getLevelFromXP, getTotalXP } from '@/lib/gamificationStore';

type Props = {
  xpBreakdown: XPBreakdown;
  oldLevel: number;
  newLevel: number;
  onContinue: () => void;
};

export default function WorkoutComplete({
  xpBreakdown,
  oldLevel,
  newLevel,
  onContinue,
}: Props) {
  const [xpAnimated, setXpAnimated] = useState(0);

  const hasPB = xpBreakdown.newPBs.length > 0;
  const leveledUp = newLevel > oldLevel;

  const totalXP = getTotalXP();
  const { currentXP, xpToNext } = getLevelFromXP(totalXP);

  useEffect(() => {
    let current = 0;
    const target = xpBreakdown.total;
    const steps = 30;
    const stepTime = 25;
    const increment = target / steps;

    const interval = window.setInterval(() => {
      current += increment;
      if (current >= target) {
        setXpAnimated(target);
        window.clearInterval(interval);
      } else {
        setXpAnimated(Math.floor(current));
      }
    }, stepTime);

    return () => window.clearInterval(interval);
  }, [xpBreakdown.total]);

  const pbDetails = useMemo(() => {
    return xpBreakdown.newPBs.map((pb) => {
      const ex = exercises.find((e) => e.id === pb.exerciseId);
      return {
        name: ex?.name ?? pb.exerciseId,
        type: pb.type,
      };
    });
  }, [xpBreakdown.newPBs]);

  return (
    <div className="min-h-screen bg-background px-4 py-4 text-foreground">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-border/40 bg-card/70 p-5 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
              <Sparkles className="h-9 w-9 text-primary" />
            </div>

            <div className="mt-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Workout Complete
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Nice work
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your session has been saved and your progress is updated.
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
            <div className="text-sm font-medium text-muted-foreground">XP Earned</div>
            <div className="mt-2 text-4xl font-black text-primary">+{xpAnimated}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Level {newLevel} • {currentXP}/{xpToNext} XP
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/40 bg-secondary/20 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                Workout XP
              </div>
              <div className="mt-2 text-xl font-bold">
                +{xpBreakdown.workoutComplete}
              </div>
            </div>

            <div className="rounded-2xl border border-border/40 bg-secondary/20 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Flame className="h-4 w-4" />
                Streak bonus
              </div>
              <div className="mt-2 text-xl font-bold">
                +{xpBreakdown.streakBonus}
              </div>
            </div>
          </div>

          {xpBreakdown.newPBs.length > 0 && (
            <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-300">
                <Trophy className="h-4 w-4" />
                New PBs
              </div>

              <div className="space-y-2">
                {pbDetails.map((pb, i) => (
                  <div
                    key={`${pb.name}-${pb.type}-${i}`}
                    className="rounded-xl border border-border/30 bg-background/40 px-3 py-2 text-sm"
                  >
                    <span className="font-semibold">{pb.name}</span>
                    <span className="text-muted-foreground"> — {pb.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {xpBreakdown.premiumMultiplied && (
            <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                <Crown className="h-4 w-4" />
                2x Premium Bonus Applied
              </div>
            </div>
          )}

          {leveledUp && (
            <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
              <div className="text-xs uppercase tracking-[0.22em] text-primary">
                Level Up
              </div>
              <div className="mt-2 text-2xl font-black">
                {oldLevel} → {newLevel}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onContinue}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-md"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}