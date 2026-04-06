import { useEffect, useMemo, useState } from 'react';
import { Images, Menu, Play, ShoppingBag, Trophy, Zap } from 'lucide-react';
import EquippedRatPreview from '@/components/EquippedRatPreview';
import { getLanguage, type AppLanguage } from '@/lib/languageStore';

type AppStats = {
  level?: number;
  currentLevel?: number;
  currentXP?: number;
  currentLevelXP?: number;
  nextLevelXP?: number;
  totalXP?: number;
  streak?: number;
};

type HomeScreenProps = {
  stats: AppStats;
  onOpenMenu: () => void;
  onStartWorkout: () => void;
  onOpenGallery: () => void;
  onOpenShop: () => void;
};

function ActionButton({
  icon: Icon,
  label,
  onClick,
  primary = false,
}: {
  icon: typeof Play;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[20px] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] transition ${
        primary
          ? 'bg-lime-300 text-black shadow-[0_18px_50px_rgba(163,230,53,0.18)] hover:brightness-105'
          : 'border border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function StatPill({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Trophy;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.04] px-3 py-3">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 text-lg font-black tracking-tight text-white">{value}</div>
    </div>
  );
}

function CompactXPCard({
  currentXP,
  nextLevelXP,
}: {
  currentXP: number;
  nextLevelXP: number;
}) {
  const progress = useMemo(() => {
    if (nextLevelXP <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((currentXP / nextLevelXP) * 100)));
  }, [currentXP, nextLevelXP]);

  const xpLeft = Math.max(0, nextLevelXP - currentXP);

  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
            XP
          </div>
          <div className="mt-1 text-xl font-black tracking-tight">{progress}%</div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
            Next in
          </div>
          <div className="mt-1 text-sm font-black">{xpLeft} XP</div>
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-lime-300 transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 text-[11px] font-bold text-white/45">
        {currentXP} / {nextLevelXP} XP
      </div>
    </div>
  );
}

export default function HomeScreen({
  stats,
  onOpenMenu,
  onStartWorkout,
  onOpenGallery,
  onOpenShop,
}: HomeScreenProps) {
  const [language, setLanguage] = useState<AppLanguage>(getLanguage());

  useEffect(() => {
    const syncLanguage = () => setLanguage(getLanguage());

    window.addEventListener('language-updated', syncLanguage);
    window.addEventListener('storage', syncLanguage);

    return () => {
      window.removeEventListener('language-updated', syncLanguage);
      window.removeEventListener('storage', syncLanguage);
    };
  }, []);

  const level = stats.currentLevel ?? stats.level ?? 1;
  const currentXP = stats.currentLevelXP ?? stats.currentXP ?? 0;
  const nextLevelXP = Math.max(1, stats.nextLevelXP ?? 100);
  const totalXP = stats.totalXP ?? currentXP;
  const streak = stats.streak ?? 0;

  return (
    <div className="min-h-screen bg-black px-5 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-300/80">
                GymRat
              </div>
              <h1 className="mt-1 text-2xl font-black tracking-tight">Home</h1>
              <div className="mt-1 text-[11px] text-white/45">
                Language · {language.toUpperCase()}
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenMenu}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] transition hover:bg-white/[0.08]"
              aria-label="Open menu"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-black/25 p-2">
            <EquippedRatPreview />
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
            <StatPill label="Level" value={level} icon={Trophy} />
            <StatPill label="Total XP" value={totalXP} icon={Zap} />
            <StatPill label="Streak" value={streak} icon={Trophy} />
          </div>

          <div className="mt-3">
            <CompactXPCard currentXP={currentXP} nextLevelXP={nextLevelXP} />
          </div>

          <div className="mt-4 grid gap-2.5">
            <ActionButton
              icon={Play}
              label="Start workout"
              onClick={onStartWorkout}
              primary
            />

            <div className="grid grid-cols-2 gap-2.5">
              <ActionButton
                icon={Images}
                label="Level gallery"
                onClick={onOpenGallery}
              />
              <ActionButton
                icon={ShoppingBag}
                label="Shop"
                onClick={onOpenShop}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}