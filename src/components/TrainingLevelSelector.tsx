import { useMemo, useState } from 'react';
import type { TrainingLevel } from '@/lib/exerciseData';
import {
  setTrainingLevel,
  getPlansForLevel,
  setSelectedPlanIndex,
} from '@/lib/trainingStore';
import { useT } from '@/lib/i18n';
import {
  Dumbbell,
  Target,
  Zap,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Ruler,
  Weight,
} from 'lucide-react';
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

const genderOptions = [
  { id: 'male' as const, label: 'Male' },
  { id: 'female' as const, label: 'Female' },
  { id: 'non-binary' as const, label: 'Non-binary' },
];

const goalOptions = [
  {
    id: 'lose' as const,
    title: 'Lose weight',
    description: 'Lower calories and keep protein high.',
  },
  {
    id: 'maintain' as const,
    title: 'Maintain',
    description: 'Balanced calories to stay strong and consistent.',
  },
  {
    id: 'gain' as const,
    title: 'Build muscle',
    description: 'Small calorie surplus for growth and recovery.',
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
    details: 'Full body workouts 3x/week with focus on form and foundation.',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    subtitle: '1–3 years',
    icon: Target,
    details: 'More volume, better progression and more structured split options.',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    subtitle: '3+ years',
    icon: Zap,
    details: 'Higher volume and intensity with demanding split structures.',
  },
];

export default function TrainingLevelSelector({ onComplete }: Props) {
  const t = useT();
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

  const profileStepValid =
    profile.age > 0 && profile.height > 0 && profile.weight > 0;

  const handleFinish = () => {
    if (!selectedLevel) return;
    saveUserProfile(profile);
    setTrainingLevel(selectedLevel);
    setSelectedPlanIndex(selectedPlan);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logo} alt="GymRat" className="mb-4 h-16 w-16 object-contain" />
          <h1 className="text-3xl font-black tracking-tight">Gym Rat</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Build your profile and choose the right training path.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2.5 w-16 rounded-full transition ${
                step >= s ? 'bg-primary' : 'bg-secondary'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4 rounded-3xl border border-border/40 bg-card/70 p-4 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold">About you</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This helps the app personalize your setup.
              </p>
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold">Gender</div>
              <div className="grid grid-cols-3 gap-2">
                {genderOptions.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setProfile((p) => ({ ...p, gender: g.id }))}
                    className={`rounded-2xl px-3 py-3 text-xs font-semibold transition ${
                      profile.gender === g.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/60 text-secondary-foreground'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Calendar className="h-4 w-4" />
                  Age
                </label>
                <Input
                  type="number"
                  min={1}
                  value={profile.age || ''}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, age: Number(e.target.value) || 0 }))
                  }
                  placeholder="Age"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Ruler className="h-4 w-4" />
                  Height
                </label>
                <Input
                  type="number"
                  min={1}
                  value={profile.height || ''}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, height: Number(e.target.value) || 0 }))
                  }
                  placeholder="cm"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Weight className="h-4 w-4" />
                  Weight
                </label>
                <Input
                  type="number"
                  min={1}
                  value={profile.weight || ''}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, weight: Number(e.target.value) || 0 }))
                  }
                  placeholder="kg"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setStep(2)}
              disabled={!profileStepValid}
              className="w-full"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 rounded-3xl border border-border/40 bg-card/70 p-4 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold">What is your goal?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick the result you want the app to optimize for.
              </p>
            </div>

            <div className="space-y-3">
              {goalOptions.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setProfile((p) => ({ ...p, goal: goal.id }))}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    profile.goal === goal.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border/40 bg-secondary/20'
                  }`}
                >
                  <div className="font-semibold">{goal.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {goal.description}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                disabled={!profile.goal}
                className="flex-1"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 rounded-3xl border border-border/40 bg-card/70 p-4 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold">Choose your level</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick the training level that best matches your experience.
              </p>
            </div>

            <div className="space-y-3">
              {levels.map(({ id, title, subtitle, icon: Icon, details }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSelectedLevel(id);
                    setSelectedPlan(0);
                  }}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedLevel === id
                      ? 'border-primary bg-primary/10'
                      : 'border-border/40 bg-secondary/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-secondary/60 p-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold">{title}</div>
                      <div className="text-sm text-muted-foreground">{subtitle}</div>
                      <div className="mt-2 text-sm text-muted-foreground">{details}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(4)}
                disabled={!selectedLevel}
                className="flex-1"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && selectedLevel && (
          <div className="space-y-4 rounded-3xl border border-border/40 bg-card/70 p-4 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold">Training plan</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick the split you want to start with.
              </p>
            </div>

            <div className="space-y-3">
              {plans.map((plan, idx) => (
                <button
                  key={`${plan.name}-${idx}`}
                  type="button"
                  onClick={() => setSelectedPlan(idx)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedPlan === idx
                      ? 'border-primary bg-primary/10'
                      : 'border-border/40 bg-secondary/20'
                  }`}
                >
                  <div className="font-semibold">{plan.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {plan.description}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {plan.days.map((day, i) => (
                      <span
                        key={`${day.label}-${i}`}
                        className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                      >
                        {day.label}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(3)} className="flex-1">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button type="button" onClick={handleFinish} className="flex-1">
                Start training
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 text-center text-xs text-muted-foreground">
          {typeof t === 'function' ? t('settings' as never) : 'You can change this later in settings.'}
        </div>
      </div>
    </div>
  );
}