import React, { useMemo, useState } from 'react';
import { ArrowLeft, Moon, BatteryCharging, Dumbbell, Brain, CheckCircle2 } from 'lucide-react';

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

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readEntries(): DailyCheckInEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: DailyCheckInEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

const scoreButtons = [1, 2, 3, 4, 5];

const DailyCheckInScreen = ({ onBack }: Props) => {
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

  const recommendation = useMemo(() => {
    if (energy <= 2 || sleepHours <= 5) {
      return 'Recovery day recommended. Keep it lighter, focus on technique, steps, and hydration.';
    }
    if (soreness >= 4) {
      return 'You seem pretty sore. Consider lower volume today or swap to a less demanding session.';
    }
    if (mood >= 4 && energy >= 4 && sleepHours >= 7) {
      return 'Green light. You look ready to train hard today.';
    }
    return 'Moderate day. Train, but keep 1–2 reps in reserve and prioritize quality.';
  }, [energy, sleepHours, soreness, mood]);

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
            <h1 className="text-lg font-bold">Daily Check-in</h1>
            <p className="text-xs text-muted-foreground">Set your state before training</p>
          </div>
        </div>

        <div className="rounded-3xl border border-border/50 bg-card/60 p-4 shadow-lg space-y-4">
          <div className="rounded-2xl bg-secondary/40 p-4">
            <div className="text-xs text-muted-foreground mb-1">Today</div>
            <div className="font-semibold">{today}</div>
          </div>

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

          <div className="rounded-2xl bg-secondary/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Moon className="h-4 w-4" />
              <h2 className="font-semibold">Sleep</h2>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min={3}
                max={10}
                step={0.5}
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full"
              />
              <div className="min-w-[48px] text-right text-sm font-semibold">
                {sleepHours}h
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-secondary/40 p-4">
            <div className="text-sm font-semibold mb-2">Note</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How are you feeling today?"
              className="w-full min-h-[110px] rounded-xl bg-background/70 border border-border px-3 py-3 text-sm outline-none"
            />
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="text-xs uppercase tracking-wide text-primary font-semibold mb-2">
              Recommended approach
            </div>
            <p className="text-sm text-foreground">{recommendation}</p>
          </div>

          <button
            onClick={handleSave}
            className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-md"
          >
            Save Check-in
          </button>

          {saved && (
            <div className="flex items-center justify-center gap-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Saved for today
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function ScoreRow({
  icon,
  title,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-2xl bg-secondary/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="font-semibold">{title}</h2>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {scoreButtons.map((score) => (
          <button
            key={score}
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

export default DailyCheckInScreen;