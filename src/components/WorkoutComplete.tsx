import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
  onContinue: () => void;
  onOpenPaywall: () => void;
};

const XP_PER_LEVEL = 250;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getLevelFromXP(xp: number) {
  return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
}

function getLevelProgressXP(xp: number) {
  const level = getLevelFromXP(xp);
  const levelStart = (level - 1) * XP_PER_LEVEL;
  return Math.max(0, xp - levelStart);
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

function StatTile({
  icon,
  label,
  value,
  accentClass = '',
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  accentClass?: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400">
        <span className={accentClass}>{icon}</span>
        <span>{label}</span>
      </div>

      <div className={`mt-3 text-2xl font-black text-white ${accentClass}`}>
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
    if (typeof window === 'undefined') {
      return Math.max(0, summary.earnedXP);
    }

    try {
      const raw = localStorage.getItem('gymrat-app-store');
      if (!raw) return Math.max(0, summary.earnedXP);

      const parsed = JSON.parse(raw) as { xp?: number };
      return typeof parsed.xp === 'number'
        ? Math.max(0, parsed.xp)
        : Math.max(0, summary.earnedXP);
    } catch {
      return Math.max(0, summary.earnedXP);
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

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.18),_transparent_30%),linear-gradient(180deg,_#09090b_0%,_#111113_100%)] px-4 py-6 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          {showExplosion ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="animate-ping rounded-full bg-emerald-400/25 p-20" />
              <div className="absolute text-4xl">✨ ⚡ ✨</div>
            </div>
          ) : null}

          {showLevelUpText && levelsGained > 0 ? (
            <div className="absolute right-4 top-4 rounded-full border border-yellow-300/30 bg-yellow-300/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-yellow-200">
              Level up
            </div>
          ) : null}

          <div className="relative z-10 flex flex-col items-center text-center">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-[0_0_45px_rgba(74,222,128,0.25)] transition duration-300 ${
                levelFlash ? 'scale-[1.06]' : 'scale-100'
              }`}
            >
              <Trophy className="h-11 w-11" />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">
              Workout complete
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Real effort. Real progress.
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-zinc-300 sm:text-base">
              <span className="font-bold text-white">{summary.workoutName}</span>{' '}
              is done. Your effort turned into XP, progression and a stronger
              GymRat identity.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon={<Zap className="h-4 w-4" />}
            label="XP gained"
            value={`+${summary.earnedXP}`}
            accentClass="text-emerald-300"
          />
          <StatTile
            icon={<Crown className="h-4 w-4" />}
            label="Coins earned"
            value={`+${coinsEarned}`}
            accentClass="text-yellow-300"
          />
          <StatTile
            icon={<Dumbbell className="h-4 w-4" />}
            label="Exercises"
            value={summary.exercisesCompleted}
          />
          <StatTile
            icon={<Flame className="h-4 w-4" />}
            label="Volume"
            value={`${summary.volume} kg`}
          />
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">
                Level progression
              </p>
              <h2
                className={`mt-2 text-3xl font-black transition ${
                  levelFlash ? 'text-emerald-300' : 'text-white'
                }`}
              >
                Level {displayLevel}
              </h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                Progress
              </p>
              <p className="mt-1 text-xl font-black text-white">
                {progressPercent.toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="h-4 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-300 transition-all duration-300 ${
                  levelFlash ? 'scale-y-[1.12]' : 'scale-y-100'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-sm text-zinc-300">
              <span>
                {currentLevelXP} / {XP_PER_LEVEL} XP
              </span>
              <span>Total XP: {displayXP}</span>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-zinc-950/50 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                  Workout
                </p>
                <p className="mt-2 font-semibold text-white">
                  {summary.workoutName}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                  Duration
                </p>
                <p className="mt-2 font-semibold text-white">
                  {formatMinutes(summary.durationMinutes)}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                  Result
                </p>
                <p className="mt-2 font-semibold text-white">
                  {levelsGained > 0
                    ? `Level ${startLevel} → ${finalLevel}`
                    : `Level ${displayLevel} progressing`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-300 px-5 py-4 text-sm font-black text-black shadow-[0_14px_35px_rgba(74,222,128,0.35)] transition hover:scale-[1.01]"
          >
            <ArrowRight className="h-4 w-4" />
            Continue
          </button>

          <button
            type="button"
            onClick={onOpenPaywall}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-5 py-4 text-sm font-black text-yellow-100 transition hover:bg-yellow-300/15 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!animationDone}
          >
            <Sparkles className="h-4 w-4" />
            Unlock Premium
          </button>
        </div>
      </div>
    </div>
  );
}