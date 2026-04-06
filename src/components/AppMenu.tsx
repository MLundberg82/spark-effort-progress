import { useEffect, useState, type ReactNode } from 'react';
import {
  Clock3,
  Crown,
  Flame,
  History,
  Settings,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  X,
} from 'lucide-react';

type AppMenuProps = {
  isPremium: boolean;
  onClose: () => void;
  onOpenDaily: () => void;
  onOpenHistory: () => void;
  onOpenNutrition: () => void;
  onOpenGallery: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  onOpenPremium: () => void;
};

type MenuButtonProps = {
  label: string;
  description: string;
  onClick: () => void;
  icon: ReactNode;
  accent?: 'default' | 'premium';
};

const REST_TIMER_KEY = 'gymrat-rest-timer-seconds';
const SET_TIMER_KEY = 'gymrat-set-timer-seconds';
const TIMER_AUTO_LOOP_KEY = 'gymrat-timer-auto-loop';

function readNumber(key: string, fallback: number) {
  if (typeof window === 'undefined') return fallback;

  const raw = localStorage.getItem(key);
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

function readBoolean(key: string, fallback: boolean) {
  if (typeof window === 'undefined') return fallback;

  const raw = localStorage.getItem(key);
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return fallback;
}

function MenuButton({
  label,
  description,
  onClick,
  icon,
  accent = 'default',
}: MenuButtonProps) {
  const accentClasses =
    accent === 'premium'
      ? 'border-yellow-300/20 bg-yellow-300/10 text-yellow-100 hover:bg-yellow-300/14'
      : 'border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]';

  return (
    <button
      onClick={onClick}
      className={`flex min-h-[58px] w-full items-center gap-3 rounded-[20px] border px-4 py-3 text-left transition ${accentClasses}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
          accent === 'premium'
            ? 'border-yellow-300/20 bg-yellow-300/10'
            : 'border-white/10 bg-white/[0.05]'
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-black uppercase tracking-[0.12em]">
          {label}
        </div>
        <div className="mt-1 text-xs leading-5 text-white/60">{description}</div>
      </div>
    </button>
  );
}

export default function AppMenu({
  isPremium,
  onClose,
  onOpenDaily,
  onOpenHistory,
  onOpenNutrition,
  onOpenGallery,
  onOpenShop,
  onOpenSettings,
  onOpenPremium,
}: AppMenuProps) {
  const [restSeconds, setRestSeconds] = useState(90);
  const [setSeconds, setSetSeconds] = useState(45);
  const [autoLoop, setAutoLoop] = useState(true);

  useEffect(() => {
    const sync = () => {
      setRestSeconds(readNumber(REST_TIMER_KEY, 90));
      setSetSeconds(readNumber(SET_TIMER_KEY, 45));
      setAutoLoop(readBoolean(TIMER_AUTO_LOOP_KEY, true));
    };

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('gymrat-timer-updated', sync as EventListener);
    window.addEventListener('timer-settings-updated', sync as EventListener);

    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('gymrat-timer-updated', sync as EventListener);
      window.removeEventListener('timer-settings-updated', sync as EventListener);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40">
      <button
        aria-label="Close menu overlay"
        onClick={onClose}
        className="absolute inset-0 bg-black/55"
      />

      <aside className="absolute right-0 top-0 flex h-full w-[80%] max-w-[420px] flex-col border-l border-white/10 bg-[#0a0a0a] px-4 pb-5 pt-4 text-white shadow-[-24px_0_60px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-lime-300/80">
              Menu
            </div>
            <div className="mt-2 text-2xl font-black tracking-tight">GymRat</div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white/75">
              <Flame className="h-3.5 w-3.5" />
              {isPremium ? 'Premium active' : 'Base mode'}
            </div>
          </div>

          <button
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] transition hover:bg-white/[0.08]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
            <Clock3 className="h-3.5 w-3.5" />
            Timer
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-2 py-2">
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
                Rest
              </div>
              <div className="mt-1 text-sm font-black text-white">{restSeconds}s</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-2 py-2">
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
                Set
              </div>
              <div className="mt-1 text-sm font-black text-white">{setSeconds}s</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-2 py-2">
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
                Loop
              </div>
              <div className="mt-1 text-sm font-black text-white">
                {autoLoop ? 'On' : 'Off'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-2.5 overflow-y-auto pr-1">
          <MenuButton
            label="Daily check-in"
            description="Streak, momentum and your next recommended move."
            onClick={onOpenDaily}
            icon={<Flame className="h-5 w-5" />}
          />

          <MenuButton
            label="History"
            description="Previous workouts, progress and long-term tracking."
            onClick={onOpenHistory}
            icon={<History className="h-5 w-5" />}
          />

          <MenuButton
            label="Nutrition"
            description="Macros, food logging and daily intake targets."
            onClick={onOpenNutrition}
            icon={<UtensilsCrossed className="h-5 w-5" />}
          />

          <MenuButton
            label="Level gallery"
            description="See every level form in one tighter gallery view."
            onClick={onOpenGallery}
            icon={<Sparkles className="h-5 w-5" />}
          />

          <MenuButton
            label="Shop"
            description="Cosmetics, backgrounds and rat identity upgrades."
            onClick={onOpenShop}
            icon={<ShoppingBag className="h-5 w-5" />}
          />

          <MenuButton
            label="Settings"
            description="Language, profile, contact, bug report, level and goal."
            onClick={onOpenSettings}
            icon={<Settings className="h-5 w-5" />}
          />

          <MenuButton
            label="Premium"
            description={
              isPremium
                ? 'Manage premium access and your unlocked progression layer.'
                : 'Unlock deeper tracking, custom tools and premium identity.'
            }
            onClick={onOpenPremium}
            icon={<Crown className="h-5 w-5" />}
            accent="premium"
          />
        </div>
      </aside>
    </div>
  );
}