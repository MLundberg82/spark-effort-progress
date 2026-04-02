import React, { useCallback, useEffect, useMemo, useState } from 'react';

import * as gamificationStore from '@/lib/gamificationStore';
import * as shopStore from '@/lib/shopStore';
import * as shopImagesModule from '@/lib/shopImages';
import * as shopPreviewImagesModule from '@/lib/shopPreviewImages';
import * as ratImagesModule from '@/lib/ratImages';
import * as trainingStore from '@/lib/trainingStore';
import * as autosaveStore from '@/lib/autosaveStore';
import * as analyticsModule from '@/lib/analytics';
import { handlePaywallTrigger } from '@/lib/paywallTriggers';
import SplashScreen from '@/components/SplashScreen';
import TrainingLevelSelector from '@/components/TrainingLevelSelector';
import WorkoutFlow from '@/components/WorkoutFlow';
import WorkoutComplete from '@/components/WorkoutComplete';
import GymRatGallery from '@/components/GymRatGallery';
import RatShop from '@/components/RatShop';
import AppMenu from '@/components/AppMenu';
import ShareButton from '@/components/ShareButton';
import { type PaywallTrigger, shouldShowPaywall } from '@/lib/paywallStore';

type ScreenView =
  | 'home'
  | 'training-level'
  | 'workout'
  | 'workout-complete'
  | 'gallery'
  | 'shop';

type GenericRecord = Record<string, any>;

type ShopItem = GenericRecord & {
  id: string;
  premium?: boolean;
  price?: number;
  cost?: number;
  image?: any;
  previewImage?: any;
};

type AutosaveState = GenericRecord & {
  inProgress?: boolean;
  step?: number;
  workoutType?: string;
};

const ONBOARDING_COMPLETED_KEY = 'gymrat-onboarding-completed';

type IndexScreenProps = {
  openPaywall: (trigger: PaywallTrigger) => void;
};

const SplashScreenAny = SplashScreen as any;
const TrainingLevelSelectorAny = TrainingLevelSelector as any;
const WorkoutFlowAny = WorkoutFlow as any;
const WorkoutCompleteAny = WorkoutComplete as any;
const GymRatGalleryAny = GymRatGallery as any;
const RatShopAny = RatShop as any;
const AppMenuAny = AppMenu as any;
const ShareButtonAny = ShareButton as any;

function getModuleFunction<T extends (...args: any[]) => any>(
  moduleObject: GenericRecord,
  functionNames: string[]
): T | undefined {
  for (const name of functionNames) {
    if (typeof moduleObject?.[name] === 'function') {
      return moduleObject[name] as T;
    }
  }
  return undefined;
}

function getModuleValue<T = any>(
  moduleObject: GenericRecord,
  valueNames: string[],
  fallback: T
): T {
  for (const name of valueNames) {
    if (typeof moduleObject?.[name] !== 'undefined') {
      return moduleObject[name] as T;
    }
  }
  return fallback;
}

function getSafeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

function getItemPrice(item: ShopItem): number {
  if (typeof item?.price === 'number') return item.price;
  if (typeof item?.cost === 'number') return item.cost;
  return 0;
}

function itemIsPremium(item: ShopItem): boolean {
  return !!item?.premium;
}

function canAccessItem(item: ShopItem, premiumActive: boolean): boolean {
  if (itemIsPremium(item)) return premiumActive;
  return true;
}

function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
}

function markOnboardingCompleted(): void {
  localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
}

