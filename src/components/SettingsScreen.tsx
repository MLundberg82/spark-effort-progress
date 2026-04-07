import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Clock3,
  Globe,
  Mail,
  RotateCcw,
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
import {
  getTimerSettings,
  resetWorkoutTimerToPhase,
  setTimerSettings,
  type TimerSettings,
} from '@/lib/timerStore';
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
    <section className="rounded-[22px] border border-white/10 bg-[#0b0b0b] p-4 shadow-[0_12px_34px_rgba(0,0,0,0.22)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.04] text-white/80">
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
    <label className="rounded-[16px] border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
        {icon}
        {label}
      </div>

      <div className="mt-1.5 flex items-center gap-2">
        <input
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ''))}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/25"
          placeholder={suffix ? `0 ${suffix}` : '0'}
        />
        {suffix ? <span className="text-xs text-white/45">{suffix}</span> : null}
      </div>
    </label>
  );
}

function TimerChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-[14px] border px-3 py-2 text-sm font-bold transition',
        active
          ? 'border-lime-300/30 bg-lime-300/[0.10] text-white'
          : 'border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.06] hover:text-white',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const initialProfile = useMemo(() => getProfile(), []);
  const initialTimer = useMemo(() => getTimerSettings(), []);
  const initialTrainingLevel = useMemo(() => getTrainingLevel(), []);
  const initialLanguage = useMemo(() => getLanguage(), []);

  const [height, setHeight] = useState(String(initialProfile.height ?? ''));
  const [weight, setWeight] = useState(String(initialProfile.weight ?? ''));
  const [age, setAge] = useState(String(initialProfile.age ?? ''));
  const [gender, setGender] = useState<ProfileGender>(initialProfile.gender);
  const [goal, setGoal] = useState<FitnessGoal>(initialProfile.goal);
  const [trainingLevel, setTrainingLevelState] =
    useState<TrainingLevel>(initialTrainingLevel);
  const [language, setLanguageState] = useState<AppLanguage>(initialLanguage);
  const [timerSettings, setTimerSettingsState] =
    useState<TimerSettings>(initialTimer);
  const [saved, setSaved] = useState(false);

  const showSaved = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  };

  const persistProfile = (partial?: Partial<{
    height: string;
    weight: string;
    age: string;
    gender: ProfileGender;
    goal: FitnessGoal;
  }>) => {
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
    showSaved();
  };

  const persistLanguage = (value: AppLanguage) => {
    setLanguage(value);
    showSaved();
  };

  const persistTimer = (partial: Partial<TimerSettings>) => {
    const next = setTimerSettings(partial);
    setTimerSettingsState(next);

    if (!next.enabled) {
      resetWorkoutTimerToPhase('set');
    }

    showSaved();
  };

  return (
    <div className="min-h-screen bg-black px-4 pb-6 pt-4 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[26px] border border-white/10 bg-[#080808] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/78 transition hover:bg-white/[0.08]"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>

            <div className="min-w-0 flex-1 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-300/85">
                Settings
              </p>
              <h1 className="mt-1 text-[28px] font-black tracking-tight text-white">
                Profile & app
              </h1>
              <p className="mx-auto mt-2 max-w-[32rem] text-sm leading-5 text-white/70">
                Tighter layout, cleaner controls, production-safe state updates.
              </p>
            </div>

            <div className="h-10 w-10 shrink-0" />
          </div>

          <div className="mt-4 grid gap-3">
            <SectionCard title="Timer" icon={<Clock3 className="h-4 w-4" />}>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => persistTimer({ enabled: !timerSettings.enabled })}
                  className={[
                    'flex w-full items-center justify-between rounded-[16px] border px-3.5 py-3 text-left transition',
                    timerSettings.enabled
                      ? 'border-lime-300/22 bg-lime-300/[0.08]'
                      : 'border-white/10 bg-white/[0.04]',
                  ].join(' ')}
                >
                  <div>
                    <div className="text-sm font-black text-white">Workout timer</div>
                    <div className="mt-1 text-xs text-white/60">
                      {timerSettings.enabled ? 'Enabled in workouts' : 'Disabled'}
                    </div>
                  </div>

                  <div
                    className={[
                      'h-6 w-11 rounded-full p-1 transition',
                      timerSettings.enabled ? 'bg-lime-300' : 'bg-white/12',
                    ].join(' ')}
                  >
                    <div
                      className={[
                        'h-4 w-4 rounded-full bg-black transition',
                        timerSettings.enabled ? 'translate-x-5' : 'translate-x-0',
                      ].join(' ')}
                    />
                  </div>
                </button>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[16px] border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/52">
                      Set seconds
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {[30, 45, 60].map((value) => (
                        <TimerChip
                          key={value}
                          label={`${value}s`}
                          active={timerSettings.setSeconds === value}
                          onClick={() => persistTimer({ setSeconds: value })}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[16px] border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/52">
                      Rest seconds
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {[60, 90, 120].map((value) => (
                        <TimerChip
                          key={value}
                          label={`${value}s`}
                          active={timerSettings.restSeconds === value}
                          onClick={() => persistTimer({ restSeconds: value })}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => persistTimer({ autoLoop: !timerSettings.autoLoop })}
                    className={[
                      'rounded-[14px] border px-3 py-2.5 text-sm font-bold transition',
                      timerSettings.autoLoop
                        ? 'border-lime-300/30 bg-lime-300/[0.10] text-white'
                        : 'border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.06] hover:text-white',
                    ].join(' ')}
                  >
                    Auto loop: {timerSettings.autoLoop ? 'On' : 'Off'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const next = setTimerSettings({
                        enabled: true,
                        setSeconds: 45,
                        restSeconds: 90,
                        autoLoop: true,
                      });
                      setTimerSettingsState(next);
                      resetWorkoutTimerToPhase('set');
                      showSaved();
                    }}
                    className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset timer defaults
                  </button>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Body" icon={<User className="h-4 w-4" />}>
              <div className="grid gap-2 md:grid-cols-3">
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

              <div className="mt-3 rounded-[16px] border border-white/10 bg-white/[0.04] px-3 py-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
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
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>
            </SectionCard>

            <SectionCard title="Training" icon={<Target className="h-4 w-4" />}>
              <div className="space-y-2">
                <ToggleGrid<FitnessGoal>
                  value={goal}
                  onChange={(value) => {
                    setGoal(value);
                    persistProfile({ goal: value });
                  }}
                  options={[
                    { value: 'lose', label: 'Lose' },
                    { value: 'maintain', label: 'Maintain' },
                    { value: 'gain', label: 'Gain' },
                  ]}
                />

                <ToggleGrid<TrainingLevel>
                  value={trainingLevel}
                  onChange={(value) => {
                    setTrainingLevelState(value);
                    persistTrainingLevel(value);
                  }}
                  options={[
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' },
                  ]}
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
                      onClick={() => {
                        setLanguageState(option.value);
                        persistLanguage(option.value);
                      }}
                      className={[
                        'rounded-[14px] border px-3 py-2.5 text-sm font-bold transition',
                        active
                          ? 'border-lime-300/30 bg-lime-300/[0.10] text-white'
                          : 'border-white/10 bg-white/[0.04] text-white/72 hover:text-white hover:bg-white/[0.06]',
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
                className="w-full rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm font-bold text-white transition hover:bg-white/[0.08]"
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
    </div>
  );
}