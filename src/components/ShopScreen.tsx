import { Check, Crown, Lock, ShoppingBag, Sparkles } from 'lucide-react';
import { getShopItems, equipItem, getEquippedItemIds } from '../lib/shopStore';
import { isPremiumUnlocked } from '../lib/premiumStore';

type ShopScreenProps = {
  onBack: () => void;
  onOpenPaywall: () => void;
};

export default function ShopScreen({ onBack, onOpenPaywall }: ShopScreenProps) {
  const items = getShopItems();
  const equipped = getEquippedItemIds();
  const premium = isPremiumUnlocked();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_24%),linear-gradient(180deg,_#09090b_0%,_#0f172a_100%)] px-4 py-4 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-400">Shop</p>
            <h1 className="mt-1 text-2xl font-black">Build your identity</h1>
          </div>

          <button
            onClick={onBack}
            type="button"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition hover:bg-white/10"
          >
            Back
          </button>
        </div>

        <div className="relative mb-4 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.16),transparent_18%),radial-gradient(circle_at_85%_25%,rgba(250,204,21,0.10),transparent_18%)]" />
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Cosmetics</p>
              <p className="mt-1 text-2xl font-black">Visual identity</p>
              <p className="mt-1 text-sm text-zinc-400">
                Premium items unlock through Premium. Regular items can later connect to real in-app purchases.
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-yellow-300/15 bg-yellow-300/10 text-yellow-300 shadow-[0_0_40px_rgba(250,204,21,0.12)]">
              <Sparkles className="h-7 w-7" />
            </div>
          </div>
        </div>

        {!premium && (
          <button
            onClick={onOpenPaywall}
            type="button"
            className="mb-4 flex w-full items-center justify-between rounded-[26px] border border-amber-300/20 bg-gradient-to-r from-amber-300/12 to-yellow-300/10 p-4 text-left shadow-[0_14px_30px_rgba(0,0,0,0.24)] transition hover:scale-[1.01]"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-amber-200">Premium unlock</p>
              <p className="mt-1 font-black text-amber-100">Open premium cosmetics</p>
              <p className="mt-1 text-sm text-zinc-300">
                Premium includes selected cosmetics instead of fake in-app currency.
              </p>
            </div>
            <div className="inline-flex rounded-2xl bg-amber-300/15 p-3 text-amber-200">
              <Crown className="h-5 w-5" />
            </div>
          </button>
        )}

        <div className="space-y-3">
          {items.map((item) => {
            const owned = item.owned;
            const isEquipped = equipped.includes(item.id);
            const premiumLocked = item.isPremium && !premium;

            return (
              <div
                key={item.id}
                className={`relative overflow-hidden rounded-[28px] border p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)] transition ${
                  premiumLocked
                    ? 'border-amber-300/15 bg-gradient-to-br from-amber-300/10 to-white/[0.04]'
                    : isEquipped
                      ? 'border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 to-white/[0.05]'
                      : 'border-white/10 bg-white/[0.06]'
                }`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_18%)]" />

                <div className="relative z-10">
                  <div className="flex items-start gap-4">
                    <div
                      className={`relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[22px] border ${
                        premiumLocked
                          ? 'border-amber-300/20 bg-amber-300/10'
                          : isEquipped
                            ? 'border-emerald-400/20 bg-emerald-400/10'
                            : 'border-white/10 bg-black/20'
                      }`}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <span className="text-3xl">{item.emoji}</span>
                      )}

                      {isEquipped && (
                        <div className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-black shadow-[0_0_18px_rgba(52,211,153,0.35)]">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-black">{item.name}</h2>

                        {item.isPremium && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-200">
                            <Crown className="h-3 w-3" />
                            Premium
                          </span>
                        )}

                        {isEquipped && (
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-300">
                            Equipped
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-zinc-400">{item.description}</p>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-white">
                            {item.isPremium ? 'Included in Premium' : 'Real purchase later'}
                          </p>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                            {item.isPremium ? 'premium cosmetic' : 'iap cosmetic'}
                          </p>
                        </div>

                        {premiumLocked ? (
                          <button
                            onClick={onOpenPaywall}
                            type="button"
                            className="flex items-center justify-center gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-200 transition hover:bg-amber-300/15"
                          >
                            <Lock className="h-4 w-4" />
                            Premium only
                          </button>
                        ) : owned ? (
                          <button
                            onClick={() => {
                              equipItem(item.id);
                              window.location.reload();
                            }}
                            type="button"
                            className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
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
                            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                          >
                            <ShoppingBag className="h-4 w-4" />
                            Coming soon
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.05] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
          <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-400">GymRat identity</p>
          <h3 className="mt-2 text-xl font-black">Your cosmetics should feel earned</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Premium items should feel exclusive. Other items can later be tied to real purchases instead of coins.
          </p>
        </div>
      </div>
    </div>
  );
}