import { useState } from 'react';
import { getLanguage, setLanguage, type Language } from '@/lib/i18n';

type Props = {
  onBack: () => void;
  premiumActive?: boolean;
};

type LanguageOption = Language;

export default function SettingsScreen({ onBack, premiumActive = false }: Props) {
const [language, setLanguageState] = useState<LanguageOption>(getLanguage());

const handleLanguageChange = (value: LanguageOption) => {
  setLanguageState(value);
  setLanguage(value);
};

  const openSupport = () => {
    window.location.href = 'mailto:hello@getgymrat.com?subject=GymRat Support';
  };

  const openBugReport = () => {
    window.location.href =
      'mailto:hello@getgymrat.com?subject=GymRat Bug Report&body=Describe the issue here:%0A%0AWhat happened:%0A%0AWhat did you expect to happen:%0A';
  };

  return (
    <div className="min-h-screen bg-background px-4 py-4 text-foreground">
      <div className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 rounded-2xl border border-border/50 bg-secondary/30 px-4 py-2 text-sm font-medium"
        >
          Back
        </button>

        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            App settings
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Settings</h1>
        </div>

        <div className="space-y-4">
          <section className="rounded-3xl border border-border/40 bg-card/70 p-4">
            <h2 className="text-lg font-bold">Language</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              The app picks the device language automatically the first time.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                  language === 'en'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/60 text-secondary-foreground'
                }`}
              >
                English
              </button>

              <button
                type="button"
                onClick={() => handleLanguageChange('sv')}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                  language === 'sv'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/60 text-secondary-foreground'
                }`}
              >
                Svenska
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-border/40 bg-card/70 p-4">
            <h2 className="text-lg font-bold">Premium</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Status: {premiumActive ? 'Premium active' : 'Free plan'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Premium includes nutrition, training history, XP boost and premium gear.
            </p>
          </section>

          <section className="rounded-3xl border border-border/40 bg-card/70 p-4">
            <h2 className="text-lg font-bold">Support</h2>

            <div className="mt-3 space-y-3">
              <button
                type="button"
                onClick={openSupport}
                className="w-full rounded-2xl border border-border/40 bg-secondary/30 px-4 py-3 text-left text-sm font-medium"
              >
                Contact support
              </button>

              <button
                type="button"
                onClick={openBugReport}
                className="w-full rounded-2xl border border-border/40 bg-secondary/30 px-4 py-3 text-left text-sm font-medium"
              >
                Report a bug
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}