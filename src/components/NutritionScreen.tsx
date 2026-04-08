import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, Beef, Flame, Plus, Trash2, UtensilsCrossed, Wheat } from 'lucide-react';
import {
  addNutritionEntry,
  clearNutritionEntries,
  getNutritionEntries,
  getNutritionGoal,
  getTodayNutritionTotals,
  removeNutritionEntry,
  setNutritionGoal,
  subscribeNutrition,
  type NutritionEntry,
  type NutritionGoal,
} from '@/lib/nutritionStore';

type Props = {
  onBack: () => void;
};

function ScreenShell({
  eyebrow,
  title,
  subtitle,
  onBack,
  children,
  saved,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  onBack: () => void;
  children: React.ReactNode;
  saved?: boolean;
}) {
  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(163,230,53,0.12),_transparent_35%),linear-gradient(180deg,#0b0b0b_0%,#050505_100%)] px-4 pb-6 pt-4 text-white">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <button
          onClick={onBack}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/82 transition hover:bg-white/[0.08] hover:text-white"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/56">
            <UtensilsCrossed className="h-3.5 w-3.5 text-lime-300" />
            {eyebrow}
          </div>
          <div>
            <h1 className="text-[30px] font-black leading-[1.02] tracking-[-0.03em] text-white">
              {title}
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/64">{subtitle}</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          {saved ? (
            <div className="mb-4 inline-flex items-center rounded-full border border-lime-300/20 bg-lime-300/[0.10] px-3 py-1 text-xs font-semibold text-lime-200">
              Saved
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
  rightSlot,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  rightSlot?: ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-white/10 bg-black/28 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-lime-300">
            {icon}
          </div>
          <h2 className="text-sm font-bold tracking-[-0.02em] text-white">{title}</h2>
        </div>
        {rightSlot}
      </div>
      {children}
    </section>
  );
}

function MacroCard({
  label,
  value,
  goal,
  unit = 'g',
}: {
  label: string;
  value: number;
  goal: number;
  unit?: string;
}) {
  const percent = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;

  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-white/48">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-lime-300/75" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-3 text-lg font-black tracking-[-0.03em] text-white">
        {Math.round(value)} <span className="text-sm font-semibold text-white/52">{unit}</span>
      </div>
      <div className="text-xs text-white/48">/ {Math.round(goal)} {unit}</div>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-2 rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">{label}</span>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ''))}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/25"
          placeholder={suffix ? `0 ${suffix}` : '0'}
        />
        {suffix ? <span className="text-xs font-semibold text-white/42">{suffix}</span> : null}
      </div>
    </label>
  );
}

