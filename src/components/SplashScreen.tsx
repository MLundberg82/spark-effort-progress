import logo from '@/assets/logo.png';
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <img
          src={logo}
          alt="GymRat"
          className="w-32 h-32 animate-pulse drop-shadow-[0_0_40px_hsl(138_90%_66%/0.5)]"
        />
        <h1 className="font-display text-3xl font-bold text-foreground mt-4">
          Gym<span className="text-gradient">Rat</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{t('loadingGains')}</p>
        <div className="mt-6 w-20 h-1 rounded-full bg-secondary overflow-hidden">
          <div className="h-full gradient-primary animate-[pulse_1s_ease-in-out_infinite] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 py-10">
      <img
        src={logo}
        alt="GymRat"
        className="w-28 h-28 drop-shadow-[0_0_40px_hsl(138_90%_66%/0.35)]"
      />

      <h1 className="font-display text-4xl font-bold mt-5">
        Gym<span className="text-gradient">Rat</span>
      </h1>

      <div className="mt-8 text-center space-y-2">
        <p className="text-base text-foreground">
          {t('appReady') || 'Appen är igång.'}
        </p>
        <p className="text-sm text-muted-foreground">
          Level: {level}
        </p>
        <p className="text-sm text-muted-foreground">
          Streak: {streak}
        </p>
        <p className="text-sm text-muted-foreground">
          Premium: {premium ? 'Ja' : 'Nej'}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={onStartWorkout}
          className="rounded-2xl px-5 py-4 font-semibold text-black gradient-primary shadow-[0_0_25px_hsl(138_90%_66%/0.25)] transition hover:scale-[1.01]"
        >
          {t('startWorkout') || 'Start Workout'}
        </button>

        <button
          type="button"
          onClick={onOpenGallery}
          className="rounded-2xl px-5 py-4 font-semibold border border-border bg-background transition hover:bg-secondary/40"
        >
          {t('gallery') || 'Gallery'}
        </button>

        <button
          type="button"
          onClick={onOpenShop}
          className="rounded-2xl px-5 py-4 font-semibold border border-border bg-background transition hover:bg-secondary/40"
        >
          {t('shop') || 'Shop'}
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;
