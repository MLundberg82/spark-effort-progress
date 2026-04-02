// @ts-nocheck
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { getWorkouts } from '@/lib/workoutStore';
import { exercises, muscleGroupLabels, MuscleGroup, muscleGroupColors } from '@/lib/exerciseData';
import { useT } from '@/lib/i18n';
import { Activity } from 'lucide-react';

const MuscleGroupChart = () => {
  const t = useT();
  const workouts = getWorkouts();
  
  const freq: Record<MuscleGroup, number> = { chest: 0, back: 0, shoulders: 0, legs: 0, arms: 0, core: 0, warmup: 0, stretching: 0 };
  workouts.forEach(w => {
    w.entries.forEach(e => {
      const ex = exercises.find(x => x.id === e.exerciseId);
      if (ex) freq[ex.muscleGroup] += e.sets.length;
    });
  });

  const data = (Object.entries(freq) as [MuscleGroup, number][]).map(([group, sets]) => ({
    name: muscleGroupLabels[group],
    sets,
    color: muscleGroupColors[group],
  }));

  const totalSets = data.reduce((acc, d) => acc + d.sets, 0);

  if (totalSets === 0) {
    return (
      <div className="card-3d rounded-2xl p-5 flex flex-col items-center justify-center min-h-[200px]">
        <Activity className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-sm">No workout data yet</p>
        <p className="text-muted-foreground text-xs">{t('startLogging')}</p>
      </div>
    );
  }

  return (
    <div className="card-3d rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">{t('muscleBalance')}</h3>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fill: 'hsl(270 10% 55%)', fontSize: 10 }} />
          <YAxis tick={{ fill: 'hsl(270 10% 55%)', fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              background: 'hsl(270 18% 12%)',
              border: '1px solid hsl(270 12% 22%)',
              borderRadius: '8px',
              color: 'hsl(45 20% 95%)',
            }}
          />
          <Bar dataKey="sets" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MuscleGroupChart;
