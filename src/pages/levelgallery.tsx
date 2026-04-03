import { useMemo, useState } from 'react';
import GymRatStage from '@/components/GymRatStage';
import { LEVEL_MILESTONES } from '@/lib/levelMilestones';
import type { EquippedItems, RatVariant } from '@/lib/assetTypes';
import { LEVEL_VISUALS } from '@/lib/levelVisuals';

const starterItems: EquippedItems = {
  head: 'cap-black-core',
  top: 'hoodie-black-core',
  pants: 'joggers-core-grey',
  feet: 'shoes-street-core',
};

const midItems: EquippedItems = {
  head: 'cap-black-core',
  top: 'hoodie-purple-grind',
  pants: 'joggers-purple-grind',
  neck: 'chain-gold-heavy',
  feet: 'shoes-street-core',
};

const eliteItems: EquippedItems = {
  eyes: 'shades-alpha',
  top: 'tank-alpha-gold',
  pants: 'legend-pants-black',
  neck: 'chain-legend-diamond',
  feet: 'shoes-legend-high',
  aura: 'aura-purple-smoke',
};

function getPresetItems(level: number): EquippedItems {
  if (level >= 70) return eliteItems;
  if (level >= 25) return midItems;
  return starterItems;
}

export default function LevelGalleryPage() {
  const [variant, setVariant] = useState<RatVariant>('male');

  const levels = useMemo(() => LEVEL_MILESTONES, []);

  return (
    <div className="min-h-screen bg-zinc-950 px-4 pb-24 pt-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              Progression
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Level Gallery
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Every milestone should feel heavier, tougher, rarer and more rewarding.
              This gallery previews the visual evolution from level 1 to 100.
            </p>
          </div>

          <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
            {(['male', 'female', 'nonbinary'] as RatVariant[]).map((value) => {
              const active = variant === value;
              return (
                <button
                  key={value}
                  onClick={() => setVariant(value)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${
                    active
                      ? 'bg-white text-zinc-950'
                      : 'text-zinc-300 hover:bg-white/8'
                  }`}
                >
                  {value === 'nonbinary' ? 'Non-binary' : value}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {levels.map((level) => {
            const visual = LEVEL_VISUALS[level];
            return (
              <div
                key={level}
                className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                      Milestone
                    </div>
                    <div className="text-xl font-black">
                      Level {level}
                    </div>
                  </div>

                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-zinc-200">
                    {visual.tierName}
                  </div>
                </div>

                <GymRatStage
                  level={level}
                  variant={variant}
                  equipped={getPresetItems(level)}
                  showTierBadge={false}
                  className="min-h-[560px]"
                />

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                      Scale
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white">
                      {visual.ratScale.toFixed(2)}x
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                      XP target
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white">
                      {visual.unlockXpTarget.toLocaleString()}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                      Mood
                    </div>
                    <div className="mt-1 text-sm font-semibold capitalize text-white">
                      {visual.lighting}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}