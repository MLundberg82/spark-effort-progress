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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <img
          src={logo}
          alt="GymRat"
          className="w-28 h-28 animate-pulse drop-shadow-[0_0_40px_hsl(138_90%_66%/0.35)]"
        />
        <h1 className="font-display text-4xl font-bold text-foreground mt-5">
          Gym<span className="text-gradient">Rat</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-3">{t('loadingGains')}</p>
      </div>
    );
  }

  const ratTier = getRatTier(level);
  const ratImage = getCurrentTierImage(ratTier.tier);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 pt-8 pb-6">
      <div className="mx-auto max-w-md flex flex-col items-center">
        <img
          src={logo}
          alt="GymRat"
          className="w-20 h-20 drop-shadow-[0_0_30px_hsl(138_90%_66%/0.25)]"
        />

        <h1 className="font-display text-4xl font-bold mt-3">
          Gym<span className="text-gradient">Rat</span>
        </h1>

        <div className="mt-6 w-full rounded-[28px] border border-border/40 bg-card/50 p-6 shadow-2xl">
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center w-44 h-44 rounded-[28px] bg-[hsl(220_15%_12%)] border border-border/40">
              <img
                src={ratImage}
                alt={ratTier.label}
                className="w-32 h-32 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
              />
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm font-semibold text-primary">{ratTier.label}</p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 w-full">
              <div className="rounded-2xl bg-secondary/40 border border-border/30 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Level</p>
                <p className="mt-1 text-lg font-bold text-foreground">{level}</p>
              </div>

              <div className="rounded-2xl bg-secondary/40 border border-border/30 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Streak</p>
                <p className="mt-1 text-lg font-bold text-foreground">{streak}</p>
              </div>

              <div className="rounded-2xl bg-secondary/40 border border-border/30 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Status</p>
                <p className="mt-1 text-sm font-bold text-foreground">
                  {premium ? 'Premium' : 'Free'}
                </p>
              </div>
            </div>

            <div className="mt-6 w-full space-y-3">
              <button
                onClick={onStartWorkout}
                className="w-full rounded-2xl gradient-primary px-4 py-4 font-bold text-primary-foreground btn-3d shadow-button"
              >
                Start Workout
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onOpenGallery}
                  className="rounded-2xl border border-border/40 bg-secondary/20 px-4 py-4 font-semibold text-foreground transition hover:bg-secondary/35"
                >
                  Gallery
                </button>

                <button
                  onClick={onOpenShop}
                  className="rounded-2xl border border-border/40 bg-secondary/20 px-4 py-4 font-semibold text-foreground transition hover:bg-secondary/35"
                >
                  Shop
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;