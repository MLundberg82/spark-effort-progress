import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Flame, Sparkles, Target, Trophy } from 'lucide-react';
import EquippedRatPreview from '@/components/EquippedRatPreview';
import XPProgressBar from '@/components/XPProgressBar';
import { getAppStats } from '@/lib/appStore';
import {
  getRecommendedNextFocusArea,
  getWorkoutFocusBreakdown,
  getWorkoutHistory,
  type FocusArea,
} from '@/lib/historyStore';

type DailyCheckInScreenProps = {
  onBack: () => void;
};

const focusAreaCopy: Record<
  FocusArea,
  {
    title: string;
    subtitle: string;
    accent: string;
  }
> = {
  chest: {
    title: 'Chest',
    subtitle: 'Push strength and upper-body pressure.',
    accent: 'from-rose-400/25 to-orange-300/10',
  },
  back: {
    title: 'Back',
    subtitle: 'Pull volume, width and posture power.',
    accent: 'from-sky-400/25 to-cyan-300/10',
  },
  arms: {
    title: 'Arms',
    subtitle: 'Delts, biceps and triceps pump.',
    accent: 'from-violet-400/25 to-fuchsia-300/10',
  },
  legs: {
    title: 'Legs',
    subtitle: 'Lower-body force and full-system drive.',
    accent: 'from-lime-400/25 to-emerald-300/10',
  },
};

function getFocusAreaLabel(area: FocusArea) {
  return focusAreaCopy[area]?.title ?? area;
}

function getLatestWorkoutDateText() {
  const history = getWorkoutHistory();
  if (history.length === 0) return 'No workouts logged yet';

  const latest = history[0];
  const date = new Date(latest.completedAt);

  return `Latest session: ${date.toLocaleDateString()} · ${latest.workoutName}`;
}

function InfoCard({
  label,
  value,
  sublabel,
  icon,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_14px_40px_rgba(0,0,0,0.25)] backdrop-blur">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
        <span className="text-lime-300">{icon}</span>
        {label}
      </div>
      <div className="mt-3 text-2xl font-black text-white">{value}</div>
      {sublabel ? <div className="mt-1 text-sm text-white/55">{sublabel}</div> : null}
    </div>
  );
}

export default function DailyCheckInScreen({ onBack }: DailyCheckInScreenProps) {
  const [stats, setStats] = useState(() => getAppStats());
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setStats(getAppStats());
      setRefreshTick((current) => current + 1);
    };

    window.addEventListener('app-store-updated', refresh);
    window.addEventListener('history-updated', refresh);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener('app-store-updated', refresh);
      window.removeEventListener('history-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const recommendedFocusArea = useMemo(
    () => getRecommendedNextFocusArea(),
    [refreshTick],
  );

  const focusBreakdown = useMemo(() => getWorkoutFocusBreakdown(), [refreshTick]);

  const totalLoggedFocusSessions = useMemo(
    () =>
      focusBreakdown.chest +
      focusBreakdown.back +
      focusBreakdown.arms +
      focusBreakdown.legs,
    [focusBreakdown],
  );

  const recommendedCopy = focusAreaCopy[recommendedFocusArea];

  const leastTrainedLabel = useMemo(() => {
    if (totalLoggedFocusSessions === 0) return 'Start with Chest';

    return `Least trained recently: ${getFocusAreaLabel(recommendedFocusArea)}`;
  }, [recommendedFocusArea, totalLoggedFocusSessions]);

  const latestWorkoutText = useMemo(() => getLatestWorkoutDateText(), [refreshTick]);

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(132,204,22,0.16),transparent_30%),linear-gradient(180deg,#09090b_0%,#111214_55%,#0b0b0d_100%)] px-4 pb-8 pt-5 text-white">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white/85 transition hover:bg-white/[0.08]"
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="relative mt-5 overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_28px_100px_rgba(0,0,0,0.38)] backdrop-blur">
          <div className="absolute inset-0 opacity-[0.16]">
            <div className="absolute -right-10 top-6 h-[340px] w-[340px]">
              <EquippedRatPreview
                level={stats.level}
                className="h-full w-full object-contain opacity-90 blur-[0.2px]"
              />
            </div>
          </div>

          <div className="relative z-10 max-w-[56%] sm:max-w-[58%]">
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-lime-300">
              Daily Check-In
            </div>
            <h1 className="mt-2 text-3xl font-black leading-none sm:text-4xl">
              Consistency hits harder when it feels real
            </h1>
            <p className="mt-3 text-sm text-white/62">
              Quick momentum view. No clutter. Just streak, XP and what to train next.
            </p>
            <div className="mt-4 text-xs text-white/42">{latestWorkoutText}</div>
          </div>

          <div className="relative z-10 mt-6 max-w-xl">
            <XPProgressBar
              level={stats.level}
              currentXP={stats.currentLevelXP}
              nextLevelXP={stats.nextLevelXP}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoCard
            label="Streak"
            value={stats.streak}
            sublabel={stats.streak === 1 ? 'Day active' : 'Days active'}
            icon={<Flame className="h-4 w-4" />}
          />
          <InfoCard
            label="Total XP"
            value={stats.totalXP}
            sublabel="Banked progression"
            icon={<Trophy className="h-4 w-4" />}
          />
        </div>

        <div
          className={`mt-4 overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br ${recommendedCopy.accent} p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]`}
        >
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
            <Sparkles className="h-4 w-4 text-lime-300" />
            Recommended next pass
          </div>

          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <div className="text-3xl font-black text-white">
                {recommendedCopy.title}
              </div>
              <div className="mt-2 text-sm text-white/70">
                {recommendedCopy.subtitle}
              </div>
              <div className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                {leastTrainedLabel}
              </div>
            </div>

            <div className="hidden rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 sm:block">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                Focus area
              </div>
              <div className="mt-2 text-xl font-black text-white">
                {recommendedCopy.title}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.26)]">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/55">
            <Target className="h-4 w-4 text-lime-300" />
            Focus balance
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {(['chest', 'back', 'arms', 'legs'] as FocusArea[]).map((area) => {
              const value = focusBreakdown[area];
              const percent =
                totalLoggedFocusSessions > 0
                  ? Math.round((value / totalLoggedFocusSessions) * 100)
                  : 0;

              return (
                <div
                  key={area}
                  className="rounded-[22px] border border-white/10 bg-black/20 p-4"
                >
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
                    {getFocusAreaLabel(area)}
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">{value}</div>
                  <div className="mt-1 text-sm text-white/55">{percent}% of sessions</div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-lime-300 transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}