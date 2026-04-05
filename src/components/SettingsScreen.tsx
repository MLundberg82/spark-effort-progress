import { useEffect, useMemo, useState } from 'react';
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
  type TrainingGoal,
  type TrainingLevel,
  type UserGender,
} from '@/lib/profileStore';
import { setTrainingLevel } from '@/lib/trainingStore';
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
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/90">
        {icon}
      </div>
      <div>
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">
          {title}
        </div>
        {subtitle ? <p className="mt-1 text-sm text-white/55">{subtitle}</p> : null}
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
            <div className="text-sm font-black">{option.label}</div>
            {option.sublabel ? (
              <div className="mt-1 text-xs text-white/45">{option.sublabel}</div>
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
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3">
      <div className="mb-2 flex items-center gap-2 text-white/45">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-black/20">
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>

      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 pr-14 text-white outline-none transition focus:border-lime-400/50"
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-white/35">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ActionRow({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:border-white/20 hover:bg-white/[0.07] active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white/90">
          {icon}
        </div>
        <div>
          <div className="text-sm font-black uppercase tracking-[0.1em] text-white">
            {title}
          </div>
          <div className="mt-1 text-sm text-white/50">{subtitle}</div>
        </div>
      </div>

      <ChevronRight className="h-4 w-4 text-white/35" />
    </button>
  );
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const profile = getProfile();

  const [gender, setGender] = useState<UserGender>(profile?.gender ?? 'male');
  const [height, setHeight] = useState(String(profile?.height ?? 180));
  const [weight, setWeight] = useState(String(profile?.weight ?? 75));
  const [goal, setGoal] = useState<TrainingGoal>(profile?.goal ?? 'maintain');
  const [trainingLevel, setTrainingLevelState] = useState<TrainingLevel>(
    profile?.trainingLevel ?? 'beginner',
  );
  const [language, setLanguageState] = useState<AppLanguage>(getLanguage());
  const [message, setMessage] = useState('');

  useEffect(() => {
    const refreshFromStore = () => {
      const current = getProfile();
      setGender(current?.gender ?? 'male');
      setHeight(String(current?.height ?? 180));
      setWeight(String(current?.weight ?? 75));
      setGoal(current?.goal ?? 'maintain');
      setTrainingLevelState(current?.trainingLevel ?? 'beginner');
      setLanguageState(getLanguage());
    };

    window.addEventListener('profile-updated', refreshFromStore);
    window.addEventListener('language-updated', refreshFromStore);

    return () => {
      window.removeEventListener('profile-updated', refreshFromStore);
      window.removeEventListener('language-updated', refreshFromStore);
    };
  }, []);

  const parsedHeight = useMemo(() => {
    const value = Number(height);
    return Number.isFinite(value)
      ? Math.max(120, Math.min(250, Math.round(value)))
      : 180;
  }, [height]);

  const parsedWeight = useMemo(() => {
    const value = Number(weight);
    return Number.isFinite(value)
      ? Math.max(35, Math.min(300, Math.round(value)))
      : 75;
  }, [weight]);

  const handleSave = () => {
    const current = getProfile();

    saveProfile({
      age: current?.age ?? 25,
      gender,
      height: parsedHeight,
      weight: parsedWeight,
      goal,
      trainingLevel,
    });

    setTrainingLevel(trainingLevel);
    setLanguage(language);
    setMessage(`Saved · ${getLanguageLabel(language)}`);
  };

  const openContact = () => {
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=GymRat%20Contact`;
  };

  const reportBug = () => {
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=GymRat%20Bug%20Report&body=Describe%20what%20happened:%0A%0ADevice:%0AScreen:%0ASteps%20to%20reproduce:%0A`;
  };

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,rgba(132,204,22,0.12),transparent_28%),linear-gradient(180deg,#050505_0%,#0d0d0f_100%)] px-4 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-md">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
            Settings
          </div>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.02em] text-white">
            Control Center
          </h1>
          <p className="mt-2 text-sm text-white/55">
            Compact profile control, training setup, language and support.
          </p>
        </div>

        <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <SectionTitle
            icon={<User className="h-5 w-5" />}
            title="Core profile"
            subtitle="Gender, height and weight should stay compact here."
          />

          <ToggleCard
            value={gender}
            onChange={setGender}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'non-binary', label: 'Non-binary' },
            ]}
          />

          <div className="mt-3 grid grid-cols-2 gap-3">
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
        </div>

        <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <SectionTitle
            icon={<Target className="h-5 w-5" />}
            title="Goal"
            subtitle="Nutrition and recommendations should follow this."
          />

          <ToggleCard
            value={goal}
            onChange={setGoal}
            columns="grid-cols-1"
            options={[
              {
                value: 'lose',
                label: 'Cut',
                sublabel: 'Lean down while keeping protein high',
              },
              {
                value: 'maintain',
                label: 'Maintain',
                sublabel: 'Stay stable and keep momentum',
              },
              {
                value: 'build',
                label: 'Build',
                sublabel: 'Push growth, recovery and progression',
              },
            ]}
          />
        </div>

        <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <SectionTitle
            icon={<Dumbbell className="h-5 w-5" />}
            title="Training setup"
            subtitle="Recommended passes should use this as baseline."
          />

          <ToggleCard
            value={trainingLevel}
            onChange={setTrainingLevelState}
            columns="grid-cols-1"
            options={[
              {
                value: 'beginner',
                label: 'Beginner',
                sublabel: 'Simple structure and lower friction',
              },
              {
                value: 'intermediate',
                label: 'Intermediate',
                sublabel: 'Balanced split with stronger progression feel',
              },
              {
                value: 'advanced',
                label: 'Advanced',
                sublabel: 'Harder setup and more serious identity',
              },
            ]}
          />
        </div>

        <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <SectionTitle
            icon={<Globe className="h-5 w-5" />}
            title="Language"
            subtitle="App language and labels."
          />

          <ToggleCard
            value={language}
            onChange={setLanguageState}
            columns="grid-cols-1 sm:grid-cols-2"
            options={languageOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
        </div>

        <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <SectionTitle
            icon={<Mail className="h-5 w-5" />}
            title="Support"
            subtitle="Quick access for contact and bug reports."
          />

          <div className="space-y-3">
            <ActionRow
              icon={<Mail className="h-5 w-5" />}
              title="Contact"
              subtitle="Questions, feedback or partnership"
              onClick={openContact}
            />
            <ActionRow
              icon={<Bug className="h-5 w-5" />}
              title="Report bug"
              subtitle="Send steps and screen details"
              onClick={reportBug}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-[24px] bg-lime-300 px-4 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[0_20px_50px_rgba(163,230,53,0.18)] transition hover:brightness-105 active:scale-[0.99]"
        >
          <Save className="h-4 w-4" />
          Save settings
        </button>

        {message ? (
          <div className="mt-3 rounded-2xl border border-lime-400/20 bg-lime-400/10 px-4 py-3 text-sm font-semibold text-lime-200">
            {message}
          </div>
        ) : null}

        <div className="mt-4 text-center text-xs text-white/35">
          Contact: {CONTACT_EMAIL}
        </div>
      </div>
    </div>
  );
}