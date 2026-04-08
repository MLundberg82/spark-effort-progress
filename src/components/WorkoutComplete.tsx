import { Flame, Sparkles, Trophy } from 'lucide-react';
import { useMemo } from 'react';

type WorkoutCompleteSummary = {
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  volume: number;
  earnedXP: number;
  prs?: Array<{
    exercise: string;
    newWeight: number;
    previousBest: number;
  }>;
  progression?: {
    previousLevel: number;
    newLevel: number;
    streak: number;
    leveledUp: boolean;
    milestoneUnlocked: boolean;
    unlockedMilestoneLevel: number | null;
    breakdown: {
      baseXP: number;
      activityXP: number;
      volumeXP: number;
      durationXP: number;
      firstWorkoutXP: number;
      consistencyXP: number;
      prXP: number;
      premiumBoostXP: number;
      totalXP: number;
    };
  };
};

type WorkoutCompleteProps = {
  summary: WorkoutCompleteSummary;
  onContinue: () => void;
  onOpenPaywall?: () => void;
};

type RatForm = {
  label: string;
  subtitle: string;
};

function StatTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 text-[22px] font-black text-white">{value}</div>
    </div>
  );
}

function XPRow({ label, value }: { label: string; value: number }) {
  if (value <= 0) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-[14px] border border-white/8 bg-black/40 px-3 py-2">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/60">
        {label}
      </div>
      <div className="text-sm font-black text-lime-200">+{value} XP</div>
    </div>
  );
}

function getRatForm(level: number): RatForm {
  if (level >= 100) return { label: 'Final Apex', subtitle: 'Peak mythic form' };
  if (level >= 90) return { label: 'Mythic IX', subtitle: 'Last ascent' };
  if (level >= 80) return { label: 'Legend', subtitle: 'Dominant aura' };
  if (level >= 70) return { label: 'King', subtitle: 'Crowned force' };
  if (level >= 60) return { label: 'Elite', subtitle: 'Refined power' };
  if (level >= 50) return { label: 'Titan', subtitle: 'Heavy status' };
  if (level >= 40) return { label: 'Alpha+', subtitle: 'Hard evolved' };
  if (level >= 30) return { label: 'Alpha', subtitle: 'Leader energy' };
  if (level >= 25) return { label: 'Grind IV', subtitle: 'Built by consistency' };
  if (level >= 20) return { label: 'Grind III', subtitle: 'Visible momentum' };
  if (level >= 15) return { label: 'Grind II', subtitle: 'Sharper frame' };
  if (level >= 10) return { label: 'Grind I', subtitle: 'Real progression' };
  if (level >= 5) return { label: 'Street Rat', subtitle: 'First evolution' };
  return { label: 'Underground', subtitle: 'Starting form' };
}

function CelebrationStyles() {
  return (
    <style>{`
      @keyframes wc-flash {
        0% { opacity: 0; transform: scale(0.55); }
        12% { opacity: 0.95; }
        100% { opacity: 0; transform: scale(1.9); }
      }
      @keyframes wc-shockwave {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.25); }
        15% { opacity: 0.75; }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1.75); }
      }
      @keyframes wc-smoke {
        0% { opacity: 0; transform: translateY(18px) scale(0.72); }
        18% { opacity: 0.3; }
        100% { opacity: 0; transform: translateY(-58px) scale(1.2); }
      }
      @keyframes wc-ember {
        0% { opacity: 0; transform: translate3d(0, 16px, 0) scale(0.55); }
        15% { opacity: 0.95; }
        100% { opacity: 0; transform: translate3d(var(--x), var(--y), 0) scale(1); }
      }
      @keyframes wc-panel-rise {
        0% { opacity: 0; transform: translateY(18px) scale(0.96); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes wc-metal-sweep {
        0% { opacity: 0; transform: translateX(-140%) skewX(-18deg); }
        20% { opacity: 0.65; }
        100% { opacity: 0; transform: translateX(190%) skewX(-18deg); }
      }
      @keyframes wc-soft-pulse {
        0%, 100% { transform: scale(1); opacity: 0.55; }
        50% { transform: scale(1.06); opacity: 0.9; }
      }
      @keyframes wc-morph-out {
        0%, 22% { opacity: 0.95; transform: translate(-50%, -50%) scale(1) rotate(0deg); filter: blur(0px); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1.3) rotate(-6deg); filter: blur(10px); }
      }
      @keyframes wc-morph-in {
        0%, 26% { opacity: 0; transform: translate(-50%, -50%) scale(0.75) rotate(6deg); filter: blur(10px); }
        100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0deg); filter: blur(0px); }
      }
      @keyframes wc-float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
      }
      @keyframes wc-screen-shake {
        0%, 100% { transform: translate3d(0,0,0); }
        10% { transform: translate3d(-2px, 1px, 0); }
        20% { transform: translate3d(2px, -1px, 0); }
        30% { transform: translate3d(-1px, 2px, 0); }
        40% { transform: translate3d(1px, -2px, 0); }
        50% { transform: translate3d(-1px, 1px, 0); }
      }
    `}</style>
  );
}

