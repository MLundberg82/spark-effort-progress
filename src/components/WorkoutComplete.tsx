import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, Crown, Dumbbell, Flame, Sparkles, Trophy, Zap } from 'lucide-react';
import { getCurrentLevelXP, getLevelFromXP, getNextLevelXP } from '@/lib/gamificationStore';
import { getProfile } from '@/lib/profileStore';
import { getRatImageForLevel } from '@/lib/assetRegistry';
import { t, useAppLanguage } from '@/lib/languageStore';

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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function formatMinutes(minutes: number, language: string) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (language === 'sv') {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

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

function ExplosionFx({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,rgba(255,245,200,0.22),rgba(255,140,0,0.16)_18%,rgba(255,80,0,0.12)_30%,transparent_58%)] animate-pulse" />
      <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,rgba(255,180,50,0.35),transparent_22%)] blur-xl animate-ping" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[18%] z-20 h-44 bg-[radial-gradient(circle_at_center,rgba(255,90,0,0.28),rgba(255,40,0,0.18)_28%,rgba(90,90,90,0.22)_45%,transparent_72%)] blur-2xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[16%] z-20 h-40 bg-[radial-gradient(circle_at_center,rgba(80,80,80,0.35),rgba(50,50,50,0.22)_40%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 z-20 opacity-95">
        <div className="absolute left-[50%] top-[32%] text-6xl animate-ping">💥</div>
        <div className="absolute left-[38%] top-[29%] text-4xl">🔥</div>
        <div className="absolute left-[58%] top-[28%] text-4xl">🔥</div>
        <div className="absolute left-[34%] top-[40%] text-3xl">⚡</div>
        <div className="absolute left-[63%] top-[38%] text-3xl">⚡</div>
      </div>
    </>
  );
}

