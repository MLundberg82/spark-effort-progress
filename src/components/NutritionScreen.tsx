import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Beef,
  Flame,
  Plus,
  Trash2,
  UtensilsCrossed,
  Wheat,
} from 'lucide-react';

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
    <section className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/75">
            {icon}
          </div>
          <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">
            {title}
          </h2>
        </div>

        {rightSlot}
      </div>

      <div className="space-y-3">{children}</div>
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
    <div className="rounded-[18px] border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white/45">
          {label}
        </div>
        <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white/35">
          {percent}%
        </div>
      </div>

      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="text-lg font-black text-white">
          {Math.round(value)}
          <span className="ml-1 text-xs uppercase tracking-[0.12em] text-white/45">
            {unit}
          </span>
        </div>

        <div className="text-xs font-semibold text-white/45">
          / {Math.round(goal)} {unit}
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-lime-300 transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
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
    <label className="flex min-h-[52px] items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.04] px-3.5 py-3">
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-[11px] font-black uppercase tracking-[0.14em] text-white/45">
          {label}
        </div>

        <div className="flex items-center gap-2">
          <input
            inputMode="numeric"
            value={value}
            onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ''))}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/25"
            placeholder={suffix ? `0 ${suffix}` : '0'}
          />
          {suffix ? (
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
              {suffix}
            </span>
          ) : null}
        </div>
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
    <div className="rounded-[18px] border border-white/10 bg-black/20 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-black text-white">{entry.name}</div>
          <div className="mt-1 text-xs text-white/45">
            {loggedDate.toLocaleDateString()} · {loggedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(entry.id)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          aria-label={`Remove ${entry.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-white/65 sm:grid-cols-4">
        <div className="rounded-[12px] border border-white/8 bg-white/[0.03] px-2.5 py-2">
          {Math.round(entry.calories)} kcal
        </div>
        <div className="rounded-[12px] border border-white/8 bg-white/[0.03] px-2.5 py-2">
          P {Math.round(entry.protein)}g
        </div>
        <div className="rounded-[12px] border border-white/8 bg-white/[0.03] px-2.5 py-2">
          C {Math.round(entry.carbs)}g
        </div>
        <div className="rounded-[12px] border border-white/8 bg-white/[0.03] px-2.5 py-2">
          F {Math.round(entry.fat)}g
        </div>
      </div>
    </div>
  );
}

export default function NutritionScreen({ onBack }: Props) {
  const initialGoal = useMemo(() => getNutritionGoal(), []);
  const initialEntries = useMemo(() => getNutritionEntries(), []);
  const initialTotals = useMemo(() => getTodayNutritionTotals(), []);

  const [goal, setGoalState] = useState<NutritionGoal>(initialGoal);
  const [entries, setEntries] = useState<NutritionEntry[]>(initialEntries);
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
    <div className="min-h-full bg-[#050505] px-4 pb-8 pt-4">
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
              aria-label="Back"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>

            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                Nutrition
              </div>
              <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white">
                Macro tracker
              </h1>
              <p className="mt-1 text-sm text-white/55">
                Goal, daily totals and quick food logging.
              </p>
            </div>
          </div>

          {saved ? (
            <div className="rounded-[14px] border border-lime-300/25 bg-lime-300/[0.10] px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-lime-100">
              Saved
            </div>
          ) : null}
        </div>

        <SectionCard
          title="Today"
          icon={<UtensilsCrossed className="h-4.5 w-4.5" />}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <MacroCard
              label="Calories"
              value={totals.calories}
              goal={goal.calories}
              unit="kcal"
            />
            <MacroCard
              label="Protein"
              value={totals.protein}
              goal={goal.protein}
            />
            <MacroCard
              label="Carbs"
              value={totals.carbs}
              goal={goal.carbs}
            />
            <MacroCard
              label="Fat"
              value={totals.fat}
              goal={goal.fat}
            />
          </div>
        </SectionCard>

        <SectionCard title="Goal" icon={<Flame className="h-4.5 w-4.5" />}>
          <div className="grid gap-2 sm:grid-cols-2">
            <NumberInput
              label="Calories"
              value={String(goal.calories)}
              onChange={(value) =>
                persistGoal({ calories: Number(value || 0) })
              }
              suffix="kcal"
            />
            <NumberInput
              label="Protein"
              value={String(goal.protein)}
              onChange={(value) =>
                persistGoal({ protein: Number(value || 0) })
              }
              suffix="g"
            />
            <NumberInput
              label="Carbs"
              value={String(goal.carbs)}
              onChange={(value) =>
                persistGoal({ carbs: Number(value || 0) })
              }
              suffix="g"
            />
            <NumberInput
              label="Fat"
              value={String(goal.fat)}
              onChange={(value) =>
                persistGoal({ fat: Number(value || 0) })
              }
              suffix="g"
            />
          </div>
        </SectionCard>

        <SectionCard title="Quick add" icon={<Plus className="h-4.5 w-4.5" />}>
          <label className="flex min-h-[52px] items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.04] px-3.5 py-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 text-[11px] font-black uppercase tracking-[0.14em] text-white/45">
                Food name
              </div>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/25"
                placeholder="Chicken rice, protein shake, oats..."
              />
            </div>
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            <NumberInput
              label="Calories"
              value={calories}
              onChange={setCalories}
              suffix="kcal"
            />
            <NumberInput
              label="Protein"
              value={protein}
              onChange={setProtein}
              suffix="g"
            />
            <NumberInput
              label="Carbs"
              value={carbs}
              onChange={setCarbs}
              suffix="g"
            />
            <NumberInput
              label="Fat"
              value={fat}
              onChange={setFat}
              suffix="g"
            />
          </div>

          <button
            type="button"
            onClick={handleAddEntry}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[14px] bg-lime-300 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-black transition hover:brightness-105"
          >
            <Plus className="h-4 w-4" />
            Add entry
          </button>
        </SectionCard>

        <SectionCard
          title="Logged today"
          icon={<Beef className="h-4.5 w-4.5" />}
          rightSlot={
            entries.length > 0 ? (
              <button
                type="button"
                onClick={handleClearToday}
                className="inline-flex min-h-[36px] items-center justify-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            ) : null
          }
        >
          {entries.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-white/10 bg-black/20 px-4 py-5 text-sm text-white/55">
              No food logged yet today.
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  onRemove={handleRemoveEntry}
                />
              ))}
            </div>
          )}
        </SectionCard>

        <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/45">
          Nutrition and daily totals are backed by the nutrition store, not timer state.
        </div>
      </div>
    </div>
  );
}