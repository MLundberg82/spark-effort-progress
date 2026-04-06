import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Bug,
  ChevronRight,
  Clock3,
  Dumbbell,
  Globe,
  Mail,
  Ruler,
  Save,
  Target,
  User,
  Weight,
} from 'lucide-react';

import {
  getProfile,
  saveProfile,
  type FitnessGoal,
  type ProfileGender,
} from '@/lib/profileStore';
import { getTrainingLevel, setTrainingLevel } from '@/lib/trainingStore';
import type { TrainingLevel } from '@/lib/exerciseData';
import {
  getLanguage,
  getLanguageLabel,
  languageOptions,
  setLanguage,
  type AppLanguage,
} from '@/lib/languageStore';

type SettingsScreenProps = {
  onBack: () => void;
};

const CONTACT_EMAIL = 'hello@getgymrat.com';

const REST_TIMER_KEY = 'gymrat-rest-timer-seconds';
const SET_TIMER_KEY = 'gymrat-set-timer-seconds';
const TIMER_AUTO_LOOP_KEY = 'gymrat-timer-auto-loop';

const TIMER_OPTIONS = [15, 20, 30, 45, 60, 75, 90, 120, 150, 180] as const;

function readNumber(key: string, fallback: number) {
  if (typeof window === 'undefined') return fallback;

  const raw = localStorage.getItem(key);
  const parsed = Number(raw);

  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.round(parsed);
  }

  return fallback;
}

function readBoolean(key: string, fallback: boolean) {
  if (typeof window === 'undefined') return fallback;

  const raw = localStorage.getItem(key);
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return fallback;
}

