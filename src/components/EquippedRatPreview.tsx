import { getRatImage } from '../lib/assetRegistry';
import type { UserGender } from '../lib/profileStore';

type Props = {
  level: number;
  gender?: UserGender;
  size?: 'hero' | 'card';
};

function mapGenderToVariant(gender?: UserGender) {
  if (gender === 'female') return 'female';
  if (gender === 'non-binary') return 'nonbinary';
  return 'male';
}

export default function EquippedRatPreview({
  level,
  gender,
  size = 'hero',
}: Props) {
  const ratImage = getRatImage(level, mapGenderToVariant(gender));

  const frameClass =
    size === 'hero'
      ? 'h-[280px] w-[280px] sm:h-[320px] sm:w-[320px]'
      : 'h-[180px] w-[180px]';

  return (
    <div className={`relative ${frameClass}`}>
      <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute inset-4 rounded-full border border-white/10 bg-zinc-950/70" />
      <div className="absolute inset-0 rounded-full border border-white/10 bg-gradient-to-b from-white/8 to-white/3" />

      {ratImage ? (
        <img
          src={ratImage}
          alt="Gym Rat"
          className="absolute inset-0 z-10 h-full w-full object-contain p-3 drop-shadow-[0_0_20px_rgba(52,211,153,0.18)]"
        />
      ) : (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-[96px]">
          🐀
        </div>
      )}
    </div>
  );
}