function EntryRow({
  entry,
  onRemove,
}: {
  entry: NutritionEntry;
  onRemove: (id: string) => void;
}) {
  const loggedDate = new Date(entry.loggedAt);

  return (
    <div className="flex items-start justify-between gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] p-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-bold text-white">{entry.name}</div>
        <div className="mt-1 text-xs text-white/48">
          {loggedDate.toLocaleDateString()} ·{' '}
          {loggedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-white/64">
          <span>{Math.round(entry.calories)} kcal</span>
          <span>P {Math.round(entry.protein)}g</span>
          <span>C {Math.round(entry.carbs)}g</span>
          <span>F {Math.round(entry.fat)}g</span>
        </div>
      </div>

      <button
        onClick={() => onRemove(entry.id)}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
        aria-label={`Remove ${entry.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function NutritionScreen({ onBack }: Props) {
  const initialGoal = useMemo(() => getNutritionGoal(), []);
  const initialEntries = useMemo(() => getNutritionEntries(), []);
  const initialTotals = useMemo(() => getTodayNutritionTotals(), []);

  const [goal, setGoalState] = useState(initialGoal);
  const [entries, setEntries] = useState(initialEntries);
  const [totals, setTotals] = useState(initialTotals);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  useEffect(() => {
    const sync = () => {
      setGoalState(getNutritionGoal());
      setEntries(getNutritionEntries());
      setTotals(getTodayNutritionTotals());
    };

    sync();
    return subscribeNutrition(sync);
  }, []);

  const flashSaved = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  };

  const persistGoal = (partial: Partial<NutritionGoal>) => {
    const next = setNutritionGoal(partial);
    setGoalState(next);
    setTotals(getTodayNutritionTotals());
    flashSaved();
  };

  const handleAddEntry = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const created = addNutritionEntry({
      name: trimmedName,
      calories: Number(calories || 0),
      protein: Number(protein || 0),
      carbs: Number(carbs || 0),
      fat: Number(fat || 0),
    });

    if (!created) return;

    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setEntries(getNutritionEntries());
    setTotals(getTodayNutritionTotals());
    flashSaved();
  };

  const handleRemoveEntry = (id: string) => {
    removeNutritionEntry(id);
    setEntries(getNutritionEntries());
    setTotals(getTodayNutritionTotals());
    flashSaved();
  };

  const handleClearToday = () => {
    clearNutritionEntries();
    setEntries([]);
    setTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    flashSaved();
  };

  return (
    <ScreenShell
      eyebrow="Nutrition"
      title="Macro tracker"
      subtitle="Goal, daily totals and quick food logging."
      onBack={onBack}
      saved={saved}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <MacroCard label="Calories" value={totals.calories} goal={goal.calories} unit="kcal" />
          <MacroCard label="Protein" value={totals.protein} goal={goal.protein} />
          <MacroCard label="Carbs" value={totals.carbs} goal={goal.carbs} />
          <MacroCard label="Fat" value={totals.fat} goal={goal.fat} />
        </div>

        <SectionCard title="Daily goals" icon={<Flame className="h-4 w-4" />}>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="Calories"
              value={String(goal.calories ?? 0)}
              onChange={(value) => persistGoal({ calories: Number(value || 0) })}
              suffix="kcal"
            />
            <NumberInput
              label="Protein"
              value={String(goal.protein ?? 0)}
              onChange={(value) => persistGoal({ protein: Number(value || 0) })}
              suffix="g"
            />
            <NumberInput
              label="Carbs"
              value={String(goal.carbs ?? 0)}
              onChange={(value) => persistGoal({ carbs: Number(value || 0) })}
              suffix="g"
            />
            <NumberInput
              label="Fat"
              value={String(goal.fat ?? 0)}
              onChange={(value) => persistGoal({ fat: Number(value || 0) })}
              suffix="g"
            />
          </div>
        </SectionCard>

        <SectionCard title="Quick add" icon={<Plus className="h-4 w-4" />}>
          <div className="space-y-3">
            <label className="flex flex-col gap-2 rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">Food name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/25"
                placeholder="Chicken rice, protein shake, oats..."
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <NumberInput label="Calories" value={calories} onChange={setCalories} suffix="kcal" />
              <NumberInput label="Protein" value={protein} onChange={setProtein} suffix="g" />
              <NumberInput label="Carbs" value={carbs} onChange={setCarbs} suffix="g" />
              <NumberInput label="Fat" value={fat} onChange={setFat} suffix="g" />
            </div>

            <button
              onClick={handleAddEntry}
              className="inline-flex items-center gap-2 rounded-2xl border border-lime-300/22 bg-lime-300/[0.12] px-4 py-3 text-sm font-bold text-white transition hover:bg-lime-300/[0.18]"
            >
              <Plus className="h-4 w-4" />
              Add entry
            </button>
          </div>
        </SectionCard>

        <SectionCard
          title="Today's log"
          icon={<UtensilsCrossed className="h-4 w-4" />}
          rightSlot={
            entries.length > 0 ? (
              <button
                onClick={handleClearToday}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/78 transition hover:bg-white/[0.08] hover:text-white"
              >
                Clear
              </button>
            ) : null
          }
        >
          {entries.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm text-white/48">
              No food logged yet today.
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <EntryRow key={entry.id} entry={entry} onRemove={handleRemoveEntry} />
              ))}
            </div>
          )}
        </SectionCard>

        <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-5 text-white/44">
          Nutrition and daily totals are backed by the nutrition store, not timer state.
        </div>
      </div>
    </ScreenShell>
  );
}
