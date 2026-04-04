import { unlockPremiumPreview } from '@/lib/premiumStore';

export default function PremiumPaywall({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-[32px] border border-amber-300/20 bg-zinc-950 p-6 shadow-[0_0_80px_rgba(251,191,36,0.16)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Premium</p>
        <h2 className="mt-2 text-3xl font-black text-white">Upgrade your Gym Rat</h2>
        <p className="mt-3 text-sm text-zinc-400">
          Premium should feel valuable, not forced. This rebuild keeps the gate simple while we stabilize the app.
        </p>

        <div className="mt-5 space-y-2 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-zinc-200">
          <p>• Nutrition tracking</p>
          <p>• Workout history depth</p>
          <p>• XP boost</p>
          <p>• Custom workouts</p>
          <p>• Premium cosmetics</p>
        </div>

        <button
          onClick={() => {
            unlockPremiumPreview();
            onClose();
            window.location.reload();
          }}
          className="mt-5 w-full rounded-[24px] bg-amber-300 px-5 py-4 font-bold text-black"
        >
          Unlock preview premium
        </button>

        <button
          onClick={onClose}
          className="mt-3 w-full rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 font-semibold text-white"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}