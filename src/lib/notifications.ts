import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

import { getPRProximity, getRecommendedNextFocusArea } from '@/lib/historyStore';
import { getStreakState } from '@/lib/streakStore';

const DAILY_REMINDER_ID = 1001;
const STREAK_RISK_ID = 1002;
const PR_HYPE_ID = 1003;

const STORAGE_KEY = 'gymrat-notification-state';

type NotificationState = {
  dailyEnabled: boolean;
  lastScheduledAt: string | null;
  permission: 'granted' | 'denied' | 'prompt' | 'unknown';
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function isNativePlatform() {
  const platform = Capacitor.getPlatform();
  return platform === 'ios' || platform === 'android';
}

function getDefaultState(): NotificationState {
  return {
    dailyEnabled: false,
    lastScheduledAt: null,
    permission: 'unknown',
  };
}

function readState(): NotificationState {
  if (!isBrowser()) return getDefaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();

    const parsed = JSON.parse(raw) as Partial<NotificationState>;

    return {
      dailyEnabled: Boolean(parsed.dailyEnabled),
      lastScheduledAt:
        typeof parsed.lastScheduledAt === 'string' ? parsed.lastScheduledAt : null,
      permission:
        parsed.permission === 'granted' ||
        parsed.permission === 'denied' ||
        parsed.permission === 'prompt'
          ? parsed.permission
          : 'unknown',
    };
  } catch {
    return getDefaultState();
  }
}

function writeState(next: NotificationState) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function getFocusLabel() {
  const focus = getRecommendedNextFocusArea();

  switch (focus) {
    case 'back':
      return 'back';
    case 'arms':
      return 'arms';
    case 'legs':
      return 'legs';
    case 'shoulders':
      return 'shoulders';
    case 'core':
      return 'core';
    case 'chest':
    default:
      return 'chest';
  }
}

function getDailyBody() {
  const proximity = getPRProximity();
  const streak = getStreakState();
  const focus = getFocusLabel();

  if (proximity.length > 0) {
    const top = proximity[0];
    return `PR day? ${top.exercise} is only ${top.diff} kg away.`;
  }

  if (streak.current >= 7) {
    return `You’re on a ${streak.current}-day streak. Don’t let it die today.`;
  }

  return `Today’s smart pick: ${focus}. Stack one more clean session.`;
}

function getStreakRiskBody() {
  const streak = getStreakState();

  if (streak.current >= 3) {
    return `Your ${streak.current}-day streak is at risk. A walk still counts.`;
  }

  return 'Keep momentum alive today. A short walk is enough to stay in motion.';
}

function getPRHypeBody() {
  const proximity = getPRProximity();

  if (proximity.length > 0) {
    const top = proximity[0];
    return `${top.exercise} is close. This could be a PR day.`;
  }

  return 'You are closer than you think. Today could move the rat forward.';
}

async function requestNotificationPermission() {
  if (!isNativePlatform()) {
    const current = readState();
    writeState({
      ...current,
      permission: 'granted',
    });

    return 'granted' as const;
  }

  try {
    const permission = await LocalNotifications.requestPermissions();
    const nextPermission =
      permission.display === 'granted'
        ? 'granted'
        : permission.display === 'denied'
          ? 'denied'
          : 'prompt';

    const current = readState();
    writeState({
      ...current,
      permission: nextPermission,
    });

    return nextPermission;
  } catch {
    const current = readState();
    writeState({
      ...current,
      permission: 'unknown',
    });

    return 'unknown' as const;
  }
}

function getScheduleForToday(hour: number, minute: number) {
  return {
    on: {
      hour,
      minute,
    },
    repeats: true,
    allowWhileIdle: true,
  };
}

export async function setupDailyReminder() {
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') return false;

  const state = readState();

  if (!isNativePlatform()) {
    writeState({
      ...state,
      dailyEnabled: true,
      lastScheduledAt: new Date().toISOString(),
    });
    return true;
  }

  try {
    await LocalNotifications.cancel({
      notifications: [{ id: DAILY_REMINDER_ID }],
    });

    await LocalNotifications.schedule({
      notifications: [
        {
          id: DAILY_REMINDER_ID,
          title: 'GymRat',
          body: getDailyBody(),
          schedule: getScheduleForToday(18, 0),
        },
      ],
    });

    writeState({
      ...state,
      dailyEnabled: true,
      lastScheduledAt: new Date().toISOString(),
      permission: 'granted',
    });

    return true;
  } catch (error) {
    console.error('Failed to setup daily reminder', error);
    return false;
  }
}

export async function scheduleStreakRiskReminder() {
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') return false;

  if (!isNativePlatform()) return true;

  try {
    await LocalNotifications.cancel({
      notifications: [{ id: STREAK_RISK_ID }],
    });

    await LocalNotifications.schedule({
      notifications: [
        {
          id: STREAK_RISK_ID,
          title: 'GymRat',
          body: getStreakRiskBody(),
          schedule: getScheduleForToday(20, 30),
        },
      ],
    });

    return true;
  } catch (error) {
    console.error('Failed to schedule streak risk reminder', error);
    return false;
  }
}

export async function schedulePRHypeReminder() {
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') return false;

  if (!isNativePlatform()) return true;

  try {
    await LocalNotifications.cancel({
      notifications: [{ id: PR_HYPE_ID }],
    });

    await LocalNotifications.schedule({
      notifications: [
        {
          id: PR_HYPE_ID,
          title: 'GymRat',
          body: getPRHypeBody(),
          schedule: getScheduleForToday(11, 30),
        },
      ],
    });

    return true;
  } catch (error) {
    console.error('Failed to schedule PR hype reminder', error);
    return false;
  }
}

export async function refreshSmartNotifications() {
  await setupDailyReminder();
  await scheduleStreakRiskReminder();
  await schedulePRHypeReminder();
}

export async function resetDailyReminder() {
  if (!isNativePlatform()) {
    const current = readState();
    writeState({
      ...current,
      dailyEnabled: false,
    });
    return;
  }

  await LocalNotifications.cancel({
    notifications: [
      { id: DAILY_REMINDER_ID },
      { id: STREAK_RISK_ID },
      { id: PR_HYPE_ID },
    ],
  });

  const current = readState();
  writeState({
    ...current,
    dailyEnabled: false,
  });
}

export function getNotificationDebugState() {
  return {
    ...readState(),
    isNative: isNativePlatform(),
    dailyBody: getDailyBody(),
    streakRiskBody: getStreakRiskBody(),
    prHypeBody: getPRHypeBody(),
  };
}