function RatMorphShowcase({ previousLevel, newLevel }: { previousLevel: number; newLevel: number }) {
  const oldForm = getRatForm(previousLevel);
  const newForm = getRatForm(newLevel);

  return (
    <div className="relative mt-4 overflow-hidden rounded-[24px] border border-yellow-200/15 bg-black/35 px-4 py-5">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-100/72">
        Morphing sequence
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3 text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">Previous form</div>
          <div className="mt-2 text-base font-black text-white">{oldForm.label}</div>
          <div className="mt-1 text-xs text-white/55">{oldForm.subtitle}</div>
        </div>
        <div className="text-xs font-black uppercase tracking-[0.18em] text-yellow-200">Morph</div>
        <div className="rounded-[18px] border border-yellow-200/20 bg-yellow-300/[0.06] px-3 py-3 text-center shadow-[0_0_22px_rgba(250,204,21,0.08)]">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-yellow-100/65">Unlocked form</div>
          <div className="mt-2 text-base font-black text-white">{newForm.label}</div>
          <div className="mt-1 text-xs text-yellow-50/70">{newForm.subtitle}</div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-[58%] h-28 w-24 rounded-[40%] border border-white/15 bg-white/10"
          style={{
            animation: 'wc-morph-out 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            clipPath: 'polygon(35% 0%, 68% 7%, 78% 24%, 84% 42%, 79% 74%, 64% 100%, 34% 100%, 18% 75%, 14% 45%, 21% 24%)',
          }}
        />
        <div
          className="absolute left-1/2 top-[58%] h-32 w-28 rounded-[40%] border border-yellow-100/28 bg-yellow-100/12 shadow-[0_0_24px_rgba(250,204,21,0.18)]"
          style={{
            animation: 'wc-morph-in 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            clipPath: 'polygon(31% 0%, 72% 8%, 84% 22%, 89% 44%, 85% 78%, 67% 100%, 35% 100%, 15% 80%, 12% 44%, 18% 20%)',
          }}
        />
      </div>
    </div>
  );
}

