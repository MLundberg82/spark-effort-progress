type TriggerOptions = {
  isPremium: boolean;
  openPaywall: () => void;
  onAllowed?: () => void;
};

export function maybeOpenHistoryPaywall({
  isPremium,
  openPaywall,
  onAllowed,
}: TriggerOptions) {
  if (isPremium) {
    onAllowed?.();
    return true;
  }

  openPaywall();
  return false;
}

export function maybeOpenNutritionPaywall({
  isPremium,
  openPaywall,
  onAllowed,
}: TriggerOptions) {
  if (isPremium) {
    onAllowed?.();
    return true;
  }

  openPaywall();
  return false;
}

export function openManualPaywall(openPaywall: () => void) {
  openPaywall();
}