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
      type="button"
      onClick={onClick}
      className={[
        'rounded-[14px] border px-3 py-2.5 text-sm font-bold transition',
        active
          ? 'border-lime-300/30 bg-lime-300/[0.10] text-white'
          : 'border-white/10 bg-white/[0.04] text-white/78 hover:bg-white/[0.06] hover:text-white',
      ].join(' ')}
    >
      {label}
    </button>
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
    <section className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/75">
          {icon}
        </div>
        <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">
          {title}
        </h2>
      </div>

      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function TimerSettingsScreen({ onBack }: Props) {
  const initialTimer = useMemo(() => getTimerSettings(), []);
  const [timerSettings, setTimerSettingsState] =
    useState<TimerSettings>(initialTimer);
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
    <div className="min-h-full bg-[#050505] px-4 pb-8 pt-4">
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
              aria-label="Back"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>

            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                Timer
              </div>
              <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white">
                Timer settings
              </h1>
              <p className="mt-1 text-sm text-white/55">
                Only timer controls live here.
              </p>
            </div>
          </div>

          {saved ? (
            <div className="rounded-[14px] border border-lime-300/25 bg-lime-300/[0.10] px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-lime-100">
              Saved
            </div>
          ) : null}
        </div>

        <SectionCard title="Workout timer" icon={<Clock3 className="h-4.5 w-4.5" />}>
          <button
            type="button"
            onClick={() => persistTimer({ enabled: !timerSettings.enabled })}
            className={[
              'flex w-full items-center justify-between rounded-[16px] border px-3.5 py-3 text-left transition',
              timerSettings.enabled
                ? 'border-lime-300/22 bg-lime-300/[0.08]'
                : 'border-white/10 bg-white/[0.04]',
            ].join(' ')}
          >
            <div>
              <div className="text-sm font-black text-white">Timer enabled</div>
              <div className="mt-1 text-xs text-white/55">
                {timerSettings.enabled ? 'Visible in workouts' : 'Hidden in workouts'}
              </div>
            </div>

            <div
              className={[
                'h-6 w-11 rounded-full border transition',
                timerSettings.enabled
                  ? 'border-lime-300/30 bg-lime-300/[0.16]'
                  : 'border-white/12 bg-white/[0.06]',
              ].join(' ')}
            >
              <div
                className={[
                  'mt-[2px] h-4.5 w-4.5 rounded-full bg-white transition-transform',
                  timerSettings.enabled ? 'translate-x-[20px]' : 'translate-x-[2px]',
                ].join(' ')}
              />
            </div>
          </button>

          <div>
            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/45">
              Set seconds
            </div>
            <div className="flex flex-wrap gap-2">
              {[30, 45, 60].map((value) => (
                <TimerChip
                  key={`set-${value}`}
                  active={timerSettings.setSeconds === value}
                  label={`${value}s`}
                  onClick={() => persistTimer({ setSeconds: value })}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/45">
              Rest seconds
            </div>
            <div className="flex flex-wrap gap-2">
              {[60, 90, 120].map((value) => (
                <TimerChip
                  key={`rest-${value}`}
                  active={timerSettings.restSeconds === value}
                  label={`${value}s`}
                  onClick={() => persistTimer({ restSeconds: value })}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => persistTimer({ autoLoop: !timerSettings.autoLoop })}
            className={[
              'rounded-[14px] border px-3 py-2.5 text-sm font-bold transition',
              timerSettings.autoLoop
                ? 'border-lime-300/30 bg-lime-300/[0.10] text-white'
                : 'border-white/10 bg-white/[0.04] text-white/78 hover:bg-white/[0.06] hover:text-white',
            ].join(' ')}
          >
            Auto loop: {timerSettings.autoLoop ? 'On' : 'Off'}
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
          >
            <RotateCcw className="h-4 w-4" />
            Reset defaults
          </button>
        </SectionCard>

        <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/45">
          Timer state is fully separated from Profile &amp; App and only controlled here.
        </div>
      </div>
    </div>
  );
}