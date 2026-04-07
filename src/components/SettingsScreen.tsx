import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Globe,
  Mail,
  Ruler,
  Target,
  User,
  Weight,
} from 'lucide-react';

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

const CONTACT_EMAIL = 'hello@getgymrat.com';

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
    <section className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/75">
          {icon}
        </div>
        <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">
          {title}
        </h2>
      </div>

      <div className="space-y-3">{children}</div>
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
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              'rounded-[14px] border px-3 py-2.5 text-sm font-bold transition',
              active
                ? 'border-lime-300/28 bg-lime-300/[0.10] text-white'
                : 'border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.06] hover:text-white',
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
    <label className="flex min-h-[52px] items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.04] px-3.5 py-3">
      <div className="shrink-0 text-white/58">{icon}</div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 text-[11px] font-black uppercase tracking-[0.14em] text-white/45">
          {label}
        </div>
        <div className="flex items-center gap-2">
          <input
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

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const initialProfile = useMemo(() => getProfile(), []);
  const initialTrainingLevel = useMemo(() => getTrainingLevel(), []);
  const initialLanguage = useMemo(() => getLanguage(), []);

  const [height, setHeight] = useState(String(initialProfile.height ?? ''));
  const [weight, setWeight] = useState(String(initialProfile.weight ?? ''));
  const [age, setAge] = useState(String(initialProfile.age ?? ''));
  const [gender, setGender] = useState<ProfileGender>(initialProfile.gender);
  const [goal, setGoal] = useState<FitnessGoal>(initialProfile.goal);
  const [trainingLevelState, setTrainingLevelState] =
    useState<TrainingLevel>(initialTrainingLevel);
  const [languageState, setLanguageState] =
    useState<AppLanguage>(initialLanguage);
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
                Settings
              </div>
              <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white">
                Profile &amp; app
              </h1>
              <p className="mt-1 text-sm text-white/55">
                Tighter layout, cleaner controls, production-safe state updates.
              </p>
            </div>
          </div>

          {saved ? (
            <div className="rounded-[14px] border border-lime-300/25 bg-lime-300/[0.10] px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-lime-100">
              Saved
            </div>
          ) : null}
        </div>

        <SectionCard title="Body stats" icon={<User className="h-4.5 w-4.5" />}>
          <div className="grid gap-2 sm:grid-cols-3">
            <CompactInput
              label="Height"
              icon={<Ruler className="h-4 w-4" />}
              value={height}
              onChange={(value) => {
                setHeight(value);
                persistProfile({ height: value });
              }}
              suffix="cm"
            />

            <CompactInput
              label="Weight"
              icon={<Weight className="h-4 w-4" />}
              value={weight}
              onChange={(value) => {
                setWeight(value);
                persistProfile({ weight: value });
              }}
              suffix="kg"
            />

            <CompactInput
              label="Age"
              icon={<User className="h-4 w-4" />}
              value={age}
              onChange={(value) => {
                setAge(value);
                persistProfile({ age: value });
              }}
            />
          </div>

          <div>
            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/45">
              Gender
            </div>
            <select
              value={gender}
              onChange={(event) => {
                const value = event.target.value as ProfileGender;
                setGender(value);
                persistProfile({ gender: value });
              }}
              className="w-full rounded-[14px] border border-white/10 bg-black/20 px-3 py-2 text-sm font-semibold text-white outline-none"
            >
<ToggleGrid<FitnessGoal>
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
            </select>
          </div>

          <div>
            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/45">
              Goal
            </div>
            <ToggleGrid<FitnessGoal>
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
        </SectionCard>

        <SectionCard
          title="Training level"
          icon={<Target className="h-4.5 w-4.5" />}
        >
          <ToggleGrid<TrainingLevel>
            value={trainingLevelState}
            onChange={persistTrainingLevel}
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
          />
        </SectionCard>

        <SectionCard title="Language" icon={<Globe className="h-4.5 w-4.5" />}>
          <ToggleGrid<AppLanguage>
            value={languageState}
            onChange={persistLanguage}
            options={languageOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
        </SectionCard>

        <SectionCard title="Contact" icon={<Mail className="h-4.5 w-4.5" />}>
          <div className="rounded-[16px] border border-white/10 bg-white/[0.04] px-3.5 py-3">
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white/45">
              Support
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-1 block text-sm font-semibold text-white hover:text-lime-200"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}