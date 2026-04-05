import {
  Flame,
  Images,
  Menu,
  Play,
  ShoppingBag,
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
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4 shadow-[0_12px_35px_rgba(0,0,0,0.22)] backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-2">
        <div className="rounded-full border border-white/10 bg-black/20 p-2 text-white/80">
          {icon}
        </div>
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/45">
          {label}
        </p>
      </div>
      <p className={`text-2xl font-black tracking-tight ${accent ?? 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white transition-transform duration-200 hover:scale-[1.02] hover:bg-white/[0.1] active:scale-[0.99]"
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
    <div
      className={`relative min-h-screen overflow-hidden ${visual.backgroundClass} text-white`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.08),transparent_24%)]" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-8 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/75">
            {visual.tierLabel}
          </div>

          <button
            onClick={onOpenMenu}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/[0.1]"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.28em] text-emerald-300/80">
            GymRat
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-white">
            Level up in real life
          </h1>
          <p className="mx-auto mt-3 max-w-[22rem] text-sm leading-6 text-white/62">
            Build momentum, stack workouts, unlock your look, and push your rat into the next form.
          </p>
        </div>

        <div className="mt-6">
          <GymRatStage level={stats.level} />
        </div>

        <div className="mt-4">
          <XPProgressBar
            level={stats.level}
            currentXP={stats.currentLevelXP}
            nextLevelXP={stats.nextLevelXP}
            progressPercent={stats.progressPercent}
          />
        </div>

        <button
          onClick={onStartWorkout}
          className="mt-4 flex items-center justify-center gap-3 rounded-[1.6rem] border border-emerald-300/20 bg-[linear-gradient(90deg,rgba(16,185,129,0.95),rgba(132,204,22,0.95))] px-5 py-4 text-base font-black tracking-[0.04em] text-black shadow-[0_18px_45px_rgba(16,185,129,0.28)] transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
        >
          <Play className="h-5 w-5 fill-current" />
          <span>Start Workout</span>
        </button>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <ActionButton
            icon={<Images className="h-4 w-4" />}
            label="Level Gallery"
            onClick={onOpenGallery}
          />
          <ActionButton
            icon={<ShoppingBag className="h-4 w-4" />}
            label="Shop"
            onClick={onOpenShop}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-4 backdrop-blur-sm">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/45">
              Training level
            </p>
            <p className="mt-2 text-base font-black text-white">
              {formatTrainingLevel(profile?.trainingLevel)}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-4 backdrop-blur-sm">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/45">
              Goal
            </p>
            <p className="mt-2 text-base font-black text-white">
              {formatGoal(profile?.goal)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
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
        </div>
      </div>
    </div>
  );
}