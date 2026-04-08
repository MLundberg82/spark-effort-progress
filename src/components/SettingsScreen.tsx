import { useMemo, useState } from 'react';
import { ArrowLeft, Globe, Ruler, Target, User, Weight } from 'lucide-react';
import {
  getLanguage,
  languageOptions,
  setLanguage,
  type AppLanguage,
} from '@/lib/languageStore';
import {
  getProfile,
  saveProfile,
  type FitnessGoal,
  type ProfileGender,
} from '@/lib/profileStore';
import { getTrainingLevel, setTrainingLevel } from '@/lib/trainingStore';
import type { TrainingLevel } from '@/lib/exerciseData';

type SettingsScreenProps = {
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
            <User className="h-3.5 w-3.5 text-lime-300" />
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
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-white/10 bg-black/28 p-4">
      <div className="mb-3 flex items-center gap-2 text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-lime-300">
          {icon}
        </div>
        <h2 className="text-sm font-bold tracking-[-0.02em] text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ToggleGrid<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={[
              'rounded-[14px] border px-3 py-2.5 text-sm font-bold transition',
              active
                ? 'border-lime-300/28 bg-lime-300/[0.14] text-white'
                : 'border-white/14 bg-black/40 text-white/86 hover:bg-black/48 hover:text-white',
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
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-2 rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">
        <span className="text-lime-300">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ''))}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/30"
          placeholder={suffix ? `0 ${suffix}` : '0'}
        />
        {suffix ? <span className="text-xs font-semibold text-white/40">{suffix}</span> : null}
      </div>
    </label>
  );
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const initialProfile = useMemo(() => getProfile(), []);
  const initialTrainingLevel = useMemo(() => getTrainingLevel(), []);
  const initialLanguage = useMemo(() => getLanguage(), []);

  const [height, setHeight] = useState(String(initialProfile.height ?? ''));
  const [weight, setWeight] = useState(String(initialProfile.weight ?? ''));
  const [age, setAge] = useState(String(initialProfile.age ?? ''));
  const [gender, setGender] = useState(initialProfile.gender);
  const [goal, setGoal] = useState(initialProfile.goal);
  const [trainingLevelState, setTrainingLevelState] = useState(initialTrainingLevel);
  const [languageState, setLanguageState] = useState(initialLanguage);
  const [saved, setSaved] = useState(false);

  const showSaved = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  };

  const persistProfile = (partial?: {
    height?: string;
    weight?: string;
    age?: string;
    gender?: ProfileGender;
    goal?: FitnessGoal;
  }) => {
    const nextHeight = partial?.height ?? height;
    const nextWeight = partial?.weight ?? weight;
    const nextAge = partial?.age ?? age;
    const nextGender = partial?.gender ?? gender;
    const nextGoal = partial?.goal ?? goal;

    saveProfile({
      height: nextHeight ? Number(nextHeight) : null,
      weight: nextWeight ? Number(nextWeight) : null,
      age: nextAge ? Number(nextAge) : null,
      gender: nextGender,
      goal: nextGoal,
      onboardingComplete: true,
    });
    showSaved();
  };

  const persistTrainingLevel = (value: TrainingLevel) => {
    setTrainingLevel(value);
    setTrainingLevelState(value);
    showSaved();
  };

  const persistLanguage = (value: AppLanguage) => {
    setLanguage(value);
    setLanguageState(value);
    showSaved();
  };

  return (
    <ScreenShell
      eyebrow="Profile"
      title="Profile & app"
      subtitle="Keep your profile and defaults clean, compact and synced."
      onBack={onBack}
      saved={saved}
    >
      <div className="space-y-4">
        <SectionCard title="Body stats" icon={<Ruler className="h-4 w-4" />}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <CompactInput
              label="Height"
              icon={<Ruler className="h-3.5 w-3.5" />}
              value={height}
              onChange={(value) => {
                setHeight(value);
                persistProfile({ height: value });
              }}
              suffix="cm"
            />
            <CompactInput
              label="Weight"
              icon={<Weight className="h-3.5 w-3.5" />}
              value={weight}
              onChange={(value) => {
                setWeight(value);
                persistProfile({ weight: value });
              }}
              suffix="kg"
            />
            <CompactInput
              label="Age"
              icon={<User className="h-3.5 w-3.5" />}
              value={age}
              onChange={(value) => {
                setAge(value);
                persistProfile({ age: value });
              }}
            />
          </div>
        </SectionCard>

        <SectionCard title="Identity" icon={<User className="h-4 w-4" />}>
          <div className="space-y-3">
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">Gender</span>
              <select
                value={gender}
                onChange={(event) => {
                  const value = event.target.value as ProfileGender;
                  setGender(value);
                  persistProfile({ gender: value });
                }}
                className="w-full rounded-[14px] border border-white/14 bg-black/40 px-3 py-3 text-sm font-semibold text-white outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="nonbinary">Non-binary</option>
              </select>
            </label>

            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">Goal</div>
              <ToggleGrid
                value={goal}
                onChange={(value) => {
                  setGoal(value);
                  persistProfile({ goal: value });
                }}
                options={[
                  { value: 'gain', label: 'Build muscle' },
                  { value: 'lose', label: 'Lose fat' },
                  { value: 'maintain', label: 'Maintain' },
                ]}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Training level" icon={<Target className="h-4 w-4" />}>
          <ToggleGrid
            value={trainingLevelState}
            onChange={persistTrainingLevel}
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
          />
        </SectionCard>

        <SectionCard title="Language" icon={<Globe className="h-4 w-4" />}>
          <ToggleGrid
            value={languageState}
            onChange={persistLanguage}
            options={languageOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
        </SectionCard>
      </div>
    </ScreenShell>
  );
}
