import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bug,
  Globe,
  Mail,
  Ruler,
  Save,
  Target,
  User,
  Weight,
  Dumbbell,
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
  languageOptions,
  setLanguage,
  useAppLanguage,
  type AppLanguage,
} from '@/lib/languageStore';

type SettingsScreenProps = {
  onBack: () => void;
};

const CONTACT_EMAIL = 'hello@getgymrat.com';

function ChipGroup<T extends string>({
  value,
  onChange,
  options,
  compact = false,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  compact?: boolean;
}) {
  return (
    <div className={`grid gap-2 ${compact ? 'grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'}`}>
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border px-3 py-2.5 text-sm font-bold transition ${
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

function MiniCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3">
      <div className="mb-2 flex items-center gap-2 text-white/45">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-black/20">
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.16em]">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const language = useAppLanguage();
  const profile = getProfile();

  const [gender, setGender] = useState<UserGender>(profile?.gender ?? 'male');
  const [height, setHeight] = useState(String(profile?.height ?? 180));
  const [weight, setWeight] = useState(String(profile?.weight ?? 75));
  const [goal, setGoal] = useState<TrainingGoal>(profile?.goal ?? 'maintain');
  const [trainingLevel, setTrainingLevelState] = useState<TrainingLevel>(
    profile?.trainingLevel ?? 'beginner',
  );
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>(language);
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
    setLanguage(selectedLanguage);
    setMessage(language === 'sv' ? 'Inställningar sparade.' : 'Settings saved.');
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
          {language === 'sv' ? 'Tillbaka' : 'Back'}
        </button>

        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
            Settings
          </div>
          <h1 className="mt-1 text-2xl font-black uppercase tracking-[0.02em] text-white">
            {language === 'sv' ? 'Kontrollcenter' : 'Control Center'}
          </h1>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MiniCard
            icon={<User className="h-4 w-4" />}
            label={language === 'sv' ? 'Kön' : 'Gender'}
          >
            <ChipGroup
              value={gender}
              onChange={setGender}
              compact
              options={[
                { value: 'male', label: language === 'sv' ? 'Man' : 'Male' },
                { value: 'female', label: language === 'sv' ? 'Kvinna' : 'Female' },
                {
                  value: 'non-binary',
                  label: language === 'sv' ? 'Icke-binär' : 'Non-binary',
                },
              ]}
            />
          </MiniCard>

          <MiniCard
            icon={<Ruler className="h-4 w-4" />}
            label={language === 'sv' ? 'Längd' : 'Height'}
          >
            <input
              type="number"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-lime-400/50"
            />
          </MiniCard>

          <MiniCard
            icon={<Weight className="h-4 w-4" />}
            label={language === 'sv' ? 'Vikt' : 'Weight'}
          >
            <input
              type="number"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-lime-400/50"
            />
          </MiniCard>

          <MiniCard
            icon={<Target className="h-4 w-4" />}
            label={language === 'sv' ? 'Mål' : 'Goal'}
          >
            <ChipGroup
              value={goal}
              onChange={setGoal}
              compact
              options={[
                { value: 'lose', label: language === 'sv' ? 'Minska' : 'Lose' },
                { value: 'maintain', label: language === 'sv' ? 'Behåll' : 'Maintain' },
                { value: 'build', label: language === 'sv' ? 'Bygg' : 'Build' },
              ]}
            />
          </MiniCard>
        </div>

        <div className="mt-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-3 flex items-center gap-2 text-white/45">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/20">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.16em]">
              {language === 'sv' ? 'Träningsupplägg' : 'Training setup'}
            </span>
          </div>

          <ChipGroup
            value={trainingLevel}
            onChange={setTrainingLevelState}
            options={[
              {
                value: 'beginner',
                label: language === 'sv' ? 'Nybörjare' : 'Beginner',
              },
              {
                value: 'intermediate',
                label: language === 'sv' ? 'Medel' : 'Intermediate',
              },
              {
                value: 'advanced',
                label: language === 'sv' ? 'Avancerad' : 'Advanced',
              },
            ]}
          />
        </div>

        <div className="mt-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-3 flex items-center gap-2 text-white/45">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/20">
              <Globe className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.16em]">
              {language === 'sv' ? 'Språk' : 'Language'}
            </span>
          </div>

          <ChipGroup
            value={selectedLanguage}
            onChange={setSelectedLanguage}
            options={languageOptions}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              window.location.href = `mailto:${CONTACT_EMAIL}?subject=GymRat%20Contact`;
            }}
            className="flex items-center justify-center gap-2 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-bold transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            <Mail className="h-4 w-4" />
            {language === 'sv' ? 'Kontakt' : 'Contact'}
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = `mailto:${CONTACT_EMAIL}?subject=GymRat%20Bug%20Report`;
            }}
            className="flex items-center justify-center gap-2 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-bold transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            <Bug className="h-4 w-4" />
            {language === 'sv' ? 'Rapportera bugg' : 'Report bug'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-[22px] border border-lime-400/25 bg-[linear-gradient(180deg,rgba(124,255,107,0.22),rgba(124,255,107,0.12))] text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-lime-300/45 hover:bg-[linear-gradient(180deg,rgba(124,255,107,0.3),rgba(124,255,107,0.16))] active:scale-[0.99]"
        >
          <Save className="h-4 w-4" />
          {language === 'sv' ? 'Spara' : 'Save'}
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