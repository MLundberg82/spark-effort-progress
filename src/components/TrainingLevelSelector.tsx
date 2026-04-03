import { useState } from 'react';
import { TrainingLevel } from '@/lib/exerciseData';
import { setTrainingLevel, getPlansForLevel, setSelectedPlanIndex } from '@/lib/trainingStore';
import { useT } from '@/lib/i18n';
import { Dumbbell, Target, Zap, ChevronRight, ChevronLeft, Calendar, Ruler, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import logo from "../assets/logo.png";

const PROFILE_KEY = 'gymrat-profile';

export interface UserProfile {
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female' | 'non-binary';
  goal?: 'lose' | 'maintain' | 'gain';
}

export function getUserProfile(): UserProfile | null {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

interface Props {
  onComplete: () => void;
}

const genderOptions = [
  { id: 'male' as const, label: 'male' },
  { id: 'female' as const, label: 'female' },
  { id: 'non-binary' as const, label: 'nonBinary' },
];

const goalOptionKeys = [
  { id: 'lose' as const, labelKey: 'loseWeight' as const, descKey: 'loseWeightDesc' as const },
  { id: 'maintain' as const, labelKey: 'maintainGoal' as const, descKey: 'maintainGoalDesc' as const },
  { id: 'gain' as const, labelKey: 'buildMuscleGoal' as const, descKey: 'buildMuscleGoalDesc' as const },
];

const levels: {
  id: TrainingLevel;
  labelKey: string;
  desc: string;
  icon: typeof Dumbbell;
  details: string;
  premium?: boolean;
}[] = [
  {
    id: 'beginner',
    labelKey: 'beginner',
    desc: '0-12 months',
    icon: Dumbbell,
    details: 'Full body workouts 3x/week. Focus on form and foundation.',
    premium: false,
  },
  {
    id: 'intermediate',
    labelKey: 'intermediate',
    desc: '1-3 years',
    icon: Target,
    details: 'Upper/Lower split 4x/week. More volume with progressive overload.',
    premium: false,
  },
  {
    id: 'advanced',
    labelKey: 'advanced',
    desc: '3+ years',
    icon: Zap,
    details: 'Push/Pull/Legs 6x/week. Maximum volume and intensity.',
    premium: false,
  },
];

const TrainingLevelSelector = ({ onComplete }: Props) => {
  const t = useT();
  const [step, setStep] = useState(1); // 1=profile, 2=goal, 3=level, 4=split
  const [profile, setProfile] = useState<UserProfile>({
    height: 0,
    weight: 0,
    age: 0,
    gender: 'male',
    goal: undefined,
  });
  const [selectedLevel, setSelectedLevel] = useState<TrainingLevel | null>(null);
  const [selectedPlan, setSelectedPlan] = useState(0);

  const handleFinish = () => {
    if (!selectedLevel) return;
    saveUserProfile(profile);
    setTrainingLevel(selectedLevel);
    setSelectedPlanIndex(selectedPlan);
    onComplete();
  };

  const plans = selectedLevel ? getPlansForLevel(selectedLevel) : [];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 animate-fade-in">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-3">
          <img src={logo} alt="GymRat" className="w-20 h-20 mx-auto animate-glow-pulse" />
          <h1 className="font-display text-3xl font-bold text-foreground">
            Gym<span className="text-gradient">Rat</span>
          </h1>
        </div>

        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 gradient-primary' : s < step ? 'w-4 bg-primary/50' : 'w-4 bg-secondary'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center">
              <h2 className="font-display text-lg font-bold text-foreground">{t('aboutYou')}</h2>
              <p className="text-xs text-muted-foreground mt-1">{t('profileHelp')}</p>
              <p className="text-[10px] text-destructive mt-0.5">* {t('required')}</p>
            </div>

            <div className="card-3d rounded-2xl p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-semibold">
                  {t('gender')} <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {genderOptions.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setProfile((p) => ({ ...p, gender: g.id }))}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                        profile.gender === g.id
                          ? 'gradient-primary text-primary-foreground shadow-button btn-3d'
                          : 'card-3d text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      {t(g.label as any) || g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {t('age')} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    min={13}
                    max={100}
                    placeholder="25"
                    value={profile.age || ''}
                    onChange={(e) => setProfile((p) => ({ ...p, age: Number(e.target.value) }))}
                    className={`input-3d text-center ${
                      !profile.age ? 'border-destructive/50 ring-1 ring-destructive/20' : 'border-primary/30'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Ruler className="w-3 h-3" /> {t('height')} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    min={100}
                    max={250}
                    placeholder="175"
                    value={profile.height || ''}
                    onChange={(e) => setProfile((p) => ({ ...p, height: Number(e.target.value) }))}
                    className={`input-3d text-center ${
                      !profile.height ? 'border-destructive/50 ring-1 ring-destructive/20' : 'border-primary/30'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Weight className="w-3 h-3" /> {t('weightKg')} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    min={30}
                    max={300}
                    placeholder="75"
                    value={profile.weight || ''}
                    onChange={(e) => setProfile((p) => ({ ...p, weight: Number(e.target.value) }))}
                    className={`input-3d text-center ${
                      !profile.weight ? 'border-destructive/50 ring-1 ring-destructive/20' : 'border-primary/30'
                    }`}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!profile.age || !profile.height || !profile.weight}
              className="w-full gradient-primary text-primary-foreground font-bold btn-3d py-6 disabled:opacity-40"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center">
              <h2 className="font-display text-lg font-bold text-foreground">{t('whatsYourGoal')}</h2>
              <p className="text-xs text-muted-foreground mt-1">{t('goalHelp')}</p>
            </div>

            <div className="space-y-3">
              {goalOptionKeys.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setProfile((p) => ({ ...p, goal: g.id }))}
                  className={`w-full card-3d rounded-2xl p-4 text-left transition-all ${
                    profile.goal === g.id ? 'glow-border' : ''
                  }`}
                >
                  <p className="text-lg font-bold text-foreground">{t(g.labelKey)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t(g.descKey)}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="btn-3d">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!profile.goal}
                className="flex-1 gradient-primary text-primary-foreground font-bold btn-3d py-6"
              >
                {t('next')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center">
              <h2 className="font-display text-lg font-bold text-foreground">{t('chooseLevel')}</h2>
            </div>

            <div className="space-y-3">
              {levels.map(({ id, labelKey, desc, icon: Icon, details, premium }) => (
                <button
                  key={id}
                  onClick={() => {
                    setSelectedLevel(id);
                    setSelectedPlan(0);
                  }}
                  className={`w-full card-3d rounded-2xl p-4 text-left transition-all group ${
                    selectedLevel === id ? 'glow-border' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-button ${
                        selectedLevel === id ? 'gradient-primary' : 'bg-secondary'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${selectedLevel === id ? 'text-primary-foreground' : 'text-foreground'}`} />
                    </div>

                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display font-bold text-foreground">{t(labelKey as any)}</h3>
                        {premium && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            Premium
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-primary font-semibold">{desc}</p>
                      <p className="text-[10px] text-muted-foreground">{details}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="btn-3d">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!selectedLevel}
                className="flex-1 gradient-primary text-primary-foreground font-bold btn-3d py-6"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && selectedLevel && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center">
              <h2 className="font-display text-lg font-bold text-foreground">{t('trainingPlan')}</h2>
              <p className="text-xs text-muted-foreground mt-1">Pick your training split</p>
            </div>

            <div className="space-y-3">
              {plans.map((plan, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPlan(idx)}
                  className={`w-full card-3d rounded-2xl p-4 text-left transition-all ${
                    selectedPlan === idx ? 'glow-border' : ''
                  }`}
                >
                  <p className="text-sm font-bold text-foreground">{plan.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {plan.days.map((day, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                      >
                        {day.label}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)} className="btn-3d">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleFinish}
                className="flex-1 gradient-primary text-primary-foreground font-bold btn-3d py-6"
              >
                🚀 Start Training
              </Button>
            </div>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground text-center">{t('changeAnytime')}</p>
      </div>
    </div>
  );
};

export default TrainingLevelSelector;