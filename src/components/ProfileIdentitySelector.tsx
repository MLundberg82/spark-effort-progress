import type { RatVariant } from '@/lib/assetTypes';

type ProfileIdentitySelectorProps = {
  value: RatVariant;
  onChange: (value: RatVariant) => void;
};

export default function ProfileIdentitySelector({
  value,
  onChange,
}: ProfileIdentitySelectorProps) {
  const options: Array<{ value: RatVariant; label: string; description: string }> = [
    {
      value: 'male',
      label: 'Male',
      description: 'Broad, raw and classic powerhouse energy.',
    },
    {
      value: 'female',
      label: 'Female',
      description: 'Athletic, dominant and sharp elite energy.',
    },
    {
      value: 'nonbinary',
      label: 'Non-binary',
      description: 'Balanced, edgy and premium power presence.',
    },
  ];

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          Identity
        </div>
        <h3 className="mt-2 text-lg font-bold text-white">
          Choose your rat style
        </h3>
        <p className="mt-1 text-sm text-zinc-400">
          This only changes the visual identity path. Progression and gameplay stay the same.
        </p>
      </div>

      <div className="grid gap-3">
        {options.map((option) => {
          const active = value === option.value;

          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? 'border-fuchsia-400/35 bg-fuchsia-500/10 shadow-[0_0_30px_rgba(217,70,239,0.12)]'
                  : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {option.label}
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-zinc-400">
                    {option.description}
                  </div>
                </div>

                <div
                  className={`h-4 w-4 rounded-full border ${
                    active
                      ? 'border-fuchsia-300 bg-fuchsia-400'
                      : 'border-zinc-500 bg-transparent'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}