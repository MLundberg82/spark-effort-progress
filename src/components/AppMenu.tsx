import { X, History, Dumbbell, Crown, Settings, Sparkles, ShoppingBag } from 'lucide-react';

type AppPage =
  | 'home'
  | 'history'
  | 'nutrition'
  | 'gallery'
  | 'shop'
  | 'premium'
  | 'settings';

type AppMenuProps = {
  open: boolean;
  currentPage: AppPage;
  onClose: () => void;
  onNavigate: (page: AppPage) => void;
};

type MenuItemProps = {
  label: string;
  icon: React.ReactNode;
  page: AppPage;
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
};

function MenuItem({ label, icon, page, currentPage, onNavigate }: MenuItemProps) {
  const active = currentPage === page;

  return (
    <button
      onClick={() => onNavigate(page)}
      className={`group flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
        active
          ? 'border-fuchsia-400/30 bg-fuchsia-500/10 text-white shadow-[0_0_30px_rgba(217,70,239,0.14)]'
          : 'border-white/8 bg-white/5 text-zinc-200 hover:border-white/15 hover:bg-white/8'
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
          active ? 'bg-fuchsia-500/15 text-fuchsia-300' : 'bg-white/6 text-zinc-300'
        }`}
      >
        {icon}
      </div>

      <div className="flex-1">
        <div className="text-sm font-semibold">{label}</div>
      </div>
    </button>
  );
}

export default function AppMenu({
  open,
  currentPage,
  onClose,
  onNavigate,
}: AppMenuProps) {
  const handleNavigate = (page: AppPage) => {
    onNavigate(page);
    onClose();
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[86%] max-w-sm transform border-l border-white/10 bg-zinc-950/96 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/8 px-5 pb-5 pt-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  GymRat
                </div>
                <div className="text-xl font-black tracking-tight text-white">
                  Menu
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-200 transition hover:bg-white/10"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-[24px] border border-fuchsia-400/15 bg-gradient-to-br from-fuchsia-500/12 via-violet-500/8 to-white/5 p-4">
              <div className="text-[10px] uppercase tracking-[0.24em] text-fuchsia-200/80">
                Upgrade your grind
              </div>
              <div className="mt-1 text-lg font-bold text-white">
                Build your rat. Unlock status. Own the gym.
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <MenuItem
              label="Home"
              icon={<Dumbbell size={20} />}
              page="home"
              currentPage={currentPage}
              onNavigate={handleNavigate}
            />
            <MenuItem
              label="Workout History"
              icon={<History size={20} />}
              page="history"
              currentPage={currentPage}
              onNavigate={handleNavigate}
            />
            <MenuItem
              label="Nutrition"
              icon={<Sparkles size={20} />}
              page="nutrition"
              currentPage={currentPage}
              onNavigate={handleNavigate}
            />
            <MenuItem
              label="Level Gallery"
              icon={<Crown size={20} />}
              page="gallery"
              currentPage={currentPage}
              onNavigate={handleNavigate}
            />
            <MenuItem
              label="Shop"
              icon={<ShoppingBag size={20} />}
              page="shop"
              currentPage={currentPage}
              onNavigate={handleNavigate}
            />
            <MenuItem
              label="Premium"
              icon={<Crown size={20} />}
              page="premium"
              currentPage={currentPage}
              onNavigate={handleNavigate}
            />
            <MenuItem
              label="Settings"
              icon={<Settings size={20} />}
              page="settings"
              currentPage={currentPage}
              onNavigate={handleNavigate}
            />
          </div>

          <div className="border-t border-white/8 p-4">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                Current build
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                Premium progression system
              </div>
              <div className="mt-1 text-xs leading-relaxed text-zinc-400">
                New milestones, new identity variants, better items, stronger backgrounds.
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}