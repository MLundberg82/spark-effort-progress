import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Clock3,
  Globe,
  Mail,
  Minus,
  Plus,
  Ruler,
  Save,
  Target,
  User,
  Weight,
} from 'lucide-react';

import { getLanguage, languageOptions, setLanguage } from '@/lib/languageStore';
import { getProfile, saveProfile } from '@/lib/profileStore';
import { getTrainingLevel, setTrainingLevel } from '@/lib/trainingStore';

type SettingsScreenProps = {
  onBack: () => void;
};

type GenderOption = 'male' | 'female' | 'non-binary';
type GoalOption = 'lose' | 'maintain' | 'gain';
type TrainingLevelOption = 'beginner' | 'intermediate' | 'advanced';
type TimerLoopOption = 'auto' | 'manual';

const CONTACT_EMAIL = 'hello@getgymrat.com';

const REST_TIMER_KEY = 'gymrat-rest-timer-seconds';
const SET_TIMER_KEY = 'gymrat-set-timer-seconds';
const TIMER_AUTO_LOOP_KEY = 'gymrat-timer-auto-loop';

function readTimerNumber(key: string, fallback: number) {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(key);
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

function readTimerBoolean(key: string, fallback: boolean) {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(key);
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return fallback;
}

function clampTimerValue(value: number) {
  return Math.max(10, Math.min(900, Math.round(value)));
}

function persistTimerSettings(
  setSeconds: number,
  restSeconds: number,
  autoLoop: boolean,
) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(SET_TIMER_KEY, String(setSeconds));
  localStorage.setItem(REST_TIMER_KEY, String(restSeconds));
  localStorage.setItem(TIMER_AUTO_LOOP_KEY, String(autoLoop));

  window.dispatchEvent(new Event('gymrat-timer-updated'));
  window.dispatchEvent(new Event('timer-settings-updated'));
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/72">
          {icon}
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
            Settings
          </p>
          <h2 className="text-sm font-black uppercase tracking-[0.12em] text-white">
            {title}
          </h2>
        </div>
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}

