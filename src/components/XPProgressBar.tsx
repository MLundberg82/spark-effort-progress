import { useEffect, useState } from 'react';
import { getLanguage, t, type AppLanguage } from '@/lib/languageStore';

type Props = {
  level: number;
  currentXP: number;
  nextLevelXP: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function XPProgressBar({
  level,
  currentXP,
  nextLevelXP,
}: Props) {
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

  const safeNext = Math.max(1, nextLevelXP);
  const progressPercent = clamp((currentXP / safeNext) * 100, 0, 100);
  const xpLeft = Math.max(0, safeNext - currentXP);

  return (
    <div className="rounded-[24px] border border-white/10 bg-zinc-950/70 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
            {t('xp.progression', language)}
          </p>
          <h3 className="mt-1 text-lg font-black uppercase text-white">
            {t('xp.level', language)} {level}
          </h3>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
            {t('xp.progress', language)}
          </p>
          <p className="mt-1 text-base font-black text-lime-300">
            {progressPercent.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="relative h-9 overflow-hidden rounded-full border border-white/10 bg-zinc-900">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#d4af37_0%,#f6df8b_35%,#7CFF6B_100%)] shadow-[0_0_24px_rgba(124,255,107,0.22)] transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />

        <div className="absolute inset-0 flex items-center justify-center px-3">
          <span className="text-[11px] font-black uppercase tracking-[0.14em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {currentXP} / {safeNext} XP
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
        <span>
          {t('xp.nextLevelIn', language)} {xpLeft} XP
        </span>
        <span>{t('xp.status', language)}</span>
      </div>
    </div>
  );
}