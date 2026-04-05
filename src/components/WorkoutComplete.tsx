import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Crown,
  Dumbbell,
  Flame,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';

type WorkoutCompleteSummary = {
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
  earnedXP: number;
};

type WorkoutCompleteProps = {
  summary: WorkoutCompleteSummary;
  onGoHome: () => void;
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

export default function WorkoutComplete({
  summary,
  onGoHome,
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
    <div className="min-h-screen bg-[#0a0d12] px-4 pb-10 pt-5 text-white">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(245,158,11,0.12),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300">
              <Zap size={14} />
              Workout complete
            </div>

            <div className="relative mt-6 flex min-h-[220px] w-full items-center justify-center overflow-hidden">
              {showExplosion ? (
                <>
                  <span className="absolute h-40 w-40 animate-ping rounded-full bg-emerald-400/15" />
                  <span className="absolute h-56 w-56 animate-pulse rounded-full bg-amber-300/10" />
                  <span className="absolute left-[20%] top-[26%] text-2xl animate-bounce">✨</span>
                  <span className="absolute right-[22%] top-[24%] text-2xl animate-bounce delay-75">💥</span>
                  <span className="absolute left-[24%] bottom-[24%] text-2xl animate-bounce delay-100">⚡</span>
                  <span className="absolute right-[24%] bottom-[26%] text-2xl animate-bounce delay-150">🔥</span>
                </>
              ) : null}

              <div
                className={`relative flex h-40 w-40 items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle,rgba(16,185,129,0.18),rgba(255,255,255,0.04),rgba(0,0,0,0.1))] shadow-[0_0_60px_rgba(16,185,129,0.18)] transition-transform duration-300 ${ratScaleClass}`}
              >
                <div className="absolute inset-0 rounded-full border border-amber-300/10" />
                <div className="text-[72px] leading-none">🐀</div>
              </div>

              {showLevelUpText && levelsGained > 0 ? (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-amber-200 shadow-[0_0_30px_rgba(251,191,36,0.15)] animate-bounce">
                  LEVEL UP
                </div>
              ) : null}
            </div>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Real effort. Real progress.
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
              {summary.workoutName} is done. Your effort turned into XP, progression and a stronger GymRat identity.
            </p>

            <div className="mt-5 text-5xl font-black tracking-tight text-emerald-300">
              +{summary.earnedXP} XP
            </div>

            {levelsGained > 0 ? (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-200">
                <Crown size={16} />
                You went from level {startLevel} to level {finalLevel}
              </div>
            ) : (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/70">
                <Sparkles size={16} />
                Level {displayLevel} progression updated
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.24)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-lg font-bold text-white">Level progression</div>
              <div className="mt-1 text-sm text-white/55">
                XP flows from the previous level state into the new one.
              </div>
            </div>

            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
              Level {displayLevel}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-white/70">
                {currentLevelXP} / {XP_PER_LEVEL} XP
              </span>
              <span className="font-semibold text-white/50">
                Total XP: {displayXP}
              </span>
            </div>

            <div className="h-5 overflow-hidden rounded-full border border-white/10 bg-black/25">
              <div
                className={`h-full rounded-full bg-[linear-gradient(90deg,rgba(16,185,129,1),rgba(250,204,21,0.95))] shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-[width,transform] duration-300 ${xpBarScaleClass}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/45">
              <span>Level {displayLevel}</span>
              <span>Next threshold</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="flex items-center gap-2 text-white/70">
              <Dumbbell size={16} />
              <span className="text-xs font-bold uppercase tracking-[0.18em]">Exercises</span>
            </div>
            <div className="mt-3 text-3xl font-black text-white">
              {summary.exercisesCompleted}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="flex items-center gap-2 text-white/70">
              <Flame size={16} />
              <span className="text-xs font-bold uppercase tracking-[0.18em]">Minutes</span>
            </div>
            <div className="mt-3 text-3xl font-black text-white">
              {summary.durationMinutes}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="flex items-center gap-2 text-white/70">
              <Trophy size={16} />
              <span className="text-xs font-bold uppercase tracking-[0.18em]">Volume</span>
            </div>
            <div className="mt-3 text-3xl font-black text-white">
              {summary.volume}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="flex items-center gap-2 text-white/70">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-[0.18em]">Coins earned</span>
            </div>
            <div className="mt-3 text-3xl font-black text-amber-200">
              +{coinsEarned}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-amber-300/10 bg-amber-300/[0.06] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-bold text-white">
                Make progression feel even bigger
              </div>
              <div className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                Premium should amplify the feeling of momentum with stronger feedback, cleaner visuals and more identity value.
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenPaywall}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 text-sm font-black text-black transition hover:brightness-105"
            >
              <Crown size={16} />
              Unlock XP Boost
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black text-black transition hover:brightness-105"
          >
            Back home
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={onOpenPaywall}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm font-bold text-white transition hover:bg-white/[0.09]"
          >
            <Crown size={16} />
            Premium rewards
          </button>
        </div>

        {!animationDone ? (
          <div className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            Animating progression…
          </div>
        ) : null}
      </div>
    </div>
  );
}