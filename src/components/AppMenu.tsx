import { useEffect, useState, type ReactNode } from 'react';
import {
  Clock3,
  Crown,
  Flame,
  History,
  Settings,
  ShoppingBag,
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

function persistTimerSettings(restSeconds: number, setSeconds: number, autoLoop: boolean) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(REST_TIMER_KEY, String(restSeconds));
  localStorage.setItem(SET_TIMER_KEY, String(setSeconds));
  localStorage.setItem(TIMER_AUTO_LOOP_KEY, String(autoLoop));

  window.dispatchEvent(new CustomEvent('gymrat-timer-updated'));
  window.dispatchEvent(new CustomEvent('timer-settings-updated'));
}

function clampSeconds(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function MenuButton({
  label,
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
      className={`flex min-h-[48px] w-full items-center gap-3 rounded-[18px] border px-3.5 py-2.5 text-left transition ${accentClasses}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border ${
          accent === 'premium'
            ? 'border-yellow-300/20 bg-yellow-300/10'
            : 'border-white/10 bg-white/[0.05]'
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1 text-sm font-black uppercase tracking-[0.12em]">
        {label}
      </div>
    </button>
  );
}

function TimerAdjuster({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-black/20 px-3 py-3">
      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
        {label}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          onClick={() => onChange(value - 15)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.05] text-lg font-black text-white transition hover:bg-white/[0.08]"
        >
          −
        </button>

        <div className="min-w-[78px] text-center text-sm font-black uppercase tracking-[0.1em] text-white">
          {value}s
        </div>

        <button
          onClick={() => onChange(value + 15)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.05] text-lg font-black text-white transition hover:bg-white/[0.08]"
        >
          +
        </button>
      </div>
    </div>
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
  const [timerOpen, setTimerOpen] = useState(false);

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

  const updateRestSeconds = (next: number) => {
    const safe = clampSeconds(next, 15, 600);
    setRestSeconds(safe);
    persistTimerSettings(safe, setSeconds, autoLoop);
  };

  const updateSetSeconds = (next: number) => {
    const safe = clampSeconds(next, 5, 300);
    setSetSeconds(safe);
    persistTimerSettings(restSeconds, safe, autoLoop);
  };

  const updateAutoLoop = (next: boolean) => {
    setAutoLoop(next);
    persistTimerSettings(restSeconds, setSeconds, next);
  };

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
            className="inline-flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.05] transition hover:bg-white/[0.08]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid gap-2 overflow-y-auto pr-1">
          <MenuButton
            label="Daily check-in"
            onClick={onOpenDaily}
            icon={<Flame className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="Workout history"
            onClick={onOpenHistory}
            icon={<History className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="Nutrition"
            onClick={onOpenNutrition}
            icon={<UtensilsCrossed className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="Timer"
            onClick={() => setTimerOpen((current) => !current)}
            icon={<Clock3 className="h-4.5 w-4.5" />}
          />

          {timerOpen ? (
            <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-3 py-3">
              <div className="grid gap-2">
                <TimerAdjuster
                  label="Rest"
                  value={restSeconds}
                  onChange={updateRestSeconds}
                />

                <TimerAdjuster
                  label="Set"
                  value={setSeconds}
                  onChange={updateSetSeconds}
                />

                <button
                  onClick={() => updateAutoLoop(!autoLoop)}
                  className={`flex min-h-[44px] items-center justify-between rounded-[16px] border px-3 py-2 text-left transition ${
                    autoLoop
                      ? 'border-lime-400/30 bg-lime-400/10 text-lime-200'
                      : 'border-white/10 bg-black/20 text-white'
                  }`}
                >
                  <span className="text-[11px] font-black uppercase tracking-[0.14em]">
                    Auto loop
                  </span>
                  <span className="text-xs font-black uppercase tracking-[0.14em]">
                    {autoLoop ? 'On' : 'Off'}
                  </span>
                </button>
              </div>
            </div>
          ) : null}

          <MenuButton
            label="Shop"
            onClick={onOpenShop}
            icon={<ShoppingBag className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="Settings"
            onClick={onOpenSettings}
            icon={<Settings className="h-4.5 w-4.5" />}
          />

          <MenuButton
            label="Premium"
            onClick={onOpenPremium}
            icon={<Crown className="h-4.5 w-4.5" />}
            accent="premium"
          />
        </div>
      </aside>
    </div>
  );
}