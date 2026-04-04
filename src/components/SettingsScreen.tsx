import { useState } from 'react';
import { Bug, ChevronLeft, Crown, Languages, Mail, ShieldCheck } from 'lucide-react';
import { getLanguage, setLanguage, type Language } from '@/lib/i18n';

type Props = {
  onBack: () => void;
  premiumActive?: boolean;
};

const languageOptions: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'sv', label: 'Svenska' },
];

export default function SettingsScreen({ onBack, premiumActive = false }: Props) {
  const [language, setLanguageState] = useState<Language>(getLanguage());

  const handleLanguageChange = (value: Language) => {
    setLanguageState(value);
    setLanguage(value);
  };

  const openSupport = () => {
    window.location.href = 'mailto:hello@getgymrat.com?subject=GymRat%20Support';
  };

  const openBugReport = () => {
    window.location.href =
      'mailto:hello@getgymrat.com?subject=GymRat%20Bug%20Report&body=Describe%20the%20issue%20here:%0A%0AWhat%20happened:%0A%0AWhat%20did%20you%20expect%20to%20happen:%0A';
  };

  return (
    <div className="min-h-screen bg-[#07110d] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-8 pt-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_40px_rgba(170,255,140,0.06)]">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-lime-300/75">
            GymRat
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Settings</h1>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Keep the app clean, premium and easy to use.
          </p>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Languages className="h-4 w-4 text-lime-300" />
              Language
            </div>
            <p className="mt-2 text-sm leading-6 text-white/60">
              The app can be switched manually any time.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {languageOptions.map((option) => {
                const active = language === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleLanguageChange(option.value)}
                    className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      active
                        ? 'bg-gradient-to-r from-lime-300 to-emerald-300 text-[#111]'
                        : 'border border-white/10 bg-white/[0.04] text-white/80'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              {premiumActive ? (
                <ShieldCheck className="h-4 w-4 text-lime-300" />
              ) : (
                <Crown className="h-4 w-4 text-yellow-300" />
              )}
              Premium
            </div>

            <div className="mt-3 text-sm text-white/75">
              Status:{' '}
              <span className="font-bold text-white">
                {premiumActive ? 'Premium active' : 'Free plan'}
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-white/60">
              Premium includes nutrition, history, XP boost, custom workout and cosmetics.
            </p>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-bold text-white">Support</div>

            <div className="mt-4 space-y-3">
              <button
                onClick={openSupport}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm font-semibold text-white/85"
              >
                <Mail className="h-4 w-4 text-lime-300" />
                Contact support
              </button>

              <button
                onClick={openBugReport}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm font-semibold text-white/85"
              >
                <Bug className="h-4 w-4 text-red-300" />
                Report a bug
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}