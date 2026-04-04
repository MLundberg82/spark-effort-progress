import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Ruler,
  Target,
  Weight,
  Zap,
} from 'lucide-react';

import type { TrainingLevel } from '@/lib/exerciseData';
import {
  getPlansForLevel,
  setSelectedPlanIndex,
  setTrainingLevel,
} from '@/lib/trainingStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import logo from '../assets/logo.png';

const PROFILE_KEY = 'gymrat-profile';

export interface UserProfile {
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female' | 'non-binary';
  goal?: 'lose' | 'maintain' | 'gain';
}

export function getUserProfile(): UserProfile | null {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? (JSON.parse(data) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

type Props = {
  onComplete: () => void;
};

const genderOptions: { id: UserProfile['gender']; label: string }[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'non-binary', label: 'Non-binary' },
];

const goalOptions: {
  id: NonNullable<UserProfile['goal']>;
  title: string;
  description: string;
}[] = [
  {
    id: 'lose',
    title: 'Lose weight',
    description: 'Lower calories and keep protein high while staying consistent.',
  },
  {
    id: 'maintain',
    title: 'Maintain',
    description: 'Balanced calories for a strong and stable routine.',
  },
  {
    id: 'gain',
    title: 'Build muscle',
    description: 'Small calorie surplus for growth, recovery and progression.',
  },
];

const levels: {
  id: TrainingLevel;
  title: string;
  subtitle: string;
  icon: typeof Dumbbell;
  details: string;
}[] = [
  {
    id: 'beginner',
    title: 'Beginner',
    subtitle: '0–12 months',
    icon: Dumbbell,
    details: 'Simple structure, form focus and a strong foundation.',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    subtitle: '1–3 years',
    icon: Target,
    details: 'More volume, more progression and smarter split structure.',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    subtitle: '3+ years',
    icon: Zap,
    details: 'High effort, higher demands and more serious programming.',
  },
];

export default function TrainingLevelSelector({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [profile, setProfile] = useState<UserProfile>({
    height: 0,
    weight: 0,
    age: 0,
    gender: 'male',
    goal: undefined,
  });
  const [selectedLevel, setSelectedLevel] = useState<TrainingLevel | null>(null);
  const [selectedPlan, setSelectedPlan] = useState(0);

  const plans = useMemo(
    () => (selectedLevel ? getPlansForLevel(selectedLevel) : []),
    [selectedLevel]
  );

  const profileStepValid = profile.age > 0 && profile.height > 0 && profile.weight > 0;

  const handleFinish = () => {
    if (!selectedLevel) return;
    saveUserProfile(profile);
    setTrainingLevel(selectedLevel);
    setSelectedPlanIndex(selectedPlan);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#07110d] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-8 pt-6">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_50px_rgba(170,255,140,0.08)]">
          <div className="flex flex-col items-center text-center">
            <img
              src={logo}
              alt="GymRat"
              className="h-20 w-20 rounded-[24px] object-contain drop-shadow-[0_0_30px_rgba(170,255,140,0.25)]"
            />
            <div className="mt-3 text-xs font-bold uppercase tracking-[0.24em] text-lime-300/75">
              GymRat
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Set your path</h1>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Build your profile and choose the right training path from the start.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((s) => {
              const active = step >= s;
              return (
                <div
                  key={s}
                  className={`h-2 rounded-full ${active ? 'bg-lime-300' : 'bg-white/10'}`}
                />
              );
            })}
          </div>

          {step === 1 && (
            <div className="mt-6">
              <h2 className="text-xl font-black">About you</h2>
              <p className="mt-2 text-sm text-white/60">
                This helps the app personalize the setup and feel more relevant from day one.
              </p>

              <div className="mt-5">
                <div className="mb-2 text-sm font-bold text-white/80">Gender</div>
                <div className="grid grid-cols-3 gap-2">
                  {genderOptions.map((g) => {
                    const active = profile.gender === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => setProfile((p) => ({ ...p, gender: g.id }))}
                        className={`rounded-2xl px-3 py-3 text-xs font-bold transition ${
                          active
                            ? 'bg-gradient-to-r from-lime-300 to-emerald-300 text-[#111]'
                            : 'border border-white/10 bg-white/[0.04] text-white/80'
                        }`}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-white/80">
                    <Target className="h-4 w-4 text-lime-300" />
                    Age
                  </label>
                  <Input
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, age: Number(e.target.value) || 0 }))
                    }
                    placeholder="Age"
                    className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-white/80">
                    <Ruler className="h-4 w-4 text-lime-300" />
                    Height
                  </label>
                  <Input
                    type="number"
                    value={profile.height || ''}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, height: Number(e.target.value) || 0 }))
                    }
                    placeholder="cm"
                    className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-white/80">
                    <Weight className="h-4 w-4 text-lime-300" />
                    Weight
                  </label>
                  <Input
                    type="number"
                    value={profile.weight || ''}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, weight: Number(e.target.value) || 0 }))
                    }
                    placeholder="kg"
                    className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white"
                  />
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!profileStepValid}
                className="mt-6 h-12 w-full rounded-2xl bg-gradient-to-r from-lime-300 to-emerald-300 font-black text-[#111]"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="mt-6">
              <h2 className="text-xl font-black">What is your goal?</h2>
              <p className="mt-2 text-sm text-white/60">
                Pick the result you want the app to support the most.
              </p>

              <div className="mt-5 space-y-3">
                {goalOptions.map((goal) => {
                  const active = profile.goal === goal.id;

                  return (
                    <button
                      key={goal.id}
                      onClick={() => setProfile((p) => ({ ...p, goal: goal.id }))}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        active
                          ? 'border-lime-300/40 bg-lime-300/10'
                          : 'border-white/10 bg-white/[0.04]'
                      }`}
                    >
                      <div className="text-sm font-black text-white">{goal.title}</div>
                      <div className="mt-1 text-sm leading-6 text-white/60">
                        {goal.description}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-12 flex-1 rounded-2xl border-white/10 bg-white/[0.04] text-white"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <Button
                  onClick={() => setStep(3)}
                  disabled={!profile.goal}
                  className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-lime-300 to-emerald-300 font-black text-[#111]"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-6">
              <h2 className="text-xl font-black">Choose your level</h2>
              <p className="mt-2 text-sm text-white/60">
                Pick the training level that best matches your current experience.
              </p>

              <div className="mt-5 space-y-3">
                {levels.map(({ id, title, subtitle, icon: Icon, details }) => {
                  const active = selectedLevel === id;

                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setSelectedLevel(id);
                        setSelectedPlan(0);
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        active
                          ? 'border-lime-300/40 bg-lime-300/10'
                          : 'border-white/10 bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8">
                          <Icon className="h-5 w-5 text-lime-300" />
                        </div>

                        <div>
                          <div className="text-sm font-black text-white">{title}</div>
                          <div className="mt-1 text-xs font-bold uppercase tracking-[0.15em] text-white/45">
                            {subtitle}
                          </div>
                          <div className="mt-2 text-sm leading-6 text-white/60">
                            {details}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="h-12 flex-1 rounded-2xl border-white/10 bg-white/[0.04] text-white"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <Button
                  onClick={() => setStep(4)}
                  disabled={!selectedLevel}
                  className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-lime-300 to-emerald-300 font-black text-[#111]"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && selectedLevel && (
            <div className="mt-6">
              <h2 className="text-xl font-black">Training plan</h2>
              <p className="mt-2 text-sm text-white/60">
                Pick the split you want to start with.
              </p>

              <div className="mt-5 space-y-3">
                {plans.map((plan, idx) => {
                  const active = selectedPlan === idx;

                  return (
                    <button
                      key={`${plan.name}-${idx}`}
                      onClick={() => setSelectedPlan(idx)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        active
                          ? 'border-lime-300/40 bg-lime-300/10'
                          : 'border-white/10 bg-white/[0.04]'
                      }`}
                    >
                      <div className="text-sm font-black text-white">{plan.name}</div>
                      <div className="mt-2 text-sm leading-6 text-white/60">
                        {plan.description}
                      </div>

                      {'days' in plan && Array.isArray(plan.days) && plan.days.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {plan.days.map((day: { label: string }, i: number) => (
                            <span
                              key={`${day.label}-${i}`}
                              className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/75"
                            >
                              {day.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="h-12 flex-1 rounded-2xl border-white/10 bg-white/[0.04] text-white"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <Button
                  onClick={handleFinish}
                  className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-lime-300 via-emerald-300 to-yellow-300 font-black text-[#111]"
                >
                  Start training
                </Button>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-xs leading-5 text-white/45">
            You can change this later in settings.
          </p>
        </div>
      </div>
    </div>
  );
}