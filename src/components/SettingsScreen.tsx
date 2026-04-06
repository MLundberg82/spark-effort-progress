import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Globe,
  Mail,
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
    <section className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4 shadow-[0_12px_34px_rgba(0,0,0,0.18)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/[0.06] text-white/80">
          {icon}
        </span>
        <h2 className="text-sm font-black tracking-tight text-white">{title}</h2>
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
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              'rounded-[18px] border px-3 py-2.5 text-sm font-bold transition',
              active
                ? 'border-lime-300/30 bg-lime-300/12 text-white'
                : 'border-white/10 bg-white/[0.04] text-white/70 hover:text-white',
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
    <label className="rounded-[18px] border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
        {icon}
        <span>{label}</span>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          inputMode="decimal"
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/25"
          placeholder={suffix ? `0 ${suffix}` : '0'}
        />
        {suffix ? <span className="text-xs text-white/45">{suffix}</span> : null}
      </div>
    </label>
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
  const [language, setLanguageState] = useState<string>(getLanguage());
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
    setSaved(true);

    window.dispatchEvent(new CustomEvent('profile-updated'));
    window.dispatchEvent(new CustomEvent('gymrat-profile-updated'));
  };

  return (
    <div className="min-h-[100dvh] bg-[#06080b] text-white">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-5 pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/[0.09]"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-lime-300/70">
              Settings
            </p>
            <h1 className="text-lg font-black tracking-tight">Profile & app</h1>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-lime-300 via-emerald-400 to-yellow-300 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-black transition hover:brightness-105"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto pb-1">
          <SectionCard title="Body" icon={<User className="h-4.5 w-4.5" />}>
            <div className="grid grid-cols-2 gap-2">
              <CompactInput
                label="Height"
                icon={<Ruler className="h-3.5 w-3.5" />}
                value={height}
                onChange={setHeight}
                suffix="cm"
              />
              <CompactInput
                label="Weight"
                icon={<Weight className="h-3.5 w-3.5" />}
                value={weight}
                onChange={setWeight}
                suffix="kg"
              />
              <CompactInput
                label="Age"
                icon={<User className="h-3.5 w-3.5" />}
                value={age}
                onChange={setAge}
              />
              <div className="rounded-[18px] border border-white/10 bg-white/[0.04] px-3 py-2.5">
                <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                  Gender
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <select
                    value={gender}
                    onChange={(event) => setGender(event.target.value as GenderOption)}
                    className="rounded-[14px] border border-white/10 bg-black/20 px-3 py-2 text-sm font-semibold text-white outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Training" icon={<Target className="h-4.5 w-4.5" />}>
            <div className="space-y-2">
              <ToggleGrid<GoalOption>
                value={goal}
                onChange={setGoal}
                options={[
                  { value: 'lose', label: 'Lose' },
                  { value: 'maintain', label: 'Maintain' },
                  { value: 'gain', label: 'Gain' },
                ]}
              />

              <ToggleGrid<TrainingLevelOption>
                value={trainingLevel}
                onChange={setTrainingLevelState}
                options={[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' },
                ]}
              />
            </div>
          </SectionCard>

          <SectionCard title="Language" icon={<Globe className="h-4.5 w-4.5" />}>
            <div className="grid grid-cols-2 gap-2">
              {languageOptions.map((option) => {
                const active = option.value === language;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setLanguageState(option.value)}
                    className={[
                      'rounded-[18px] border px-3 py-2.5 text-sm font-bold transition',
                      active
                        ? 'border-lime-300/30 bg-lime-300/12 text-white'
                        : 'border-white/10 bg-white/[0.04] text-white/70 hover:text-white',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Support" icon={<Mail className="h-4.5 w-4.5" />}>
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

        {saved ? (
          <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-lime-300/25 bg-lime-300/12 px-4 py-2 text-sm font-bold text-lime-100 shadow-[0_10px_28px_rgba(132,204,22,0.15)]">
            Saved
          </div>
        ) : null}
      </div>
    </div>
  );
}