import { useMemo, type ReactNode } from 'react';
import {
  ArrowLeft,
  Flame,
  Trophy,
  CalendarDays,
  TrendingUp,
  Dumbbell,
} from 'lucide-react';
import * as gamificationStore from '@/lib/gamificationStore';

type Props = {
  onBack: () => void;
};

function getSafeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

function getCheckInCount() {
  try {
    const raw = localStorage.getItem('gymrat-daily-checkin');
    const entries = raw ? JSON.parse(raw) : [];
    return Array.isArray(entries) ? entries.length : 0;
  } catch {
    return 0;
  }
}

function getNutritionDays() {
  try {
    const raw = localStorage.getItem('gymrat-nutrition-log');
    const data = raw ? JSON.parse(raw) : {};
    return Object.keys(data).length;
  } catch {
    return 0;
  }
}

function getWorkoutCount() {
  try {
    const raw = localStorage.getItem('gymrat-workouts');
    const entries = raw ? JSON.parse(raw) : [];
    return Array.isArray(entries) ? entries.length : 0;
  } catch {
    return 0;
  }
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-secondary/20 p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-xl font-bold">{value}</div>
    </div>
  );
}

function HistoryRow({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-secondary/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{label}</div>
          <div className="mt-1 text-sm text-muted-foreground">{helper}</div>
        </div>
        <div className="text-xl font-black">{value}</div>
      </div>
    </div>
  );
}

export default function HistoryScreen({ onBack }: Props) {
  const stats = useMemo(() => {
    const totalXP = getSafeNumber((gamificationStore as any).getTotalXP?.(), 0);
    const streak = getSafeNumber((gamificationStore as any).getStreak?.(), 0);
    const levelData = (gamificationStore as any).getLevelFromXP?.(totalXP);
    const level =
      typeof levelData === 'object' && levelData !== null
        ? getSafeNumber((levelData as any).level, 1)
        : getSafeNumber(levelData, 1);

    return {
      totalXP,
      streak,
      level,
      checkIns: getCheckInCount(),
      nutritionDays: getNutritionDays(),
      workouts: getWorkoutCount(),
    };
  }, []);

  return (
    <div className="min-h-screen bg-background px-4 py-4 text-foreground">
      <div className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 rounded-2xl border border-border/50 bg-secondary/30 px-4 py-2 text-sm font-medium"
        >
          <span className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </span>
        </button>

        <div className="rounded-3xl border border-border/40 bg-card/70 p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            History
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Your progress overview
          </h1>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatCard
              icon={<Trophy className="h-4 w-4" />}
              label="Level"
              value={`${stats.level}`}
            />
            <StatCard
              icon={<TrendingUp className="h-4 w-4" />}
              label="Total XP"
              value={`${stats.totalXP}`}
            />
            <StatCard
              icon={<Flame className="h-4 w-4" />}
              label="Streak"
              value={`${stats.streak} days`}
            />
            <StatCard
              icon={<CalendarDays className="h-4 w-4" />}
              label="Check-ins"
              value={`${stats.checkIns}`}
            />
          </div>

          <div className="mt-5">
            <h2 className="text-lg font-bold">Consistency snapshot</h2>
            <div className="mt-3 space-y-3">
              <HistoryRow
                label="Workout sessions"
                value={stats.workouts}
                helper="Total saved training sessions"
              />
              <HistoryRow
                label="Nutrition tracked"
                value={stats.nutritionDays}
                helper="Days with food and macro logging"
              />
              <HistoryRow
                label="Daily check-ins"
                value={stats.checkIns}
                helper="Recovery and readiness tracking"
              />
              <HistoryRow
                label="Current streak"
                value={stats.streak}
                helper="Consecutive active days"
              />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border/40 bg-secondary/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Dumbbell className="h-4 w-4" />
              Progress note
            </div>
            <p className="text-sm text-muted-foreground">
              This is the stable rebuilt history screen. We can extend it next with exercise PRs,
              previous workouts and deeper analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}