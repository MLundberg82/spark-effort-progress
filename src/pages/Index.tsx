import React, { useCallback, useEffect, useMemo, useState } from 'react';

import * as gamificationStore from '@/lib/gamificationStore';
import * as shopStore from '@/lib/shopStore';
import * as ratImagesModule from '@/lib/ratImages';
import * as trainingStore from '@/lib/trainingStore';
import * as autosaveStore from '@/lib/autosaveStore';
import * as analyticsModule from '@/lib/analytics';
import { getItemById } from '@/lib/itemAssets';
import { handlePaywallTrigger } from '@/lib/paywallTriggers';
import SplashScreen from '@/components/SplashScreen';
import TrainingLevelSelector from '@/components/TrainingLevelSelector';
import WorkoutFlow from '@/components/WorkoutFlow';
import WorkoutComplete from '@/components/WorkoutComplete';
import GymRatGallery from '@/components/GymRatGallery';
import RatShop from '@/components/RatShop';
import ShareButton from '@/components/ShareButton';
import DailyCheckInScreen from '@/components/DailyCheckInScreen';
import NutritionScreen from '@/components/NutritionScreen';
import HistoryScreen from '@/components/HistoryScreen';
import SettingsScreen from '@/components/SettingsScreen';
import { type PaywallTrigger, shouldShowPaywall } from '@/lib/paywallStore';
import EquippedRatPreview from '@/components/EquippedRatPreview';
import XPProgressBar from '@/components/XPProgressBar';

type ScreenView =
  | 'home'
  | 'training-level'
  | 'workout'
  | 'workout-complete'
  | 'gallery'
  | 'shop'
  | 'daily-check-in'
  | 'food'
  | 'history'
  | 'settings';

type GenericRecord = Record<string, any>;

type ShopItem = GenericRecord & {
  id: string;
  premium?: boolean;
  price?: number;
  cost?: number;
  image?: any;
  previewImage?: any;
  slot?: string;
  unlockLevel?: number;
};

type AutosaveState = GenericRecord & {
  inProgress?: boolean;
  step?: number;
  workoutType?: string;
};

type IndexScreenProps = {
  openPaywall: (trigger: PaywallTrigger) => void;
};

type LevelData = {
  level: number;
  currentXP: number;
  xpToNext: number;
  progress: number;
};

type TierData = {
  tier: string;
  label?: string;
  emoji?: string;
  size?: number;
};

const ONBOARDING_COMPLETED_KEY = 'gymrat-onboarding-completed';

const SplashScreenAny = SplashScreen as any;
const TrainingLevelSelectorAny = TrainingLevelSelector as any;
const WorkoutFlowAny = WorkoutFlow as any;
const WorkoutCompleteAny = WorkoutComplete as any;
const GymRatGalleryAny = GymRatGallery as any;
const RatShopAny = RatShop as any;
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

function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
}

function markOnboardingCompleted(): void {
  localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
}

function normalizeLevelData(rawLevel: any, totalXP: number): LevelData {
  if (typeof rawLevel === 'object' && rawLevel !== null) {
    return {
      level: getSafeNumber(rawLevel.level, 1),
      currentXP: getSafeNumber(rawLevel.currentXP, 0),
      xpToNext: getSafeNumber(rawLevel.xpToNext, 100),
      progress: getSafeNumber(rawLevel.progress, 0),
    };
  }

  const numericLevel = Math.max(1, getSafeNumber(rawLevel, 1));
  const fallbackCurrentXP = totalXP;
  const fallbackXpToNext = 100;
  const fallbackProgress =
    fallbackXpToNext > 0
      ? Math.max(0, Math.min(100, (fallbackCurrentXP / fallbackXpToNext) * 100))
      : 0;

  return {
    level: numericLevel,
    currentXP: fallbackCurrentXP,
    xpToNext: fallbackXpToNext,
    progress: fallbackProgress,
  };
}

function normalizeTierData(rawTier: any): TierData {
  if (typeof rawTier === 'object' && rawTier !== null) {
    return {
      tier: String(rawTier.tier ?? 'rookie'),
      label: rawTier.label,
      emoji: rawTier.emoji,
      size: rawTier.size,
    };
  }

  return {
    tier: typeof rawTier === 'string' ? rawTier : 'rookie',
  };
}