function CelebrationFX({
  hasPRs,
  leveledUp,
  milestoneUnlocked,
}: {
  hasPRs: boolean;
  leveledUp: boolean;
  milestoneUnlocked: boolean;
}) {
  const embers = useMemo(
    () =>
      Array.from({ length: milestoneUnlocked ? 22 : leveledUp ? 16 : 8 }, (_, index) => ({
        id: index,
        left: 50 + Math.cos((index / 12) * Math.PI * 2) * (milestoneUnlocked ? 18 : 14),
        top: 34 + (index % 4) * 4,
        size: milestoneUnlocked ? 7 + (index % 5) * 2 : 6 + (index % 4) * 2,
        delay: index * 0.05,
        duration: 1.05 + (index % 4) * 0.18,
        x: `${Math.round((Math.cos(index) * 90) + ((index % 3) - 1) * 32)}px`,
        y: `${-90 - ((index % 5) * 24)}px`,
      })),
    [leveledUp, milestoneUnlocked],
  );

  const smoke = useMemo(
    () =>
      Array.from({ length: milestoneUnlocked ? 10 : leveledUp ? 7 : hasPRs ? 4 : 0 }, (_, index) => ({
        id: index,
        left: 50 + (index - 3) * 8,
        top: milestoneUnlocked ? 42 : 38,
        size: milestoneUnlocked ? 70 + index * 7 : 54 + index * 6,
        delay: 0.12 + index * 0.08,
        duration: 1.8 + index * 0.12,
      })),
    [hasPRs, leveledUp, milestoneUnlocked],
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[360px] overflow-hidden">
      {(leveledUp || milestoneUnlocked) ? (
        <>
          <div
            className="absolute left-1/2 top-[110px] h-24 w-24 -translate-x-1/2 rounded-full bg-orange-300/70 blur-[10px]"
            style={{ animation: 'wc-flash 0.9s ease-out forwards' }}
          />
          <div
            className="absolute left-1/2 top-[110px] h-44 w-44 rounded-full border border-orange-200/45"
            style={{ animation: 'wc-shockwave 1.2s ease-out forwards' }}
          />
          <div
            className="absolute left-1/2 top-[110px] h-60 w-60 rounded-full border border-yellow-200/18"
            style={{ animation: 'wc-shockwave 1.45s ease-out 0.12s forwards', opacity: 0 }}
          />
        </>
      ) : null}

      {hasPRs ? (
        <>
          <div className="absolute inset-x-10 top-10 h-24 rounded-[30px] border border-white/8 bg-white/[0.025] backdrop-blur-[2px]" />
          <div
            className="absolute left-0 right-0 top-12 h-28 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{ animation: 'wc-metal-sweep 1.4s ease-out forwards' }}
          />
          <div
            className="absolute right-10 top-12 h-14 w-14 rounded-full border border-yellow-200/18 bg-yellow-200/10 shadow-[0_0_30px_rgba(250,204,21,0.08)]"
            style={{ animation: 'wc-soft-pulse 1.5s ease-in-out infinite' }}
          />
        </>
      ) : null}

      {smoke.map((puff) => (
        <div
          key={`smoke-${puff.id}`}
          className="absolute rounded-full bg-white/10 blur-[18px]"
          style={{
            left: `${puff.left}%`,
            top: `${puff.top}%`,
            width: puff.size,
            height: puff.size * 0.72,
            animation: `wc-smoke ${puff.duration}s ease-out ${puff.delay}s forwards`,
            opacity: 0,
          }}
        />
      ))}

      {embers.map((ember) => (
        <span
          key={`ember-${ember.id}`}
          className="absolute rounded-full bg-gradient-to-b from-yellow-100 via-orange-300 to-red-500 shadow-[0_0_18px_rgba(251,146,60,0.35)]"
          style={{
            left: `${ember.left}%`,
            top: `${ember.top}%`,
            width: ember.size,
            height: ember.size,
            opacity: 0,
            ['--x' as string]: ember.x,
            ['--y' as string]: ember.y,
            animation: `wc-ember ${ember.duration}s cubic-bezier(0.18, 0.75, 0.3, 1) ${ember.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

export default function WorkoutComplete({
  summary,
  onContinue,
}: WorkoutCompleteProps) {
  const hasPRs = Boolean(summary.prs && summary.prs.length > 0);
  const progression = summary.progression;
  const leveledUp = Boolean(progression?.leveledUp);
  const milestoneUnlocked = Boolean(progression?.milestoneUnlocked);

  return (
    <div className="min-h-screen bg-black px-5 py-5 text-white">
      <CelebrationStyles />
      <div
        className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-md flex-col"
        style={{ animation: milestoneUnlocked || leveledUp ? 'wc-screen-shake 0.48s linear 1' : undefined }}
      >
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/90 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.48)]">
          <CelebrationFX hasPRs={hasPRs} leveledUp={leveledUp} milestoneUnlocked={milestoneUnlocked} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-lime-200">
              <Flame className="h-3.5 w-3.5" />
              Workout complete
            </div>

            {milestoneUnlocked ? (
              <div
                className="relative mt-4 overflow-hidden rounded-[22px] border border-yellow-300/25 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.26),_rgba(251,146,60,0.12)_22%,_rgba(132,204,22,0.08)_48%,_rgba(0,0,0,0.28)_100%)] px-4 py-4 shadow-[0_0_35px_rgba(250,204,21,0.08)]"
                style={{ animation: 'wc-panel-rise 0.65s cubic-bezier(0.2, 0.8, 0.2, 1) both' }}
              >
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-100/80">
                  Mega BOOM
                </div>
                <h2 className="mt-2 text-[28px] font-black tracking-tight text-white">
                  New rat unlocked
                </h2>
                <p className="mt-2 text-sm leading-6 text-yellow-50/88">
                  Level {progression?.unlockedMilestoneLevel} reached. Full explosion, smoke burst and rat morph into the next form.
                </p>
                {progression ? (
                  <RatMorphShowcase previousLevel={progression.previousLevel} newLevel={progression.newLevel} />
                ) : null}
              </div>
            ) : leveledUp ? (
              <div
                className="relative mt-4 overflow-hidden rounded-[22px] border border-orange-300/20 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.28),_rgba(132,204,22,0.08)_48%,_rgba(0,0,0,0.25)_100%)] px-4 py-4 shadow-[0_0_28px_rgba(251,146,60,0.08)]"
                style={{ animation: 'wc-panel-rise 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both' }}
              >
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-100/78">
                  Boom
                </div>
                <h2 className="mt-2 text-[24px] font-black tracking-tight text-white">
                  Level up
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-100/88">
                  Level {progression?.previousLevel} → {progression?.newLevel}. Explosion first, then smoke and glow as the rat powers up.
                </p>
              </div>
            ) : null}

            {hasPRs ? (
              <div
                className="relative mt-4 overflow-hidden rounded-[20px] border border-red-300/18 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.16),_rgba(251,191,36,0.08)_45%,_rgba(0,0,0,0.2)_100%)] px-4 py-4"
                style={{ animation: 'wc-panel-rise 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) both' }}
              >
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-[-40%] w-[38%] bg-gradient-to-r from-transparent via-white/28 to-transparent"
                    style={{ animation: 'wc-metal-sweep 1.35s ease-out 0.18s forwards' }}
                  />
                </div>
                <div className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em] text-red-100/75">
                  Bigger BOOM
                </div>
                <h3 className="relative z-10 mt-2 text-[20px] font-black tracking-tight text-white">
                  New PB {summary.prs?.length && summary.prs.length > 1 ? 's' : ''}
                </h3>
                <p className="relative z-10 mt-2 text-sm leading-6 text-zinc-200">
                  Cleaner than a level up, but still a strong progress hit with metallic sweep and impact glow.
                </p>
                <div className="relative z-10 mt-3 space-y-2">
                  {summary.prs?.slice(0, 3).map((pr) => (
                    <div
                      key={`${pr.exercise}-${pr.newWeight}`}
                      className="rounded-[14px] border border-white/8 bg-black/35 px-3 py-2"
                    >
                      <div className="text-sm font-black text-white">{pr.exercise}</div>
                      <div className="mt-1 text-xs font-semibold text-zinc-300">
                        {pr.previousBest > 0 ? `${pr.previousBest} → ` : ''}
                        {pr.newWeight} kg
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <h1 className="mt-4 text-[30px] font-black tracking-tight text-white">
              Nice. You moved the rat forward.
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-300">
              {summary.workoutName} is done. Clean finish, stable save, and progress counted.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <StatTile label="Duration" value={`${summary.durationMinutes} min`} />
              <StatTile label="Exercises" value={String(summary.exercisesCompleted)} />
              <StatTile
                label="XP earned"
                value={`+${summary.earnedXP}`}
                icon={<Sparkles className="h-3.5 w-3.5" />}
              />
              <StatTile
                label="Volume"
                value={String(Math.round(summary.volume))}
                icon={<Trophy className="h-3.5 w-3.5" />}
              />
            </div>

            {progression ? (
              <>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <StatTile label="Level" value={`${progression.previousLevel} → ${progression.newLevel}`} />
                  <StatTile label="Streak" value={`${progression.streak} d`} />
                </div>

                <div className="mt-5 space-y-2">
                  <XPRow label="Base" value={progression.breakdown.baseXP} />
                  <XPRow label="Exercise bonus" value={progression.breakdown.activityXP} />
                  <XPRow label="Volume bonus" value={progression.breakdown.volumeXP} />
                  <XPRow label="Duration bonus" value={progression.breakdown.durationXP} />
                  <XPRow label="First workout" value={progression.breakdown.firstWorkoutXP} />
                  <XPRow label="Streak bonus" value={progression.breakdown.consistencyXP} />
                  <XPRow label="PB bonus" value={progression.breakdown.prXP} />
                  <XPRow label="Premium boost" value={progression.breakdown.premiumBoostXP} />
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex min-h-[68px] w-full items-center justify-center rounded-[20px] bg-lime-300 px-5 py-4 text-[14px] font-black uppercase tracking-[0.16em] text-black shadow-[0_20px_50px_rgba(163,230,53,0.16)] transition hover:brightness-105"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
