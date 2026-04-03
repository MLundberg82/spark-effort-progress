import { Menu, Crown, ShoppingBag, Sparkles } from 'lucide-react';
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
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              GymRat
            </div>
            <div className="mt-1 text-2xl font-black tracking-tight">
              Main Stage
            </div>
          </div>

          <button
            onClick={onOpenMenu}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <GymRatStage
            level={level}
            variant={variant}
            equipped={equipped}
            className="min-h-[620px]"
          />

          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                Current status
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    Level
                  </div>
                  <div className="mt-1 text-2xl font-black">{level}</div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    XP
                  </div>
                  <div className="mt-1 text-2xl font-black">
                    {xp.toLocaleString()}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    Tier
                  </div>
                  <div className="mt-1 text-lg font-bold">{visual.tierName}</div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    Identity
                  </div>
                  <div className="mt-1 text-lg font-bold capitalize">
                    {variant === 'nonbinary' ? 'Non-binary' : variant}
                  </div>
                </div>
              </div>

              <button
                onClick={onStartWorkout}
                className="mt-5 w-full rounded-2xl bg-white px-5 py-4 text-sm font-bold text-zinc-950 transition hover:scale-[1.01]"
              >
                Start Workout
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <button
                onClick={() => onNavigate('gallery')}
                className="rounded-[24px] border border-white/10 bg-gradient-to-br from-fuchsia-500/10 via-violet-500/8 to-white/[0.04] p-5 text-left transition hover:border-fuchsia-400/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-300">
                    <Crown size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Level Gallery</div>
                    <div className="text-xs text-zinc-400">
                      Preview every milestone
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onNavigate('shop')}
                className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-left transition hover:border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8 text-zinc-200">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Shop</div>
                    <div className="text-xs text-zinc-400">
                      Equip new cosmetics
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onNavigate('premium')}
                className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-left transition hover:border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8 text-zinc-200">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Premium</div>
                    <div className="text-xs text-zinc-400">
                      Unlock more status
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                Direction
              </div>
              <div className="mt-2 text-lg font-bold">
                Build a rat that looks earned.
              </div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Every milestone should feel heavier, rarer and harder to reach.
                Bigger body. Better items. Stronger environments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}