function writeTimerSettings(options: {
  restSeconds: number;
  setSeconds: number;
  autoLoop: boolean;
}) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(REST_TIMER_KEY, String(options.restSeconds));
  localStorage.setItem(SET_TIMER_KEY, String(options.setSeconds));
  localStorage.setItem(TIMER_AUTO_LOOP_KEY, String(options.autoLoop));

  const detail = {
    restSeconds: options.restSeconds,
    setSeconds: options.setSeconds,
    autoLoop: options.autoLoop,
    autoStartWorkout: false,
  };

  window.dispatchEvent(new CustomEvent('gymrat-timer-updated', { detail }));
  window.dispatchEvent(new CustomEvent('timer-settings-updated', { detail }));
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-2 flex items-start gap-2.5">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white">
        {icon}
      </div>

      <div className="min-w-0">
        <div className="text-[12px] font-black uppercase tracking-[0.12em] text-white">
          {title}
        </div>
        {subtitle ? (
          <div className="mt-0.5 text-[11px] leading-5 text-white/50">{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}

function ToggleCard<T extends string>({
  value,
  onChange,
  options,
  columns = 'grid-cols-1 sm:grid-cols-3',
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; sublabel?: string }[];
  columns?: string;
}) {
  return (
    <div className={`grid gap-2 ${columns}`}>
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border px-3 py-2.5 text-left transition ${
              active
                ? 'border-lime-400/35 bg-lime-400/12 text-white shadow-[0_0_0_1px_rgba(163,230,53,0.08)]'
                : 'border-white/10 bg-white/[0.04] text-white/75 hover:border-white/20 hover:bg-white/[0.07]'
            }`}
          >
            <div className="text-[12px] font-black uppercase tracking-[0.08em]">
              {option.label}
            </div>
            {option.sublabel ? (
              <div className="mt-0.5 text-[10px] leading-4 text-white/50">
                {option.sublabel}
              </div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function CompactInput({
  label,
  value,
  onChange,
  suffix,
  icon,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  suffix?: string;
  icon: ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
        <span className="text-white/65">{icon}</span>
        {label}
      </div>

      <div className="relative">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 pr-12 text-sm text-white outline-none transition focus:border-lime-400/50"
        />
        {suffix ? (
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
            {suffix}
          </div>
        ) : null}
      </div>
    </label>
  );
}

function ActionRow({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-left transition hover:border-white/20 hover:bg-white/[0.07]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-black uppercase tracking-[0.08em] text-white">
          {title}
        </div>
        <div className="mt-0.5 text-[11px] leading-5 text-white/50">{subtitle}</div>
      </div>

      <ChevronRight className="h-4 w-4 text-white/30" />
    </button>
  );
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const profile = getProfile();

  const [gender, setGender] = useState<ProfileGender>(profile.gender ?? 'male');
  const [height, setHeight] = useState(profile.height ? String(profile.height) : '');
  const [weight, setWeight] = useState(profile.weight ? String(profile.weight) : '');
  const [age, setAge] = useState(profile.age ? String(profile.age) : '');
  const [goal, setGoal] = useState<FitnessGoal>(profile.goal ?? 'gain');
  const [trainingLevelState, setTrainingLevelState] =
    useState<TrainingLevel>(getTrainingLevel());
  const [language, setLanguageState] = useState<AppLanguage>(getLanguage());

  const [restSeconds, setRestSeconds] = useState<number>(
    readNumber(REST_TIMER_KEY, 90),
  );
  const [setSeconds, setSetSeconds] = useState<number>(
    readNumber(SET_TIMER_KEY, 45),
  );
  const [autoLoop, setAutoLoop] = useState<boolean>(
    readBoolean(TIMER_AUTO_LOOP_KEY, true),
  );

  const [message, setMessage] = useState('');

  useEffect(() => {
    const refreshFromStores = () => {
      const current = getProfile();

      setGender(current.gender ?? 'male');
      setHeight(current.height ? String(current.height) : '');
      setWeight(current.weight ? String(current.weight) : '');
      setAge(current.age ? String(current.age) : '');
      setGoal(current.goal ?? 'gain');
      setTrainingLevelState(getTrainingLevel());
      setLanguageState(getLanguage());
      setRestSeconds(readNumber(REST_TIMER_KEY, 90));
      setSetSeconds(readNumber(SET_TIMER_KEY, 45));
      setAutoLoop(readBoolean(TIMER_AUTO_LOOP_KEY, true));
    };

    window.addEventListener('gymrat-profile-updated', refreshFromStores);
    window.addEventListener('language-updated', refreshFromStores);
    window.addEventListener('storage', refreshFromStores);
    window.addEventListener('gymrat-timer-updated', refreshFromStores as EventListener);
    window.addEventListener('timer-settings-updated', refreshFromStores as EventListener);

    return () => {
      window.removeEventListener('gymrat-profile-updated', refreshFromStores);
      window.removeEventListener('language-updated', refreshFromStores);
      window.removeEventListener('storage', refreshFromStores);
      window.removeEventListener(
        'gymrat-timer-updated',
        refreshFromStores as EventListener,
      );
      window.removeEventListener(
        'timer-settings-updated',
        refreshFromStores as EventListener,
      );
    };
  }, []);

  const parsedHeight = useMemo(() => {
    const value = Number(height);
    return Number.isFinite(value) ? Math.max(100, Math.min(260, Math.round(value))) : null;
  }, [height]);

  const parsedWeight = useMemo(() => {
    const value = Number(weight);
    return Number.isFinite(value) ? Math.max(30, Math.min(300, Math.round(value))) : null;
  }, [weight]);

  const parsedAge = useMemo(() => {
    const value = Number(age);
    return Number.isFinite(value) ? Math.max(13, Math.min(100, Math.round(value))) : null;
  }, [age]);

  const handleSave = () => {
    saveProfile({
      age: parsedAge,
      gender,
      height: parsedHeight,
      weight: parsedWeight,
      goal,
      onboardingComplete: true,
    });

    setTrainingLevel(trainingLevelState);
    setLanguage(language);
    writeTimerSettings({
      restSeconds,
      setSeconds,
      autoLoop,
    });

    setMessage(
      `Saved · ${getLanguageLabel(language)} · Rest ${restSeconds}s · Set ${setSeconds}s`,
    );

    window.setTimeout(() => setMessage(''), 2200);
  };

  const openContact = () => {
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=GymRat%20Contact`;
  };

  const reportBug = () => {
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=GymRat%20Bug%20Report&body=Describe%20what%20happened:%0A%0ADevice:%0AScreen:%0ASteps%20to%20reproduce:%0A`;
  };

  return (
    <div className="min-h-screen bg-black px-5 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/80 transition hover:bg-white/[0.08]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-300/80">
              Settings
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-tight">Control Center</h1>
          <p className="mt-1 text-xs leading-5 text-white/55">
            Compact profile control, timers, training setup, language and support.
          </p>

          <div className="mt-4 space-y-3.5">
            <section className="rounded-[22px] border border-white/10 bg-black/20 p-3.5">
              <SectionTitle
                icon={<User className="h-4 w-4" />}
                title="Core profile"
                subtitle="Age, gender, height, weight and goal."
              />

              <div className="grid gap-2.5 sm:grid-cols-3">
                <CompactInput
                  label="Age"
                  value={age}
                  onChange={setAge}
                  suffix="yrs"
                  icon={<User className="h-3.5 w-3.5" />}
                />
                <CompactInput
                  label="Height"
                  value={height}
                  onChange={setHeight}
                  suffix="cm"
                  icon={<Ruler className="h-3.5 w-3.5" />}
                />
                <CompactInput
                  label="Weight"
                  value={weight}
                  onChange={setWeight}
                  suffix="kg"
                  icon={<Weight className="h-3.5 w-3.5" />}
                />
              </div>

              <div className="mt-2.5">
                <ToggleCard<ProfileGender>
                  value={gender}
                  onChange={setGender}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'non-binary', label: 'Non-binary' },
                  ]}
                />
              </div>
            </section>

            <section className="rounded-[22px] border border-white/10 bg-black/20 p-3.5">
              <SectionTitle
                icon={<Target className="h-4 w-4" />}
                title="Goal"
                subtitle="Used for recommendations and direction."
              />

              <ToggleCard<FitnessGoal>
                value={goal}
                onChange={setGoal}
                options={[
                  { value: 'lose', label: 'Lose fat' },
                  { value: 'maintain', label: 'Maintain' },
                  { value: 'gain', label: 'Build muscle' },
                ]}
              />
            </section>

            <section className="rounded-[22px] border border-white/10 bg-black/20 p-3.5">
              <SectionTitle
                icon={<Dumbbell className="h-4 w-4" />}
                title="Training level"
                subtitle="Controls suggested workout structure."
              />

              <ToggleCard<TrainingLevel>
                value={trainingLevelState}
                onChange={setTrainingLevelState}
                options={[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' },
                ]}
              />
            </section>

            <section className="rounded-[22px] border border-white/10 bg-black/20 p-3.5">
              <SectionTitle
                icon={<Clock3 className="h-4 w-4" />}
                title="Workout timer"
                subtitle="User starts and stops manually. Does not auto-start when a workout begins."
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
                    Rest timer
                  </div>
                  <ToggleCard<string>
                    value={String(restSeconds)}
                    onChange={(value) => setRestSeconds(Number(value))}
                    options={TIMER_OPTIONS.map((seconds) => ({
                      value: String(seconds),
                      label: `${seconds}s`,
                    }))}
                    columns="grid-cols-3"
                  />
                </div>

                <div>
                  <div className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
                    Set timer
                  </div>
                  <ToggleCard<string>
                    value={String(setSeconds)}
                    onChange={(value) => setSetSeconds(Number(value))}
                    options={TIMER_OPTIONS.map((seconds) => ({
                      value: String(seconds),
                      label: `${seconds}s`,
                    }))}
                    columns="grid-cols-3"
                  />
                </div>
              </div>

              <div className="mt-3">
                <ToggleCard<string>
                  value={autoLoop ? 'loop' : 'single'}
                  onChange={(value) => setAutoLoop(value === 'loop')}
                  options={[
                    {
                      value: 'loop',
                      label: 'Auto loop',
                      sublabel: 'Keeps rolling set/rest until user stops it',
                    },
                    {
                      value: 'single',
                      label: 'Single cycle',
                      sublabel: 'One phase at a time until manually changed',
                    },
                  ]}
                  columns="grid-cols-1 sm:grid-cols-2"
                />
              </div>
            </section>

            <section className="rounded-[22px] border border-white/10 bg-black/20 p-3.5">
              <SectionTitle
                icon={<Globe className="h-4 w-4" />}
                title="Language"
                subtitle="App language and labels."
              />

              <ToggleCard<AppLanguage>
                value={language}
                onChange={setLanguageState}
                options={languageOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                columns="grid-cols-2 sm:grid-cols-3"
              />
            </section>

            <section className="rounded-[22px] border border-white/10 bg-black/20 p-3.5">
              <SectionTitle
                icon={<Mail className="h-4 w-4" />}
                title="Support"
                subtitle="Quick access for contact and bug reports."
              />

              <div className="grid gap-2.5">
                <ActionRow
                  icon={<Mail className="h-4 w-4" />}
                  title="Contact"
                  subtitle="Questions, feedback or partnerships"
                  onClick={openContact}
                />
                <ActionRow
                  icon={<Bug className="h-4 w-4" />}
                  title="Report bug"
                  subtitle="Send steps, screen and device details"
                  onClick={reportBug}
                />
              </div>
            </section>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[22px] bg-lime-300 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.2)] transition hover:brightness-105"
          >
            <Save className="h-4 w-4" />
            Save settings
          </button>

          {message ? (
            <div className="mt-3 rounded-2xl border border-lime-400/20 bg-lime-400/10 px-4 py-2.5 text-xs font-bold text-lime-100">
              {message}
            </div>
          ) : null}

          <div className="mt-3 text-[11px] text-white/35">Contact: {CONTACT_EMAIL}</div>
        </div>
      </div>
    </div>
  );
}