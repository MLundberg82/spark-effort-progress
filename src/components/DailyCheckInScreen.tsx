import { ArrowLeft, Flame, Moon, Smile, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getWorkoutHistory } from '../lib/historyStore';

export default function DailyCheckInScreen({ onBack }: { onBack: () => void }) {
  const [energy, setEnergy] = useState(7);
  const [recovery, setRecovery] = useState(7);
  const [mood, setMood] = useState(7);

  const workouts = getWorkoutHistory();

  const streak = useMemo(() => {
    if (!workouts.length) return 0;

    const days = new Set(
      workouts.map((entry) => new Date(entry.completedAt).toISOString().slice(0, 10))
    );

    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    let count = 0;

    while (true) {
      const iso = cursor.toISOString().slice(0, 10);
      if (!days.has(iso)) break;
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return count;
  }, [workouts]);

  return (
    <div className="min-h-screen bg-[#09090b] px-4 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-[430px]">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/10 px-3 py-2 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
              Daily Check-in
            </div>
            <div className="text-lg font-black leading-none">Today</div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
            Daily Check-in
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Momentum lives here</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Enkel daglig överblick för energi, återhämtning och riktning.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
                <Flame className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-xs text-zinc-400">Streak</div>
              <div className="mt-1 text-lg font-bold">{streak}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
                <Trophy className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-xs text-zinc-400">Workouts</div>
              <div className="mt-1 text-lg font-bold">{workouts.length}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
                <Moon className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-xs text-zinc-400">Recovery</div>
              <div className="mt-1 text-lg font-bold">{recovery}/10</div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <CheckSlider
              label="Energy"
              value={energy}
              onChange={setEnergy}
              icon={<Flame className="h-4 w-4 text-emerald-300" />}
            />

            <CheckSlider
              label="Recovery"
              value={recovery}
              onChange={setRecovery}
              icon={<Moon className="h-4 w-4 text-emerald-300" />}
            />

            <CheckSlider
              label="Mood"
              value={mood}
              onChange={setMood}
              icon={<Smile className="h-4 w-4 text-emerald-300" />}
            />
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-sm font-semibold text-white">Quick read</div>
            <p className="mt-2 text-sm text-zinc-400">
              {energy >= 8 && recovery >= 8
                ? 'You look ready to push hard today.'
                : energy <= 4 || recovery <= 4
                ? 'Today may be better for a lighter session or recovery focus.'
                : 'Solid middle zone. Keep momentum without overdoing it.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckSlider({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl bg-white/[0.05] p-2">{icon}</div>
          <div className="text-sm font-semibold text-white">{label}</div>
        </div>

        <div className="text-sm font-bold text-white">{value}/10</div>
      </div>

      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-4 w-full"
      />
    </div>
  );
}