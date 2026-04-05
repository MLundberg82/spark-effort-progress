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
import { getEquippedItemIds } from '@/lib/shopStore';
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
  const xpLeft = Math.max(0, stats.nextLevelXP - stats.currentLevelXP);
  const hasAnyEquipped = getEquippedItemIds().length > 0;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-4 pb-6 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenMenu}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl transition hover:scale-[1.02] hover:bg-white/[0.08]"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
            {tierLabel}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(74,222,128,0.16),transparent_34%),radial-gradient(circle_at_bottom,rgba(163,230,53,0.08),transparent_30%)]" />
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              Premium hero mode
            </div>

            <h1 className="text-[2rem] font-black leading-none tracking-[-0.04em]">
              GymRat
            </h1>

            <p className="mt-2 max-w-[22rem] text-sm text-white/68">
              Level up in real life. Train harder, look stronger, build identity.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/75">
                LVL {stats.level}
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/75">
                {profile?.trainingLevel ?? 'beginner'}
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/75">
                Goal: {formatGoal(profile?.goal)}
              </div>

              {hasAnyEquipped ? (
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300">
                  Look equipped
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex justify-center">
              <EquippedRatPreview level={stats.level} gender={profile?.gender} size="hero" />
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-4 shadow-[0_16px_60px_rgba(0,0,0,0.35)]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                XP Progress
              </div>
              <div className="mt-1 text-lg font-bold">Level {stats.level}</div>
            </div>

            <div className="text-right">
              <div className="text-xs text-white/45">Current</div>
              <div className="text-sm font-semibold text-emerald-300">
                {stats.currentLevelXP} / {stats.nextLevelXP} XP
              </div>
            </div>
          </div>

          <div className="h-4 overflow-hidden rounded-full bg-white/[0.05] p-[3px]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#34d399,#bef264)] shadow-[0_0_30px_rgba(74,222,128,0.35)] transition-all duration-500"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
              <div className="text-[11px] uppercase tracking-[0.15em] text-white/45">XP left</div>
              <div className="mt-1 text-lg font-black text-white">{xpLeft}</div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
              <div className="text-[11px] uppercase tracking-[0.15em] text-white/45">Total XP</div>
              <div className="mt-1 text-lg font-black text-white">{stats.totalXP}</div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
              <div className="text-[11px] uppercase tracking-[0.15em] text-white/45">Workouts</div>
              <div className="mt-1 text-lg font-black text-white">{stats.totalWorkouts}</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartWorkout}
          className="mt-4 flex h-14 items-center justify-center gap-2 rounded-[1.25rem] bg-[linear-gradient(90deg,#ffffff,#d4d4d8)] text-sm font-black uppercase tracking-[0.14em] text-black transition hover:scale-[1.01]"
        >
          <Play className="h-4 w-4" />
          Start workout
        </button>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onOpenGallery}
            className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:bg-white/[0.07]"
          >
            <div className="mb-2 flex items-center gap-2 text-emerald-300">
              <Images className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">Gallery</span>
            </div>
            <div className="text-base font-bold">Level gallery</div>
            <div className="mt-1 text-sm text-white/55">See your evolution and milestones.</div>
          </button>

          <button
            type="button"
            onClick={onOpenShop}
            className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:bg-white/[0.07]"
          >
            <div className="mb-2 flex items-center gap-2 text-emerald-300">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">Shop</span>
            </div>
            <div className="text-base font-bold">Cosmetics</div>
            <div className="mt-1 text-sm text-white/55">Equip looks, aura and backgrounds.</div>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.035] px-3 py-3">
            <div className="mb-2 flex items-center gap-2 text-white/55">
              <Zap className="h-4 w-4 text-yellow-300" />
              <span className="text-[11px] uppercase tracking-[0.14em]">Momentum</span>
            </div>
            <div className="text-sm font-semibold">Progress feels alive</div>
          </div>

          <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.035] px-3 py-3">
            <div className="mb-2 flex items-center gap-2 text-white/55">
              <Target className="h-4 w-4 text-emerald-300" />
              <span className="text-[11px] uppercase tracking-[0.14em]">Goal</span>
            </div>
            <div className="text-sm font-semibold">{formatGoal(profile?.goal)}</div>
          </div>

          <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.035] px-3 py-3">
            <div className="mb-2 flex items-center gap-2 text-white/55">
              <Trophy className="h-4 w-4 text-orange-300" />
              <span className="text-[11px] uppercase tracking-[0.14em]">Tier</span>
            </div>
            <div className="text-sm font-semibold">{tierLabel}</div>
          </div>
        </div>
      </div>
    </div>
  );
}