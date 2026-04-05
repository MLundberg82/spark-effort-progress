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

function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-4 shadow-[0_12px_35px_rgba(0,0,0,0.24)]">
      <div className="mb-2 flex items-center gap-2 text-white/60">
        <div className="rounded-full border border-white/10 bg-black/20 p-2">
          {icon}
        </div>
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em]">
          {label}
        </span>
      </div>
      <div className={`text-xl font-black tracking-tight ${accent ?? 'text-white'}`}>
        {value}
      </div>
    </div>
  );
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
  const ratScaleClass = levelFlash ? 'scale-[1.04]' : 'scale-100';
  const xpBarScaleClass = levelFlash ? 'scale-y-[1.12]' : 'scale-y-100';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_28%),linear-gradient(180deg,#07110d_0%,#0b1511_38%,#050806_100%)] px-4 pb-8 pt-6 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(163,230,53,0.10),transparent_26%)]" />
      <div className="pointer-events-none absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />

      {showExplosion ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="animate-ping rounded-full bg-emerald-300/20 px-10 py-10 blur-sm" />
          <div className="absolute text-5xl">✨ ⚡ ✨</div>
        </div>
      ) : null}

      {showLevelUpText && levelsGained > 0 ? (
        <div className="pointer-events-none absolute inset-x-0 top-16 z-20 flex justify-center">
          <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-5 py-2 text-sm font-black uppercase tracking-[0.22em] text-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.22)]">
            LEVEL UP
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-md">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-emerald-300">
              Workout complete
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/70">
              Real progress
            </div>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white">
            Real effort. Real progress.
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/65">
            <span className="font-semibold text-white">{summary.workoutName}</span>{' '}
            is done. Your effort turned into XP, progression and a stronger GymRat identity.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <StatTile
              icon={<Zap className="h-4 w-4" />}
              label="XP gained"
              value={`+${summary.earnedXP}`}
              accent="text-emerald-300"
            />
            <StatTile
              icon={<Crown className="h-4 w-4" />}
              label="Coins earned"
              value={`+${coinsEarned}`}
              accent="text-yellow-300"
            />
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Level progression
                </p>
                <h2 className="mt-1 text-lg font-black text-white">
                  Level {displayLevel}
                </h2>
              </div>

              <div
                className={`rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[0.7rem] font-black uppercase tracking-[0.16em] text-emerald-300 transition-transform duration-300 ${ratScaleClass}`}
              >
                {progressPercent.toFixed(0)}%
              </div>
            </div>

            <div className="relative overflow-hidden rounded-full border border-white/10 bg-white/5 p-1">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_60%)]" />
              <div className="h-5 overflow-hidden rounded-full bg-black/30">
                <div
                  className={`h-full rounded-full bg-[linear-gradient(90deg,#34d399_0%,#22c55e_45%,#a3e635_100%)] shadow-[0_0_25px_rgba(52,211,153,0.55)] transition-all duration-300 ${xpBarScaleClass}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <p className="text-white/55">
                {currentLevelXP} / {XP_PER_LEVEL} XP
              </p>
              <p className="font-bold text-white">
                Total XP: <span className="text-emerald-300">{displayXP}</span>
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/72">
              {levelsGained > 0
                ? `You went from level ${startLevel} to level ${finalLevel}.`
                : `Level ${displayLevel} progression updated.`}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <StatTile
              icon={<Dumbbell className="h-4 w-4" />}
              label="Exercises"
              value={summary.exercisesCompleted}
            />
            <StatTile
              icon={<Flame className="h-4 w-4" />}
              label="Duration"
              value={formatMinutes(summary.durationMinutes)}
            />
            <StatTile
              icon={<Trophy className="h-4 w-4" />}
              label="Volume"
              value={`${summary.volume} kg`}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={onContinue}
              className="flex items-center justify-center gap-3 rounded-[1.4rem] border border-emerald-300/20 bg-[linear-gradient(90deg,rgba(16,185,129,0.95),rgba(132,204,22,0.95))] px-5 py-4 text-base font-black tracking-[0.04em] text-black shadow-[0_18px_45px_rgba(16,185,129,0.28)] transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Continue</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            {animationDone ? (
              <button
                onClick={onOpenPaywall}
                className="flex items-center justify-center gap-2 rounded-[1.3rem] border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.1]"
              >
                <Sparkles className="h-4 w-4 text-emerald-300" />
                <span>Unlock Premium</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}