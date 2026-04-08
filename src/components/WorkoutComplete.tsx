import { Flame, Sparkles, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

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
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-white/12 bg-white/[0.035] px-4 py-3 backdrop-blur-sm">
      <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function XPRow({ label, value }: { label: string; value: number }) {
  if (value <= 0) return null;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-sm">
      <span className="text-white/70">{label}</span>
      <span className="font-semibold text-lime-300">+{value} XP</span>
    </div>
  );
}

function getRatForm(level: number): RatForm {
  if (level >= 100) return { label: 'Ascendant Rat', subtitle: 'Expansion-ready apex state' };
  if (level >= 90) return { label: 'Immortal Rat', subtitle: 'Untouchable pressure' };
  if (level >= 80) return { label: 'Legendary Rat', subtitle: 'Rare dominant aura' };
  if (level >= 70) return { label: 'Ascended Rat', subtitle: 'Transcendent momentum' };
  if (level >= 60) return { label: 'Overlord Rat', subtitle: 'Crushing presence' };
  if (level >= 50) return { label: 'Titan Rat', subtitle: 'Heavy elite mass' };
  if (level >= 40) return { label: 'Warlord Rat', subtitle: 'Battle-built power' };
  if (level >= 30) return { label: 'Mythic Rat', subtitle: 'Rare evolved force' };
  if (level >= 25) return { label: 'Apex Rat', subtitle: 'Predator energy' };
  if (level >= 20) return { label: 'King Rat', subtitle: 'Crowned confidence' };
  if (level >= 15) return { label: 'Elite Rat', subtitle: 'Visible strength jump' };
  if (level >= 10) return { label: 'Alpha Rat', subtitle: 'Real progression unlocked' };
  if (level >= 5) return { label: 'Grind Rat', subtitle: 'First evolution hit' };
  return { label: 'Underground Rat', subtitle: 'Starting form' };
}

function CelebrationStyles() {
  return (
    <style>{`
      @keyframes wc-screenFlash {
        0% { opacity: 0; }
        14% { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes wc-shockwave {
        0% { transform: translate(-50%, -50%) scale(0.24); opacity: 0; }
        16% { opacity: .9; }
        100% { transform: translate(-50%, -50%) scale(2.4); opacity: 0; }
      }
      @keyframes wc-coreBlast {
        0% { transform: translate(-50%, -50%) scale(.2); opacity: 0; filter: blur(24px); }
        18% { opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1.85); opacity: 0; filter: blur(6px); }
      }
      @keyframes wc-smokeRise {
        0% { transform: translate(-50%, 8px) scale(.7); opacity: 0; }
        18% { opacity: .55; }
        100% { transform: translate(-50%, -84px) scale(1.28); opacity: 0; }
      }
      @keyframes wc-emberFlight {
        0% { transform: translate3d(0,0,0) scale(.5); opacity: 0; }
        12% { opacity: 1; }
        100% { transform: translate3d(var(--x), var(--y), 0) scale(1.1); opacity: 0; }
      }
      @keyframes wc-metalSweep {
        0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
        18% { opacity: .85; }
        100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
      }
      @keyframes wc-cardRise {
        0% { opacity: 0; transform: translateY(28px) scale(.98); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes wc-floatGlow {
        0%, 100% { transform: translateY(0); opacity: .52; }
        50% { transform: translateY(-8px); opacity: .9; }
      }
      @keyframes wc-morphOld {
        0% { opacity: 1; transform: scale(1) rotate(0deg); filter: blur(0); }
        100% { opacity: 0; transform: scale(1.12) rotate(-4deg); filter: blur(14px); }
      }
      @keyframes wc-morphNew {
        0% { opacity: 0; transform: scale(.78) rotate(4deg); filter: blur(14px); }
        100% { opacity: 1; transform: scale(1) rotate(0deg); filter: blur(0); }
      }
    `}</style>
  );
}

