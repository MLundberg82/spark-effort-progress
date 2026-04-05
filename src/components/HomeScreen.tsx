import { Menu, Images, ShoppingBag, Play } from 'lucide-react';
import type { AppStats } from '@/lib/appStore';
import { getProfile } from '@/lib/profileStore';
import { getEquippedItemIds } from '@/lib/shopStore';
import EquippedRatPreview from '@/components/EquippedRatPreview';
import { Button } from '@/components/ui/button';

type HomeScreenProps = {
  stats: AppStats;
  onOpenMenu: () => void;
  onStartWorkout: () => void;
  onOpenGallery: () => void;
  onOpenShop: () => void;
};

function getTierFromLevel(level: number) {
  if (level >= 60) return 'Legend Tier';
  if (level >= 40) return 'Beast Tier';
  if (level >= 25) return 'Buff Tier';
  if (level >= 15) return 'Strong Tier';
  if (level >= 8) return 'Regular Tier';
  if (level >= 3) return 'Rookie Tier';
  return 'Baby Tier';
}

export default function HomeScreen({
  stats,
  onOpenMenu,
  onStartWorkout,
  onOpenGallery,
  onOpenShop,
}: HomeScreenProps) {
  const profile = getProfile();
  const equippedIds = getEquippedItemIds();
  const hasAnyEquipped = equippedIds.length > 0;
  const tierLabel = getTierFromLevel(stats.level);

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-4 pt-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenMenu}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-foreground shadow-sm"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold text-muted-foreground">
              {tierLabel}
            </div>
            <div className="rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-[11px] font-bold text-lime-300">
              LEVEL {stats.level}
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime-300/80">
            GymRat
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Level up in real life
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {profile?.trainingLevel
              ? `Training level: ${profile.trainingLevel}`
              : 'Choose your level and start your first workout.'}
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center py-4">
          <div className="relative flex h-full max-h-[48vh] w-full items-center justify-center overflow-hidden rounded-[32px] border border-border bg-card">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(163,230,53,0.12),transparent_60%)]" />

            <div className="relative z-10 flex h-full w-full items-center justify-center">
              <EquippedRatPreview
                level={stats.level}
                gender={profile?.gender}
                size="hero"
              />
            </div>

            {hasAnyEquipped && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-300">
                Equipped look active
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Progression
              </p>
              <h3 className="mt-1 text-2xl font-black">Level {stats.level}</h3>
            </div>

            <div className="rounded-2xl border border-lime-400/20 bg-lime-400/10 px-3 py-2 text-right">
              <p className="text-[10px] uppercase tracking-[0.18em] text-lime-300">
                XP
              </p>
              <p className="text-sm font-bold text-foreground">
                {stats.currentLevelXP} / {stats.nextLevelXP}
              </p>
            </div>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-lime-400 transition-all"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Total XP: {stats.totalXP}</span>
            <span>Workouts: {stats.totalWorkouts}</span>
          </div>
        </div>

        <div className="mt-4">
          <Button
            onClick={onStartWorkout}
            className="h-14 w-full rounded-2xl text-base font-bold"
          >
            <Play className="mr-2 h-5 w-5" />
            Start workout
          </Button>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onOpenGallery}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm"
            >
              <Images className="h-4 w-4" />
              Gallery
            </button>

            <button
              type="button"
              onClick={onOpenShop}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}