export default function IndexScreen({ openPaywall }: IndexScreenProps) {
  const [isBooting, setIsBooting] = useState(true);
  const [view, setView] = useState<ScreenView>(
    hasCompletedOnboarding() ? 'home' : 'training-level'
  );
  const [autosave, setAutosave] = useState<AutosaveState | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const trackEvent = getModuleFunction(analyticsModule as GenericRecord, ['trackEvent']);

  const getTotalXP = getModuleFunction(gamificationStore as GenericRecord, ['getTotalXP']);
  const getLevelFromXP = getModuleFunction(gamificationStore as GenericRecord, ['getLevelFromXP']);
  const getRatTier = getModuleFunction(gamificationStore as GenericRecord, ['getRatTier']);
  const getStreak = getModuleFunction(gamificationStore as GenericRecord, ['getStreak']);
  const isPremium = getModuleFunction(gamificationStore as GenericRecord, ['isPremium']);

  const getEquipped = getModuleFunction(shopStore as GenericRecord, ['getEquipped']);

  const rawShopItems = getModuleValue<ShopItem[]>(
    shopStore as GenericRecord,
    ['shopItems'],
    []
  );

  const getCurrentTierImage = getModuleFunction(
    ratImagesModule as GenericRecord,
    ['getCurrentTierImage', 'getRatTierImage', 'getTierImage']
  );

  const getTrainingLevel = getModuleFunction(trainingStore as GenericRecord, ['getTrainingLevel']);
  const getAutosaveState = getModuleFunction(autosaveStore as GenericRecord, ['getAutosaveState']);

  const syncUI = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const normalizeShopItem = useCallback((item: ShopItem): ShopItem => {
    const asset = getItemById(item.id);

    return {
      ...item,
      image: asset?.image ?? item?.image ?? null,
      previewImage: asset?.image ?? item?.image ?? null,
      price: getItemPrice(item),
      premium: itemIsPremium(item),
      slot: item.slot ?? asset?.slot,
      unlockLevel: item.unlockLevel ?? asset?.unlockLevel,
    };
  }, []);

  const appState = useMemo(() => {
    const totalXP = getSafeNumber(getTotalXP?.(), 0);
    const rawLevel = getLevelFromXP?.(totalXP);
    const levelData = normalizeLevelData(rawLevel, totalXP);

    let rawTier: any = 'rookie';
    try {
      rawTier = getRatTier?.(levelData.level) ?? getRatTier?.() ?? 'rookie';
    } catch {
      rawTier = 'rookie';
    }

    const tierData = normalizeTierData(rawTier);
    const streak = getSafeNumber(getStreak?.(), 0);
    const premiumActive = !!isPremium?.();
    const trainingLevel = getTrainingLevel?.() ?? null;
    const equipped = getEquipped?.() ?? {};

    let currentTierImage = null;

    try {
      if (typeof getCurrentTierImage === 'function') {
        currentTierImage = getCurrentTierImage(tierData.tier) ?? null;
      }
    } catch {}

    return {
      totalXP,
      level: levelData.level,
      levelData,
      streak,
      tier: tierData.tier,
      premiumActive,
      trainingLevel,
      equipped,
      currentTierImage,
    };
  }, [
    refreshKey,
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
    setMenuOpen(false);
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
    setMenuOpen(false);
    syncUI();
    setView('shop');
  }, [syncUI]);

  const openGallery = useCallback(() => {
    setMenuOpen(false);
    syncUI();
    setView('gallery');
  }, [syncUI]);

  const openTraining = useCallback(() => {
    setMenuOpen(false);

    if (!hasCompletedOnboarding()) {
      setView('training-level');
      return;
    }

    syncUI();
    setView('workout');
  }, [syncUI]);

  const openDailyCheckIn = useCallback(() => {
    setMenuOpen(false);
    setView('daily-check-in');
  }, []);

  const openFood = useCallback(() => {
    setMenuOpen(false);

    if (!appState.premiumActive) {
      openManualPremium();
      return;
    }

    setView('food');
  }, [appState.premiumActive, openManualPremium]);

  const openHistory = useCallback(() => {
    setMenuOpen(false);

    if (!appState.premiumActive) {
      openHistoryPremium();
      return;
    }

    setView('history');
  }, [appState.premiumActive, openHistoryPremium]);

  const openSettings = useCallback(() => {
    setMenuOpen(false);
    setView('settings');
  }, []);

  const openContact = useCallback(() => {
    setMenuOpen(false);
    window.location.href = 'mailto:hello@getgymrat.com?subject=GymRat%20Support';
  }, []);

  const openBugReport = useCallback(() => {
    setMenuOpen(false);
    window.location.href =
      'mailto:hello@getgymrat.com?subject=GymRat%20Bug%20Report&body=Describe%20the%20issue%20here:%0A%0AWhat%20happened:%0A%0AWhat%20did%20you%20expect%20to%20happen:%0A';
  }, []);

  const startWorkout = useCallback(() => {
    markOnboardingCompleted();
    syncUI();
    setView('home');
  }, [syncUI]);

  const completeWorkout = useCallback(() => {
    syncUI();
    setView('home');
    handlePaywallTrigger('workout_complete', openPaywall);
  }, [syncUI, openPaywall]);

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

  if (view === 'training-level') {
    return <TrainingLevelSelectorAny onComplete={startWorkout} />;
  }

  if (view === 'workout') {
    return (
      <WorkoutFlowAny
        premium={appState.premiumActive}
        trainingLevel={appState.trainingLevel}
        autosave={autosave}
        onBack={goHome}
        onComplete={completeWorkout}
        onOpenPremium={openCustomWorkoutPremium}
      />
    );
  }

  if (view === 'workout-complete') {
    return (
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
    );
  }

  if (view === 'gallery') {
    return (
      <GymRatGalleryAny
        premium={appState.premiumActive}
        currentTier={appState.tier}
        currentImage={appState.currentTierImage}
        equipped={appState.equipped}
        onBack={goHome}
        onOpenPremium={openShopPremium}
      />
    );
  }

  if (view === 'shop') {
    return (
      <div className="min-h-screen bg-background">
        <RatShopAny
          premium={appState.premiumActive}
          items={preparedShopItems}
          equipped={appState.equipped}
          onBack={goHome}
          onOpenPremium={openShopPremium}
          onRefresh={syncUI}
        />
      </div>
    );
  }

  if (view === 'daily-check-in') {
    return <DailyCheckInScreen onBack={goHome} />;
  }

  if (view === 'food') {
    return <NutritionScreen onBack={goHome} />;
  }

  if (view === 'history') {
    return <HistoryScreen onBack={goHome} />;
  }

  if (view === 'settings') {
    return <SettingsScreen onBack={goHome} premiumActive={appState.premiumActive} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-4 pt-4">
        <div className="mx-auto flex max-w-md items-center justify-between rounded-2xl border border-border/50 bg-card/60 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-lg">
              🐭
            </div>
            <div>
              <div className="text-sm font-semibold">Level {appState.level}</div>
              <div className="text-xs text-muted-foreground">
                {appState.streak} day streak
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {appState.premiumActive && (
              <div className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                Premium
              </div>
            )}

            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground text-lg transition-transform active:scale-95"
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <button
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div
          className={`absolute right-0 top-0 h-full w-[80vw] max-w-sm border-l border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Menu
                </div>
                <div className="text-lg font-bold text-foreground">GymRat</div>
              </div>

              <button
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground text-lg transition-transform active:scale-95"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              <div className="space-y-1">
                <button
                  onClick={openDailyCheckIn}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-secondary/70"
                >
                  <div>
                    <div className="text-sm font-semibold text-foreground">📅 Daily Check-in</div>
                    <div className="text-xs text-muted-foreground">Stay consistent every day</div>
                  </div>
                  <span className="text-muted-foreground">›</span>
                </button>

                <button
                  onClick={openFood}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-secondary/70"
                >
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <span>🍎 Nutrition</span>
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                        Premium
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Macros, goals and food tracking
                    </div>
                  </div>
                  <span className="text-muted-foreground">›</span>
                </button>

                <button
                  onClick={openHistory}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-secondary/70"
                >
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <span>📊 Training History</span>
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                        Premium
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Logbook, progress and previous sessions
                    </div>
                  </div>
                  <span className="text-muted-foreground">›</span>
                </button>

                <button
                  onClick={openSettings}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-secondary/70"
                >
                  <div>
                    <div className="text-sm font-semibold text-foreground">⚙️ Settings</div>
                    <div className="text-xs text-muted-foreground">
                      Language, training level and app preferences
                    </div>
                  </div>
                  <span className="text-muted-foreground">›</span>
                </button>
              </div>

              <div className="my-4 border-t border-border/40" />

              <div className="space-y-1">
                <button
                  onClick={openContact}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-secondary/70"
                >
                  <div>
                    <div className="text-sm font-semibold text-foreground">✉️ Contact</div>
                    <div className="text-xs text-muted-foreground">
                      Get help or ask a question
                    </div>
                  </div>
                  <span className="text-muted-foreground">›</span>
                </button>

                <button
                  onClick={openBugReport}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-secondary/70"
                >
                  <div>
                    <div className="text-sm font-semibold text-foreground">🐞 Report a Bug</div>
                    <div className="text-xs text-muted-foreground">
                      Tell us when something breaks
                    </div>
                  </div>
                  <span className="text-muted-foreground">›</span>
                </button>
              </div>
            </div>

            {!appState.premiumActive && (
              <div className="border-t border-border/40 p-3">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    openManualPremium();
                  }}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left gradient-accent text-accent-foreground shadow-gold"
                >
                  <div>
                    <div className="text-sm font-bold">💎 Go Premium</div>
                    <div className="text-xs text-accent-foreground/80">
                      Unlock nutrition, history and premium gear
                    </div>
                  </div>
                  <span>›</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`flex flex-col items-center justify-center px-4 pb-2 ${
          menuOpen ? 'pt-3' : 'pt-4'
        }`}
      >
        <div className="w-full max-w-md min-h-[520px] rounded-[32px] border border-border/50 bg-card/40 px-4 py-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
          <div className="flex flex-1 flex-col items-center justify-center -mt-2">
            <EquippedRatPreview size="hero" />
            <div className="w-full px-2 -mt-2">
              <XPProgressBar />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setMenuOpen(false);
                openTraining();
              }}
              className="h-9 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md transition-transform active:scale-[0.98]"
            >
              Start
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                openGallery();
              }}
              className="h-9 rounded-xl bg-secondary text-sm font-medium text-secondary-foreground transition-transform active:scale-[0.98]"
            >
              Gallery
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                openShop();
              }}
              className="h-9 rounded-xl bg-secondary text-sm font-medium text-secondary-foreground transition-transform active:scale-[0.98]"
            >
              Shop
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-2 pb-6">
        <ShareButtonAny
          level={appState.level}
          streak={appState.streak}
          ratTier={appState.tier}
        />
      </div>
    </div>
  );
}