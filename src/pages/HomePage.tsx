import { Menu, ShoppingBag, Crown } from 'lucide-react';
import GymRatStage from '@/components/GymRatStage';
import type { EquippedItems, RatVariant } from '@/lib/assetTypes';
import { getLevelVisual } from '@/lib/levelVisuals';

type AppPage =
  | 'home'
  | 'history'
  | 'nutrition'
  | 'gallery'
  | 'shop'
  | 'premium'
  | 'settings';

type HomePageProps = {
  level: number;
  xp: number;
  variant: RatVariant;
  equipped: EquippedItems;
  onOpenMenu: () => void;
  onNavigate: (page: AppPage) => void;
  onStartWorkout: () => void;
};

export default function HomePage({
  level,
  xp,
  variant,
  equipped,
  onOpenMenu,
  onNavigate,
  onStartWorkout,
}: HomePageProps) {
  const visual = getLevelVisual(level);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-md px-4 pb-8 pt-4">
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/6 text-lg">
              🐭
            </div>
            <div>
              <div className="text-sm font-semibold">Level {level}</div>
              <div className="text-xs text-zinc-500">
                {visual.tierName}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenMenu}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] px-4 pb-4 pt-4">
          <div className="mb-3 text-center">
            <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Main Stage
            </div>
          </div>

          <GymRatStage
            level={level}
            variant={variant}
            equipped={equipped}
            showTierBadge={false}
            showLevelBadge={false}
            className="min-h-[440px] rounded-[26px] border-white/8"
          />

          <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-zinc-500">
              <span>XP</span>
              <span>{xp.toLocaleString()}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all"
                style={{ width: `${Math.max(6, Math.min(100, (level % 10) * 10))}%` }}
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <button
              onClick={onStartWorkout}
              className="h-12 w-full rounded-2xl bg-white text-base font-bold text-zinc-950 transition hover:scale-[1.01]"
            >
              Start Workout
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('gallery')}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition hover:border-fuchsia-400/20 hover:bg-fuchsia-500/[0.06]"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-300">
                  <Crown size={18} />
                </div>
                <div className="text-sm font-bold">Gallery</div>
                <div className="text-[11px] text-zinc-400">
                  View milestones
                </div>
              </button>

              <button
                onClick={() => onNavigate('shop')}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-zinc-200">
                  <ShoppingBag size={18} />
                </div>
                <div className="text-sm font-bold">Shop</div>
                <div className="text-[11px] text-zinc-400">
                  Equip cosmetics
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}