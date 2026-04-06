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
const TIMER_KEY = 'gymrat-rest-timer-seconds';
const TIMER_OPTIONS = [45, 60, 75, 90, 120, 150, 180] as const;

function getTimerSeconds(): number {
  if (typeof window === 'undefined') return 90;

  const raw = localStorage.getItem(TIMER_KEY);
  const parsed = Number(raw);

  if (Number.isFinite(parsed) && parsed >= 30 && parsed <= 600) {
    return Math.round(parsed);
  }

  return 90;
}

function setTimerSeconds(value: number) {
  if (typeof window === 'undefined') return;

  const safeValue = Math.max(30, Math.min(600, Math.round(value)));
  localStorage.setItem(TIMER_KEY, String(safeValue));
  window.dispatchEvent(
    new CustomEvent('gymrat-timer-updated', { detail: { seconds: safeValue } }),
  );
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
    <div className="mb-3 flex items-start gap-3">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white">
        {icon}
      </div>

      <div className="min-w-0">
        <div className="text-sm font-black uppercase tracking-[0.12em] text-white">
          {title}
        </div>
        {subtitle ? (
          <div className="mt-1 text-xs leading-5 text-white/55">{subtitle}</div>
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
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              active
                ? 'border-lime-400/35 bg-lime-400/12 text-white shadow-[0_0_0_1px_rgba(163,230,53,0.08)]'
                : 'border-white/10 bg-white/[0.04] text-white/75 hover:border-white/20 hover:bg-white/[0.07]'
            }`}
          >
            <div className="text-sm font-black uppercase tracking-[0.1em]">
              {option.label}
            </div>
            {option.sublabel ? (
              <div className="mt-1 text-[11px] leading-4 text-white/55">
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
      <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/55">
        <span className="text-white/70">{icon}</span>
        {label}
      </div>

      <div className="relative">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 pr-14 text-white outline-none transition focus:border-lime-400/50"
        />
        {suffix ? (
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-black uppercase tracking-[0.12em] text-white/35">
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
      className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition hover:border-white/20 hover:bg-white/[0.07]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-black uppercase tracking-[0.1em] text-white">
          {title}
        </div>
        <div className="mt-1 text-xs leading-5 text-white/55">{subtitle}</div>
      </div>

      <ChevronRight className="h-4 w-4 text-white/35" />
    </button>
  );
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const profile = getProfile();

  const [gender, setGender] = useState<ProfileGender>(profile.gender ?? 'male');
  const [height, setHeight] = useState(
    profile.height ? String(profile.height) : '',
  );
  const [weight, setWeight] = useState(
    profile.weight ? String(profile.weight) : '',
  );
  const [age, setAge] = useState(profile.age ? String(profile.age) : '');
  const [goal, setGoal] = useState<FitnessGoal>(profile.goal ?? 'gain');
  const [trainingLevelState, setTrainingLevelState] =
    useState<TrainingLevel>(getTrainingLevel());
  const [language, setLanguageState] = useState<AppLanguage>(getLanguage());
  const [timerSeconds, setTimerSecondsState] = useState<number>(getTimerSeconds());
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
      setTimerSecondsState(getTimerSeconds());
    };

    window.addEventListener('gymrat-profile-updated', refreshFromStores);
    window.addEventListener('language-updated', refreshFromStores);
    window.addEventListener('storage', refreshFromStores);
    window.addEventListener('gymrat-timer-updated', refreshFromStores as EventListener);

    return () => {
      window.removeEventListener('gymrat-profile-updated', refreshFromStores);
      window.removeEventListener('language-updated', refreshFromStores);
      window.removeEventListener('storage', refreshFromStores);
      window.removeEventListener(
        'gymrat-timer-updated',
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
    setTimerSeconds(timerSeconds);

    setMessage(
      `Saved · ${getLanguageLabel(language)} · ${Math.round(timerSeconds)}s timer`,
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
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/80 transition hover:bg-white/[0.08]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mt-5 rounded-[30px] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-lime-300/80">
            Settings
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Control Center</h1>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Compact profile control, training setup, timer, language and support.
          </p>

          <div className="mt-6 space-y-5">
            <section className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <SectionTitle
                icon={<User className="h-5 w-5" />}
                title="Core profile"
                subtitle="Age, gender, height, weight and goal in one compact block."
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <CompactInput
                  label="Age"
                  value={age}
                  onChange={setAge}
                  suffix="yrs"
                  icon={<User className="h-4 w-4" />}
                />
                <CompactInput
                  label="Height"
                  value={height}
                  onChange={setHeight}
                  suffix="cm"
                  icon={<Ruler className="h-4 w-4" />}
                />
                <CompactInput
                  label="Weight"
                  value={weight}
                  onChange={setWeight}
                  suffix="kg"
                  icon={<Weight className="h-4 w-4" />}
                />
              </div>

              <div className="mt-3">
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

            <section className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <SectionTitle
                icon={<Target className="h-5 w-5" />}
                title="Goal"
                subtitle="Used for overall direction and recommendations."
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

            <section className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <SectionTitle
                icon={<Dumbbell className="h-5 w-5" />}
                title="Training level"
                subtitle="Controls the base level of suggested workout structure."
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

            <section className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <SectionTitle
                icon={<Clock3 className="h-5 w-5" />}
                title="Timer"
                subtitle="Default rest timer used by the app."
              />

              <ToggleCard<string>
                value={String(timerSeconds)}
                onChange={(value) => setTimerSecondsState(Number(value))}
                options={TIMER_OPTIONS.map((seconds) => ({
                  value: String(seconds),
                  label: `${seconds}s`,
                }))}
                columns="grid-cols-3 sm:grid-cols-4"
              />
            </section>

            <section className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <SectionTitle
                icon={<Globe className="h-5 w-5" />}
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

            <section className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <SectionTitle
                icon={<Mail className="h-5 w-5" />}
                title="Support"
                subtitle="Quick access for contact and bug reports."
              />

              <div className="grid gap-3">
                <ActionRow
                  icon={<Mail className="h-5 w-5" />}
                  title="Contact"
                  subtitle="Questions, feedback or partnerships"
                  onClick={openContact}
                />
                <ActionRow
                  icon={<Bug className="h-5 w-5" />}
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
            className="mt-6 inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[24px] bg-lime-300 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_50px_rgba(163,230,53,0.2)] transition hover:brightness-105"
          >
            <Save className="h-4 w-4" />
            Save settings
          </button>

          {message ? (
            <div className="mt-3 rounded-2xl border border-lime-400/20 bg-lime-400/10 px-4 py-3 text-sm font-bold text-lime-100">
              {message}
            </div>
          ) : null}

          <div className="mt-4 text-xs text-white/35">Contact: {CONTACT_EMAIL}</div>
        </div>
      </div>
    </div>
  );
}