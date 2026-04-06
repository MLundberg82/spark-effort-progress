import { Menu, ShoppingBag, Sparkles, Play } from 'lucide-react';
import EquippedRatPreview from '@/components/EquippedRatPreview';
import { getLevelVisual } from '@/lib/levelVisuals';

type HomeScreenProps = {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  streak: number;
  premiumActive: boolean;
  onOpenMenu: () => void;
  onStartWorkout: () => void;
  onOpenGallery: () => void;
  onOpenShop: () => void;
};

function HomeCTA({
  label,
  icon,
  onClick,
  wide = false,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  wide?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'group flex items-center justify-center gap-2 rounded-[20px] border text-[13px] font-black uppercase tracking-[0.15em] transition active:scale-[0.99]',
        wide
          ? 'col-span-2 h-[52px] border-lime-300/35 bg-lime-300 text-black shadow-[0_18px_50px_rgba(163,230,53,0.2)] hover:brightness-105'
          : 'h-[48px] border-white/10 bg-black/70 text-white backdrop-blur-xl hover:bg-black/80',
      ].join(' ')}
    >
      <span className={wide ? 'text-black' : 'text-lime-300'}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default function HomeScreen({
  level,
  currentXP,
  nextLevelXP,
  streak,
  premiumActive,
  onOpenMenu,
  onStartWorkout,
  onOpenGallery,
  onOpenShop,
}: HomeScreenProps) {
  const visual = getLevelVisual(level);
  const xpPercent =
    nextLevelXP > 0
      ? Math.max(0, Math.min(100, (currentXP / nextLevelXP) * 100))
      : 100;

  return (
    <main className="fixed inset-0 overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <EquippedRatPreview
          level={level}
          className="h-full w-full [&_img]:select-none"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.08)_18%,rgba(0,0,0,0.18)_46%,rgba(0,0,0,0.78)_100%)]" />

      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between px-[max(12px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))] pt-[max(12px,env(safe-area-inset-top))]">
        <div className="px-1 py-1">
          <p className="text-[18px] font-black uppercase tracking-[0.18em] text-lime-300 drop-shadow-[0_0_18px_rgba(163,230,53,0.22)]">
            LVL {level}
          </p>
        </div>

        <button
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/66 text-white shadow-[0_18px_46px_rgba(0,0,0,0.34)] backdrop-blur-xl transition hover:bg-black/78"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 px-[max(12px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))] pb-[max(6px,env(safe-area-inset-bottom))]">
        <div className="space-y-2">
          <div className="rounded-[20px] border border-white/10 bg-black/62 px-4 py-3 shadow-[0_16px_44px_rgba(0,0,0,0.42)] backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-300/85">
                  XP Progress
                </p>
                <p className="mt-1 text-[13px] font-semibold text-white/86">
                  {visual.title}
                </p>
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-right">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/45">
                  Streak
                </p>
                <p className="text-sm font-black text-white">{streak}</p>
              </div>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-lime-300 transition-[width] duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">
              <span>{Math.round(currentXP)} XP</span>
              <span>{Math.max(0, Math.round(nextLevelXP))} to next</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <HomeCTA
              label="Level Gallery"
              icon={<Sparkles className="h-4 w-4" />}
              onClick={onOpenGallery}
            />
            <HomeCTA
              label="Shop"
              icon={<ShoppingBag className="h-4 w-4" />}
              onClick={onOpenShop}
            />
            <HomeCTA
              label="Start Workout"
              icon={<Play className="h-4 w-4 fill-current" />}
              onClick={onStartWorkout}
              wide
            />
          </div>
        </div>
      </div>
    </main>
  );
}