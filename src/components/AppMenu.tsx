import { useEffect, useState, type ReactNode } from 'react';
import {
  Crown,
  Flame,
  History,
  Images,
  Mail,
  Settings,
  ShoppingBag,
  UtensilsCrossed,
  X,
  Bug,
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
      className="flex w-full items-center justify-between rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-4 text-left text-white transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-white/90">
          {icon}
        </div>

        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white">
            {label}
          </div>
          {subtitle ? (
            <div className="mt-1 text-xs text-white/45">{subtitle}</div>
          ) : null}
        </div>
      </div>

      {badge ? (
        <div className="rounded-full border border-lime-400/25 bg-lime-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-lime-300">
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
    window.setTimeout(fn, 150);
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="absolute right-0 top-0 h-full w-[80%] max-w-[420px] border-l border-white/10 bg-[linear-gradient(180deg,#111111_0%,#090909_100%)] p-4 shadow-[-20px_0_60px_rgba(0,0,0,0.45)] animate-in slide-in-from-right duration-300"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">
              {t('menu.title', language)}
            </div>
            <h2 className="mt-1 text-2xl font-black uppercase tracking-[0.03em] text-white">
              GymRat
            </h2>
            <p className="mt-1 text-sm text-white/45">
              {t('menu.subtitle', language)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white transition hover:border-white/20 hover:bg-white/[0.10] active:scale-[0.98]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                {t('menu.status', language)}
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                {isPremium
                  ? t('menu.premiumActive', language)
                  : t('menu.baseMode', language)}
              </div>
            </div>

            <div
              className={[
                'rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em]',
                isPremium
                  ? 'border border-lime-400/25 bg-lime-400/10 text-lime-300'
                  : 'border border-amber-400/20 bg-amber-400/10 text-amber-300',
              ].join(' ')}
            >
              {isPremium
                ? t('menu.unlocked', language)
                : t('menu.upgrade', language)}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <MenuButton
            label={t('menu.daily', language)}
            subtitle={t('menu.dailySub', language)}
            icon={<Flame className="h-4 w-4" />}
            onClick={() => handle(onOpenDaily)}
          />

          <MenuButton
            label={t('menu.history', language)}
            subtitle={t('menu.historySub', language)}
            icon={<History className="h-4 w-4" />}
            onClick={() => handle(onOpenHistory)}
          />

          <MenuButton
            label={t('menu.nutrition', language)}
            subtitle={t('menu.nutritionSub', language)}
            badge={!isPremium ? t('common.premium', language) : undefined}
            icon={<UtensilsCrossed className="h-4 w-4" />}
            onClick={() => handle(onOpenNutrition)}
          />

          <MenuButton
            label={t('menu.gallery', language)}
            subtitle={t('menu.gallerySub', language)}
            icon={<Images className="h-4 w-4" />}
            onClick={() => handle(onOpenGallery)}
          />

          <MenuButton
            label={t('menu.shop', language)}
            subtitle={t('menu.shopSub', language)}
            icon={<ShoppingBag className="h-4 w-4" />}
            onClick={() => handle(onOpenShop)}
          />

          <MenuButton
            label={isPremium ? t('menu.premiumActive', language) : t('menu.premium', language)}
            subtitle={t('menu.premiumSub', language)}
            badge={isPremium ? t('menu.active', language) : t('menu.boost', language)}
            icon={<Crown className="h-4 w-4" />}
            onClick={() => handle(onOpenPremium)}
          />

          <MenuButton
            label={t('menu.settings', language)}
            subtitle={t('menu.settingsSub', language)}
            icon={<Settings className="h-4 w-4" />}
            onClick={() => handle(onOpenSettings)}
          />

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                window.location.href = 'mailto:hello@getgymrat.com?subject=GymRat%20Contact';
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
      </div>
    </div>
  );
}