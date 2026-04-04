import { useMemo } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Dumbbell,
  Flame,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';

type Props = {
  onBack: () => void;
  premiumActive?: boolean;
  onOpenPremium?: () => void;
};

type StoredWorkoutSummary = {
  completedAt: string;
  durationMinutes: number;
  exercisesCompleted: number;
  planName: string;
  xpEarned: number;
};

type HistoryStats = {
  workoutsCompleted: number;
  totalXP: number;
  totalMinutes: number;
  bestXP: number;
  currentStreak: number;
  nutritionDays: number;
  checkIns: number;
  recentWorkouts: StoredWorkoutSummary[];
};

const WORKOUT_HISTORY_KEY = 'gymrat-workout-history';
const LAST_WORKOUT_SUMMARY_KEY = 'gymrat-last-workout-summary';
const NUTRITION_LOG_KEY = 'gymrat-nutrition-log';
const DAILY_CHECKIN_KEY = 'gymrat-daily-checkin';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function readWorkoutHistory(): StoredWorkoutSummary[] {
  try {
    const raw = localStorage.getItem(WORKOUT_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readLastWorkout(): StoredWorkoutSummary | null {
  try {
    const raw = localStorage.getItem(LAST_WORKOUT_SUMMARY_KEY);
    return raw ? (JSON.parse(raw) as StoredWorkoutSummary) : null;
  } catch {
    return null;
  }
}

function countNutritionDays(): number {
  try {
    const raw = localStorage.getItem(NUTRITION_LOG_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? Object.keys(parsed).length : 0;
  } catch {
    return 0;
  }
}

function countCheckIns(): number {
  try {
    const raw = localStorage.getItem(DAILY_CHECKIN_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

function getDateKey(isoString: string): string {
  return new Date(isoString).toISOString().slice(0, 10);
}

function calculateWorkoutStreak(workouts: StoredWorkoutSummary[]): number {
  if (!workouts.length) return 0;

  const uniqueDays = Array.from(new Set(workouts.map((w) => getDateKey(w.completedAt)))).sort(
    (a, b) => (a < b ? 1 : -1)
  );

  let streak = 0;
  const today = new Date();
  let cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  const hasToday = uniqueDays.includes(cursor.toISOString().slice(0, 10));
  const hasYesterday = uniqueDays.includes(
    new Date(cursor.getTime() - 86400000).toISOString().slice(0, 10)
  );

  if (!hasToday && !hasYesterday) return 0;
  if (!hasToday && hasYesterday) {
    cursor = new Date(cursor.getTime() - 86400000);
  }

  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (uniqueDays.includes(key)) {
      streak += 1;
      cursor = new Date(cursor.getTime() - 86400000);
    } else {
      break;
    }
  }

  return streak;
}

function getStats(): HistoryStats {
  const history = readWorkoutHistory();
  const lastWorkout = readLastWorkout();

  const merged =
    lastWorkout &&
    !history.some(
      (item) =>
        item.completedAt === lastWorkout.completedAt &&
        item.planName === lastWorkout.planName &&
        item.xpEarned === lastWorkout.xpEarned
    )
      ? [lastWorkout, ...history]
      : history;

  const sorted = [...merged].sort((a, b) =>
    a.completedAt < b.completedAt ? 1 : -1
  );

  const totalXP = sorted.reduce((sum, item) => sum + item.xpEarned, 0);
  const totalMinutes = sorted.reduce((sum, item) => sum + item.durationMinutes, 0);
  const bestXP = sorted.reduce((best, item) => Math.max(best, item.xpEarned), 0);

  return {
    workoutsCompleted: sorted.length,
    totalXP,
    totalMinutes,
    bestXP,
    currentStreak: calculateWorkoutStreak(sorted),
    nutritionDays: countNutritionDays(),
    checkIns: countCheckIns(),
    recentWorkouts: sorted.slice(0, 6),
  };
}

function StatCard({
  icon: Icon,
  label,
  value,
  glow = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-[24px] border p-4',
        glow
          ? 'border-lime-300/20 bg-gradient-to-br from-lime-300/10 to-yellow-300/10 shadow-[0_0_35px_rgba(170,255,140,0.08)]'
          : 'border-white/10 bg-white/[0.04]'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
          {label}
        </div>
        <Icon className="h-4 w-4 text-white/45" />
      </div>
      <div className="mt-3 text-2xl font-black tracking-tight text-white">{value}</div>
    </div>
  );
}

export default function HistoryScreen({
  onBack,
  premiumActive = false,
  onOpenPremium,
}: Props) {
  const stats = useMemo(() => getStats(), []);

  return (
    <div className="min-h-screen bg-[#07110d] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-8 pt-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_50px_rgba(170,255,140,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-lime-300/75">
                History
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight">Progress archive</h1>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Your momentum, streaks and proof that you are leveling up in real life.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-black/20 text-lime-200">
              <Trophy className="h-7 w-7" />
            </div>
          </div>

          {!premiumActive && (
            <div className="mt-5 rounded-[26px] border border-yellow-300/20 bg-gradient-to-r from-yellow-300/12 via-white/[0.04] to-lime-300/12 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-300/10 text-yellow-200">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black text-white">Premium History</div>
                  <p className="mt-1 text-sm leading-6 text-white/68">
                    Keep your archive, session tracking and long-term progress fully unlocked.
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenPremium}
                className="mt-4 w-full rounded-[18px] bg-gradient-to-r from-yellow-300 via-amber-300 to-lime-300 px-4 py-3 text-sm font-black text-[#111]"
              >
                Unlock Premium
              </button>
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatCard
              icon={Dumbbell}
              label="Workouts"
              value={String(stats.workoutsCompleted)}
              glow
            />
            <StatCard icon={Zap} label="Total XP" value={String(stats.totalXP)} />
            <StatCard
              icon={Flame}
              label="Streak"
              value={`${stats.currentStreak} day${stats.currentStreak === 1 ? '' : 's'}`}
            />
            <StatCard icon={Target} label="Best XP" value={String(stats.bestXP)} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <CalendarDays className="h-4 w-4 text-lime-300" />
                Nutrition days
              </div>
              <div className="mt-3 text-2xl font-black text-white">{stats.nutritionDays}</div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Sparkles className="h-4 w-4 text-lime-300" />
                Check-ins
              </div>
              <div className="mt-3 text-2xl font-black text-white">{stats.checkIns}</div>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-black text-white">Total time invested</div>
            <p className="mt-1 text-sm text-white/60">
              {stats.totalMinutes} minutes of real work logged.
            </p>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-yellow-300"
                style={{
                  width: `${Math.max(8, Math.min(100, stats.workoutsCompleted * 12))}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-black text-white">Recent workouts</div>

            {stats.recentWorkouts.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-white/60">
                No sessions logged yet. Complete your first workout and this archive starts filling
                up.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {stats.recentWorkouts.map((workout, index) => (
                  <div
                    key={`${workout.completedAt}-${index}`}
                    className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-white">{workout.planName}</div>
                        <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-white/45">
                          {new Date(workout.completedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-lime-200">
                        +{workout.xpEarned} XP
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-white/68">
                      <div>{workout.exercisesCompleted} exercises done</div>
                      <div>{workout.durationMinutes} min session</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}