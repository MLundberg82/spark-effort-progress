import { Sparkles } from "lucide-react";

import EquippedRatPreview from "@/components/EquippedRatPreview";
import type { RatVariant } from "@/lib/assetTypes";
import {
  getCurrentLevelXP,
  getNextLevelXP,
  getProgressPercent,
  getTotalXP,
} from "@/lib/gamificationStore";
import { getEquippedState } from "@/lib/shopStore";

type GymRatStageProps = {
  level: number;
  variant: RatVariant;
  showMeta?: boolean;
  className?: string;
};

export default function GymRatStage({
  level,
  variant,
  showMeta = true,
  className = "",
}: GymRatStageProps) {
  const equipped = getEquippedState();
  const totalXP = getTotalXP();
  const currentXP = getCurrentLevelXP(totalXP);
  const nextXP = getNextLevelXP(totalXP);
  const progress = Math.max(0, Math.min(100, Math.round(getProgressPercent(totalXP))));

  return (
    <div className={`relative flex min-h-0 flex-col ${className}`}>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[28px]">
        <EquippedRatPreview
          level={level}
          variant={variant}
          equippedOverride={equipped}
          className="h-full w-full"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 via-black/6 to-transparent" />
      </div>

      {showMeta ? (
        <div className="mt-3 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                Current level
              </div>
              <div className="mt-1 text-sm font-bold text-white">LVL {level}</div>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-bold text-white/55">
              <Sparkles className="h-3.5 w-3.5" />
              {progress}%
            </div>
          </div>

          <div className="mt-2 text-xs text-white/55">
            {currentXP} / {nextXP} XP
          </div>

          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-lime-300 transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}