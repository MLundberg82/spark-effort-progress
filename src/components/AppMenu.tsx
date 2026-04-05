import { X, Crown, Apple, History, Dumbbell, TimerReset, Settings2, Flame } from 'lucide-react';
import { getTimerSettings, toggleTimerEnabled } from '@/lib/timerStore';

type AppMenuProps = {
  open: boolean;
  onClose: () => void;
  isPremium: boolean;
  hasTrainingLevel: boolean;
  onOpenPremium: () => void;
  onOpenNutrition: () => void;
  onOpenHistory: () => void;
  onOpenCustomWorkout: () => void;
  onOpenLevelSelect: () => void;
};

type MenuRowProps = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  premium?: boolean;
  onClick: () => void;
};

function MenuRow({ icon, title, subtitle, premium, onClick }: MenuRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition hover:bg-accent"
    >
      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {premium && (
            <span className="rounded-full bg-lime-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-lime-300">
              Premium
            </span>
          )}
        </div>
        {subtitle && <p className="mt-1 text-xs leading-5 text-muted-foreground">{subtitle}</p>}
      </div>
    </button>
  );
}

export default function AppMenu({
  open,
  onClose,
  isPremium,
  hasTrainingLevel,
  onOpenPremium,
  onOpenNutrition,
  onOpenHistory,
  onOpenCustomWorkout,
  onOpenLevelSelect,
}: AppMenuProps) {
  const timer = getTimerSettings();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[75] bg-black/60"
      onClick={onClose}
    >
      <div
        className="absolute left-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto border-r border-border bg-background p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime-300/80">
              Menu
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">GymRat</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          {!isPremium && (
            <MenuRow
              icon={<Crown className="h-5 w-5" />}
              title="Go Premium"
              subtitle="Unlock nutrition, history, custom workouts, XP boost and exclusive cosmetics."
              onClick={() => {
                onClose();
                onOpenPremium();
              }}
            />
          )}

          <MenuRow
            icon={<Apple className="h-5 w-5" />}
            title="Nutrition"
            subtitle="Track food, macros and goals."
            premium
            onClick={() => {
              onClose();
              onOpenNutrition();
            }}
          />

          <MenuRow
            icon={<History className="h-5 w-5" />}
            title="Workout History"
            subtitle="See previous sessions and progress."
            premium
            onClick={() => {
              onClose();
              onOpenHistory();
            }}
          />

          <MenuRow
            icon={<Dumbbell className="h-5 w-5" />}
            title="Custom Workout"
            subtitle="Build your own session structure."
            premium
            onClick={() => {
              onClose();
              onOpenCustomWorkout();
            }}
          />

          <MenuRow
            icon={<Flame className="h-5 w-5" />}
            title="Daily Check-in"
            subtitle="Hookas till din daily flow i nästa steg."
            onClick={() => {
              onClose();
              alert('Daily check-in hookas in i nästa steg.');
            }}
          />

          <MenuRow
            icon={<Settings2 className="h-5 w-5" />}
            title={hasTrainingLevel ? 'Change Training Level' : 'Choose Training Level'}
            subtitle="Set beginner / intermediate / advanced flow."
            onClick={() => {
              onClose();
              onOpenLevelSelect();
            }}
          />

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
                <TimerReset className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Workout Timer</p>
                <p className="text-xs text-muted-foreground">
                  Set length: {timer.setSeconds}s · Rest: {timer.restSeconds}s
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-background px-3 py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Auto timer active</p>
                <p className="text-xs text-muted-foreground">
                  Uses your saved timer settings during workouts.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  toggleTimerEnabled();
                }}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                  timer.enabled ? 'bg-lime-400' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                    timer.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Exact editing for set/rest values comes in the next timer settings step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}