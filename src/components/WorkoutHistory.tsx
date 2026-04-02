import { useState, useMemo } from 'react';
import { getWorkouts, WorkoutLog } from '@/lib/workoutStore';
import { exercises } from '@/lib/exerciseData';
import { muscleGroupIconMap } from '@/lib/muscleGroupIcons';
import { useT } from '@/lib/i18n';
import { Calendar, Flame, TrendingUp, Trophy } from 'lucide-react';
import ShareButton from '@/components/ShareButton';

type DateFilter = 'all' | 'week' | 'month' | 'year';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function calcStreak(workouts: WorkoutLog[]): number {
  if (workouts.length === 0) return 0;
  const dates = [...new Set(workouts.map(w => new Date(w.date).toDateString()))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (new Date(dates[i]).toDateString() === expected.toDateString()) {
      streak++;
    } else if (i === 0) {
      expected.setDate(expected.getDate() - 1);
      if (new Date(dates[i]).toDateString() === expected.toDateString()) {
        streak++;
      } else break;
    } else break;
  }
  return streak;
}

function filterByDate(workouts: WorkoutLog[], filter: DateFilter): WorkoutLog[] {
  if (filter === 'all') return workouts;
  const now = new Date();
  const cutoff = new Date();
  switch (filter) {
    case 'week': cutoff.setDate(now.getDate() - 7); break;
    case 'month': cutoff.setMonth(now.getMonth() - 1); break;
    case 'year': cutoff.setFullYear(now.getFullYear() - 1); break;
  }
  return workouts.filter(w => new Date(w.date) >= cutoff);
}

const filterLabels: Record<DateFilter, string> = {
  all: 'All',
  week: 'Week',
  month: 'Month',
  year: 'Year',
};

const WorkoutHistory = () => {
  const t = useT();
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const allWorkouts = useMemo(() => getWorkouts().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), []);
  const workouts = useMemo(() => filterByDate(allWorkouts, dateFilter), [allWorkouts, dateFilter]);
  const streak = useMemo(() => calcStreak(allWorkouts), [allWorkouts]);
  const totalVolume = useMemo(() => workouts.reduce((acc, w) => acc + w.entries.reduce((a, e) => a + e.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0), 0), [workouts]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">{t('workoutHistory')}</h2>
        <ShareButton text={`🐀 GymRat Stats: ${workouts.length} workouts | ${streak} day streak | ${totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume}kg total volume! 💪`} compact />
      </div>

      {/* Date filter tabs */}
      <div className="flex gap-1.5">
        {(Object.keys(filterLabels) as DateFilter[]).map(f => (
          <button key={f} onClick={() => setDateFilter(f)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dateFilter === f
                ? 'gradient-primary text-primary-foreground shadow-button'
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
            }`}>
            {filterLabels[f]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card-3d rounded-xl p-3 text-center">
          <Flame className="w-4 h-4 text-accent mx-auto mb-1" />
          <p className="font-display text-xl font-bold text-foreground">{streak}</p>
          <p className="text-[10px] text-muted-foreground">{t('dayStreak')}</p>
        </div>
        <div className="card-3d rounded-xl p-3 text-center">
          <Trophy className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="font-display text-xl font-bold text-foreground">{workouts.length}</p>
          <p className="text-[10px] text-muted-foreground">{t('workouts')}</p>
        </div>
        <div className="card-3d rounded-xl p-3 text-center">
          <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="font-display text-xl font-bold text-foreground">{totalVolume.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">{t('totalVol')}</p>
        </div>
      </div>

      {workouts.length === 0 ? (
        <div className="card-3d rounded-2xl p-8 text-center">
          <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{dateFilter === 'all' ? t('noWorkoutsYet') : `No workouts in the last ${filterLabels[dateFilter].toLowerCase()}`}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('startLogging')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map(w => {
            const vol = w.entries.reduce((a, e) => a + e.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0);
            const totalSets = w.entries.reduce((a, e) => a + e.sets.length, 0);
            const groups = [...new Set(w.entries.map(e => {
              const ex = exercises.find(x => x.id === e.exerciseId);
              return ex?.muscleGroup;
            }).filter(Boolean))];

            return (
              <div key={w.id} className="card-3d rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">{formatDate(w.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground shadow-elevated">
                      {totalSets} {t('sets')}
                    </span>
                    <ShareButton text={`🏋️ Just crushed ${totalSets} sets | ${vol}kg volume on ${formatDate(w.date)}! #GymRat 🐀`} compact />
                  </div>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {groups.map(g => {
                    if (!g) return null;
                    const Icon = muscleGroupIconMap[g];
                    return (
                      <span key={g} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">
                        <Icon className="w-3 h-3" /> {g}
                      </span>
                    );
                  })}
                </div>

                <div className="text-xs text-muted-foreground space-y-0.5">
                  {w.entries.map((e, i) => {
                    const ex = exercises.find(x => x.id === e.exerciseId);
                    const best = Math.max(...e.sets.map(s => s.weight));
                    return (
                      <div key={i} className="flex justify-between">
                        <span>{ex?.name ?? e.exerciseId}</span>
                        <span className="text-foreground font-medium">{e.sets.length}×{e.sets[0]?.reps || 0} @ {best}kg</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-1 border-t border-border/30 flex justify-between text-xs">
                  <span className="text-muted-foreground">{t('volume')}</span>
                  <span className="font-semibold text-foreground">{vol.toLocaleString()} kg</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkoutHistory;
