import type { ReactNode } from 'react';
import {
  Crown,
  Flame,
  Images,
  Menu,
  Play,
  ShoppingBag,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';

import type { AppStats } from '@/lib/appStore';
import { getProfile } from '@/lib/profileStore';
import GymRatStage from '@/components/GymRatStage';
import XPProgressBar from '@/components/XPProgressBar';
import { getLevelVisual } from '@/lib/levelVisuals';

type HomeScreenProps = {
  stats: AppStats;
  onOpenMenu: () => void;
  onStartWorkout: () => void;
  onOpenGallery: () => void;
  onOpenShop: () => void;
};

function formatGoal(goal?: string) {
  if (goal === 'lose') return 'Cut';
  if (goal === 'build') return 'Build';
  return 'Maintain';
}

function formatTrainingLevel(level?: string) {
  if (level === 'advanced') return 'Advanced';
  if (level === 'intermediate') return 'Intermediate';
  return 'Beginner';
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_16px_45px_rgba(0,0,0,0.28)]">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400">
        <span className={accent}>{icon}</span>
        <span>{label}</span>
      </div>

      <div className={`mt-3 text-2xl font-black text-white ${accent ?? ''}`}>
        {value}
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
    >
      {icon}
      <span>{label}</span>
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
  const profile = getProfile();
  const visual = getLevelVisual(stats.level);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.18),_transparent_30%),linear-gradient(180deg,_#09090b_0%,_#111113_100%)] px-4 py-5 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">
              {visual.tierLabel}
            </p>
            <h1 className="mt-1 text-3xl font-black sm:text-4xl">
              GymRat
            </h1>
          </div>

          <button
            type="button"
            onClick={onOpenMenu}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-100 transition hover:bg-white/[0.08]"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
          <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/15 via-lime-400/10 to-transparent p-5">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">
              <Sparkles className="h-4 w-4" />
              <span>Level up in real life</span>
            </div>

            <h2 className="mt-3 max-w-2xl text-2xl font-black sm:text-3xl">
              Build momentum, stack workouts, unlock your look.
            </h2>

            <p className="mt-3 max-w-2xl text-sm text-zinc-300 sm:text-base">
              Dopamine, progression and premium identity. Train, earn XP, evolve your rat and keep the streak alive.
            </p>
          </div>

          <div className="p-5">
            <div className="rounded-[30px] border border-white/10 bg-black/20 px-4 pb-5 pt-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Current form
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    Level {stats.level}
                  </p>
                </div>

                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                  {visual.tierLabel}
                </div>
              </div>

              <div className="relative">
                <GymRatStage level={stats.level} />
              </div>

              <div className="mt-4">
                <XPProgressBar
                  currentXP={stats.currentLevelXP}
                  nextLevelXP={stats.nextLevelXP}
                  level={stats.level}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-sm text-zinc-300">
                <span>
                  {stats.currentLevelXP} / {stats.nextLevelXP} XP
                </span>
                <span>{stats.progressPercent}%</span>
              </div>

              <button
                type="button"
                onClick={onStartWorkout}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-300 px-5 py-4 text-sm font-black text-black shadow-[0_14px_35px_rgba(74,222,128,0.35)] transition hover:scale-[1.01]"
              >
                <Play className="h-4 w-4 fill-current" />
                Start Workout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ActionButton
            icon={<Images className="h-4 w-4 text-zinc-200" />}
            label="Level Gallery"
            onClick={onOpenGallery}
          />
          <ActionButton
            icon={<ShoppingBag className="h-4 w-4 text-zinc-200" />}
            label="Shop"
            onClick={onOpenShop}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Zap className="h-4 w-4" />}
            label="Total XP"
            value={stats.totalXP}
            accent="text-emerald-300"
          />
          <StatCard
            icon={<Trophy className="h-4 w-4" />}
            label="Workouts"
            value={stats.totalWorkouts}
          />
          <StatCard
            icon={<Flame className="h-4 w-4" />}
            label="Streak"
            value={stats.streak}
            accent="text-orange-300"
          />
          <StatCard
            icon={<Crown className="h-4 w-4" />}
            label="Tier"
            value={visual.tierLabel}
            accent="text-yellow-300"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.28)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500">
              Training level
            </p>
            <p className="mt-3 text-xl font-black text-white">
              {formatTrainingLevel(profile?.trainingLevel)}
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Your current setup baseline for the app.
            </p>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.28)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500">
              Goal
            </p>
            <p className="mt-3 text-xl font-black text-white">
              {formatGoal(profile?.goal)}
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Nutrition and progression can build around this.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}