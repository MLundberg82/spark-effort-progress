import { useEffect, useState, type ReactNode } from 'react';
import {
  Bug,
  Crown,
  Flame,
  History,
  Images,
  Mail,
  Settings,
  ShoppingBag,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { getLanguage, t, type AppLanguage } from '@/lib/languageStore';

type AppMenuProps = {
  isPremium: boolean;
  onClose: () => void;
  onOpenDaily: () => void;
  onOpenHistory: () => void;
  onOpenNutrition: () => void;
  onOpenGallery: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  onOpenPremium: () => void;
};

function MenuButton({
  label,
  subtitle,
  badge,
  icon,
  onClick,
}: {
  label: string;
  subtitle?: string;
  badge?: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-white/[0.045] px-4 py-4 text-left transition hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.995]"
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white/90">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-[12px] font-black uppercase tracking-[0.14em] text-white">
            {label}
          </div>
          {subtitle ? (
            <div className="mt-1 text-sm leading-5 text-white/50">{subtitle}</div>
          ) : null}
        </div>
      </div>

      {badge ? (
        <div className="shrink-0 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-lime-300">
          {badge}
        </div>
      ) : null}
    </button>
  );
}

export default function AppMenu({
  isPremium,
  onClose,
  onOpenDaily,
  onOpenHistory,
  onOpenNutrition,
  onOpenGallery,
  onOpenShop,
  onOpenSettings,
  onOpenPremium,
}: AppMenuProps) {
  const [language, setLanguage] = useState<AppLanguage>(getLanguage());

  useEffect(() => {
    const syncLanguage = () => setLanguage(getLanguage());

    window.addEventListener('gymrat-language-updated', syncLanguage);
    window.addEventListener('storage', syncLanguage);

    return () => {
      window.removeEventListener('gymrat-language-updated', syncLanguage);
      window.removeEventListener('storage', syncLanguage);
    };
  }, []);

  const handle = (fn: () => void) => {
    onClose();
    window.setTimeout(fn, 120);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]"
      onClick={onClose}
      aria-hidden="true"
    >
      <aside
        className="absolute right-0 top-0 flex h-[100dvh] w-[80%] max-w-[420px] flex-col border-l border-white/10 bg-[linear-gradient(180deg,#0b0b0d_0%,#101113_100%)] shadow-[-20px_0_60px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
        aria-label="App menu"
      >
        <div className="border-b border-white/10 px-5 pb-5 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-300">
                {t('menu.title', language)}
              </div>
              <div className="mt-2 text-3xl font-black leading-none text-white">
                GymRat
              </div>
              <div className="mt-2 max-w-[240px] text-sm text-white/55">
                {t('menu.subtitle', language)}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white transition hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98]"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">
              {t('menu.status', language)}
            </div>

            <div className="mt-2 flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-black text-white">
                  {isPremium
                    ? t('menu.premiumActive', language)
                    : t('menu.baseMode', language)}
                </div>
                <div className="mt-1 text-sm text-white/50">
                  {isPremium
                    ? t('menu.unlocked', language)
                    : t('menu.upgrade', language)}
                </div>
              </div>

              <div
                className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                  isPremium
                    ? 'border border-lime-300/20 bg-lime-300/10 text-lime-300'
                    : 'border border-white/10 bg-white/[0.05] text-white/70'
                }`}
              >
                {isPremium ? 'Premium' : 'Base'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-3">
            <MenuButton
              label={t('menu.daily', language)}
              subtitle="Streak, XP and recommended next pass"
              icon={<Flame className="h-5 w-5 text-orange-300" />}
              onClick={() => handle(onOpenDaily)}
            />

            <MenuButton
              label={t('menu.history', language)}
              subtitle="See progression with real workout data"
              icon={<History className="h-5 w-5 text-lime-300" />}
              badge={!isPremium ? 'Premium' : undefined}
              onClick={() => handle(onOpenHistory)}
            />

            <MenuButton
              label={t('menu.nutrition', language)}
              subtitle="Macros and targets tied to your goal"
              icon={<UtensilsCrossed className="h-5 w-5 text-sky-300" />}
              badge={!isPremium ? 'Premium' : undefined}
              onClick={() => handle(onOpenNutrition)}
            />

            <MenuButton
              label={t('menu.gallery', language)}
              subtitle="See your forms and future unlock feel"
              icon={<Images className="h-5 w-5 text-violet-300" />}
              onClick={() => handle(onOpenGallery)}
            />

            <MenuButton
              label={t('menu.shop', language)}
              subtitle="Cosmetics, glow and identity"
              icon={<ShoppingBag className="h-5 w-5 text-amber-300" />}
              onClick={() => handle(onOpenShop)}
            />

            <MenuButton
              label={t('menu.premium', language)}
              subtitle="Unlock the heavier version of GymRat"
              icon={<Crown className="h-5 w-5 text-yellow-300" />}
              badge={isPremium ? 'Active' : 'Upgrade'}
              onClick={() => handle(onOpenPremium)}
            />

            <MenuButton
              label={t('menu.settings', language)}
              subtitle="Profile, goal, language and support"
              icon={<Settings className="h-5 w-5 text-white/85" />}
              onClick={() => handle(onOpenSettings)}
            />
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                window.location.href =
                  'mailto:hello@getgymrat.com?subject=GymRat%20Contact';
              }}
              className="flex items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/[0.04] px-3 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/80 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              <Mail className="h-4 w-4" />
              {t('menu.contact', language)}
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href =
                  'mailto:hello@getgymrat.com?subject=GymRat%20Bug%20Report';
              }}
              className="flex items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/[0.04] px-3 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/80 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              <Bug className="h-4 w-4" />
              {t('menu.report', language)}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}