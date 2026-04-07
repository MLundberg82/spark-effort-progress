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
        'rounded-[14px] border px-3 py-2 text-sm font-bold transition',
        active
          ? 'border-lime-300/30 bg-lime-300/[0.10] text-white'
          : 'border-white/10 bg-white/[0.04] text-white/78 hover:bg-white/[0.08] hover:text-white',
      ].join(' ')}
    >
      {label}
    </button>
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

  return (
    <div className="min-h-full bg-black px-4 pb-6 pt-4 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[26px] border border-white/10 bg-[#080808] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/78 transition hover:bg-white/[0.08]"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>

            <div className="min-w-0 flex-1 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-300/85">
                Timer
              </p>
              <h1 className="mt-1 text-[28px] font-black tracking-tight text-white">
                Timer settings
              </h1>
              <p className="mx-auto mt-2 max-w-[28rem] text-sm leading-5 text-white/72">
                Only timer controls live here.
              </p>
            </div>

            <div className="h-10 w-10 shrink-0" />
          </div>

          <div className="mt-4 rounded-[22px] border border-white/10 bg-[#0b0b0b] p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.04] text-white/80">
                <Clock3 className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-black tracking-tight text-white">
                Workout timer
              </h2>
            </div>

            <div className="space-y-3">
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
                  <div className="mt-1 text-xs text-white/62">
                    {timerSettings.enabled ? 'Visible in workouts' : 'Hidden in workouts'}
                  </div>
                </div>

                <div
                  className={[
                    'h-6 w-11 rounded-full p-1 transition',
                    timerSettings.enabled ? 'bg-lime-300' : 'bg-white/12',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'h-4 w-4 rounded-full bg-black transition',
                      timerSettings.enabled ? 'translate-x-5' : 'translate-x-0',
                    ].join(' ')}
                  />
                </div>
              </button>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[16px] border border-white/10 bg-white/[0.04] p-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/52">
                    Set seconds
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {[30, 45, 60].map((value) => (
                      <TimerChip
                        key={value}
                        label={`${value}s`}
                        active={timerSettings.setSeconds === value}
                        onClick={() => persistTimer({ setSeconds: value })}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-[16px] border border-white/10 bg-white/[0.04] p-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/52">
                    Rest seconds
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {[60, 90, 120].map((value) => (
                      <TimerChip
                        key={value}
                        label={`${value}s`}
                        active={timerSettings.restSeconds === value}
                        onClick={() => persistTimer({ restSeconds: value })}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
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
                  onClick={() => {
                    const next = setTimerSettings({
                      enabled: true,
                      setSeconds: 45,
                      restSeconds: 90,
                      autoLoop: true,
                    });
                    setTimerSettingsState(next);
                    resetWorkoutTimerToPhase('set');
                    flashSaved();
                  }}
                  className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset defaults
                </button>
              </div>
            </div>
          </div>

          {saved ? (
            <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-lime-300/25 bg-lime-300/12 px-4 py-2 text-sm font-bold text-lime-100 shadow-[0_10px_28px_rgba(132,204,22,0.15)]">
              Saved
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}