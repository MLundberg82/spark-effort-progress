import {
  Images,
  Menu,
  Play,
  ShoppingBag,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
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

export default function HomeScreen({
  stats,
  onOpenMenu,
  onStartWorkout,
  onOpenGallery,
  onOpenShop,
}: HomeScreenProps) {
  const profile = getProfile();
  const tierLabel = getTierFromLevel(stats.level);
  const xpLeft = Math.max(0, stats.nextLevelXP - stats.currentLevelXP);

  return (
    <div className="h-screen overflow-hidden bg-[#0a0d12] px-4 py-4 text-white">
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),rgba(255,255,255,0.03),rgba(0,0,0,0.20)),linear-gradient(180deg,rgba(17,24,39,0.96),rgba(10,13,18,1))] px-5 pb-5 pt-4 shadow-[0_20px_70px_rgba(0,0,0,0.38)]">
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300/80">
                Current level
              </div>
              <div className="mt-1 text-xl font-black tracking-tight text-white">
                LVL {stats.level}
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenMenu}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80 transition hover:bg-white/[0.10] hover:text-white"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="mt-3 flex flex-col items-center justify-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
              <Sparkles size={13} />
              {tierLabel}
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              GymRat
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
              Level up in real life.
            </p>
          </div>

          <div className="relative mt-2 flex min-h-0 flex-1 items-center justify-center">
            <div className="absolute h-[70%] w-[70%] rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute h-[50%] w-[50%] rounded-full bg-amber-300/10 blur-3xl" />

            <div className="relative flex w-full max-w-[440px] flex-1 items-center justify-center">
              <EquippedRatPreview className="h-full max-h-[420px] w-full" />
            </div>
          </div>

          <div className="mt-2 rounded-[26px] border border-white/10 bg-black/25 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <div className="font-bold text-white">XP Progress</div>
                <div className="mt-1 text-xs text-white/55">
                  {stats.currentLevelXP} / {stats.nextLevelXP} XP
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                  XP left
                </div>
                <div className="mt-1 text-sm font-bold text-emerald-300">
                  {xpLeft}
                </div>
              </div>
            </div>

            <div className="mt-3 h-4 overflow-hidden rounded-full border border-white/10 bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(16,185,129,1),rgba(250,204,21,0.95))] shadow-[0_0_24px_rgba(16,185,129,0.35)] transition-[width] duration-500"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
              <span>Level {stats.level}</span>
              <span>Goal: next level</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onOpenGallery}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-bold text-white transition hover:bg-white/[0.09]"
            >
              <Images size={16} />
              Level Gallery
            </button>

            <button
              type="button"
              onClick={onOpenShop}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-bold text-white transition hover:bg-white/[0.09]"
            >
              <ShoppingBag size={16} />
              Shop
            </button>
          </div>

          <button
            type="button"
            onClick={onStartWorkout}
            className="mt-3 inline-flex h-14 items-center justify-center gap-2 rounded-[22px] bg-emerald-400 text-base font-black text-black shadow-[0_12px_30px_rgba(16,185,129,0.25)] transition hover:brightness-105"
          >
            <Play size={18} />
            Start Workout
          </button>

          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                <Zap size={12} />
                Total XP
              </div>
              <div className="mt-1 text-lg font-black text-white">{stats.totalXP}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                <Trophy size={12} />
                Workouts
              </div>
              <div className="mt-1 text-lg font-black text-white">{stats.totalWorkouts}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                <Target size={12} />
                Profile
              </div>
              <div className="mt-1 truncate text-sm font-bold text-white">
                {profile?.trainingLevel ? profile.trainingLevel : 'Not set'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}