function RatTransition({
  fromLevel,
  toLevel,
  active,
  variant,
  language,
}: {
  fromLevel: number;
  toLevel: number;
  active: boolean;
  variant: 'male' | 'female' | 'non-binary';
  language: string;
}) {
  const fromRat = getRatImageForLevel(fromLevel, variant);
  const toRat = getRatImageForLevel(toLevel, variant);

  if (!fromRat && !toRat) return null;

  return (
    <div className="relative mx-auto mt-5 h-[250px] w-full max-w-[280px]">
      {fromRat ? (
        <img
          src={fromRat}
          alt="Previous form"
          className={`absolute inset-0 h-full w-full object-contain transition-all duration-700 ${
            active ? 'scale-[0.88] opacity-0 blur-md' : 'scale-100 opacity-100'
          }`}
          draggable={false}
        />
      ) : null}

      {toRat ? (
        <img
          src={toRat}
          alt="New form"
          className={`absolute inset-0 h-full w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.55)] transition-all duration-700 ${
            active ? 'scale-100 opacity-100' : 'scale-[1.12] opacity-0 blur-sm'
          }`}
          draggable={false}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto w-[72%] rounded-full bg-[radial-gradient(circle_at_center,rgba(124,255,107,0.28),transparent_70%)] py-8 blur-2xl" />

      {active ? (
        <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-lime-300">
          {t('workoutComplete.newForm', language)}
        </div>
      ) : null}
    </div>
  );
}

export default function WorkoutComplete({
  summary,
  onContinue,
  onOpenPaywall,
}: WorkoutCompleteProps) {
  const language = useAppLanguage();

  const currentTotalXP = useMemo(() => {
    if (typeof window === 'undefined') return summary.earnedXP;

    try {
      const raw = localStorage.getItem('gymrat-gamification');
      if (!raw) return summary.earnedXP;
      const parsed = JSON.parse(raw) as { totalXP?: number };
      return typeof parsed.totalXP === 'number' ? parsed.totalXP : summary.earnedXP;
    } catch {
      return summary.earnedXP;
    }
  }, [summary.earnedXP]);

  const previousTotalXP = Math.max(0, currentTotalXP - summary.earnedXP);
  const startLevel = getLevelFromXP(previousTotalXP);
  const finalLevel = getLevelFromXP(currentTotalXP);
  const levelsGained = Math.max(0, finalLevel - startLevel);

  const profile = getProfile();
  const variant =
    profile?.gender === 'female'
      ? 'female'
      : profile?.gender === 'non-binary'
        ? 'non-binary'
        : 'male';

  const [displayXP, setDisplayXP] = useState(previousTotalXP);
  const [displayLevel, setDisplayLevel] = useState(startLevel);
  const [levelFlash, setLevelFlash] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [showLevelUpText, setShowLevelUpText] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const [ratTransitionActive, setRatTransitionActive] = useState(false);

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
    setRatTransitionActive(false);
    previousLevelRef.current = startLevel;

    const duration = 2400;

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
        setRatTransitionActive(true);
        vibrate([120, 40, 160, 40, 220]);

        window.setTimeout(() => setLevelFlash(false), 500);
        window.setTimeout(() => setShowExplosion(false), 1150);
        window.setTimeout(() => setRatTransitionActive(false), 1100);
      } else {
        setDisplayLevel(nextLevel);
      }

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setDisplayXP(currentTotalXP);
        setDisplayLevel(finalLevel);
        setAnimationDone(true);
        vibrate(70);
      }
    };

    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [currentTotalXP, finalLevel, previousTotalXP, startLevel]);

  const currentLevelXP = getCurrentLevelXP(displayXP);
  const nextLevelXP = Math.max(1, getNextLevelXP(displayXP));
  const progressPercent = clamp((currentLevelXP / nextLevelXP) * 100, 0, 100);
  const coinsEarned = Math.max(10, Math.floor(summary.earnedXP / 5));

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_32%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(132,255,88,0.08),transparent_22%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.04),rgba(0,0,0,0.45)_45%,rgba(0,0,0,0.88))]" />

      <ExplosionFx active={showExplosion} />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-6 pt-6">
        <div className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
          {t('workoutComplete.complete', language)}
        </div>

        {showLevelUpText && levelsGained > 0 ? (
          <div className="mb-2 inline-flex self-start rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-lime-300">
            {t('workoutComplete.levelUp', language)}
          </div>
        ) : null}

        <h1 className="text-4xl font-black uppercase leading-none tracking-[0.02em] text-white">
          {t('workoutComplete.titleA', language)}
          <br />
          {t('workoutComplete.titleB', language)}
        </h1>

        <p className="mt-3 max-w-[32ch] text-sm text-white/55">
          {summary.workoutName}. {t('workoutComplete.doneText', language)}
        </p>

        <RatTransition
          fromLevel={startLevel}
          toLevel={finalLevel}
          active={ratTransitionActive || levelsGained > 0}
          variant={variant}
          language={language}
        />

        <div
          className={[
            'relative mt-4 rounded-[32px] border p-5 transition-all duration-200',
            levelFlash
              ? 'border-lime-300/35 bg-[linear-gradient(180deg,rgba(132,255,88,0.14),rgba(255,255,255,0.05))] shadow-[0_0_50px_rgba(132,255,88,0.12)]'
              : 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]',
          ].join(' ')}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                {t('workoutComplete.xpEarned', language)}
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
                  {t('workoutComplete.level', language)}
                </div>
                <div className="mt-1 text-2xl font-black text-white">
                  {displayLevel}
                </div>
              </div>
            </div>
          </div>

          {levelsGained > 0 ? (
            <div className="mb-4 rounded-[20px] border border-lime-400/20 bg-lime-400/8 px-4 py-3 text-sm font-semibold text-lime-200">
              {t('workoutComplete.levelFromTo', language, {
                from: startLevel,
                to: finalLevel,
              })}
            </div>
          ) : (
            <div className="mb-4 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
              {t('workoutComplete.levelProgressUpdated', language, {
                level: displayLevel,
              })}
            </div>
          )}

          <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
            <span>{t('workoutComplete.xpProgress', language)}</span>
            <span>
              {currentLevelXP} / {nextLevelXP}
            </span>
          </div>

          <div className="h-4 overflow-hidden rounded-full bg-white/10">
            <div
              className={[
                'h-full rounded-full transition-all duration-150',
                levelFlash
                  ? 'bg-[linear-gradient(90deg,#ffd37a_0%,#ff7b39_30%,#ff3d2e_55%,#ffffff_100%)]'
                  : 'bg-[linear-gradient(90deg,#d4af37_0%,#ffe58f_30%,#7cff6b_100%)]',
              ].join(' ')}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-2 text-right text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
            {t('workoutComplete.totalXp', language)} {displayXP}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatTile
            icon={<Dumbbell className="h-4 w-4" />}
            label={t('workoutComplete.exercises', language)}
            value={summary.exercisesCompleted}
          />
          <StatTile
            icon={<Flame className="h-4 w-4" />}
            label={t('workoutComplete.duration', language)}
            value={formatMinutes(summary.durationMinutes, language)}
          />
          <StatTile
            icon={<Trophy className="h-4 w-4" />}
            label={t('workoutComplete.volume', language)}
            value={summary.volume}
          />
          <StatTile
            icon={<Zap className="h-4 w-4" />}
            label={t('workoutComplete.coins', language)}
            value={`+${coinsEarned}`}
            accentClass="text-amber-300"
          />
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-5 flex h-16 w-full items-center justify-center gap-2 rounded-[24px] border border-white/10 bg-white/6 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-white/20 hover:bg-white/10 active:scale-[0.99]"
        >
          {t('workoutComplete.backHome', language)}
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
              {t('workoutComplete.premiumBoost', language)}
            </div>
          </div>

          <div className="text-[13px] font-black uppercase tracking-[0.12em] text-white">
            {t('workoutComplete.makeItHit', language)}
          </div>
          <p className="mt-1 text-sm text-white/55">
            {t('workoutComplete.makeItHitSub', language)}
          </p>
        </button>

        {!animationDone ? (
          <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
            <Sparkles className="h-3.5 w-3.5" />
            {t('workoutComplete.animating', language)}
          </div>
        ) : null}
      </div>
    </div>
  );
}