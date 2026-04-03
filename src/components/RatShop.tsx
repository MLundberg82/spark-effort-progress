import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  shopItems as fallbackShopItems,
  type ShopItem,
  getPurchases,
  purchaseItem,
  equipItem,
  getEquipped,
  isEquipped as isItemEquipped,
} from '@/lib/shopStore';
import { getItemById } from '@/lib/itemAssets';
import type { EquippedItems, ItemSlot, RatVariant } from '@/lib/assetTypes';
import GymRatStage from '@/components/GymRatStage';
import { ShoppingBag, Check, Sparkles, ArrowLeft, Crown, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { getLevelFromXP, getTotalXP } from '@/lib/gamificationStore';
import { formatPrice, getItemPrice as getCurrencyItemPrice } from '@/lib/currency';
import { getGenderKey } from '@/lib/ratImages';

const slotLabels: Record<ItemSlot, string> = {
  head: '🧢 Head',
  eyes: '🕶 Eyes',
  neck: '⛓ Neck',
  top: '🧥 Top',
  pants: '👖 Pants',
  feet: '👟 Feet',
  aura: '✨ Aura',
};

type RatShopProps = {
  premium?: boolean;
  items?: ShopItem[];
  equipped?: EquippedItems;
  glowClass?: string;
  onBack?: () => void;
  onOpenPremium?: () => void;
  onRefresh?: () => void;
};

function RatShop({
  premium = false,
  items,
  equipped: equippedProp,
  onOpenPremium,
  onRefresh,
}: RatShopProps) {
  const [open, setOpen] = useState(true);
  const [activeSlot, setActiveSlot] = useState<ItemSlot>('top');
  const [purchases, setPurchases] = useState<string[]>(getPurchases());
  const [equippedState, setEquippedState] = useState<EquippedItems>(equippedProp ?? getEquipped());
  const [previewItem, setPreviewItem] = useState<ShopItem | null>(null);
  const [showPremium, setShowPremium] = useState(false);

  const sourceItems = items && items.length > 0 ? items : fallbackShopItems;

  const totalXP = getTotalXP();
  const levelData = getLevelFromXP(totalXP);
  const level = typeof levelData === 'number' ? levelData : levelData?.level ?? 1;
  const variant = getGenderKey() as RatVariant;

  const filteredItems = useMemo(() => {
    return sourceItems.filter((item) => {
      const matchesSlot = item.slot === activeSlot;
      const matchesPremiumTab = showPremium ? !!item.premium : !item.premium;
      return matchesSlot && matchesPremiumTab;
    });
  }, [sourceItems, activeSlot, showPremium]);

  const refreshLocalState = () => {
    setPurchases(getPurchases());
    setEquippedState(getEquipped());
    onRefresh?.();
  };

  const getDisplayPrice = (item: ShopItem): number => {
    if (item.premium && premium) return 0;
    if (typeof item.price === 'number') return item.price;

    try {
      const fallback = getCurrencyItemPrice(!!item.premium);
      return typeof fallback === 'number' ? fallback : 0;
    } catch {
      return 0;
    }
  };

  const handlePurchase = (item: ShopItem) => {
    if (item.premium && !premium) {
      toast.error('Premium item — unlock Premium first.');
      onOpenPremium?.();
      return;
    }

    if (item.premium && premium) {
      toast.success(`${item.name} unlocked with Premium!`);
      refreshLocalState();
      return;
    }

    if (purchaseItem(item.id)) {
      setPurchases(getPurchases());
      toast.success(`Purchased ${item.name}!`);
      onRefresh?.();
    }
  };

  const handleEquip = (item: ShopItem) => {
    if (item.premium && !premium) {
      toast.error('Premium item — unlock Premium first.');
      onOpenPremium?.();
      return;
    }

    if (!purchases.includes(item.id) && !(item.premium && premium)) {
      handlePurchase(item);
      return;
    }

    equipItem(item.id, item.slot);
    setEquippedState(getEquipped());
    toast.success(`Equipped ${item.name}!`);
    setPreviewItem(null);
    onRefresh?.();
  };

  const previewEquipped: EquippedItems = previewItem
    ? {
        ...equippedState,
        [previewItem.slot]: previewItem.id,
      }
    : equippedState;

  const renderPreviewStage = (size: 'lg' | 'sm' = 'lg') => {
    return (
      <GymRatStage
        level={level}
        variant={variant}
        equipped={previewEquipped}
        showTierBadge={size === 'lg'}
        showLevelBadge={size === 'lg'}
        className={size === 'lg' ? 'min-h-[420px]' : 'min-h-[220px]'}
      />
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setPreviewItem(null);
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-accent" /> Rat Shop
          </DialogTitle>
        </DialogHeader>

        {previewItem ? (
          <div className="space-y-4 animate-fade-in">
            <button
              onClick={() => setPreviewItem(null)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to shop
            </button>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div>{renderPreviewStage('lg')}</div>

              <div className="flex flex-col justify-center rounded-3xl border border-border/40 bg-secondary/20 p-5">
                <div className="space-y-2">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    {slotLabels[previewItem.slot]}
                  </div>

                  <h3 className="font-display font-bold text-foreground text-2xl">
                    {previewItem.name}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {previewItem.description}
                  </p>

                  {typeof previewItem.unlockLevel === 'number' && (
                    <p className="text-xs text-accent font-semibold">
                      Unlock level: {previewItem.unlockLevel}
                    </p>
                  )}
                </div>

                <div className="mt-5">
                  {previewItem.premium && !premium ? (
                    <button
                      onClick={() => onOpenPremium?.()}
                      className="w-full px-4 py-3 rounded-2xl bg-secondary/50 text-muted-foreground font-bold text-sm flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" /> Premium Only
                    </button>
                  ) : purchases.includes(previewItem.id) || (previewItem.premium && premium) ? (
                    equippedState[previewItem.slot] === previewItem.id ? (
                      <span className="w-full px-4 py-3 rounded-2xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" /> Equipped
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEquip(previewItem)}
                        className="w-full px-6 py-3 rounded-2xl gradient-primary text-primary-foreground font-bold text-sm btn-3d shadow-button"
                      >
                        Equip Item
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handlePurchase(previewItem)}
                      className="w-full px-6 py-3 rounded-2xl gradient-accent text-accent-foreground font-bold text-sm btn-gold flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {premium && previewItem.premium
                        ? 'Unlock Free'
                        : `Buy for ${formatPrice(getDisplayPrice(previewItem))}`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPremium(false)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                      !showPremium
                        ? 'gradient-primary text-primary-foreground shadow-button'
                        : 'bg-secondary/50 text-muted-foreground'
                    }`}
                  >
                    🛒 Shop
                  </button>
                  <button
                    onClick={() => setShowPremium(true)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                      showPremium
                        ? 'gradient-accent text-accent-foreground shadow-gold'
                        : 'bg-secondary/50 text-muted-foreground'
                    }`}
                  >
                    <Crown className="w-3 h-3" /> Premium
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(slotLabels) as ItemSlot[]).map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setActiveSlot(slot)}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeSlot === slot
                          ? 'gradient-primary text-primary-foreground shadow-button'
                          : 'bg-secondary/50 text-muted-foreground'
                      }`}
                    >
                      {slotLabels[slot]}
                    </button>
                  ))}
                </div>

                <div className="rounded-3xl border border-border/40 bg-secondary/20 p-3">
                  {renderPreviewStage('sm')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {filteredItems.map((item) => {
                  const asset = getItemById(item.id);
                  const owned = purchases.includes(item.id) || (item.premium && premium);
                  const equippedNow = equippedState[item.slot] === item.id;
                  const locked = item.premium && !premium;
                  const previewImage = asset?.variants?.[variant] || asset?.image;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setPreviewItem(item)}
                      className={`rounded-2xl p-4 flex flex-col items-center gap-3 transition-all cursor-pointer hover:scale-[1.02] ${
                        equippedNow
                          ? 'card-3d glow-border'
                          : owned
                            ? 'card-3d'
                            : 'bg-secondary/30 border border-border/30'
                      } ${item.premium ? 'ring-1 ring-accent/30' : ''}`}
                    >
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden bg-[hsl(220_15%_12%)] relative">
                        {locked && (
                          <Lock className="w-4 h-4 text-muted-foreground absolute z-20" />
                        )}

                        {previewImage ? (
                          <img
                            src={previewImage}
                            alt={item.name}
                            className="w-14 h-14 object-contain"
                          />
                        ) : (
                          <span className="text-2xl">{item.icon}</span>
                        )}
                      </div>

                      <div className="text-center">
                        <p className="text-xs font-bold text-foreground">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {equippedNow ? (
                        <span className="text-[10px] px-2 py-1 rounded-full gradient-primary text-primary-foreground font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Equipped
                        </span>
                      ) : owned ? (
                        <span className="text-[10px] px-2 py-1 rounded-full bg-primary/20 text-primary font-bold">
                          {item.premium && premium ? 'Included in Premium' : 'Owned'}
                        </span>
                      ) : locked ? (
                        <span className="text-[10px] px-2 py-1 rounded-full bg-accent/20 text-accent font-bold flex items-center gap-1">
                          <Crown className="w-3 h-3" /> Premium
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-1 rounded-full gradient-accent text-accent-foreground font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> {formatPrice(getDisplayPrice(item))}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {filteredItems.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No {showPremium ? 'premium' : 'free'} items in this slot
              </p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default RatShop;