export default function IndexScreen({ openPaywall }: IndexScreenProps) {
  const [isBooting, setIsBooting] = useState(true);
const [view, setView] = useState<ScreenView>(
  hasCompletedOnboarding() ? 'home' : 'training-level'
);
  const [autosave, setAutosave] = useState<AutosaveState | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const trackEvent = getModuleFunction(analyticsModule as GenericRecord, ['trackEvent']);

  const getTotalXP = getModuleFunction(gamificationStore as GenericRecord, ['getTotalXP']);
  const getLevelFromXP = getModuleFunction(gamificationStore as GenericRecord, ['getLevelFromXP']);
  const getRatTier = getModuleFunction(gamificationStore as GenericRecord, ['getRatTier']);
  const getStreak = getModuleFunction(gamificationStore as GenericRecord, ['getStreak']);
  const isPremium = getModuleFunction(gamificationStore as GenericRecord, ['isPremium']);

  const getActiveGlowClass = getModuleFunction(shopStore as GenericRecord, ['getActiveGlowClass']);
  const getEquipped = getModuleFunction(shopStore as GenericRecord, ['getEquipped']);

  const rawShopItems = getModuleValue<ShopItem[]>(
    shopStore as GenericRecord,
    ['shopItems'],
    []
  );

  const shopItemImages = getModuleValue<Record<string, any>>(
    shopImagesModule as GenericRecord,
    ['shopItemImages'],
    {}
  );

  const getItemPreviewImage = getModuleFunction(
    shopPreviewImagesModule as GenericRecord,
    ['getItemPreviewImage']
  );

  const getCurrentTierImage = getModuleFunction(
    ratImagesModule as GenericRecord,
    ['getCurrentTierImage', 'getRatTierImage', 'getTierImage']
  );

  const getTrainingLevel = getModuleFunction(trainingStore as GenericRecord, ['getTrainingLevel']);
  const getAutosaveState = getModuleFunction(autosaveStore as GenericRecord, ['getAutosaveState']);
  const clearAutosaveState = getModuleFunction(autosaveStore as GenericRecord, ['clearAutosaveState']);

  const syncUI = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const normalizeShopItem = useCallback(
    (item: ShopItem): ShopItem => {
      let previewImage = item?.image ?? null;

      try {
        if (typeof getItemPreviewImage === 'function') {
          previewImage = getItemPreviewImage(item.id) ?? previewImage;
        }
      } catch {}

      return {
        ...item,
        image: shopItemImages?.[item.id] ?? item?.image ?? null,
        previewImage,
        price: getItemPrice(item),
        premium: itemIsPremium(item),
      };
    },
    [getItemPreviewImage, shopItemImages]
  );

  const appState = useMemo(() => {
    const totalXP = getSafeNumber(getTotalXP?.(), 0);
    const level = getSafeNumber(getLevelFromXP?.(totalXP), 1);
    const streak = getSafeNumber(getStreak?.(), 0);
    const tier = getRatTier?.() ?? 'rookie';
    const premiumActive = !!isPremium?.();
    const trainingLevel = getTrainingLevel?.() ?? null;
    const equipped = getEquipped?.() ?? {};
    const activeGlowClass = getActiveGlowClass?.() ?? '';

    let currentTierImage = null;

    try {
      if (typeof getCurrentTierImage === 'function') {
        currentTierImage = getCurrentTierImage(tier) ?? null;
      }
    } catch {}

    return {
      totalXP,
      level,
      streak,
      tier,
      premiumActive,
      trainingLevel,
      equipped,
      activeGlowClass,
      currentTierImage,
    };
  }, [
    refreshKey,
    getActiveGlowClass,
    getCurrentTierImage,
    getEquipped,
    getLevelFromXP,
    getRatTier,
    getStreak,
    getTotalXP,
    getTrainingLevel,
    isPremium,
  ]);

const preparedShopItems = useMemo(() => {
  if (!Array.isArray(rawShopItems)) return [];

  return rawShopItems.map((item) => {
    const normalized = normalizeShopItem(item);

    if (normalized.premium && appState.premiumActive) {
      return {
        ...normalized,
        price: 0,
        cost: 0,
        premiumUnlocked: true,
      };
    }

    return normalized;
  });
}, [rawShopItems, normalizeShopItem, appState.premiumActive]);

  useEffect(() => {
    const MIN_SPLASH_TIME = 1200;
    const startTime = Date.now();

    const boot = async () => {
      try {
        const autosaveStateValue = (getAutosaveState?.() as AutosaveState | null) ?? null;

        if (autosaveStateValue?.inProgress) {
          setAutosave(autosaveStateValue);
        }

        trackEvent?.('app_opened', {
          premium: appState.premiumActive,
          level: appState.level,
        });
      } catch (error) {
        console.log('boot error', error);
      } finally {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_SPLASH_TIME - elapsed);

        window.setTimeout(() => {
          setIsBooting(false);
        }, remaining);
      }
    };

    boot();
  }, []);

