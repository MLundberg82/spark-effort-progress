import { useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Moon,
  BatteryCharging,
  Dumbbell,
  Brain,
  CheckCircle2,
} from 'lucide-react';

type DailyCheckInEntry = {
  date: string;
  mood: number;
  energy: number;
  soreness: number;
  sleepHours: number;
  note: string;
};

type Props = {
  onBack: () => void;
};

const STORAGE_KEY = 'gymrat-daily-checkin';
const scoreButtons = [1, 2, 3, 4, 5];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readEntries(): DailyCheckInEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DailyCheckInEntry[]) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: DailyCheckInEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function ScoreRow({
  icon,
  title,
  value,
  onChange,
}: {
  icon: ReactNode;
  title: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-secondary/30 p-4">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="font-semibold">{title}</h2>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {scoreButtons.map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`h-10 rounded-xl text-sm font-semibold transition ${
              value === score
                ? 'bg-primary text-primary-foreground'
                : 'bg-background/70 text-foreground'
            }`}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DailyCheckInScreen({ onBack }: Props) {
  const today = getTodayKey();

  const existingToday = useMemo(
    () => readEntries().find((entry) => entry.date === today),
    [today]
  );

  const [mood, setMood] = useState(existingToday?.mood ?? 3);
  const [energy, setEnergy] = useState(existingToday?.energy ?? 3);
  const [soreness, setSoreness] = useState(existingToday?.soreness ?? 2);
  const [sleepHours, setSleepHours] = useState(existingToday?.sleepHours ?? 8);
  const [note, setNote] = useState(existingToday?.note ?? '');
  const [saved, setSaved] = useState(false);

  const recommendation = useMemo(() => {
    if (energy <= 2 || sleepHours <= 5) {
      return 'Recovery day recommended. Keep it lighter, focus on technique, steps and hydration.';
    }

    if (soreness >= 4) {
      return 'You seem pretty sore. Consider lower volume today or swap to a less demanding session.';
    }

    if (mood >= 4 && energy >= 4 && sleepHours >= 7) {
      return 'Green light. You look ready to train hard today.';
    }

    return 'Moderate day. Train, but keep 1–2 reps in reserve and prioritize quality.';
  }, [energy, sleepHours, soreness, mood]);

  const handleSave = () => {
    const entries = readEntries().filter((entry) => entry.date !== today);

    entries.unshift({
      date: today,
      mood,
      energy,
      soreness,
      sleepHours,
      note,
    });

    saveEntries(entries);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

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
            Daily Check-in
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Set your state before training
          </h1>

          <div className="mt-4 rounded-2xl border border-border/40 bg-secondary/20 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Today
            </div>
            <div className="mt-1 text-lg font-semibold">{today}</div>
          </div>

          <div className="mt-4 space-y-3">
            <ScoreRow
              icon={<Brain className="h-4 w-4" />}
              title="Mood"
              value={mood}
              onChange={setMood}
            />

            <ScoreRow
              icon={<BatteryCharging className="h-4 w-4" />}
              title="Energy"
              value={energy}
              onChange={setEnergy}
            />

            <ScoreRow
              icon={<Dumbbell className="h-4 w-4" />}
              title="Soreness"
              value={soreness}
              onChange={setSoreness}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-border/40 bg-secondary/30 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <h2 className="font-semibold">Sleep</h2>
            </div>

            <input
              type="range"
              min={0}
              max={12}
              step={0.5}
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="w-full"
            />

            <div className="mt-2 text-sm text-muted-foreground">{sleepHours}h</div>
          </div>

          <div className="mt-4 rounded-2xl border border-border/40 bg-secondary/30 p-4">
            <div className="mb-2 font-semibold">Note</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How are you feeling today?"
              className="min-h-[110px] w-full rounded-xl border border-border bg-background/70 px-3 py-3 text-sm outline-none"
            />
          </div>

          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
              Recommended approach
            </div>
            <p className="text-sm text-foreground">{recommendation}</p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="mt-4 h-12 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-md"
          >
            Save Check-in
          </button>

          {saved && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Saved for today
            </div>
          )}
        </div>
      </div>
    </div>
  );
}