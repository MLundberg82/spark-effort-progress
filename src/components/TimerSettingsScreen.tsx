import { useMemo, useState } from 'react';
import { ArrowLeft, Clock3, RotateCcw } from 'lucide-react';
import {
  getTimerSettings,
  resetWorkoutTimerToPhase,
  setTimerSettings,
  type TimerSettings,
} from '@/lib/timerStore';

type Props = {
  onBack: () => void;
};

function ScreenShell({
  eyebrow,
  title,
  subtitle,
  onBack,
  children,
  saved,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  onBack: () => void;
  children: React.ReactNode;
  saved?: boolean;
}) {
  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(163,230,53,0.12),_transparent_35%),linear-gradient(180deg,#0b0b0b_0%,#050505_100%)] px-4 pb-6 pt-4 text-white">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <button
          onClick={onBack}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/82 transition hover:bg-white/[0.08] hover:text-white"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/56">
            <Clock3 className="h-3.5 w-3.5 text-lime-300" />
            {eyebrow}
          </div>
          <div>
            <h1 className="text-[30px] font-black leading-[1.02] tracking-[-0.03em] text-white">
              {title}
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/64">{subtitle}</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          {saved ? (
            <div className="mb-4 inline-flex items-center rounded-full border border-lime-300/20 bg-lime-300/[0.10] px-3 py-1 text-xs font-semibold text-lime-200">
              Saved
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-white/10 bg-black/28 p-4">
      <div className="mb-3 flex items-center gap-2 text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-lime-300">
          {icon}
        </div>
        <h2 className="text-sm font-bold tracking-[-0.02em] text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function TimerChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-2xl border px-3.5 py-2.5 text-sm font-bold transition',
        active
          ? 'border-lime-300/28 bg-lime-300/[0.14] text-white shadow-[0_0_0_1px_rgba(163,230,53,0.08)]'
          : 'border-white/10 bg-white/[0.03] text-white/78 hover:bg-white/[0.08] hover:text-white',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export default function TimerSettingsScreen({ onBack }: Props) {
  const initialTimer = useMemo(() => getTimerSettings(), []);
  const [timerSettings, setTimerSettingsState] = useState(initialTimer);
  const [saved, setSaved] = useState(false);

  const flashSaved = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  };

  const persistTimer = (partial: Partial<TimerSettings>) => {
    const next = setTimerSettings(partial);
    setTimerSettingsState(next);
    if (!next.enabled) {
      resetWorkoutTimerToPhase('set');
    }
    flashSaved();
  };

  const handleResetDefaults = () => {
    const next = setTimerSettings({
      enabled: true,
      setSeconds: 45,
      restSeconds: 90,
      autoLoop: true,
    });
    setTimerSettingsState(next);
    resetWorkoutTimerToPhase('set');
    flashSaved();
  };

  return (
    <ScreenShell
      eyebrow="Timer"
      title="Timer settings"
      subtitle="Minimal workout timer controls only."
      onBack={onBack}
      saved={saved}
    >
      <div className="space-y-4">
        <button
          onClick={() => persistTimer({ enabled: !timerSettings.enabled })}
          className={[
            'flex w-full items-center justify-between rounded-[22px] border px-4 py-3.5 text-left transition',
            timerSettings.enabled
              ? 'border-lime-300/22 bg-lime-300/[0.08]'
              : 'border-white/10 bg-black/28',
          ].join(' ')}
        >
          <div>
            <div className="text-sm font-bold text-white">Timer enabled</div>
            <div className="mt-1 text-xs text-white/58">
              {timerSettings.enabled ? 'Visible in workouts' : 'Hidden in workouts'}
            </div>
          </div>
          <div
            className={[
              'h-6 w-11 rounded-full border transition',
              timerSettings.enabled
                ? 'border-lime-300/30 bg-lime-300/[0.18]'
                : 'border-white/10 bg-white/[0.05]',
            ].join(' ')}
          >
            <div
              className={[
                'mt-[2px] h-4.5 w-4.5 rounded-full bg-white transition',
                timerSettings.enabled ? 'ml-[22px]' : 'ml-[2px]',
              ].join(' ')}
            />
          </div>
        </button>

        <SectionCard title="Set seconds" icon={<Clock3 className="h-4 w-4" />}>
          <div className="flex flex-wrap gap-2">
            {[30, 45, 60, 90, 120].map((value) => (
              <TimerChip
                key={value}
                active={timerSettings.setSeconds === value}
                label={`${value}s`}
                onClick={() => persistTimer({ setSeconds: value })}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Rest seconds" icon={<Clock3 className="h-4 w-4" />}>
          <div className="flex flex-wrap gap-2">
            {[30, 45, 60, 90, 120, 150, 180].map((value) => (
              <TimerChip
                key={value}
                active={timerSettings.restSeconds === value}
                label={`${value}s`}
                onClick={() => persistTimer({ restSeconds: value })}
              />
            ))}
          </div>
        </SectionCard>

        <button
          onClick={handleResetDefaults}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/82 transition hover:bg-white/[0.08] hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          Reset defaults
        </button>
      </div>
    </ScreenShell>
  );
}