function ToggleGrid<T extends string>({
  value,
  onChange,
  options,
  columns = 3,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  columns?: 2 | 3;
}) {
  return (
    <div
      className={`grid gap-2 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              'rounded-[16px] border px-3 py-3 text-center text-sm font-bold transition',
              active
                ? 'border-lime-300/30 bg-lime-300/12 text-white'
                : 'border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.07] hover:text-white',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function CompactInput({
  label,
  icon,
  value,
  onChange,
  suffix,
  inputMode = 'decimal',
}: {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  inputMode?: 'decimal' | 'numeric';
}) {
  return (
    <label className="flex min-w-0 items-center gap-2 rounded-[16px] border border-white/10 bg-black/20 px-3 py-3">
      <span className="text-white/45">{icon}</span>

      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/38">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode={inputMode}
        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/20"
        placeholder={suffix ? `0 ${suffix}` : '0'}
      />

      {suffix ? (
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/38">
          {suffix}
        </span>
      ) : null}
    </label>
  );
}

function TimerRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;

  return (
    <div className="rounded-[18px] border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
            {label}
          </p>
          <p className="mt-1 text-lg font-black text-white">
            {minutes}:{String(seconds).padStart(2, '0')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(clampTimerValue(value - 5))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
            aria-label={`Decrease ${label}`}
          >
            <Minus className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onChange(clampTimerValue(value + 5))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
            aria-label={`Increase ${label}`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const initialProfile = useMemo(() => getProfile(), []);
  const [height, setHeight] = useState(String(initialProfile?.height ?? ''));
  const [weight, setWeight] = useState(String(initialProfile?.weight ?? ''));
  const [age, setAge] = useState(String(initialProfile?.age ?? ''));
  const [gender, setGender] = useState<GenderOption>(
    (initialProfile?.gender as GenderOption) ?? 'male',
  );
  const [goal, setGoal] = useState<GoalOption>(
    (initialProfile?.goal as GoalOption) ?? 'maintain',
  );
  const [trainingLevel, setTrainingLevelState] = useState<TrainingLevelOption>(
    (getTrainingLevel() as TrainingLevelOption) ?? 'beginner',
  );
  const [language, setLanguageState] = useState(getLanguage());

  const [setSeconds, setSetSeconds] = useState(() =>
    readTimerNumber(SET_TIMER_KEY, 45),
  );
  const [restSeconds, setRestSeconds] = useState(() =>
    readTimerNumber(REST_TIMER_KEY, 90),
  );
  const [autoLoop, setAutoLoop] = useState(() =>
    readTimerBoolean(TIMER_AUTO_LOOP_KEY, true),
  );

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;

    const timeout = window.setTimeout(() => setSaved(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [saved]);

  const handleSave = () => {
    saveProfile({
      ...(initialProfile ?? {}),
      height: Number(height) || 0,
      weight: Number(weight) || 0,
      age: Number(age) || 0,
      gender,
      goal,
      trainingLevel,
    } as never);

    setTrainingLevel(trainingLevel as never);
    setLanguage(language as never);
    persistTimerSettings(setSeconds, restSeconds, autoLoop);

    setSaved(true);

    window.dispatchEvent(new CustomEvent('profile-updated'));
    window.dispatchEvent(new CustomEvent('gymrat-profile-updated'));
  };

  return (
    <div
      className="absolute inset-y-0 right-0 flex w-[80%] max-w-[420px] flex-col border-l border-white/10 bg-[#0a0a0a]/96 shadow-[-24px_0_80px_rgba(0,0,0,0.45)]"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 pb-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[11px] font-black uppercase tracking-[0.16em] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>

        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
            Menu
          </p>
          <h1 className="text-base font-black uppercase tracking-[0.16em] text-white">
            Settings
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        <div className="space-y-3">
          <SectionCard title="Profile" icon={<User className="h-4 w-4" />}>
            <div className="grid grid-cols-1 gap-2">
              <CompactInput
                label="Height"
                icon={<Ruler className="h-4 w-4" />}
                value={height}
                onChange={setHeight}
                suffix="cm"
              />

              <CompactInput
                label="Weight"
                icon={<Weight className="h-4 w-4" />}
                value={weight}
                onChange={setWeight}
                suffix="kg"
              />

              <CompactInput
                label="Age"
                icon={<User className="h-4 w-4" />}
                value={age}
                onChange={setAge}
                inputMode="numeric"
              />
            </div>

            <div className="mt-3">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                Gender
              </p>

              <select
                value={gender}
                onChange={(event) => setGender(event.target.value as GenderOption)}
                className="w-full rounded-[16px] border border-white/10 bg-black/20 px-3 py-3 text-sm font-semibold text-white outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
              </select>
            </div>
          </SectionCard>

          <SectionCard title="Goal" icon={<Target className="h-4 w-4" />}>
            <ToggleGrid<GoalOption>
              value={goal}
              onChange={(value) => setGoal(value)}
              options={[
                { value: 'lose', label: 'Lose' },
                { value: 'maintain', label: 'Maintain' },
                { value: 'gain', label: 'Gain' },
              ]}
              columns={3}
            />

            <div className="mt-3">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                Training level
              </p>

              <ToggleGrid<TrainingLevelOption>
                value={trainingLevel}
                onChange={(value) => setTrainingLevelState(value)}
                options={[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' },
                ]}
                columns={3}
              />
            </div>
          </SectionCard>

          <SectionCard title="Timer" icon={<Clock3 className="h-4 w-4" />}>
            <div className="grid grid-cols-1 gap-2">
              <TimerRow
                label="Set timer"
                value={setSeconds}
                onChange={setSetSeconds}
              />

              <TimerRow
                label="Rest timer"
                value={restSeconds}
                onChange={setRestSeconds}
              />
            </div>

            <div className="mt-3">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                Timer loop
              </p>

              <ToggleGrid<TimerLoopOption>
                value={autoLoop ? 'auto' : 'manual'}
                onChange={(value) => setAutoLoop(value === 'auto')}
                options={[
                  { value: 'auto', label: 'Auto loop' },
                  { value: 'manual', label: 'Manual' },
                ]}
                columns={2}
              />
            </div>
          </SectionCard>

          <SectionCard title="Language" icon={<Globe className="h-4 w-4" />}>
            <div className="grid grid-cols-2 gap-2">
              {languageOptions.map((option) => {
                const active = option.value === language;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setLanguageState(option.value)}
                    className={[
                      'rounded-[16px] border px-3 py-3 text-sm font-bold transition',
                      active
                        ? 'border-lime-300/30 bg-lime-300/12 text-white'
                        : 'border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.07] hover:text-white',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Support" icon={<Mail className="h-4 w-4" />}>
            <button
              type="button"
              onClick={() => {
                window.location.href = `mailto:${CONTACT_EMAIL}?subject=GymRat%20Support`;
              }}
              className="w-full rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm font-bold text-white transition hover:bg-white/[0.08]"
            >
              Contact support
            </button>
          </SectionCard>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#0a0a0a]/96 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-lime-300 text-[11px] font-black uppercase tracking-[0.16em] text-black transition hover:brightness-105"
        >
          <Save className="h-4 w-4" />
          Save settings
        </button>

        {saved ? (
          <div className="mt-2 text-center text-[10px] font-black uppercase tracking-[0.18em] text-lime-200">
            Saved
          </div>
        ) : null}
      </div>
    </div>
  );
}