function RatMorphShowcase({ previousLevel, newLevel }: { previousLevel: number; newLevel: number }) {
  const oldForm = getRatForm(previousLevel);
  const newForm = getRatForm(newLevel);

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/14 bg-black/35 px-4 py-5">
      <div className="mb-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
        <span>Morphing sequence</span>
        <span className="text-lime-300">New form unlocked</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="rounded-[22px] border border-white/10 bg-white/[0.035] px-3 py-4 text-center">
          <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-white/40">Previous form</div>
          <div
            className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-3xl"
            style={{ animation: 'wc-morphOld 0.8s ease forwards' }}
          >
            🐀
          </div>
          <div className="text-sm font-semibold text-white">{oldForm.label}</div>
          <div className="mt-1 text-xs text-white/55">{oldForm.subtitle}</div>
        </div>

        <div className="text-center">
          <div className="mb-1 text-[10px] uppercase tracking-[0.28em] text-amber-200/70">Morph</div>
          <div className="mx-auto h-px w-8 bg-gradient-to-r from-transparent via-amber-200/80 to-transparent" />
        </div>

        <div className="rounded-[22px] border border-lime-300/20 bg-lime-300/[0.06] px-3 py-4 text-center shadow-[0_0_40px_rgba(190,242,100,0.08)]">
          <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-lime-200/80">Unlocked form</div>
          <div
            className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border border-lime-300/20 bg-lime-300/[0.08] text-3xl"
            style={{ animation: 'wc-morphNew 0.9s ease 0.22s both, wc-floatGlow 2.4s ease-in-out 1.2s infinite' }}
          >
            👑
          </div>
          <div className="text-sm font-semibold text-white">{newForm.label}</div>
          <div className="mt-1 text-xs text-white/60">{newForm.subtitle}</div>
        </div>
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
        x: `${Math.round(Math.cos(index) * 90 + ((index % 3) - 1) * 32)}px`,
        y: `${-90 - (index % 5) * 24}px`,
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
    <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[330px] overflow-hidden rounded-[34px]">
      {(leveledUp || milestoneUnlocked) ? (
        <>
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,237,160,0.35),rgba(255,140,0,0.12)_24%,rgba(0,0,0,0)_58%)]"
            style={{ animation: 'wc-screenFlash 0.72s ease-out both' }}
          />
          <div
            className="absolute left-1/2 top-[120px] h-36 w-36 rounded-full border border-amber-200/70"
            style={{ animation: 'wc-shockwave 1s ease-out 0.04s both' }}
          />
          <div
            className="absolute left-1/2 top-[120px] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(255,235,170,0.95)_0%,rgba(255,149,0,0.6)_18%,rgba(255,79,0,0.12)_54%,transparent_75%)] mix-blend-screen"
            style={{ animation: 'wc-coreBlast 0.95s ease-out both' }}
          />
        </>
      ) : null}

      {hasPRs ? (
        <>
          <div className="absolute inset-x-6 top-10 h-28 overflow-hidden rounded-[28px] border border-amber-100/10 bg-gradient-to-r from-white/[0.04] to-white/[0.01]">
            <div
              className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-amber-100/55 to-transparent blur-md"
              style={{ animation: 'wc-metalSweep 1.15s ease-out 0.2s both' }}
            />
          </div>
          <div className="absolute inset-x-8 top-[76px] h-px bg-gradient-to-r from-transparent via-amber-100/80 to-transparent opacity-75" />
        </>
      ) : null}

      {smoke.map((puff) => (
        <div
          key={puff.id}
          className="absolute rounded-full bg-white/16 blur-2xl"
          style={{
            left: `${puff.left}%`,
            top: `${puff.top}%`,
            width: `${puff.size}px`,
            height: `${puff.size}px`,
            animation: `wc-smokeRise ${puff.duration}s ease-out ${puff.delay}s both`,
          }}
        />
      ))}

      {embers.map((ember) => (
        <span
          key={ember.id}
          className="absolute rounded-full bg-gradient-to-b from-yellow-200 via-amber-300 to-orange-500 shadow-[0_0_18px_rgba(251,191,36,0.45)]"
          style={{
            left: `${ember.left}%`,
            top: `${ember.top}%`,
            width: `${ember.size}px`,
            height: `${ember.size}px`,
            ['--x' as string]: ember.x,
            ['--y' as string]: ember.y,
            animation: `wc-emberFlight ${ember.duration}s cubic-bezier(.14,.72,.22,.98) ${ember.delay}s both`,
          }}
        />
      ))}
    </div>
  );
}

