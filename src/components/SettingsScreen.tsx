import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Bug,
  ChevronRight,
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
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-lime-300">
        {icon}
      </div>
      <div>
        <div className="text-sm font-black uppercase tracking-[0.14em] text-white">
          {title}
        </div>
        {subtitle ? <div className="mt-1 text-xs text-white/55">{subtitle}</div> : null}
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
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border px-3 py-2.5 text-left transition ${
              active
                ? 'border-lime-400/35 bg-lime-400/12 text-white shadow-[0_0_0_1px_rgba(163,230,53,0.08)]'
                : 'border-white/10 bg-white/[0.04] text-white/75 hover:border-white/20 hover:bg-white/[0.07]'
            }`}
          >
            <div className="text-xs font-black uppercase tracking-[0.12em]">
              {option.label}
            </div>
            {option.sublabel ? (
              <div className="mt-1 text-[11px] leading-4 text-white/55">{option.sublabel}</div>
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
      <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/55">
        {icon}
        {label}
      </div>

      <div className="relative">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 pr-12 text-sm text-white outline-none transition focus:border-lime-400/50"
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-[0.12em] text-white/40">
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
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition hover:bg-white/[0.07]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-lime-300">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-black uppercase tracking-[0.12em] text-white">
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
    <div className="min-h-screen bg-black px-4 pb-6 pt-4 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-4xl flex-col">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-start justify-between gap-3">
            <button
              onClick={onBack}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.05] transition hover:bg-white/[0.08]"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1 text-center">
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-lime-300/80">
                Settings
              </div>
              <h1 className="mt-1 text-2xl font-black tracking-tight">Control center</h1>
              <p className="mt-2 text-sm text-white/62">
                Language, profile, contact, bug report and training direction.
              </p>
            </div>

            <div className="h-11 w-11" />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <SectionTitle
                icon={<User className="h-4 w-4" />}
                title="Profile"
                subtitle="Age, gender, height and weight from onboarding."
              />

              <div className="grid gap-3 sm:grid-cols-3">
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

              <div className="mt-3">
                <ToggleCard
                  value={gender}
                  onChange={setGender}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'non-binary', label: 'Non-binary' },
                  ]}
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <SectionTitle
                icon={<Globe className="h-4 w-4" />}
                title="Language"
                subtitle="App language and labels."
              />

              <ToggleCard
                value={language}
                onChange={setLanguageState}
                options={languageOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                columns="grid-cols-2 sm:grid-cols-3"
              />
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <SectionTitle
                icon={<Target className="h-4 w-4" />}
                title="Training level / goal"
                subtitle="Used for recommendations, structure and nutrition targets."
              />

              <div className="space-y-3">
                <ToggleCard
                  value={goal}
                  onChange={setGoal}
                  options={[
                    { value: 'lose', label: 'Lose fat' },
                    { value: 'maintain', label: 'Maintain' },
                    { value: 'gain', label: 'Build muscle' },
                  ]}
                />

                <ToggleCard
                  value={trainingLevelState}
                  onChange={setTrainingLevelState}
                  options={[
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' },
                  ]}
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <SectionTitle
                icon={<Mail className="h-4 w-4" />}
                title="Support"
                subtitle="Quick contact and bug reporting."
              />

              <div className="space-y-2.5">
                <ActionRow
                  icon={<Mail className="h-4 w-4" />}
                  title="Contact"
                  subtitle="Questions, feedback or partnerships"
                  onClick={openContact}
                />

                <ActionRow
                  icon={<Bug className="h-4 w-4" />}
                  title="Report bug"
                  subtitle="Send screen, steps and device details"
                  onClick={reportBug}
                />

                <ActionRow
                  icon={<Dumbbell className="h-4 w-4" />}
                  title="Training profile"
                  subtitle="Adjust the way the app guides your progression"
                  onClick={() => {}}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-white/45">Contact: {CONTACT_EMAIL}</div>

          <div className="flex items-center gap-3 self-end">
            {message ? <div className="text-sm font-bold text-lime-200">{message}</div> : null}

            <button
              onClick={onBack}
              className="inline-flex min-h-[48px] items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.05] px-5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
            >
              Back to menu
            </button>

            <button
              onClick={handleSave}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[18px] bg-lime-300 px-5 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:brightness-105"
            >
              <Save className="h-4 w-4" />
              Save settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}