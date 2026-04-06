import { Images, Menu, Play, ShoppingBag, Trophy, Zap } from 'lucide-react';

import EquippedRatPreview from '@/components/EquippedRatPreview';
import XPProgressBar from '@/components/XPProgressBar';
import { getProfile } from '@/lib/profileStore';

export type HomeStats = {
  level: number;
  totalXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  totalWorkouts: number;
  streak: number;
};

type HomeScreenProps = {
  stats: HomeStats;
  onOpenMenu: () => void;
  onStartWorkout: () => void;
  onOpenGallery: () => void;
  onOpenShop: () => void;
};

function ActionButton({
  icon: Icon,
  label,
  onClick,
  primary = false,
}: {
  icon: typeof Play;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex items-center justify-center gap-2 rounded-[22px] px-4 py-3 text-sm font-black transition active:scale-[0.99]',
        primary
          ? 'bg-gradient-to-r from-lime-300 via-emerald-400 to-yellow-300 text-black shadow-[0_14px_34px_rgba(132,204,22,0.25)] hover:brightness-105'
          : 'border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.09]',
      ].join(' ')}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

function StatPill({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Trophy;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.05] px-3 py-2">
      <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <p className="text-base font-black text-white">{value}</p>
    </div>
  );
}

function getTierLabel(level: number) {
  if (level >= 100) return 'Mythic';
  if (level >= 80) return 'King';
  if (level >= 60) return 'Legend';
  if (level >= 40) return 'Elite';
  if (level >= 25) return 'Buff';
  if (level >= 15) return 'Strong';
  if (level >= 8) return 'Regular';
  if (level >= 3) return 'Rookie';
  return 'Starter';
}

export default function HomeScreen({
  stats,
  onOpenMenu,
  onStartWorkout,
  onOpenGallery,
  onOpenShop,
}: HomeScreenProps) {
  const profile = getProfile();
  const tierLabel = getTierLabel(stats.level);

  return (
    <div className="min-h-[100dvh] overflow-hidden bg-[#06080b] text-white">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-5 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-lime-300/70">
              GymRat
            </p>
            <h1 className="text-xl font-black tracking-tight">Level up IRL</h1>
          </div>

          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open menu"
            className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/[0.09]"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          <StatPill icon={Zap} label="Streak" value={stats.streak} />
          <StatPill icon={Trophy} label="Level" value={stats.level} />
          <StatPill icon={Trophy} label="Tier" value={tierLabel} />
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="relative flex flex-1 items-center justify-center pb-2 pt-1">
            <div className="absolute inset-x-0 top-[8%] h-[42%] rounded-full bg-lime-300/8 blur-3xl" />
            <EquippedRatPreview
              level={stats.level}
              className="h-full max-h-[55vh] w-full"
            />
          </div>

          <div className="mt-auto space-y-3">
            <XPProgressBar
              currentXP={stats.currentLevelXP}
              nextLevelXP={stats.nextLevelXP}
              level={stats.level}
            />

            <div className="grid grid-cols-2 gap-2">
              <StatPill icon={Zap} label="Total XP" value={stats.totalXP} />
              <StatPill icon={Trophy} label="Workouts" value={stats.totalWorkouts} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <ActionButton icon={Images} label="Gallery" onClick={onOpenGallery} />
              <ActionButton icon={ShoppingBag} label="Shop" onClick={onOpenShop} />
            </div>

            <ActionButton icon={Play} label="Start Workout" onClick={onStartWorkout} primary />

            <div className="px-1 text-center text-xs text-white/42">
              {profile?.trainingLevel ? `Training level: ${profile.trainingLevel}` : 'Finish your profile in settings anytime.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}