import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Globe,
  Dumbbell,
  Crown,
  Mail,
  Bug,
  Shield,
  FileText,
  RefreshCw,
  Bell,
  Smartphone,
  Palette,
} from 'lucide-react';
import { getTrainingLevel, setTrainingLevel } from '@/lib/trainingStore';

type Props = {
  onBack: () => void;
  premiumActive?: boolean;
};

type AppSettings = {
  soundEffects: boolean;
  vibration: boolean;
  darkMode: boolean;
  reminderTime: string;
};

type LanguageOption = 'en' | 'sv';
type LocalTrainingLevel = 'beginner' | 'intermediate' | 'advanced';

const SETTINGS_STORAGE_KEY = 'gymrat-settings';
const LANGUAGE_STORAGE_KEY = 'gymrat-language';

function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return {
        soundEffects: true,
        vibration: true,
        darkMode: true,
        reminderTime: '19:00',
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      soundEffects: true,
      vibration: true,
      darkMode: true,
      reminderTime: '19:00',
    };
  }
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

function getSavedLanguage(): LanguageOption {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === 'sv') return 'sv';
  return 'en';
}

function saveLanguage(language: LanguageOption) {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  window.dispatchEvent(new Event('gymrat-language-changed'));
}

function normalizeTrainingLevel(value: unknown): LocalTrainingLevel {
  if (value === 'advanced') return 'advanced';
  if (value === 'intermediate') return 'intermediate';
  return 'beginner';
}

