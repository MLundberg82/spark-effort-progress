import { Menu, Play, ShoppingBag, Images } from 'lucide-react';
import type { AppStats } from '@/lib/appStore';
import EquippedRatPreview from '@/components/EquippedRatPreview';
import XPProgressBar from '@/components/XPProgressBar';
import { useAppLanguage } from '@/lib/languageStore';

type HomeScreenProps = {
  stats: AppStats;
  onOpenMenu: () => void;
  onStartWorkout: () => void;
  onOpenGallery: () => void;
  onOpenShop: () => void;
};

function getCopy(language: string) {
  if (language === 'sv') {
    return {
      shop: 'Shop',
      gallery: 'Level Gallery',
      start: 'Starta Pass',
    };
  }

  return {
    shop: 'Shop',
    gallery: 'Level Gallery',
    start: 'Start Workout',
  };
}

function SecondaryButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof ShoppingBag;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-14 flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 text-white transition-all duration-200 hover:border-white/20 hover:bg-white/8 active:scale-[0.98]"
    >
      <Icon className="mb-1 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
      <span className="px-1 text-center text-[10px] font-black uppercase tracking-[0.16em]">
        {label}
      </span>
    </button>
  );
}

export default function HomeScreen({
  stats,
  onOpenMenu,
  onStartWorkout,
  onOpenGallery,
  onOpenShop,
}: HomeScreenProps) {
  const language = useAppLanguage();
  const copy = getCopy(language);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.02),rgba(0,0,0,0.42)_58%,rgba(0,0,0,0.88))]" />

      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="absolute right-4 top-4 z-[90] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/55 text-white backdrop-blur-md transition-all duration-200 hover:scale-[1.03] hover:border-white/20 hover:bg-black/72 active:scale-[0.98]"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative z-10 flex h-full flex-col">
        <div className="min-h-0 flex-1 px-3 pt-3 pb-0">
          <EquippedRatPreview level={stats.level} className="h-full w-full" />
        </div>

        <div className="relative z-20 px-4 pb-5">
          <div className="mx-auto w-full max-w-md">
            <XPProgressBar
              level={stats.level}
              currentXP={stats.currentLevelXP}
              nextLevelXP={stats.nextLevelXP}
            />

            <div className="mt-3 grid grid-cols-2 gap-2">
              <SecondaryButton
                icon={ShoppingBag}
                label={copy.shop}
                onClick={onOpenShop}
              />
              <SecondaryButton
                icon={Images}
                label={copy.gallery}
                onClick={onOpenGallery}
              />
            </div>

            <button
              type="button"
              onClick={onStartWorkout}
              className="mt-2 flex h-16 w-full items-center justify-center gap-2 rounded-[24px] border border-lime-400/30 bg-[linear-gradient(180deg,rgba(132,255,88,0.24),rgba(132,255,88,0.12))] text-white shadow-[0_0_24px_rgba(132,255,88,0.12)] transition-all duration-200 hover:border-lime-300/50 hover:bg-[linear-gradient(180deg,rgba(132,255,88,0.30),rgba(132,255,88,0.16))] active:scale-[0.98]"
            >
              <Play className="h-4 w-4" />
              <span className="text-[11px] font-black uppercase tracking-[0.18em]">
                {copy.start}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}