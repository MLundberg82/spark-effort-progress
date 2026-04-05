import { useEffect, useMemo, useState } from 'react';
import { Images, Menu, Play, ShoppingBag, Trophy, Zap } from 'lucide-react';
import type { AppStats } from '@/lib/appStore';
import EquippedRatPreview from '@/components/EquippedRatPreview';
import { getLanguage, t, type AppLanguage } from '@/lib/languageStore';

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
      className={`group inline-flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[24px] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] transition active:scale-[0.995] ${
        primary
          ? 'bg-lime-300 text-black shadow-[0_20px_55px_rgba(163,230,53,0.2)] hover:brightness-105'
          : 'border border-white/10 bg-white/[0.05] text-white hover:border-white/20 hover:bg-white/[0.08]'
      }`}
    >
      <Icon
        className={`h-4 w-4 transition ${
          primary ? 'text-black' : 'text-white/85'
        } group-hover:scale-110`}
      />
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
    <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 shadow-[0_14px_34px_rgba(0,0,0,0.24)]">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
        <Icon className="h-3.5 w-3.5 text-lime-300" />
        {label}
      </div>
      <div className="mt-2 text-xl font-black text-white">{value}</div>
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

  return (
    <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 shadow-[0_14px_34px_rgba(0,0,0,0.22)]">
      <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-white/10">
        <div
          className="flex h-full items-center justify-center rounded-full bg-[linear-gradient(90deg,rgba(132,204,22,1)_0%,rgba(250,204,21,1)_100%)] px-2 text-[9px] font-black tracking-[0.08em] text-black transition-all duration-300"
          style={{ width: `${Math.max(progress, 18)}%` }}
        >
          <span className="whitespace-nowrap">
            {currentXP} / {nextLevelXP} XP
          </span>
        </div>
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

    window.addEventListener('gymrat-language-updated', syncLanguage);
    window.addEventListener('storage', syncLanguage);

    return () => {
      window.removeEventListener('gymrat-language-updated', syncLanguage);
      window.removeEventListener('storage', syncLanguage);
    };
  }, []);

  const nextLevelIn = Math.max(0, stats.nextLevelXP - stats.currentLevelXP);

  return (
    <div className="min-h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(132,204,22,0.14),transparent_28%),linear-gradient(180deg,#050505_0%,#0d0d0f_55%,#080809_100%)] px-4 pb-8 pt-5 text-white">
      <div className="mx-auto max-w-md">
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-5 pb-6 pt-5 shadow-[0_28px_90px_rgba(0,0,0,0.42)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_30%)]" />
          <div className="absolute -left-10 top-16 h-36 w-36 rounded-full bg-lime-300/10 blur-3xl" />
          <div className="absolute -right-12 top-24 h-44 w-44 rounded-full bg-yellow-300/10 blur-3xl" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-300">
                GymRat
              </div>
              <div className="mt-2 text-3xl font-black leading-none text-white">
                Level up
                <span className="ml-2 text-lime-300">IRL</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenMenu}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white transition hover:border-white/20 hover:bg-white/[0.1] active:scale-[0.98]"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="relative z-10 mt-5">
            <div className="relative mx-auto flex min-h-[340px] items-center justify-center">
              <div className="absolute inset-x-[8%] top-[10%] h-[250px] rounded-full bg-[radial-gradient(circle_at_center,rgba(163,230,53,0.18),rgba(255,255,255,0.03),transparent_68%)] blur-2xl" />
              <div className="absolute inset-x-[12%] top-[14%] h-[240px] rounded-full border border-white/10 bg-white/[0.03] shadow-[0_0_80px_rgba(163,230,53,0.12)]" />
              <EquippedRatPreview
                level={stats.level}
                className="relative z-10 h-[320px] w-full object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
              />
            </div>
          </div>

          <div className="relative z-10 -mt-5">
            <CompactXPCard
              currentXP={stats.currentLevelXP}
              nextLevelXP={stats.nextLevelXP}
            />
          </div>

          <div className="relative z-10 mt-4 grid grid-cols-3 gap-3">
            <StatPill
              label={t('xp.level', language)}
              value={stats.level}
              icon={Trophy}
            />
            <StatPill
              label={t('xp.currentXp', language)}
              value={stats.totalXP}
              icon={Zap}
            />
            <StatPill
              label={t('xp.nextLevelIn', language)}
              value={nextLevelIn}
              icon={Trophy}
            />
          </div>

          <div className="relative z-10 mt-5 grid grid-cols-2 gap-3">
            <ActionButton
              icon={ShoppingBag}
              label={t('home.shop', language)}
              onClick={onOpenShop}
            />
            <ActionButton
              icon={Images}
              label={t('home.levelGallery', language)}
              onClick={onOpenGallery}
            />
          </div>

          <div className="relative z-10 mt-3">
            <ActionButton
              icon={Play}
              label={t('home.startWorkout', language)}
              onClick={onStartWorkout}
              primary
            />
          </div>

          <div className="relative z-10 mt-4 rounded-[24px] border border-white/10 bg-black/20 px-4 py-4">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">
              {t('xp.status', language)}
            </div>
            <div className="mt-2 text-sm leading-6 text-white/62">
              Heavy training flow. Fast access. Clear rat in focus. No clutter.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}