export default function SettingsPage({
  onBack,
  premiumActive = false,
}: Props) {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [language, setLanguage] = useState<LanguageOption>(getSavedLanguage());
  const [trainingLevelValue, setTrainingLevelValue] = useState<LocalTrainingLevel>(
    normalizeTrainingLevel(getTrainingLevel?.())
  );

  const trainingOptions = useMemo(
    () => [
      {
        value: 'beginner' as LocalTrainingLevel,
        label: 'Beginner',
        description: 'Simpler structure and easier entry point',
      },
      {
        value: 'intermediate' as LocalTrainingLevel,
        label: 'Intermediate',
        description: 'Balanced challenge and progression',
      },
      {
        value: 'advanced' as LocalTrainingLevel,
        label: 'Advanced',
        description: 'Harder sessions and higher training demand',
      },
    ],
    []
  );

  const updateSettings = (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };

  const handleLanguageChange = (value: LanguageOption) => {
    setLanguage(value);
    saveLanguage(value);
  };

  const handleTrainingLevelChange = (value: LocalTrainingLevel) => {
    setTrainingLevelValue(value);
    setTrainingLevel?.(value);
  };

  const openMail = (subject: string, body?: string) => {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body ?? '');
    window.location.href = `mailto:hello@getgymrat.com?subject=${encodedSubject}&body=${encodedBody}`;
  };

  const openPrivacy = () => {
    window.open('/privacy.html', '_blank');
  };

  const openTerms = () => {
    window.open('/terms.html', '_blank');
  };

  const restorePurchases = () => {
    window.dispatchEvent(new Event('gymrat-restore-purchases'));
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground transition-transform active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              App settings
            </div>
            <h1 className="text-2xl font-black tracking-tight">Settings</h1>
          </div>
        </div>

        <div className="grid gap-4">
          <section className="rounded-[28px] border border-border/50 bg-card/50 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold">Language</div>
                <div className="text-xs text-muted-foreground">
                  Choose the app language
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  language === 'en'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary/60 text-secondary-foreground'
                }`}
              >
                English
              </button>

              <button
                onClick={() => handleLanguageChange('sv')}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  language === 'sv'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary/60 text-secondary-foreground'
                }`}
              >
                Svenska
              </button>
            </div>
          </section>

          <section className="rounded-[28px] border border-border/50 bg-card/50 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold">Training level</div>
                <div className="text-xs text-muted-foreground">
                  Adjust your plan difficulty and progression feel
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {trainingOptions.map((option) => {
                const active = trainingLevelValue === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleTrainingLevelChange(option.value)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-primary/40 bg-primary/10'
                        : 'border-border/40 bg-secondary/30'
                    }`}
                  >
                    <div className="text-sm font-semibold">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[28px] border border-border/50 bg-card/50 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold">App experience</div>
                <div className="text-xs text-muted-foreground">
                  Small preferences for feedback and reminders
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <SettingCard
                icon={<Bell className="h-4 w-4" />}
                title="Sound effects"
                description="Small feedback sounds in the app."
                control={
                  <Toggle
                    checked={settings.soundEffects}
                    onChange={(checked) => updateSettings({ soundEffects: checked })}
                  />
                }
              />

              <SettingCard
                icon={<Smartphone className="h-4 w-4" />}
                title="Vibration"
                description="Haptic feel for interactions and progress."
                control={
                  <Toggle
                    checked={settings.vibration}
                    onChange={(checked) => updateSettings({ vibration: checked })}
                  />
                }
              />

              <SettingCard
                icon={<Palette className="h-4 w-4" />}
                title="Dark mode"
                description="Optimized look for the GymRat visual style."
                control={
                  <Toggle
                    checked={settings.darkMode}
                    onChange={(checked) => updateSettings({ darkMode: checked })}
                  />
                }
              />

              <div className="rounded-2xl border border-border/40 bg-secondary/30 px-4 py-3">
                <div className="mb-1 text-sm font-semibold">Daily reminder</div>
                <div className="mb-3 text-xs text-muted-foreground">
                  Choose a time that suits your routine.
                </div>
                <input
                  type="time"
                  value={settings.reminderTime}
                  onChange={(e) => updateSettings({ reminderTime: e.target.value })}
                  className="h-11 rounded-xl border border-border bg-background/70 px-3"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-border/50 bg-card/50 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold">Premium</div>
                <div className="text-xs text-muted-foreground">
                  Manage premium access and purchases
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="rounded-2xl border border-border/40 bg-secondary/30 px-4 py-3">
                <div className="text-sm font-semibold">
                  Status: {premiumActive ? 'Premium active' : 'Free plan'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Nutrition, training history and premium gear are included in Premium.
                </div>
              </div>

              <button
                onClick={restorePurchases}
                className="flex w-full items-center justify-between rounded-2xl border border-border/40 bg-secondary/30 px-4 py-3 text-left transition hover:bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-4 w-4" />
                  <div>
                    <div className="text-sm font-semibold">Restore purchases</div>
                    <div className="text-xs text-muted-foreground">
                      Re-sync previous premium purchases
                    </div>
                  </div>
                </div>
                <span className="text-muted-foreground">›</span>
              </button>
            </div>
          </section>

          <section className="rounded-[28px] border border-border/50 bg-card/50 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold">Support</div>
                <div className="text-xs text-muted-foreground">
                  Contact us or report issues
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => openMail('GymRat Support')}
                className="flex w-full items-center justify-between rounded-2xl border border-border/40 bg-secondary/30 px-4 py-3 text-left transition hover:bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4" />
                  <div>
                    <div className="text-sm font-semibold">Contact support</div>
                    <div className="text-xs text-muted-foreground">
                      Ask a question or get help
                    </div>
                  </div>
                </div>
                <span className="text-muted-foreground">›</span>
              </button>

              <button
                onClick={() =>
                  openMail(
                    'GymRat Bug Report',
                    'Describe the issue here:\n\nWhat happened:\n\nWhat did you expect to happen:\n'
                  )
                }
                className="flex w-full items-center justify-between rounded-2xl border border-border/40 bg-secondary/30 px-4 py-3 text-left transition hover:bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <Bug className="h-4 w-4" />
                  <div>
                    <div className="text-sm font-semibold">Report a bug</div>
                    <div className="text-xs text-muted-foreground">
                      Let us know when something breaks
                    </div>
                  </div>
                </div>
                <span className="text-muted-foreground">›</span>
              </button>
            </div>
          </section>

          <section className="rounded-[28px] border border-border/50 bg-card/50 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold">Legal</div>
                <div className="text-xs text-muted-foreground">
                  Privacy and terms
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={openPrivacy}
                className="flex w-full items-center justify-between rounded-2xl border border-border/40 bg-secondary/30 px-4 py-3 text-left transition hover:bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4" />
                  <div>
                    <div className="text-sm font-semibold">Privacy policy</div>
                    <div className="text-xs text-muted-foreground">
                      Read how data is handled
                    </div>
                  </div>
                </div>
                <span className="text-muted-foreground">›</span>
              </button>

              <button
                onClick={openTerms}
                className="flex w-full items-center justify-between rounded-2xl border border-border/40 bg-secondary/30 px-4 py-3 text-left transition hover:bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4" />
                  <div>
                    <div className="text-sm font-semibold">Terms of service</div>
                    <div className="text-xs text-muted-foreground">
                      Usage terms for the app
                    </div>
                  </div>
                </div>
                <span className="text-muted-foreground">›</span>
              </button>
            </div>
          </section>

          <div className="px-1 pt-1 text-center text-xs text-muted-foreground">
            GymRat v1.0
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingCard({
  icon,
  title,
  description,
  control,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-secondary/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="mt-0.5 text-muted-foreground">{icon}</div>
          <div>
            <div className="font-semibold">{title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{description}</div>
          </div>
        </div>
        {control}
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${
        checked ? 'bg-primary' : 'bg-secondary'
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}