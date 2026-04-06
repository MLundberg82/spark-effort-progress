import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Bug,
  ChevronRight,
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
    <div className="mb-3 flex items-start gap-2.5">
      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04] text-lime-300">
        {icon}
      </div>

      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-white">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-xs leading-5 text-white/55">{subtitle}</p>
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
            className={`rounded-[18px] border px-3 py-2 text-left transition ${
              active
                ? 'border-lime-400/35 bg-lime-400/12 text-white shadow-[0_0_0_1px_rgba(163,230,53,0.08)]'
                : 'border-white/10 bg-white/[0.04] text-white/75 hover:border-white/20 hover:bg-white/[0.07]'
            }`}
          >
            <div className="text-sm font-semibold">{option.label}</div>
            {option.sublabel ? (
              <div className="mt-0.5 text-[11px] leading-4 text-white/45">
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
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/42">
        {icon}
        <span>{label}</span>
      </div>

      <div className="relative">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-[16px] border border-white/10 bg-zinc-950 px-3 py-2 pr-11 text-sm text-white outline-none transition focus:border-lime-400/50"
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-white/35">
            {suffix}
          </span>
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
      className="flex w-full items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-left transition hover:border-white/20 hover:bg-white/[0.07]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[16px] border border-white/10 bg-zinc-950 text-lime-300">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="mt-0.5 text-[11px] leading-4 text-white/50">{subtitle}</div>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-white/28" />
    </button>
  );
}

const genderOptions: { value: ProfileGender; label: string; sublabel: string }[] = [
  { value: 'male', label: 'Male', sublabel: 'Masculine rat visuals' },
  { value: 'female', label: 'Female', sublabel: 'Feminine rat visuals' },
  {
    value: 'non-binary',
    label: 'Non-binary',
    sublabel: 'Inclusive rat visuals',
  },
];

const goalOptions: { value: FitnessGoal; label: string; sublabel: string }[] = [
  { value: 'lose', label: 'Lose', sublabel: 'Cutting / fat loss' },
  { value: 'maintain', label: 'Maintain', sublabel: 'Consistency / balance' },
  { value: 'gain', label: 'Gain', sublabel: 'Muscle / size / strength' },
];