const goHome = useCallback(() => {
  syncUI();

  if (!hasCompletedOnboarding()) {
    setView('training-level');
    return;
  }

  setView('home');
}, [syncUI]);

  const openManualPremium = useCallback(() => {
    if (appState.premiumActive) return;
    openPaywall('manual');
  }, [appState.premiumActive, openPaywall]);

  const openCustomWorkoutPremium = useCallback(() => {
    if (appState.premiumActive) return;
    openPaywall('custom_workout');
  }, [appState.premiumActive, openPaywall]);

  const openHistoryPremium = useCallback(() => {
    if (appState.premiumActive) return;
    openPaywall('history');
  }, [appState.premiumActive, openPaywall]);

  const openShopPremium = useCallback(() => {
    if (appState.premiumActive) return;
    openPaywall('shop_premium');
  }, [appState.premiumActive, openPaywall]);

  const openShop = useCallback(() => {
    syncUI();
    setView('shop');
  }, [syncUI]);

  const openGallery = useCallback(() => {
    syncUI();
    setView('gallery');
  }, [syncUI]);

const openTraining = useCallback(() => {
  if (!hasCompletedOnboarding()) {
    setView('training-level');
    return;
  }

  setView('workout');
}, []);

const startWorkout = useCallback(() => {
  markOnboardingCompleted();
  setView('workout');
}, []);

const completeWorkout = useCallback(() => {
  syncUI();
  setView('workout-complete');

  handlePaywallTrigger('workout_complete', openPaywall);
}, [syncUI]);

  const ONBOARDING_COMPLETED_KEY = 'gymrat-onboarding-completed';

  useEffect(() => {
    if (view !== 'workout-complete') return;
    if (appState.premiumActive) return;
    if (!shouldShowPaywall()) return;

    const timeout = window.setTimeout(() => {
      openPaywall('workout_complete');
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [view, appState.premiumActive, openPaywall]);
  if (isBooting) {
    return <SplashScreenAny isLoading={true} />;
  }

  return (
    <>
      {view === 'home' && (
        <div className="min-h-screen">
          <SplashScreenAny
            isLoading={false}
            level={appState.level}
            streak={appState.streak}
            premium={appState.premiumActive}
            onStartWorkout={openTraining}
            onOpenGallery={openGallery}
            onOpenShop={openShop}
          />

          <AppMenuAny
            premium={appState.premiumActive}
            onHome={goHome}
            onTraining={openTraining}
            onGallery={openGallery}
            onShop={openShop}
            onPremium={openManualPremium}
          />

          <div className="px-4 pb-6">
            <ShareButtonAny
              level={appState.level}
              streak={appState.streak}
              ratTier={appState.tier}
            />
          </div>
        </div>
        
      )}
      
      {!appState.premiumActive && (
  <div className="px-4 pb-4">
    <div
      onClick={() => openPaywall('manual')}
      className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 cursor-pointer hover:scale-[1.01] transition"
    >
      <p className="text-sm font-semibold text-white">
        Unlock full GymRat experience 👑
      </p>
      <p className="text-xs text-zinc-400 mt-1">
        Track progress, unlock premium items & build custom workouts
      </p>
    </div>
  </div>
)}

      {view === 'training-level' && (
        <TrainingLevelSelectorAny
          selectedLevel={appState.trainingLevel}
          premium={appState.premiumActive}
          onBack={goHome}
          onContinue={startWorkout}
          onOpenPremium={openCustomWorkoutPremium}
        />
      )}

      {view === 'workout' && (
        <WorkoutFlowAny
          premium={appState.premiumActive}
          trainingLevel={appState.trainingLevel}
          autosave={autosave}
          onBack={goHome}
          onComplete={completeWorkout}
          onOpenPremium={openCustomWorkoutPremium}
        />
      )}

      {view === 'workout-complete' && (
        <WorkoutCompleteAny
          premium={appState.premiumActive}
          level={appState.level}
          totalXP={appState.totalXP}
          streak={appState.streak}
          ratTier={appState.tier}
          ratImage={appState.currentTierImage}
          onDone={goHome}
          onOpenPremium={openHistoryPremium}
        />
      )}

      {view === 'gallery' && (
        <GymRatGalleryAny
          premium={appState.premiumActive}
          currentTier={appState.tier}
          currentImage={appState.currentTierImage}
          equipped={appState.equipped}
          onBack={goHome}
          onOpenPremium={openShopPremium}
        />
      )}

      {view === 'shop' && (
        <RatShopAny
          premium={appState.premiumActive}
          items={preparedShopItems}
          equipped={appState.equipped}
          glowClass={appState.activeGlowClass}
          onBack={goHome}
          onOpenPremium={openShopPremium}
          onRefresh={syncUI}
        />
      )}

    </>
  );
}