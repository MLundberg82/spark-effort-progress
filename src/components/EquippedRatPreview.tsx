import { getBackgroundImage, getItemImage, getRatImage } from '@/lib/assetRegistry';
import type { RatVariant } from '@/lib/assetTypes';
import type { UserGender } from '@/lib/profileStore';
import { getEquippedItems } from '@/lib/shopStore';

type Props = {
  level: number;
  gender?: UserGender;
  size?: 'hero' | 'card';
};

function mapGenderToVariant(gender?: UserGender): RatVariant {
  if (gender === 'female') return 'female';
  if (gender === 'non-binary') return 'nonbinary';
  return 'male';
}

function getFrameClass(size: 'hero' | 'card') {
  if (size === 'card') {
    return 'h-[190px] w-[190px] sm:h-[210px] sm:w-[210px]';
  }

  return 'h-[300px] w-[300px] sm:h-[360px] sm:w-[360px]';
}

function getRatPadding(size: 'hero' | 'card') {
  return size === 'hero' ? 'p-2 sm:p-3' : 'p-2';
}

function getOverlayClass(slot?: string) {
  switch (slot) {
    case 'aura':
      return 'absolute inset-[-4%] z-[5] h-[108%] w-[108%] object-contain opacity-95';
    case 'head':
      return 'absolute inset-0 z-[30] h-full w-full object-contain';
    case 'eyes':
      return 'absolute inset-0 z-[31] h-full w-full object-contain';
    case 'neck':
      return 'absolute inset-0 z-[28] h-full w-full object-contain';
    case 'top':
      return 'absolute inset-0 z-[24] h-full w-full object-contain';
    case 'pants':
      return 'absolute inset-0 z-[22] h-full w-full object-contain';
    case 'feet':
      return 'absolute inset-0 z-[21] h-full w-full object-contain';
    default:
      return 'absolute inset-0 z-[20] h-full w-full object-contain';
  }
}

export default function EquippedRatPreview({ level, gender, size = 'hero' }: Props) {
  const variant = mapGenderToVariant(gender);
  const ratImage = getRatImage(level, variant);
  const equipped = getEquippedItems();

  const backgroundImage = equipped.background ? getBackgroundImage(equipped.background) : undefined;

  const auraImage = equipped.aura ? getItemImage(equipped.aura) : undefined;
  const headImage = equipped.head ? getItemImage(equipped.head) : undefined;
  const eyesImage = equipped.eyes ? getItemImage(equipped.eyes) : undefined;
  const neckImage = equipped.neck ? getItemImage(equipped.neck) : undefined;
  const topImage = equipped.top ? getItemImage(equipped.top) : undefined;
  const pantsImage = equipped.pants ? getItemImage(equipped.pants) : undefined;
  const feetImage = equipped.feet ? getItemImage(equipped.feet) : undefined;

  const frameClass = getFrameClass(size);
  const ratPadding = getRatPadding(size);

  return (
    <div className={`relative ${frameClass}`}>
      <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_50%_20%,rgba(74,222,128,0.16),transparent_45%),linear-gradient(180deg,rgba(24,24,27,0.82),rgba(9,9,11,0.96))] shadow-[0_20px_80px_rgba(0,0,0,0.45)]" />
      <div className="absolute inset-[1px] rounded-[2rem] border border-white/10 bg-white/[0.03]" />
      <div className="absolute inset-4 rounded-[1.5rem] bg-gradient-to-b from-white/[0.05] via-transparent to-black/20" />

      <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
        <div className="absolute left-1/2 top-[10%] h-[28%] w-[60%] -translate-x-1/2 rounded-full bg-emerald-400/12 blur-3xl" />
        <div className="absolute bottom-[12%] left-1/2 h-[22%] w-[72%] -translate-x-1/2 rounded-full bg-lime-300/8 blur-3xl" />
      </div>

      <div className="absolute inset-[10px] overflow-hidden rounded-[1.6rem]">
        {backgroundImage ? (
          <img
            src={backgroundImage}
            alt="Background"
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-90"
          />
        ) : (
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.15),transparent_42%),linear-gradient(180deg,rgba(24,24,27,0.45),rgba(9,9,11,0.86))]" />
        )}

        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/10 via-transparent to-black/35" />
      </div>

      <div className={`absolute inset-[12px] z-10 ${ratPadding}`}>
        <div className="relative h-full w-full">
          {auraImage ? (
            <img src={auraImage} alt="Aura" className={getOverlayClass('aura')} />
          ) : null}

          {ratImage ? (
            <img
              src={ratImage}
              alt="Gym Rat"
              className="absolute inset-0 z-[10] h-full w-full object-contain drop-shadow-[0_22px_40px_rgba(0,0,0,0.42)]"
            />
          ) : (
            <div className="absolute inset-0 z-[10] flex items-center justify-center text-[96px]">
              🐀
            </div>
          )}

          {pantsImage ? <img src={pantsImage} alt="Pants" className={getOverlayClass('pants')} /> : null}
          {feetImage ? <img src={feetImage} alt="Feet" className={getOverlayClass('feet')} /> : null}
          {topImage ? <img src={topImage} alt="Top" className={getOverlayClass('top')} /> : null}
          {neckImage ? <img src={neckImage} alt="Neck" className={getOverlayClass('neck')} /> : null}
          {headImage ? <img src={headImage} alt="Head" className={getOverlayClass('head')} /> : null}
          {eyesImage ? <img src={eyesImage} alt="Eyes" className={getOverlayClass('eyes')} /> : null}
        </div>
      </div>

      <div className="absolute inset-x-[16%] bottom-3 h-6 rounded-full bg-emerald-300/8 blur-2xl" />
    </div>
  );
}