const trainingLevelOptions: {
  value: TrainingLevel;
  label: string;
  sublabel: string;
}[] = [
  { value: 'beginner', label: 'Beginner', sublabel: 'Simple structure and guidance' },
  {
    value: 'intermediate',
    label: 'Intermediate',
    sublabel: 'Balanced volume and progression',
  },
  { value: 'advanced', label: 'Advanced', sublabel: 'Higher training demand' },
];

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const profile = getProfile();

  const [gender, setGender] = useState<ProfileGender>(profile.gender ?? 'male');
  const [height, setHeight] = useState(profile.height ? String(profile.height) : '');
  const [weight, setWeight] = useState(profile.weight ? String(profile.weight) : '');
  const [age, setAge] = useState(profile.age ? String(profile.age) : '');
  const [goal, setGoal] = useState<FitnessGoal>(profile.goal ?? 'gain');
  const [trainingLevelState, setTrainingLevelState] = useState<TrainingLevel>(
    getTrainingLevel(),
  );
  const [language, setLanguageState] = useState<AppLanguage>(getLanguage());
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
    };

    window.addEventListener('gymrat-profile-updated', refreshFromStores);
    window.addEventListener('language-updated', refreshFromStores);
    window.addEventListener('storage', refreshFromStores);

    return () => {
      window.removeEventListener('gymrat-profile-updated', refreshFromStores);
      window.removeEventListener('language-updated', refreshFromStores);
      window.removeEventListener('storage', refreshFromStores);
    };
  }, []);

  const parsedHeight = useMemo(() => {
    const value = Number(height);
    return Number.isFinite(value)
      ? Math.max(100, Math.min(260, Math.round(value)))
      : null;
  }, [height]);

  const parsedWeight = useMemo(() => {
    const value = Number(weight);
    return Number.isFinite(value)
      ? Math.max(30, Math.min(300, Math.round(value)))
      : null;
  }, [weight]);

  const parsedAge = useMemo(() => {
    const value = Number(age);
    return Number.isFinite(value)
      ? Math.max(13, Math.min(100, Math.round(value)))
      : null;
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
    setMessage(`Saved · ${getLanguageLabel(language)} · ${trainingLevelState}`);

    window.setTimeout(() => setMessage(''), 2200);
  };

  const openContact = () => {
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=GymRat%20Contact`;
  };

  const reportBug = () => {
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=GymRat%20Bug%20Report&body=Describe%20what%20happened:%0A%0ADevice:%0AScreen:%0ASteps%20to%20reproduce:%0A`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-28 pt-4 sm:px-6">
        <div className="mb-4 rounded-[24px] border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-950 to-lime-950/20 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.32)]">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-lime-300">
            <User className="h-3.5 w-3.5" />
            Settings
          </div>

          <h1 className="text-[28px] font-black tracking-tight text-white">Settings</h1>
          <p className="mt-1.5 max-w-xl text-xs leading-5 text-white/58">
            Profile, language, support and training direction.
          </p>
        </div>

        <div className="space-y-3">
          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-3.5 sm:p-4">
            <SectionTitle
              icon={<User className="h-4.5 w-4.5" />}
              title="Profile"
              subtitle="Compact core profile values."
            />

            <div className="grid grid-cols-2 gap-2.5">
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
              <CompactInput
                label="Age"
                value={age}
                onChange={setAge}
                icon={<User className="h-3.5 w-3.5" />}
              />

              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/42">
                  <User className="h-3.5 w-3.5" />
                  <span>Gender</span>
                </div>

                <ToggleCard<ProfileGender>
                  value={gender}
                  onChange={(value) => setGender(value)}
                  options={genderOptions}
                  columns="grid-cols-1"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-3.5 sm:p-4">
            <SectionTitle
              icon={<Globe className="h-4.5 w-4.5" />}
              title="Language"
              subtitle="App language."
            />

            <ToggleCard<AppLanguage>
              value={language}
              onChange={(value) => setLanguageState(value)}
              options={languageOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              columns="grid-cols-2 sm:grid-cols-3"
            />
          </section>

          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-3.5 sm:p-4">
            <SectionTitle
              icon={<Target className="h-4.5 w-4.5" />}
              title="Training"
              subtitle="Goal and level."
            />

            <div className="grid gap-3">
              <div>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/42">
                  Goal
                </div>
                <ToggleCard<FitnessGoal>
                  value={goal}
                  onChange={(value) => setGoal(value)}
                  options={goalOptions}
                  columns="grid-cols-1 sm:grid-cols-3"
                />
              </div>

              <div>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/42">
                  Training level
                </div>
                <ToggleCard<TrainingLevel>
                  value={trainingLevelState}
                  onChange={(value) => setTrainingLevelState(value)}
                  options={trainingLevelOptions}
                  columns="grid-cols-1 sm:grid-cols-3"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-3.5 sm:p-4">
            <SectionTitle
              icon={<Mail className="h-4.5 w-4.5" />}
              title="Support"
              subtitle="Contact and bug reporting."
            />

            <div className="grid gap-2.5">
              <ActionRow
                icon={<Mail className="h-4.5 w-4.5" />}
                title="Contact"
                subtitle="Questions, feedback or partnerships"
                onClick={openContact}
              />
              <ActionRow
                icon={<Bug className="h-4.5 w-4.5" />}
                title="Report bug"
                subtitle="Send screen, steps and device details"
                onClick={reportBug}
              />
            </div>
          </section>
        </div>

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/92 to-transparent px-4 pb-5 pt-8 sm:px-6">
          <div className="pointer-events-auto mx-auto flex w-full max-w-3xl items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex flex-1 items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex flex-[1.15] items-center justify-center gap-2 rounded-[18px] border border-lime-400/30 bg-lime-400/15 px-4 py-3 text-sm font-semibold text-lime-200 transition hover:border-lime-300/40 hover:bg-lime-400/20"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
          </div>

          {message ? (
            <div className="mx-auto mt-3 w-full max-w-3xl rounded-[18px] border border-lime-400/20 bg-lime-400/10 px-4 py-3 text-center text-sm font-medium text-lime-200">
              {message}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}