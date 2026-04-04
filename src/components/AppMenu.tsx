import type { AppPage } from '../lib/appStore';

export default function AppMenu({
  open,
  currentPage,
  onClose,
  onNavigate,
  onOpenPaywall,
}: {
  open: boolean;
  currentPage: AppPage;
  onClose: () => void;
  onNavigate: (page: AppPage) => void;
  onOpenPaywall: () => void;
}) {
  if (!open) return null;

  const items: { key: AppPage; label: string }[] = [
    { key: 'home', label: 'Home' },
    { key: 'daily', label: 'Daily Check-in' },
    { key: 'history', label: 'History' },
    { key: 'nutrition', label: 'Nutrition' },
    { key: 'shop', label: 'Shop' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="ml-auto h-full w-[84%] max-w-sm border-l border-white/10 bg-zinc-950/95 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-white">Menu</h2>
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
          >
            Close
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`w-full rounded-2xl px-4 py-4 text-left transition ${
                currentPage === item.key ? 'bg-emerald-400 text-black font-bold' : 'bg-white/5 text-white'
              }`}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={onOpenPaywall}
            className="w-full rounded-2xl bg-amber-300/15 px-4 py-4 text-left font-semibold text-amber-200"
          >
            Premium
          </button>
        </div>
      </div>
    </div>
  );
}