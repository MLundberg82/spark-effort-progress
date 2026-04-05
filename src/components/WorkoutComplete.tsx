import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Crown, Dumbbell, Flame, Sparkles, Trophy, Zap } from 'lucide-react';

type WorkoutCompleteSummary = {
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
  earnedXP: number;
};

type WorkoutCompleteProps = {
  summary: WorkoutCompleteSummary;
  onContinue: () => void;
  onOpenPaywall: () => void;
};

const XP_PER_LEVEL = 250;

function getLevelFromXP(xp: number) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function getLevelProgressXP(xp: number) {
  const level = getLevelFromXP(xp);
  const levelStart = (level - 1) * XP_PER_LEVEL;
  return xp - levelStart;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default function WorkoutComplete({
  summary,
  onContinue,
  onOpenPaywall,
}: WorkoutCompleteProps) {
  const currentTotalXP = useMemo(() => {
    if (typeof window === 'undefined') return summary.earnedXP;

    try {
      const raw = localStorage.getItem('gymrat-app-store');
      if (!raw) return summary.earnedXP;

      const parsed = JSON.parse(raw) as { xp?: number };
      return typeof parsed?.xp === 'number' ? parsed.xp : summary.earnedXP;
    } catch {
      return summary.earnedXP;
    }
  }, [summary.earnedXP]);

  const previousTotalXP = Math.max(0, currentTotalXP - summary.earnedXP);
  const startLevel = getLevelFromXP(previousTotalXP);
  const finalLevel = getLevelFromXP(currentTotalXP);
  const levelsGained = Math.max(0, finalLevel - startLevel);

  const [displayXP, setDisplayXP] = useState(previousTotalXP);
  const [displayLevel, setDisplayLevel] = useState(startLevel);
  const [levelFlash, setLevelFlash] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [showLevelUpText, setShowLevelUpText] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);

  const previousLevelRef = useRef(startLevel);

  useEffect(() => {
    let raf = 0;
    let startTime = 0;

    previousLevelRef.current = startLevel;
    setDisplayXP(previousTotalXP);
    setDisplayLevel(startLevel);
    setAnimationDone(false);
    setShowExplosion(false);
    setShowLevelUpText(false);
    setLevelFlash(false);

    const duration = 2200;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const progress = clamp(elapsed / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      const nextXP = Math.round(
        previousTotalXP + (currentTotalXP - previousTotalXP) * eased
      );

      setDisplayXP(nextXP);

      const nextLevel = getLevelFromXP(nextXP);

      if (nextLevel > previousLevelRef.current) {
        previousLevelRef.current = nextLevel;
        setDisplayLevel(nextLevel);
        setLevelFlash(true);
        setShowExplosion(true);
        setShowLevelUpText(true);
        vibrate([80, 40, 120, 40, 180]);

        window.setTimeout(() => setLevelFlash(false), 420);
        window.setTimeout(() => setShowExplosion(false), 900);
      } else {
        setDisplayLevel(nextLevel);
      }

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setDisplayXP(currentTotalXP);
        setDisplayLevel(finalLevel);
        setAnimationDone(true);
        vibrate(60);
      }
    };

    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [currentTotalXP, finalLevel, previousTotalXP, startLevel]);

  const currentLevelXP = getLevelProgressXP(displayXP);
  const progressPercent = clamp((currentLevelXP / XP_PER_LEVEL) * 100, 0, 100);
  const coinsEarned = Math.max(10, Math.floor(summary.earnedXP / 5));
  const ratScaleClass = levelFlash ? 'scale-[1.08]' : 'scale-100';
  const xpBarScaleClass = levelFlash ? 'scale-y-[1.12]' : 'scale-y-100';

  return (
    <div className="min-h-screen bg-[#09090b] px-4 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-[430px]">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
            Workout complete
          </div>

          <div className="relative mt-4 flex min-h-[220px] items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20">
            {showExplosion ? (
              <div className="absolute inset-0 flex items-center justify-center text-4xl">
                <span className="animate-pulse">✨</span>
                <span className="mx-3 animate-pulse">⚡</span>
                <span className="animate-pulse">✨</span>
              </div>
            ) : null}

            {showLevelUpText && levelsGained > 0 ? (
              <div className="absolute top-4 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-amber-200">
                LEVEL UP
              </div>
            ) : null}

            <div
              className={`flex h-36 w-36 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-6xl transition ${ratScaleClass}`}
            >
              🐀
            </div>
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight">
            Real effort. Real progress.
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {summary.workoutName} is done. Your effort turned into XP, progression and a stronger GymRat identity.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
                <Zap className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-xs text-zinc-400">XP gained</div>
              <div className="mt-1 text-xl font-black">+{summary.earnedXP}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
                <Trophy className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-xs text-zinc-400">Coins earned</div>
              <div className="mt-1 text-xl font-black">+{coinsEarned}</div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">Level progression</div>
                <div className="mt-1 text-xs text-zinc-400">
                  XP flows from the previous level state into the new one.
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/10 px-3 py-2 text-right">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300/80">
                  Level
                </div>
                <div className="text-lg font-black">{displayLevel}</div>
              </div>
            </div>

            <div
              className={`mt-4 h-3 overflow-hidden rounded-full bg-white/10 transition ${xpBarScaleClass}`}
            >
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
              <span>
                {currentLevelXP} / {XP_PER_LEVEL} XP
              </span>
              <span>Total XP: {displayXP}</span>
            </div>

            <div className="mt-3 text-sm text-zinc-300">
              {levelsGained > 0
                ? `You went from level ${startLevel} to level ${finalLevel}.`
                : `Level ${displayLevel} progression updated.`}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
                <Dumbbell className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-xs text-zinc-400">Exercises</div>
              <div className="mt-1 text-lg font-bold">{summary.exercisesCompleted}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
                <Flame className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-xs text-zinc-400">Duration</div>
              <div className="mt-1 text-lg font-bold">{formatMinutes(summary.durationMinutes)}</div>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
              <Sparkles className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="text-xs text-zinc-400">Volume</div>
            <div className="mt-1 text-lg font-bold">{summary.volume} kg</div>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-4 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:scale-[1.01]"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>

          {animationDone ? (
            <button
              type="button"
              onClick={onOpenPaywall}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm font-bold text-amber-100 transition hover:bg-amber-400/15"
            >
              <Crown className="h-4 w-4" />
              Unlock Premium
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}