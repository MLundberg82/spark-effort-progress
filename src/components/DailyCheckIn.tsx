import { useMemo } from 'react';
import { getStreak, getTotalXP, getLevelFromXP, getRatTier, getNextMilestone, getReachedMilestones } from '@/lib/gamificationStore';
import { getWorkouts } from '@/lib/workoutStore';
import { getUserProfile } from './TrainingLevelSelector';
import { Flame, Trophy, Target, TrendingUp, Star } from 'lucide-react';

const DailyCheckIn = () => {
  const streak = getStreak();
  const totalXP = getTotalXP();
  const { level, progress, currentXP, xpToNext } = getLevelFromXP(totalXP);
  const ratTier = getRatTier(level);
  const nextMilestone = getNextMilestone(level);
  const reached = getReachedMilestones(level);
  const workouts = useMemo(() => getWorkouts(), []);
  const profile = getUserProfile();

  const totalVolume = useMemo(() =>
    workouts.reduce((acc, w) => acc + w.entries.reduce((a, e) => a + e.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0), 0),
    [workouts]
  );

  const goalLabel = profile && (profile as any).goal
    ? { lose: '🔥 Lose Weight', maintain: '⚖️ Maintain', gain: '💪 Build Muscle' }[(profile as any).goal as string] || 'Not set'
    : 'Not set';

  return (
    <div className="space-y-4">
      {/* Streak */}
      <div className="card-3d rounded-2xl p-5 text-center">
        <Flame className="w-10 h-10 text-accent mx-auto mb-2" />
        <p className="font-display text-4xl font-black text-accent">{streak}</p>
        <p className="text-sm text-muted-foreground font-semibold">Day Streak</p>
        {streak === 0 && <p className="text-xs text-muted-foreground mt-1">Start a workout to begin your streak!</p>}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-3d rounded-xl p-3 text-center">
          <Trophy className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="font-display text-xl font-bold text-foreground">{workouts.length}</p>
          <p className="text-[10px] text-muted-foreground">Workouts</p>
        </div>
        <div className="card-3d rounded-xl p-3 text-center">
          <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="font-display text-xl font-bold text-foreground">{totalVolume >= 1000 ? `${Math.round(totalVolume).toLocaleString()} kg` : `${totalVolume} kg`}</p>
          <p className="text-[10px] text-muted-foreground">Total Volume (kg)</p>
        </div>
      </div>

      {/* Level progress */}
      <div className="card-3d rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">Level {level}</span>
          <span className="text-xs text-muted-foreground">{ratTier.label}</span>
        </div>
        <div className="h-3 rounded-full bg-secondary overflow-hidden shadow-inset">
          <div className="h-full gradient-primary transition-all duration-700 rounded-full" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{currentXP} XP</span>
          <span>{xpToNext} XP to next</span>
        </div>
      </div>

      {/* Personal Goal */}
      <div className="card-3d rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-accent" />
          <span className="text-sm font-bold text-foreground">Personal Goal</span>
        </div>
        <p className="text-sm text-muted-foreground">{goalLabel}</p>
      </div>

      {/* Next milestone */}
      {nextMilestone && (
        <div className="card-3d rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold text-foreground">Next Milestone</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{nextMilestone.icon}</span>
            <div>
              <p className="text-sm font-bold text-foreground">Level {nextMilestone.level}: {nextMilestone.title}</p>
              <p className="text-xs text-accent">{nextMilestone.reward}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reached milestones */}
      {reached.length > 0 && (
        <div className="card-3d rounded-2xl p-4 space-y-2">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Achievements</span>
          <div className="flex flex-wrap gap-2">
            {reached.map(m => (
              <div key={m.level} className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                <span>{m.icon}</span> {m.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyCheckIn;
