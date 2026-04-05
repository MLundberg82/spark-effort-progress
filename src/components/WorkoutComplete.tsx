import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
    <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center gap-2 text-white/45">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
          {icon}
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.18em]">
          {label}
        </div>
      </div>

      <div className={`text-2xl font-black uppercase tracking-[0.02em] text-white ${accentClass}`}>
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
      const parsed = JSON.parse(raw) as { xp?: number; totalXP?: number };
      if (typeof parsed.totalXP === 'number') return parsed.totalXP;
      if (typeof parsed.xp === 'number') return parsed.xp;
      return summary.earnedXP;
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
    previousLevelRef.current = startLevel;

    const duration = 2200;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const progress = clamp(elapsed / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      const nextXP = Math.round(
        previousTotalXP + (currentTotalXP - previousTotalXP) * eased,
      );

      setDisplayXP(nextXP);

      const nextLevel = getLevelFromXP(nextXP);

      if (nextLevel > previousLevelRef.current) {
        previousLevelRef.current = nextLevel;
        setDisplayLevel(nextLevel);
        setLevelFlash(true);
        setShowExplosion(true);
        setShowLevelUpText(true);
        vibrate([90, 40, 140, 40, 200]);

        window.setTimeout(() => setLevelFlash(false), 420);
        window.setTimeout(() => setShowExplosion(false), 950);
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
    <div className="relative min-h-[100dvh] overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_32%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(132,255,88,0.08),transparent_22%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.04),rgba(0,0,0,0.45)_45%,rgba(0,0,0,0.88))]" />

      {showExplosion ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-[16%] z-20 flex justify-center text-[84px] opacity-95 animate-ping">
            ✦
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-[20%] z-20 flex justify-center text-[48px] opacity-90">
            ⚡
          </div>
        </>
      ) : null}

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-6 pt-6">
        <div className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
          Workout complete
        </div>

        {showLevelUpText && levelsGained > 0 ? (
          <div className="mb-2 inline-flex self-start rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-lime-300">
            Level Up
          </div>
        ) : null}

        <h1 className="text-4xl font-black uppercase leading-none tracking-[0.02em] text-white">
          Session
          <br />
          Crushed
        </h1>

        <p className="mt-3 max-w-[32ch] text-sm text-white/55">
          {summary.workoutName} is done. Work converted into XP, momentum and a
          stronger GymRat.
        </p>

        <div
          className={[
            'relative mt-6 rounded-[32px] border p-5 transition-all duration-200',
            levelFlash
              ? 'border-lime-300/35 bg-[linear-gradient(180deg,rgba(132,255,88,0.14),rgba(255,255,255,0.05))] shadow-[0_0_50px_rgba(132,255,88,0.12)]'
              : 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]',
          ].join(' ')}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                XP earned
              </div>
              <div className="mt-1 text-3xl font-black uppercase text-lime-300">
                +{summary.earnedXP} XP
              </div>
            </div>

            <div
              className={[
                'flex h-20 w-20 items-center justify-center rounded-full border text-center transition-all duration-200',
                levelFlash
                  ? 'scale-[1.08] border-lime-300/35 bg-lime-400/10 shadow-[0_0_45px_rgba(132,255,88,0.22)]'
                  : 'border-white/10 bg-white/5',
              ].join(' ')}
            >
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/40">
                  Level
                </div>
                <div className="mt-1 text-2xl font-black text-white">
                  {displayLevel}
                </div>
              </div>
            </div>
          </div>

          {levelsGained > 0 ? (
            <div className="mb-4 rounded-[20px] border border-lime-400/20 bg-lime-400/8 px-4 py-3 text-sm font-semibold text-lime-200">
              You went from level {startLevel} to level {finalLevel}.
            </div>
          ) : (
            <div className="mb-4 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
              Level {displayLevel} progression updated.
            </div>
          )}

          <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
            <span>XP progress</span>
            <span>
              {currentLevelXP} / {XP_PER_LEVEL}
            </span>
          </div>

          <div className="h-4 overflow-hidden rounded-full bg-white/10">
            <div
              className={[
                'h-full rounded-full transition-all duration-150',
                levelFlash
                  ? 'bg-[linear-gradient(90deg,#d9ff7a_0%,#7cff6b_55%,#ffffff_100%)]'
                  : 'bg-[linear-gradient(90deg,#d4af37_0%,#ffe58f_30%,#7cff6b_100%)]',
              ].join(' ')}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-2 text-right text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
            Total XP {displayXP}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
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
            value={summary.volume}
          />
          <StatTile
            icon={<Zap className="h-4 w-4" />}
            label="Coins"
            value={`+${coinsEarned}`}
            accentClass="text-amber-300"
          />
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-5 flex h-16 w-full items-center justify-center gap-2 rounded-[24px] border border-white/10 bg-white/6 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-white/20 hover:bg-white/10 active:scale-[0.99]"
        >
          Back Home
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onOpenPaywall}
          className="mt-3 rounded-[24px] border border-amber-400/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.14),rgba(255,255,255,0.03))] p-4 text-left transition hover:border-amber-300/35 hover:bg-[linear-gradient(180deg,rgba(251,191,36,0.2),rgba(255,255,255,0.05))] active:scale-[0.99]"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
              <Crown className="h-4 w-4 text-amber-300" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
              Premium boost
            </div>
          </div>

          <div className="text-[13px] font-black uppercase tracking-[0.12em] text-white">
            Make progression hit harder
          </div>
          <p className="mt-1 text-sm text-white/55">
            Stronger identity, cleaner flow and more dopamine in every session.
          </p>
        </button>

        {!animationDone ? (
          <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
            <Sparkles className="h-3.5 w-3.5" />
            Animating progression…
          </div>
        ) : null}
      </div>
    </div>
  );
}