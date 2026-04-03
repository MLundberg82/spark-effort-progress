import logo from '@/assets/logo.png';
import { getRatTier } from '@/lib/gamificationStore';
import { getCurrentTierImage } from '@/lib/ratImages';
import { useT } from '@/lib/i18n';

type SplashScreenProps = {
  isLoading?: boolean;
  level?: number;
  streak?: number;
  premium?: boolean;
  onStartWorkout?: () => void;
  onOpenGallery?: () => void;
  onOpenShop?: () => void;
};

const SplashScreen = ({
  isLoading = false,
  level = 1,
  streak = 0,
  premium = false,
  onStartWorkout,
  onOpenGallery,
  onOpenShop,
}: SplashScreenProps) => {
  const t = useT();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <img
          src={logo}
          alt="GymRat"
          className="w-24 h-24 animate-pulse drop-shadow-[0_0_40px_hsl(138_90%_66%/0.35)]"
        />

        <h1 className="mt-5 text-3xl font-black tracking-tight text-foreground">
          Gym<span className="text-primary">Rat</span>
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">{t('loadingGains')}</p>

        <div className="mt-6 h-2 w-32 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-full animate-pulse rounded-full bg-primary" />
        </div>
      </div>
    );
  }

  const ratTier = getRatTier(level);
  const ratImage = getCurrentTierImage(ratTier.tier);

  return (
    <div className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col">
        <div className="flex flex-col items-center text-center">
          <img
            src={logo}
            alt="GymRat"
            className="h-16 w-16 object-contain drop-shadow-[0_0_30px_hsl(138_90%_66%/0.25)]"
          />

          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Gym<span className="text-primary">Rat</span>
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">{ratTier.label}</p>
        </div>

        <div className="mt-6 rounded-[32px] border border-border/40 bg-card/70 p-5 shadow-sm">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-border/40 bg-secondary/20 p-3 text-center">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Level
              </div>
              <div className="mt-1 text-2xl font-black">{level}</div>
            </div>

            <div className="rounded-2xl border border-border/40 bg-secondary/20 p-3 text-center">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Streak
              </div>
              <div className="mt-1 text-2xl font-black">{streak}</div>
            </div>

            <div className="rounded-2xl border border-border/40 bg-secondary/20 p-3 text-center">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Status
              </div>
              <div className="mt-1 text-sm font-bold">
                {premium ? 'Premium' : 'Free'}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-border/40 bg-background/60">
              {ratImage ? (
                <img
                  src={ratImage}
                  alt={ratTier.label}
                  className="max-h-[220px] max-w-[220px] object-contain drop-shadow-[0_0_35px_rgba(0,0,0,0.25)]"
                />
              ) : (
                <div className="text-6xl">🐀</div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onStartWorkout}
            className="mt-6 h-12 w-full rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-md"
          >
            {t('startWorkout')}
          </button>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onOpenGallery}
              className="rounded-2xl border border-border/40 bg-secondary/30 px-4 py-3 text-sm font-semibold"
            >
              {t('gallery')}
            </button>

            <button
              type="button"
              onClick={onOpenShop}
              className="rounded-2xl border border-border/40 bg-secondary/30 px-4 py-3 text-sm font-semibold"
            >
              {t('shop')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;