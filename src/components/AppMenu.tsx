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
    <div className="rounded-[16px] border border-white/10 bg-white/[0.04] px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
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
      type="button"
      onClick={onClick}
      className={`w-full rounded-[22px] border p-4 text-left transition ${classes}`}
    >
      <div className="flex items-start gap-3">
        <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/10 bg-black/20">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-black uppercase tracking-[0.08em]">
            {label}
          </h3>
          <p className="mt-1 text-sm leading-6 text-white/60">{description}</p>
        </div>
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
    <div
      className="absolute inset-y-0 right-0 flex w-[80%] max-w-[420px] flex-col border-l border-white/10 bg-[#0a0a0a]/96 shadow-[-24px_0_80px_rgba(0,0,0,0.45)]"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between border-b border-white/10 px-5 pb-4 pt-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
            Menu
          </p>
          <h2 className="mt-1 text-[22px] font-black leading-none text-white">
            GymRat
          </h2>
          <p className="mt-2 text-sm text-white/55">
            {isPremium ? 'Premium active' : 'Base mode'}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
        <div className="grid grid-cols-3 gap-2">
          <StatPill label="Set" value={`${setSeconds}s`} />
          <StatPill label="Rest" value={`${restSeconds}s`} />
          <StatPill label="Loop" value={autoLoop ? 'Auto' : 'Manual'} />
        </div>

        <div className="mt-4 space-y-3">
          <MenuButton
            label="Daily Check-In"
            description="Streak, recovery and recommended next focus."
            onClick={onOpenDaily}
            icon={<Flame className="h-5 w-5" />}
          />

          <MenuButton
            label="Settings"
            description="Profile, language and timer setup."
            onClick={onOpenSettings}
            icon={<Settings className="h-5 w-5" />}
          />

          <MenuButton
            label="History"
            description="Progress, logs and workout overview."
            onClick={onOpenHistory}
            icon={<History className="h-5 w-5" />}
          />

          <MenuButton
            label="Nutrition"
            description="Macros, targets and food logging."
            onClick={onOpenNutrition}
            icon={<UtensilsCrossed className="h-5 w-5" />}
          />

          <MenuButton
            label="Shop"
            description="Cosmetics, backgrounds and identity unlocks."
            onClick={onOpenShop}
            icon={<Sparkles className="h-5 w-5" />}
          />

          <MenuButton
            label="Get Premium"
            description="Unlock the heavier version of GymRat."
            onClick={onOpenPremium}
            icon={<Crown className="h-5 w-5" />}
            accent="premium"
          />

          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-white/65">
              <Clock3 className="h-4 w-4" />
              <span className="text-[11px] font-black uppercase tracking-[0.16em]">
                Menu behavior
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Every section should now feel like a full panel inside the menu, not a popup card.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}