export default function WorkoutComplete({ summary, onContinue }: WorkoutCompleteProps) {
  const hasPRs = Boolean(summary.prs && summary.prs.length > 0);
  const progression = summary.progression;
  const leveledUp = Boolean(progression?.leveledUp);
  const milestoneUnlocked = Boolean(progression?.milestoneUnlocked);
  const [showContent, setShowContent] = useState(!(leveledUp || milestoneUnlocked || hasPRs));

  useEffect(() => {
    setShowContent(!(leveledUp || milestoneUnlocked || hasPRs));

    if (!(leveledUp || milestoneUnlocked || hasPRs)) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setShowContent(true), milestoneUnlocked ? 920 : leveledUp ? 760 : 420);
    return () => window.clearTimeout(timeout);
  }, [hasPRs, leveledUp, milestoneUnlocked]);

  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#03040a] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.42)]">
      <CelebrationStyles />
      <CelebrationFX hasPRs={hasPRs} leveledUp={leveledUp} milestoneUnlocked={milestoneUnlocked} />

      <div className="relative z-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-300/22 bg-lime-300/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-lime-200">
          <Flame className="h-3.5 w-3.5" />
          Workout complete
        </div>

        <div
          className={showContent ? 'opacity-100' : 'opacity-0'}
          style={{ animation: showContent ? 'wc-cardRise 0.42s ease-out both' : undefined }}
        >
          {milestoneUnlocked ? (
            <div className="mb-4 overflow-hidden rounded-[30px] border border-amber-200/16 bg-[radial-gradient(circle_at_top,rgba(255,178,36,0.18),rgba(120,58,0,0.12)_34%,rgba(0,0,0,0.16)_74%)] p-4 shadow-[0_0_50px_rgba(255,166,0,0.08)]">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-200/80">Mega BOOM</div>
              <h2 className="text-3xl font-black tracking-tight text-white">New rat unlocked</h2>
              <p className="mt-2 max-w-[32rem] text-sm leading-6 text-white/72">
                Level {progression?.unlockedMilestoneLevel} reached. Big explosion first, then smoke, glow and morph into the next form.
              </p>
              {progression ? (
                <div className="mt-4">
                  <RatMorphShowcase previousLevel={progression.previousLevel} newLevel={progression.newLevel} />
                </div>
              ) : null}
            </div>
          ) : leveledUp ? (
            <div className="mb-4 overflow-hidden rounded-[30px] border border-amber-200/16 bg-[radial-gradient(circle_at_top,rgba(255,178,36,0.16),rgba(76,37,0,0.12)_34%,rgba(0,0,0,0.16)_74%)] p-4 shadow-[0_0_42px_rgba(255,166,0,0.06)]">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-100/80">BOOM</div>
              <h2 className="text-3xl font-black tracking-tight text-white">Level up</h2>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Level {progression?.previousLevel} → {progression?.newLevel}. Blast first, then smoke and glow as the rat powers up.
              </p>
            </div>
          ) : null}

          {hasPRs ? (
            <div className="mb-4 overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(135deg,rgba(116,21,0,0.38),rgba(28,12,0,0.16)_45%,rgba(0,0,0,0.22))] p-4 shadow-[0_0_34px_rgba(245,158,11,0.05)]">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-white/55">Bigger BOOM</div>
              <h3 className="text-2xl font-black tracking-tight text-white">New PB{summary.prs?.length && summary.prs.length > 1 ? 's' : ''}</h3>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Cleaner than a level up, but still a strong progress hit with metallic sweep and impact glow.
              </p>

              <div className="mt-4 grid gap-3">
                {summary.prs?.slice(0, 3).map((pr) => (
                  <div key={`${pr.exercise}-${pr.newWeight}`} className="rounded-[20px] border border-white/14 bg-black/28 px-4 py-3">
                    <div className="font-semibold text-white">{pr.exercise}</div>
                    <div className="mt-1 text-sm text-white/65">
                      {pr.previousBest > 0 ? `${pr.previousBest} → ` : ''}
                      {pr.newWeight} kg
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4">
            <h1 className="text-4xl font-black tracking-tight text-white">Nice. You moved the rat forward.</h1>
            <p className="mt-3 max-w-[36rem] text-base leading-7 text-white/70">
              {summary.workoutName} is done. Clean finish, stable save, and progress counted.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatTile label="Workout" value={summary.workoutName} icon={<Sparkles className="h-4 w-4 text-lime-300" />} />
            <StatTile label="XP gained" value={`${summary.earnedXP} XP`} icon={<Flame className="h-4 w-4 text-amber-300" />} />
            <StatTile label="Duration" value={`${summary.durationMinutes} min`} icon={<Sparkles className="h-4 w-4 text-white/65" />} />
            <StatTile label="Exercises" value={`${summary.exercisesCompleted}`} icon={<Trophy className="h-4 w-4 text-white/65" />} />
          </div>

          {progression ? (
            <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">XP breakdown</div>
                  <div className="mt-1 text-base font-semibold text-white">Level {progression.newLevel} · Streak {progression.streak}</div>
                </div>
                <div className="rounded-full border border-lime-300/20 bg-lime-300/[0.07] px-3 py-1 text-xs font-semibold text-lime-200">
                  +{progression.breakdown.totalXP} XP
                </div>
              </div>

              <div className="grid gap-2">
                <XPRow label="Base" value={progression.breakdown.baseXP} />
                <XPRow label="Activity" value={progression.breakdown.activityXP} />
                <XPRow label="Volume" value={progression.breakdown.volumeXP} />
                <XPRow label="Duration" value={progression.breakdown.durationXP} />
                <XPRow label="First workout" value={progression.breakdown.firstWorkoutXP} />
                <XPRow label="Streak" value={progression.breakdown.consistencyXP} />
                <XPRow label="PB bonus" value={progression.breakdown.prXP} />
                <XPRow label="Premium boost" value={progression.breakdown.premiumBoostXP} />
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={onContinue}
            className="mt-5 inline-flex w-full items-center justify-center rounded-[22px] border border-lime-300/18 bg-[linear-gradient(180deg,rgba(190,242,100,0.22),rgba(101,163,13,0.14))] px-5 py-4 text-base font-semibold text-white shadow-[0_12px_30px_rgba(101,163,13,0.16)] transition hover:scale-[1.01] hover:border-lime-300/28"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
