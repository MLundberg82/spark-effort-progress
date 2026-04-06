import { useEffect, useState, type ReactNode } from 'react';
import {
  Clock3,
  Crown,
  Flame,
  History,
  Settings,
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

function StatPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function MenuButton({
  label,
  description,
  onClick,
  icon,
  accent = 'default',
}: MenuButtonProps) {
  const classes =
    accent === 'premium'
      ? 'border-yellow-300/20 bg-yellow-300/10 text-yellow-100 hover:bg-yellow-300/14'
      : 'border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]';

  return (
    <button
      onClick={onClick}
      className={`flex min-h-[72px] w-full items-center gap-3 rounded-[24px] border px-4 py-3 text-left transition ${classes}`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/40">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-black uppercase tracking-[0.12em]">{label}</p>
        <p className="mt-1 text-xs leading-5 text-white/65">{description}</p>
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
    <aside
      className="pointer-events-auto absolute inset-y-0 right-0 flex h-full w-[86%] max-w-[420px] flex-col overflow-hidden rounded-l-[30px] border-l border-white/12 bg-[#060606] shadow-[-24px_0_80px_rgba(0,0,0,0.7)] animate-in slide-in-from-right duration-300"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between border-b border-white/10 px-5 pb-4 pt-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-300/90">
            Menu
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
            GymRat
          </h2>
          <p className="mt-1 text-sm text-white/60">
            {isPremium ? 'Premium active' : 'Base mode'}
          </p>
        </div>

        <button
          onClick={onClose}
          aria-label="Close menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/[0.09]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="overflow-y-auto px-5 pb-6 pt-4">
        <div className="grid grid-cols-3 gap-2">
          <StatPill label="Rest" value={`${restSeconds}s`} />
          <StatPill label="Set" value={`${setSeconds}s`} />
          <StatPill label="Loop" value={autoLoop ? 'On' : 'Off'} />
        </div>

        <div className="mt-5 space-y-3">
          <MenuButton
            icon={<Flame className="h-5 w-5 text-lime-300" />}
            label="Daily Check-In"
            description="Streak, recovery and recommended next focus."
            onClick={onOpenDaily}
          />

          <MenuButton
            icon={<Settings className="h-5 w-5 text-white" />}
            label="Settings"
            description="Profile, language and timer setup."
            onClick={onOpenSettings}
          />

          <MenuButton
            icon={<History className="h-5 w-5 text-white" />}
            label="History"
            description="Progress, logs and workout overview."
            onClick={onOpenHistory}
          />

          <MenuButton
            icon={<UtensilsCrossed className="h-5 w-5 text-white" />}
            label="Nutrition"
            description="Macros, targets and food logging."
            onClick={onOpenNutrition}
          />

          <MenuButton
            icon={<Clock3 className="h-5 w-5 text-white" />}
            label="Level Gallery"
            description="See the visual evolution across milestones."
            onClick={onOpenGallery}
          />

          <MenuButton
            icon={<Sparkles className="h-5 w-5 text-white" />}
            label="Shop"
            description="Cosmetics, backgrounds and identity unlocks."
            onClick={onOpenShop}
          />

          <MenuButton
            icon={<Crown className="h-5 w-5 text-yellow-200" />}
            label="Get Premium"
            description="Unlock the heavier version of GymRat."
            onClick={onOpenPremium}
            accent="premium"
          />
        </div>
      </div>
    </aside>
  );
}