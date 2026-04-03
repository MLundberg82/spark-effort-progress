import { useEffect, useState } from 'react';
import { getLevelFromXP, getTotalXP } from '@/lib/gamificationStore';

const XPProgressBar = () => {
  const totalXP = getTotalXP();
  const levelData = getLevelFromXP(totalXP);

  const level = levelData.level;
  const xpIntoLevel = levelData.currentXP;
  const xpNeededThisLevel = levelData.xpToNext;
  const targetProgress = Math.max(0, Math.min(100, levelData.progress));

  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedProgress(targetProgress);
    }, 120);

    return () => clearTimeout(timeout);
  }, [targetProgress]);

  return (
    <div className="w-full max-w-xs mx-auto mt-3">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
        <span>Level {level}</span>
        <span>
          {xpIntoLevel} / {xpNeededThisLevel} XP
        </span>
      </div>

      <div className="h-2.5 rounded-full bg-secondary overflow-hidden shadow-inner">
        <div
          className="h-full gradient-primary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${animatedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default XPProgressBar;