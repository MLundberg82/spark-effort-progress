import { useMemo, useState } from 'react';
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

function SelectCard<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
              active
                ? 'border-lime-400/30 bg-lime-400/12 text-white'
                : 'border-white/10 bg-white/[0.04] text-white/75 hover:border-white/20 hover:bg-white/[0.07]'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function InputBlock({
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
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-3 flex items-center gap-2 text-white/45">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/20">
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
    setMessage(`Saved. Language: ${getLanguageLabel(language)}`);
  };

  const openContact = () => {
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=GymRat%20Contact`;
  };

  const reportBug = () => {
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=GymRat%20Bug%20Report&body=Describe%20what%20happened:%0A%0ADevice:%0AApp%20screen:%0ASteps%20to%20reproduce:%0A`;
  };

  return (
    <div className="min-h-[100dvh] bg-[linear-gradient(180deg,#060606_0%,#0d0d0d_100%)] px-4 pb-8 pt-6 text-white">
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
            Identity, progression setup, language and support in one place.
          </p>
        </div>

        <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <SectionTitle
            icon={<User className="h-5 w-5" />}
            title="Identity"
            subtitle="This decides which rat variant the app should use."
          />

          <SelectCard
            value={gender}
            onChange={setGender}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'non-binary', label: 'Non-binary' },
            ]}
          />
        </div>

        <div className="mt-4 grid gap-4">
          <InputBlock
            label="Height"
            value={height}
            onChange={setHeight}
            suffix="cm"
            icon={<Ruler className="h-4 w-4" />}
          />

          <InputBlock
            label="Weight"
            value={weight}
            onChange={setWeight}
            suffix="kg"
            icon={<Weight className="h-4 w-4" />}
          />
        </div>

        <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <SectionTitle
            icon={<Target className="h-5 w-5" />}
            title="Goal"
            subtitle="Controls the main direction of the app."
          />

          <SelectCard
            value={goal}
            onChange={setGoal}
            options={[
              { value: 'lose', label: 'Lose' },
              { value: 'maintain', label: 'Maintain' },
              { value: 'build', label: 'Build' },
            ]}
          />
        </div>

        <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <SectionTitle
            icon={<Dumbbell className="h-5 w-5" />}
            title="Training setup"
            subtitle="Controls the kind of workout plan the app prepares."
          />

          <SelectCard
            value={trainingLevel}
            onChange={setTrainingLevelState}
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
          />
        </div>

        <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <SectionTitle
            icon={<Globe className="h-5 w-5" />}
            title="Language"
            subtitle="Stored now so the app can use this preference next."
          />

          <SelectCard
            value={language}
            onChange={setLanguageState}
            options={languageOptions}
          />
        </div>

        <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <SectionTitle
            icon={<Mail className="h-5 w-5" />}
            title="Support"
            subtitle="Direct access from inside the app."
          />

          <div className="space-y-3">
            <ActionRow
              icon={<Mail className="h-4 w-4" />}
              title="Contact"
              subtitle={CONTACT_EMAIL}
              onClick={openContact}
            />

            <ActionRow
              icon={<Bug className="h-4 w-4" />}
              title="Report bug"
              subtitle="Open a mail draft with bug-report subject"
              onClick={reportBug}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="mt-4 flex h-16 w-full items-center justify-center gap-2 rounded-[24px] border border-lime-400/25 bg-[linear-gradient(180deg,rgba(124,255,107,0.22),rgba(124,255,107,0.12))] text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-lime-300/45 hover:bg-[linear-gradient(180deg,rgba(124,255,107,0.3),rgba(124,255,107,0.16))] active:scale-[0.99]"
        >
          <Save className="h-4 w-4" />
          Save Settings
        </button>

        {message ? (
          <div className="mt-3 rounded-2xl border border-lime-400/20 bg-lime-400/10 px-4 py-3 text-sm font-semibold text-lime-200">
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
}