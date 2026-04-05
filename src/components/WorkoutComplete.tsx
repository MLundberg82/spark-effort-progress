import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Dumbbell,
  Flame,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';

type FocusArea = 'chest' | 'back' | 'arms' | 'legs';

type WorkoutExerciseDetail = {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  volume: number;
};

type WorkoutCompleteSummary = {
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
  earnedXP: number;
  focusArea?: FocusArea;
  details?: WorkoutExerciseDetail[];
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

function getFocusLabel(focusArea?: FocusArea) {
  if (focusArea === 'back') return 'Back';
  if (focusArea === 'arms') return 'Arms';
  if (focusArea === 'legs') return 'Legs';
  return 'Chest';
}

function getRatStage(level: number) {
  if (level >= 80) {
    return {
      title: 'Mythic Rat',
      body:
        'Your rat looks fully awakened now. The aura is heavy, dominant and impossible to ignore.',
      glow:
        'shadow-[0_0_80px_rgba(163,230,53,0.28),0_0_120px_rgba(250,204,21,0.18)]',
      ring:
        'from-yellow-300/30 via-lime-300/12 to-transparent',
      ratScale: 'scale-[1.08]',
    };
  }

  if (level >= 50) {
    return {
      title: 'Elite Rat',
      body:
        'This is no beginner energy anymore. The rat is visibly sharper, bigger and more dangerous.',
      glow:
        'shadow-[0_0_70px_rgba(163,230,53,0.24),0_0_110px_rgba(56,189,248,0.14)]',
      ring:
        'from-lime-300/28 via-emerald-300/10 to-transparent',
      ratScale: 'scale-[1.05]',
    };
  }

  if (level >= 25) {
    return {
      title: 'Alpha Rat',
      body:
        'Momentum is real now. The rat has crossed into a stronger identity and it shows.',
      glow:
        'shadow-[0_0_60px_rgba(163,230,53,0.2),0_0_90px_rgba(217,70,239,0.12)]',
      ring:
        'from-fuchsia-300/22 via-lime-300/10 to-transparent',
      ratScale: 'scale-[1.02]',
    };
  }

  if (level >= 10) {
    return {
      title: 'Grind Rat',
      body:
        'You are building visible form. The rat is no longer basic — it has weight and intent.',
      glow:
        'shadow-[0_0_48px_rgba(163,230,53,0.18),0_0_70px_rgba(251,146,60,0.12)]',
      ring:
        'from-orange-300/20 via-lime-300/10 to-transparent',
      ratScale: 'scale-100',
    };
  }

  return {
    title: 'Base Rat',
    body:
      'You are stacking the first real layers. The identity is forming and the rat is waking up.',
    glow:
      'shadow-[0_0_38px_rgba(163,230,53,0.15),0_0_55px_rgba(255,255,255,0.08)]',
    ring:
      'from-white/14 via-lime-300/8 to-transparent',
    ratScale: 'scale-[0.98]',
  };
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
    <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_14px_36px_rgba(0,0,0,0.24)]">
      <div className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/45 ${accentClass}`}>
        {icon}
        {label}
      </div>
      <div className="mt-3 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function MiniExerciseRow({ detail }: { detail: WorkoutExerciseDetail }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-bold text-white">{detail.exercise}</div>
        <div className="mt-1 text-xs text-white/45">
          {detail.sets} sets · {detail.reps} reps · {detail.weight} kg
        </div>
      </div>
      <div className="shrink-0 text-sm font-black text-lime-300">{detail.volume} kg</div>
    </div>
  );
}

function RatVisual({
  level,
  isEvolving,
  stageTitle,
}: {
  level: number;
  isEvolving: boolean;
  stageTitle: string;
}) {
  const stage = getRatStage(level);

  return (
    <div className="relative mx-auto flex h-[320px] w-full max-w-[360px] items-center justify-center overflow-hidden">
      <div
        className={`absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(163,230,53,0.18),transparent_58%)] blur-2xl transition-all duration-500 ${
          isEvolving ? 'scale-125 opacity-100' : 'scale-100 opacity-70'
        }`}
      />
      <div
        className={`absolute inset-[14%] rounded-full bg-gradient-to-br ${stage.ring} blur-xl transition-all duration-500 ${
          isEvolving ? 'scale-125 opacity-100' : 'scale-100 opacity-80'
        }`}
      />
      <div
        className={`absolute inset-[18%] rounded-full border border-lime-300/15 bg-white/[0.03] ${stage.glow} transition-all duration-500 ${
          isEvolving ? 'scale-[1.08] opacity-100' : 'scale-100 opacity-90'
        }`}
      />

      <div
        className={`relative z-10 flex h-[210px] w-[210px] items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_55%,rgba(0,0,0,0.16))] transition-all duration-500 ${stage.ratScale} ${
          isEvolving ? 'rotate-1 scale-[1.08]' : ''
        }`}
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.12),transparent_22%)]" />

        <div className="relative flex flex-col items-center">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/35">
            {stageTitle}
          </div>

          <div
            className={`relative text-[110px] leading-none transition-all duration-500 ${
              isEvolving ? 'scale-110 drop-shadow-[0_0_28px_rgba(163,230,53,0.35)]' : 'scale-100'
            }`}
          >
            🐀
          </div>

          <div className="mt-2 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
            <Zap className="h-3.5 w-3.5 text-lime-300" />
            Level {level}
          </div>
        </div>
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
  const [ratMorphPhase, setRatMorphPhase] = useState<'idle' | 'old' | 'burst' | 'new'>('idle');

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
    setRatMorphPhase('old');
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
        setRatMorphPhase('burst');
        vibrate([90, 40, 150, 40, 210]);

        window.setTimeout(() => setLevelFlash(false), 420);
        window.setTimeout(() => setShowExplosion(false), 1000);
        window.setTimeout(() => setRatMorphPhase('new'), 240);
      } else {
        setDisplayLevel(nextLevel);
      }

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setDisplayXP(currentTotalXP);
        setDisplayLevel(finalLevel);
        setAnimationDone(true);
        setRatMorphPhase(finalLevel > startLevel ? 'new' : 'idle');
        vibrate(60);
      }
    };

    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [currentTotalXP, finalLevel, previousTotalXP, startLevel]);

  const currentLevelXP = getLevelProgressXP(displayXP);
  const progressPercent = clamp((currentLevelXP / XP_PER_LEVEL) * 100, 0, 100);
  const coinsEarned = Math.max(10, Math.floor(summary.earnedXP / 5));
  const topDetails = (summary.details ?? []).slice(0, 4);
  const stage = getRatStage(displayLevel);

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(132,204,22,0.16),transparent_28%),linear-gradient(180deg,#060606_0%,#111214_58%,#0b0b0d_100%)] px-4 pb-10 pt-5 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_30px_110px_rgba(0,0,0,0.4)] backdrop-blur">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_34%)]" />

          {showExplosion ? (
            <>
              <div className="pointer-events-none absolute left-1/2 top-[18%] z-20 -translate-x-1/2 text-6xl opacity-90 animate-ping">
                ✦
              </div>
              <div className="pointer-events-none absolute left-[18%] top-[26%] z-20 text-3xl text-amber-300 animate-pulse">
                ⚡
              </div>
              <div className="pointer-events-none absolute right-[16%] top-[24%] z-20 text-4xl text-orange-300 animate-pulse">
                ✦
              </div>
              <div className="pointer-events-none absolute left-[26%] top-[42%] z-20 text-3xl text-lime-300 animate-ping">
                ✧
              </div>
              <div className="pointer-events-none absolute right-[22%] top-[46%] z-20 text-3xl text-yellow-300 animate-ping">
                ✦
              </div>
              <div className="pointer-events-none absolute inset-x-[20%] top-[34%] z-10 h-28 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.30),rgba(163,230,53,0.16),transparent_68%)] blur-2xl" />
            </>
          ) : null}

          <div className="relative z-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/15 bg-lime-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-lime-300">
                <Sparkles className="h-3.5 w-3.5" />
                Workout complete
              </div>

              {showLevelUpText && levelsGained > 0 ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-amber-200 shadow-[0_0_30px_rgba(251,191,36,0.18)]">
                  <Zap className="h-4 w-4" />
                  Level Up
                </div>
              ) : null}

              <h1 className="mt-4 text-4xl font-black leading-none sm:text-5xl">
                Session
                <span className="ml-3 text-lime-300">Crushed</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/65">
                {summary.workoutName} is done. Work converted into XP, progression and a stronger GymRat identity.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <StatTile
                  icon={<Zap className="h-4 w-4 text-lime-300" />}
                  label="XP earned"
                  value={`+${summary.earnedXP} XP`}
                />
                <StatTile
                  icon={<Trophy className="h-4 w-4 text-amber-300" />}
                  label="Level"
                  value={displayLevel}
                  accentClass={levelFlash ? 'text-amber-200' : ''}
                />
              </div>

              <div className="mt-4 rounded-[28px] border border-white/10 bg-black/20 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                      XP progress
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">
                      {currentLevelXP}
                      <span className="ml-2 text-base text-white/35">/ {XP_PER_LEVEL}</span>
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-white/55">
                    Total XP <span className="text-white">{displayXP}</span>
                  </div>
                </div>

                <div className="mt-4 h-4 overflow-hidden rounded-full border border-white/10 bg-white/10">
                  <div
                    className={`h-full rounded-full bg-[linear-gradient(90deg,rgba(132,204,22,1)_0%,rgba(250,204,21,1)_100%)] transition-all duration-200 ${
                      levelFlash ? 'brightness-125 saturate-150' : ''
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="mt-3 text-sm text-white/55">
                  {levelsGained > 0 ? (
                    <>
                      You went from level <span className="font-black text-white">{startLevel}</span> to{' '}
                      <span className="font-black text-lime-300">{finalLevel}</span>.
                    </>
                  ) : (
                    <>
                      Level <span className="font-black text-white">{displayLevel}</span> progression updated.
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                <StatTile
                  icon={<Sparkles className="h-4 w-4 text-amber-300" />}
                  label="Coins"
                  value={`+${coinsEarned}`}
                  accentClass="text-amber-300"
                />
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={onContinue}
                  type="button"
                  className="inline-flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-[24px] bg-lime-300 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.18)] transition hover:brightness-105 active:scale-[0.995]"
                >
                  Back Home
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={onOpenPaywall}
                  type="button"
                  className="inline-flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-[24px] border border-white/10 bg-white/[0.05] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.995]"
                >
                  Premium boost
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {!animationDone ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/55">
                  <Sparkles className="h-3.5 w-3.5 text-lime-300 animate-pulse" />
                  Animating progression…
                </div>
              ) : null}
            </div>

            <div>
              <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-5">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                  Rat transition
                </div>

                <RatVisual
                  level={displayLevel}
                  isEvolving={ratMorphPhase === 'burst'}
                  stageTitle={stage.title}
                />

                <div className="text-center">
                  <div className="text-xl font-black text-white">{stage.title}</div>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/58">
                    {levelsGained > 0
                      ? 'You triggered a real level shift. The rat evolves with your work, not fake taps.'
                      : stage.body}
                  </p>
                </div>

                <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                    Session focus
                  </div>
                  <div className="mt-2 text-2xl font-black text-lime-300">
                    {getFocusLabel(summary.focusArea)}
                  </div>
                  <div className="mt-1 text-sm text-white/55">
                    Progress hits harder when the app remembers what you actually trained.
                  </div>
                </div>

                {topDetails.length > 0 ? (
                  <div className="mt-4">
                    <div className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                      Exercise breakdown
                    </div>
                    <div className="space-y-2">
                      {topDetails.map((detail, index) => (
                        <MiniExerciseRow
                          key={`${detail.exercise}-${index}`}
                          detail={detail}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 rounded-[24px] border border-lime-300/12 bg-lime-300/[0.06] p-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-lime-300">
                    Make progression hit harder
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/58">
                    Stronger identity, cleaner flow and more dopamine in every session.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}