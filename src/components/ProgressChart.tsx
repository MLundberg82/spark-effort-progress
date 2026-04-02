// @ts-nocheck
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getExerciseHistory } from '@/lib/workoutStore';
import { exercises } from '@/lib/exerciseData';
import { TrendingUp } from 'lucide-react';

interface ProgressChartProps {
  exerciseId: string;
}

const ProgressChart = ({ exerciseId }: ProgressChartProps) => {
  const history = getExerciseHistory(exerciseId);
  const exercise = exercises.find(e => e.id === exerciseId);

  if (history.length === 0) {
    return (
      <div className="card-3d rounded-2xl p-5 flex flex-col items-center justify-center min-h-[200px]">
        <TrendingUp className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-sm">No data yet for {exercise?.name}</p>
        <p className="text-muted-foreground text-xs">Log workouts to see progress</p>
      </div>
    );
  }

  const formattedData = history.map(h => ({
    date: new Date(h.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    weight: h.maxWeight,
    volume: h.totalVolume,
  }));

  return (
    <div className="card-3d rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">{exercise?.name} Progress</h3>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(270 12% 22%)" />
          <XAxis dataKey="date" tick={{ fill: 'hsl(270 10% 55%)', fontSize: 11 }} />
          <YAxis tick={{ fill: 'hsl(270 10% 55%)', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: 'hsl(270 18% 12%)',
              border: '1px solid hsl(270 12% 22%)',
              borderRadius: '8px',
              color: 'hsl(45 20% 95%)',
            }}
          />
          <Line type="monotone" dataKey="weight" stroke="hsl(45 90% 55%)" strokeWidth={2} dot={{ r: 4, fill: 'hsl(45 90% 55%)' }} />
          <Line type="monotone" dataKey="volume" stroke="hsl(280 65% 60%)" strokeWidth={2} dot={{ r: 4, fill: 'hsl(280 65% 60%)' }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1.5 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Max Weight (kg)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1.5 rounded-full bg-accent" />
          <span className="text-xs text-muted-foreground">Volume (kg)</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
