import React, { useMemo } from 'react';
import { ArrowLeft, Flame, Trophy, CalendarDays, TrendingUp } from 'lucide-react';
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

const HistoryScreen = ({ onBack }: Props) => {
  const stats = useMemo(() => {
    const totalXP = getSafeNumber((gamificationStore as any).getTotalXP?.(), 0);
    const streak = getSafeNumber((gamificationStore as any).getStreak?.(), 0);
    const levelData = (gamificationStore as any).getLevelFromXP?.(totalXP);

    const level =
      typeof levelData === 'object' && levelData !== null
        ? getSafeNumber(levelData.level, 1)
        : getSafeNumber(levelData, 1);

    return {
      totalXP,
      streak,
      level,
      checkIns: getCheckInCount(),
      nutritionDays: getNutritionDays(),
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-4">
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold">History</h1>
            <p className="text-xs text-muted-foreground">Your progress overview</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard icon={<Trophy className="h-4 w-4" />} label="Level" value={`${stats.level}`} />
          <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Total XP" value={`${stats.totalXP}`} />
          <StatCard icon={<Flame className="h-4 w-4" />} label="Streak" value={`${stats.streak} days`} />
          <StatCard icon={<CalendarDays className="h-4 w-4" />} label="Check-ins" value={`${stats.checkIns}`} />
        </div>

        <div className="rounded-3xl border border-border/50 bg-card/60 p-4 shadow-lg space-y-3">
          <h2 className="font-semibold">Consistency snapshot</h2>

          <HistoryRow
            label="Daily check-ins completed"
            value={stats.checkIns}
            helper="Great for adjusting training intensity day to day."
          />

          <HistoryRow
            label="Days with nutrition logged"
            value={stats.nutritionDays}
            helper="The more consistent this gets, the easier progress becomes."
          />

          <HistoryRow
            label="Current streak"
            value={stats.streak}
            helper="Momentum matters. Protect your streak, but recover smart."
          />

          <HistoryRow
            label="Total XP earned"
            value={stats.totalXP}
            helper="Your rat evolves as your consistency grows."
          />
        </div>
      </div>
    </div>
  );
};

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-lg font-bold">{value}</div>
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
    <div className="rounded-2xl bg-secondary/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-base font-bold">{value}</div>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{helper}</div>
    </div>
  );
}

export default HistoryScreen;