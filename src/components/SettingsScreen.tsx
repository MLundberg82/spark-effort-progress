import { Crown, Settings, Sparkles, User, Zap } from 'lucide-react';
import { getProfile } from '../lib/profileStore';
import { isPremiumUnlocked, unlockPremiumPreview } from '../lib/premiumStore';

export default function SettingsScreen({ onBack }: { onBack: () => void }) {
  const profile = getProfile();
  const premium = isPremiumUnlocked();

  const identityLabel =
    profile?.gender === 'female'
      ? 'Female'
      : profile?.gender === 'non-binary'
        ? 'Non-binary'
        : 'Male';

  const trainingLabel =
    profile?.trainingLevel === 'advanced'
      ? 'Advanced'
      : profile?.trainingLevel === 'intermediate'
        ? 'Intermediate'
        : 'Beginner';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_24%),linear-gradient(180deg,_#09090b_0%,_#0f172a_100%)] px-4 py-4 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-400">Settings</p>
            <h1 className="mt-1 text-2xl font-black">Profile and status</h1>
          </div>

          <button
            onClick={onBack}
            type="button"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition hover:bg-white/10"
          >
            Back
          </button>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.14),transparent_18%),radial-gradient(circle_at_85%_25%,rgba(250,204,21,0.08),transparent_18%)]" />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">GymRat status</p>
              <h2 className="mt-1 text-2xl font-black">Your profile</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Core setup and app status.
              </p>
            </div>

            <div
              className={`flex h-16 w-16 items-center justify-center rounded-3xl border shadow-[0_0_40px_rgba(0,0,0,0.15)] ${
                premium
                  ? 'border-amber-300/20 bg-amber-300/10 text-amber-200'
                  : 'border-emerald-400/15 bg-emerald-400/10 text-emerald-300'
              }`}
            >
              {premium ? <Crown className="h-7 w-7" /> : <Settings className="h-7 w-7" />}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)]">
            <div className="mb-3 inline-flex rounded-2xl bg-emerald-400/10 p-2.5 text-emerald-300">
              <User className="h-4 w-4" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">Identity</p>
            <p className="mt-1 text-xl font-black">{identityLabel}</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)]">
            <div className="mb-3 inline-flex rounded-2xl bg-yellow-300/10 p-2.5 text-yellow-200">
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">Training level</p>
            <p className="mt-1 text-xl font-black">{trainingLabel}</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)]">
            <div className="mb-3 inline-flex rounded-2xl bg-emerald-400/10 p-2.5 text-emerald-300">
              <Zap className="h-4 w-4" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">Age</p>
            <p className="mt-1 text-xl font-black">{profile?.age ?? '-'}</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)]">
            <div className="mb-3 inline-flex rounded-2xl bg-amber-300/10 p-2.5 text-amber-200">
              <Crown className="h-4 w-4" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">Weight</p>
            <p className="mt-1 text-xl font-black">{profile?.weight ?? '-'} kg</p>
          </div>
        </div>

        <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)]">
          <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">App overview</p>

          <div className="mt-4 space-y-3">
            <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Identity</p>
              <p className="mt-1 text-lg font-black">{identityLabel}</p>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Training level</p>
              <p className="mt-1 text-lg font-black">{trainingLabel}</p>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Premium</p>
              <p className="mt-1 text-lg font-black">{premium ? 'Unlocked' : 'Free'}</p>
            </div>
          </div>
        </div>

        {!premium && (
          <div className="mt-4 rounded-[28px] border border-amber-300/20 bg-gradient-to-r from-amber-300/12 to-yellow-300/10 p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-amber-200">Premium upgrade</p>
                <h3 className="mt-2 text-xl font-black text-amber-100">Unlock the full GymRat experience</h3>
                <p className="mt-2 text-sm text-zinc-300">
                  Get premium cosmetics, custom workouts and nutrition features.
                </p>
              </div>

              <div className="inline-flex rounded-2xl bg-amber-300/15 p-3 text-amber-200">
                <Crown className="h-5 w-5" />
              </div>
            </div>

            <button
              onClick={() => {
                unlockPremiumPreview();
                window.location.reload();
              }}
              type="button"
              className="mt-4 w-full rounded-[24px] bg-amber-300 px-4 py-4 text-base font-black text-black transition hover:scale-[1.01]"
            >
              Unlock preview premium
            </button>
          </div>
        )}

        {premium && (
          <div className="mt-4 rounded-[28px] border border-emerald-400/20 bg-gradient-to-r from-emerald-400/10 to-white/[0.05] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)]">
            <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-300">Premium active</p>
            <h3 className="mt-2 text-xl font-black">Full progression layer unlocked</h3>
            <p className="mt-2 text-sm text-zinc-300">
              Premium content is active for this build.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}