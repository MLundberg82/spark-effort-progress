import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  shopItems as fallbackShopItems,
  type ShopItem,
  getPurchases,
  purchaseItem,
  equipItem,
  getEquipped,
} from '@/lib/shopStore';
import { shopItemImages } from '@/lib/shopImages';
import { getItemPreviewImage } from '@/lib/shopPreviewImages';
import { ShoppingBag, Check, Sparkles, ArrowLeft, Crown, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { getRatTier, getLevelFromXP, getTotalXP } from '@/lib/gamificationStore';
import { getCurrentTierImage } from '@/lib/ratImages';
import { formatPrice, getItemPrice as getCurrencyItemPrice } from '@/lib/currency';

const categoryLabels: Record<ShopItem['category'], string> = {
  clothing: '👕 Clothing',
  glow: '✨ Glow',
  accessory: '💎 Gear',
  background: '🏠 Gym',
};

type PreviewHeld = 'none' | 'barbell' | 'dumbbell';

type RatShopProps = {
  premium?: boolean;
  items?: ShopItem[];
  equipped?: Record<string, string | null | undefined>;
  glowClass?: string;
  onBack?: () => void;
  onOpenPremium?: () => void;
  onRefresh?: () => void;
};

function RatShop({
  premium = false,
  items,
  equipped: equippedProp,
  glowClass,
  onBack,
  onOpenPremium,
  onRefresh,
}: RatShopProps) {
  const [open, setOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ShopItem['category']>('clothing');
  const [purchases, setPurchases] = useState<string[]>(getPurchases());
  const [equippedState, setEquippedState] = useState<Record<string, string | null | undefined>>(
    equippedProp ?? getEquipped()
  );
  const [previewItem, setPreviewItem] = useState<ShopItem | null>(null);
  const [previewHeld, setPreviewHeld] = useState<PreviewHeld>('none');
  const [showPremium, setShowPremium] = useState(false);

  const sourceItems = items && items.length > 0 ? items : fallbackShopItems;

  const filteredItems = useMemo(() => {
    return sourceItems.filter(
      (item) => item.category === activeCategory && (showPremium ? !!item.premium : !item.premium)
    );
  }, [sourceItems, activeCategory, showPremium]);

  const totalXP = getTotalXP();
  const levelData = getLevelFromXP(totalXP);
  const level = typeof levelData === 'number' ? levelData : levelData?.level ?? 1;
  const ratTierData = getRatTier(level);
  const ratTier =
    typeof ratTierData === 'string'
      ? { tier: ratTierData, label: ratTierData }
      : ratTierData ?? { tier: 'rookie', label: 'rookie' };

  const refreshLocalState = () => {
    setPurchases(getPurchases());
    setEquippedState(getEquipped());
    onRefresh?.();
  };

  const getDisplayPrice = (item: ShopItem): number => {
    if (item.premium && premium) return 0;
    if (typeof item.price === 'number') return item.price;

    const itemWithOptionalCost = item as ShopItem & { cost?: number };
    if (typeof itemWithOptionalCost.cost === 'number') return itemWithOptionalCost.cost;

    try {
      const fallback = getCurrencyItemPrice(!!item.premium);
      return typeof fallback === 'number' ? fallback : 0;
    } catch {
      return 0;
    }
  };

  const handlePurchase = (item: ShopItem) => {
    if (item.premium && !premium) {
      toast.error('Premium item — unlock Premium first!');
      onOpenPremium?.();
      return;
    }

    if (item.premium && premium) {
      toast.success(`${item.name} unlocked with Premium! ${item.icon ?? ''}`);
      refreshLocalState();
      return;
    }

    if (purchaseItem(item.id)) {
      setPurchases(getPurchases());
      toast.success(`Purchased ${item.name}! ${item.icon ?? ''}`);
      onRefresh?.();
    }
  };

  const handleEquip = (item: ShopItem) => {
    if (item.premium && !premium) {
      toast.error('Premium item — unlock Premium first!');
      onOpenPremium?.();
      return;
    }

    if (!purchases.includes(item.id) && !(item.premium && premium)) {
      handlePurchase(item);
      return;
    }

    equipItem(item.id, item.category);
    setEquippedState(getEquipped());
    toast.success(`Equipped ${item.name}!`);
    setPreviewItem(null);
    onRefresh?.();
  };

  const previewGlow =
    previewItem?.category === 'glow' && previewItem.preview
      ? previewItem.preview
      : equippedState.glow
        ? sourceItems.find((i) => i.id === equippedState.glow)?.preview || glowClass || ''
        : glowClass || '';

  const equippedClothing = equippedState.clothing
    ? sourceItems.find((i) => i.id === equippedState.clothing)
    : null;
  const equippedAccessory = equippedState.accessory
    ? sourceItems.find((i) => i.id === equippedState.accessory)
    : null;

  const previewClothing = previewItem?.category === 'clothing' ? previewItem : equippedClothing;
  const previewAccessory = previewItem?.category === 'accessory' ? previewItem : equippedAccessory;

  const renderItemOnRat = (item: ShopItem | null | undefined) => {
    if (!item || !item.position) return null;
    const pos = item.position as any;
    const imageSrc = shopItemImages[item.id];

    if (imageSrc) {
      return (
        <img
          src={imageSrc}
          alt={item.name}
          className="absolute pointer-events-none transition-all duration-300"
          style={{
            top: pos.top,
            left: pos.left,
            right: pos.right,
            bottom: pos.bottom,
            width: pos.fontSize ? `${parseFloat(pos.fontSize) * 2}rem` : '3rem',
            height: pos.fontSize ? `${parseFloat(pos.fontSize) * 2}rem` : '3rem',
            transform: `translate(-50%, -50%) ${pos.rotate ? `rotate(${pos.rotate})` : ''}`,
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
            zIndex: 10,
          }}
        />
      );
    }

    return (
      <span
        className="absolute drop-shadow-lg transition-all duration-300 pointer-events-none"
        style={{
          top: pos.top,
          left: pos.left,
          right: pos.right,
          bottom: pos.bottom,
          fontSize: pos.fontSize || '1.5rem',
          transform: `translate(-50%, -50%) ${pos.rotate ? `rotate(${pos.rotate})` : ''}`,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
          zIndex: 10,
        }}
      >
        {item.icon}
      </span>
    );
  };

  const renderRatPreview = (size: 'lg' | 'sm' = 'lg') => {
    const containerClass = size === 'lg' ? 'w-40 h-40 rounded-3xl' : 'w-20 h-20 rounded-2xl';
    const imgClass = size === 'lg' ? 'w-32 h-32' : 'w-16 h-16';
    const heldSize = size === 'lg' ? 'text-2xl' : 'text-sm';

    const activePreviewItem =
      previewItem?.category === 'clothing' || previewItem?.category === 'accessory'
        ? previewItem
        : null;
    const preRendered = activePreviewItem ? getItemPreviewImage(activePreviewItem.id, ratTier.tier) : null;

    return (
      <div
        className={`relative ${containerClass} bg-[hsl(220_15%_12%)] flex items-center justify-center border-2 border-border/50 transition-all duration-500 ${previewGlow}`}
      >
        {preRendered ? (
          <img
            src={preRendered}
            alt={`${ratTier.label} wearing ${activePreviewItem?.name}`}
            className={`${imgClass} object-contain drop-shadow-lg relative z-[1]`}
          />
        ) : (
          <>
            <img
              src={getCurrentTierImage(ratTier.tier)}
              alt={ratTier.label}
              className={`${imgClass} object-contain drop-shadow-lg relative z-[1]`}
            />
            {renderItemOnRat(previewClothing)}
            {renderItemOnRat(previewAccessory)}
          </>
        )}

        {previewHeld === 'barbell' && (
          <span className={`absolute bottom-[15%] left-[50%] -translate-x-1/2 ${heldSize} drop-shadow-lg z-20`}>
            🏋️
          </span>
        )}
        {previewHeld === 'dumbbell' && (
          <span className={`absolute bottom-[15%] left-[50%] -translate-x-1/2 ${heldSize} drop-shadow-lg z-20`}>
            💪
          </span>
        )}
      </div>
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
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-card border-border">
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

            <div className="flex flex-col items-center gap-4">
              {renderRatPreview('lg')}

              <div className="text-center space-y-1">
                <h3 className="font-display font-bold text-foreground text-lg">{previewItem.name}</h3>
                <p className="text-xs text-muted-foreground">{previewItem.description}</p>
                <p className="text-[10px] text-accent font-semibold">Preview on your {ratTier.label}</p>
              </div>

              {previewItem.premium && !premium ? (
                <button
                  onClick={() => onOpenPremium?.()}
                  className="px-4 py-2 rounded-xl bg-secondary/50 text-muted-foreground font-bold text-sm flex items-center gap-1.5"
                >
                  <Lock className="w-4 h-4" /> Premium Only
                </button>
              ) : purchases.includes(previewItem.id) || (previewItem.premium && premium) ? (
                equippedState[previewItem.category] === previewItem.id ? (
                  <span className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Equipped
                  </span>
                ) : (
                  <button
                    onClick={() => handleEquip(previewItem)}
                    className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground font-bold text-sm btn-3d shadow-button"
                  >
                    Equip Item
                  </button>
                )
              ) : (
                <button
                  onClick={() => handlePurchase(previewItem)}
                  className="px-6 py-2.5 rounded-xl gradient-accent text-accent-foreground font-bold text-sm btn-gold flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />{' '}
                  {premium && previewItem.premium ? 'Unlock Free' : `Buy for ${formatPrice(getDisplayPrice(previewItem))}`}
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-1">
              <button
                onClick={() => setShowPremium(false)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                  !showPremium ? 'gradient-primary text-primary-foreground shadow-button' : 'bg-secondary/50 text-muted-foreground'
                }`}
              >
                🛒 Shop
              </button>
              <button
                onClick={() => setShowPremium(true)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                  showPremium ? 'gradient-accent text-accent-foreground shadow-gold' : 'bg-secondary/50 text-muted-foreground'
                }`}
              >
                <Crown className="w-3 h-3" /> Premium
              </button>
            </div>

            <div className="flex gap-2">
              {(Object.keys(categoryLabels) as ShopItem['category'][]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeCategory === cat
                      ? 'gradient-primary text-primary-foreground shadow-button'
                      : 'bg-secondary/50 text-muted-foreground'
                  }`}
                >
                  {categoryLabels[cat]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((item) => {
                const owned = purchases.includes(item.id);
                const isEquipped = equippedState[item.category] === item.id;
                const locked = item.premium && !premium;
                const itemImage = shopItemImages[item.id];

                return (
                  <div
                    key={item.id}
                    onClick={() => setPreviewItem(item)}
                    className={`rounded-2xl p-4 flex flex-col items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] ${
                      isEquipped ? 'card-3d glow-border' : owned ? 'card-3d' : 'bg-secondary/30 border border-border/30'
                    } ${item.premium ? 'ring-1 ring-accent/30' : ''}`}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden ${
                        item.category === 'glow' && item.preview ? item.preview : ''
                      } ${owned || (item.premium && premium) ? 'bg-[hsl(220_15%_12%)]' : item.premium ? 'bg-accent/20' : 'bg-secondary'}`}
                    >
                      {locked && <Lock className="w-4 h-4 text-muted-foreground absolute z-20" />}
                      {itemImage ? (
                        <img src={itemImage} alt={item.name} className="w-12 h-12 object-contain" />
                      ) : (
                        <span className="text-2xl">{item.icon}</span>
                      )}
                    </div>

                    <div className="text-center">
                      <p className="text-xs font-bold text-foreground">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</p>
                    </div>

                    {isEquipped ? (
                      <span className="text-[10px] px-2 py-1 rounded-full gradient-primary text-primary-foreground font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Equipped
                      </span>
                    ) : owned || (item.premium && premium) ? (
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

            {filteredItems.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No {showPremium ? 'premium' : 'free'} items in this category
              </p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RatShop;