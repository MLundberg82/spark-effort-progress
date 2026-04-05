import { Images, Menu, Play, ShoppingBag, Trophy, Zap } from 'lucide-react';
import type { AppStats } from '@/lib/appStore';
import { getProfile } from '@/lib/profileStore';
import EquippedRatPreview from '@/components/EquippedRatPreview';

type HomeScreenProps = {
  stats: AppStats;
  onOpenMenu: () => void;
  onStartWorkout: () => void;
  onOpenGallery: () => void;
  onOpenShop: () => void;
};

function getTierFromLevel(level: number) {
  if (level >= 100) return 'Mythic Tier';
  if (level >= 80) return 'King Tier';
  if (level >= 60) return 'Legend Tier';
  if (level >= 40) return 'Beast Tier';
  if (level >= 25) return 'Buff Tier';
  if (level >= 15) return 'Strong Tier';
  if (level >= 8) return 'Regular Tier';
  if (level >= 3) return 'Rookie Tier';
  return 'Baby Tier';
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function formatGoal(goal?: string) {
  if (goal === 'lose') return 'Cut';
  if (goal === 'build') return 'Build';
  return 'Maintain';
}

export default function HomeScreen({
  stats,
  onOpenMenu,
  onStartWorkout,
  onOpenGallery,
  onOpenShop,
}: HomeScreenProps) {
  const profile = getProfile();
  const tierLabel = getTierFromLevel(stats.level);

  const currentLevelXP = Math.max(0, stats.currentLevelXP ?? 0);
  const nextLevelXP = Math.max(currentLevelXP + 1, stats.nextLevelXP ?? 250);
  const xpLeft = Math.max(0, nextLevelXP - currentLevelXP);
  const progressPercent = clamp((currentLevelXP / nextLevelXP) * 100, 0, 100);

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-4 pb-8 pt-5">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenMenu}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/10 px-3 py-2 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
              Current level
            </div>
            <div className="text-lg font-black leading-none">LVL {stats.level}</div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
            {tierLabel}
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">GymRat</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Level up in real life.
          </p>

          <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
            <EquippedRatPreview />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-xs text-zinc-400">Training level</div>
              <div className="mt-1 text-sm font-bold capitalize">
                {profile?.trainingLevel ?? 'beginner'}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-xs text-zinc-400">Goal</div>
              <div className="mt-1 text-sm font-bold">
                {formatGoal(profile?.goal)}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-zinc-300">XP Progress</span>
              <span className="font-semibold text-white">
                {currentLevelXP} / {nextLevelXP} XP
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
              <span>Level {stats.level}</span>
              <span>XP left: {xpLeft}</span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onOpenGallery}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold transition hover:bg-white/[0.08]"
            >
              <Images className="h-4 w-4" />
              Level Gallery
            </button>

            <button
              type="button"
              onClick={onOpenShop}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold transition hover:bg-white/[0.08]"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop
            </button>
          </div>

          <button
            type="button"
            onClick={onStartWorkout}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-4 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:scale-[1.01]"
          >
            <Play className="h-4 w-4 fill-current" />
            Start Workout
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
              <Zap className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="text-xs text-zinc-400">Total XP</div>
            <div className="mt-1 text-lg font-bold">{stats.totalXP}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-2 inline-flex rounded-xl bg-white/[0.05] p-2">
              <Trophy className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="text-xs text-zinc-400">Workouts</div>
            <div className="mt-1 text-lg font-bold">{stats.totalWorkouts}</div>
          </div>
        </div>
      </div>
    </div>
  );
}