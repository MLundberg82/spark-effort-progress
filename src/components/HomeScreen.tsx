import { Menu } from 'lucide-react';
import type { AppStats } from '../lib/appStore';
import { getProfile } from '../lib/profileStore';
import { getRatImage } from '../lib/assetRegistry';

function getTierFromLevel(level: number) {
  if (level >= 60) return 'Legend Tier';
  if (level >= 40) return 'Beast Tier';
  if (level >= 25) return 'Buff Tier';
  if (level >= 15) return 'Strong Tier';
  if (level >= 8) return 'Regular Tier';
  if (level >= 3) return 'Rookie Tier';
  return 'Baby Tier';
}

export default function HomeScreen({
  stats,
  onOpenMenu,
  onStartWorkout,
}: {
  stats: AppStats;
  onOpenMenu: () => void;
  onStartWorkout: () => void;
}) {
  const profile = getProfile();
function mapGenderToVariant(gender?: string) {
  if (gender === 'female') return 'female';
  if (gender === 'non-binary') return 'nonbinary';
  return 'male';
}

const ratImage = getRatImage(
  stats.level,
  mapGenderToVariant(profile?.gender)
);
  const tierLabel = getTierFromLevel(stats.level);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_24%),linear-gradient(180deg,_#09090b_0%,_#0f172a_100%)] px-4 py-4 text-white">
      <div className="mx-auto max-w-md">
        <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.05] px-5 pb-6 pt-5 shadow-[0_25px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(52,211,153,0.18),transparent_20%),radial-gradient(circle_at_50%_60%,rgba(250,204,21,0.08),transparent_28%)]" />

          <div className="relative z-10">
            <div className="mb-3 flex justify-end">
              <button
                onClick={onOpenMenu}
                type="button"
                className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition hover:scale-[1.03] hover:bg-white/10"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-zinc-300">
                {tierLabel}
              </div>

              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300">
                LEVEL {stats.level}
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="absolute top-8 h-52 w-52 rounded-full bg-emerald-400/12 blur-3xl" />
              <div className="absolute top-12 h-64 w-64 rounded-full border border-white/5" />
              <div className="absolute top-16 h-56 w-56 rounded-full border border-emerald-400/10" />

              <div className="relative z-10 flex h-[340px] w-full items-center justify-center">
                {ratImage ? (
                  <img
                    src={ratImage}
                    alt="Gym Rat"
                    className="max-h-[320px] w-auto object-contain drop-shadow-[0_0_28px_rgba(52,211,153,0.20)]"
                  />
                ) : (
                  <div className="text-[120px]">🐀</div>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">Progression</p>
                  <h3 className="mt-1 text-2xl font-black">Level {stats.level}</h3>
                </div>

                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-right">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-300">XP</p>
                  <p className="text-sm font-bold text-white">
                    {stats.currentLevelXP} / {stats.nextLevelXP}
                  </p>
                </div>
              </div>

              <div className="h-4 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-yellow-300 transition-all duration-700"
                  style={{ width: `${stats.progressPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={onStartWorkout}
              type="button"
              className="mt-5 w-full rounded-[26px] bg-gradient-to-r from-emerald-400 via-lime-300 to-yellow-300 px-5 py-5 text-lg font-black text-black shadow-[0_12px_40px_rgba(132,204,22,0.25)] transition hover:scale-[1.01]"
            >
              Start Workout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}