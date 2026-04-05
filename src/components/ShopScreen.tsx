import { Check, Crown, Lock, ShoppingBag, Sparkles } from 'lucide-react';
import { getShopItems, equipItem, getEquippedItemIds } from '../lib/shopStore';
import { isPremiumUnlocked } from '../lib/premiumStore';

type ShopScreenProps = {
  onBack: () => void;
  onOpenPaywall: () => void;
};

export default function ShopScreen({
  onBack,
  onOpenPaywall,
}: ShopScreenProps) {
  const items = getShopItems();
  const equipped = getEquippedItemIds();
  const premium = isPremiumUnlocked();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_30%),linear-gradient(180deg,#07110d_0%,#0b1511_38%,#050806_100%)] px-4 pb-8 pt-5 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onBack}
            type="button"
            className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
          >
            Back
          </button>

          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-emerald-300">
            Shop
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/75">
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Cosmetics</span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
            Build your identity
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/65">
            Visual identity should feel earned. Premium items unlock through
            Premium, while regular cosmetics can later connect to real in-app
            purchases.
          </p>

          {!premium && (
            <button
              onClick={onOpenPaywall}
              type="button"
              className="mt-5 w-full rounded-[1.4rem] border border-yellow-400/20 bg-yellow-400/10 p-4 text-left transition hover:bg-yellow-400/15"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full border border-yellow-400/20 bg-yellow-400/10 p-2">
                  <Crown className="h-4 w-4 text-yellow-300" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black uppercase tracking-[0.14em] text-yellow-300">
                      Premium unlock
                    </p>
                    <Lock className="h-4 w-4 text-yellow-300" />
                  </div>

                  <p className="mt-2 text-base font-bold text-white">
                    Open premium cosmetics
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/62">
                    Premium includes selected cosmetics instead of fake in-app
                    currency and keeps the experience cleaner.
                  </p>
                </div>
              </div>
            </button>
          )}

          <div className="mt-5 space-y-3">
            {items.map((item) => {
              const owned = item.owned;
              const isEquipped = equipped.includes(item.id);
              const premiumLocked = item.isPremium && !premium;

              return (
                <div
                  key={item.id}
                  className="rounded-[1.6rem] border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.2rem] border border-white/10 bg-white/[0.05]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-3xl">{item.emoji}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-black tracking-tight text-white">
                          {item.name}
                        </h2>

                        {item.isPremium && (
                          <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-yellow-300">
                            Premium
                          </span>
                        )}

                        {isEquipped && (
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-emerald-300">
                            Equipped
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-white/58">
                        {item.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/50">
                          {item.isPremium
                            ? 'Included in Premium'
                            : 'Real purchase later'}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/50">
                          {item.isPremium ? 'premium cosmetic' : 'iap cosmetic'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    {premiumLocked ? (
                      <button
                        onClick={onOpenPaywall}
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-sm font-bold text-yellow-200 transition hover:bg-yellow-400/15"
                      >
                        <Lock className="h-4 w-4" />
                        <span>Premium only</span>
                      </button>
                    ) : owned ? (
                      <button
                        onClick={() => {
                          if (!isEquipped) {
                            equipItem(item.id);
                            window.location.reload();
                          }
                        }}
                        type="button"
                        className={`w-full rounded-2xl px-4 py-3 text-sm font-bold transition ${
                          isEquipped
                            ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                            : 'bg-white text-black hover:scale-[1.01]'
                        }`}
                      >
                        {isEquipped ? 'Equipped' : 'Equip'}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (item.isPremium) {
                            onOpenPaywall();
                            return;
                          }
                        }}
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>Coming soon</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 p-2">
                <Check className="h-4 w-4 text-emerald-300" />
              </div>

              <div>
                <p className="text-base font-bold text-white">
                  GymRat identity
                </p>
                <p className="mt-2 text-sm leading-6 text-white/62">
                  Your cosmetics should feel earned. Premium items should feel
                  exclusive. Other items can later be tied to real purchases
                  instead of coins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}