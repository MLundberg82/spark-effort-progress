import { LocalNotifications } from '@capacitor/local-notifications';
import { getPRProximity } from '@/lib/historyStore';

const NOTIFICATION_ID = 1001;
const STORAGE_KEY = 'gymrat-daily-reminder';

// ---------- SMART TEXT ----------

function getSmartNotificationText(): string {
  const proximity = getPRProximity();

  if (proximity.length > 0) {
    const top = proximity[0];
    return `You're close to a PR in ${top.exercise} 👀`;
  }

  const fallback = [
    'Stay on track today 💪',
    'Small progress = big results 📈',
    'Don’t break the streak 🔥',
    'Your future self is watching 👀',
  ];

  return fallback[Math.floor(Math.random() * fallback.length)];
}

// ---------- SETUP ----------

export async function setupDailyReminder() {
  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return;

    const existing = localStorage.getItem(STORAGE_KEY);

    // 🔥 already scheduled → do nothing
    if (existing === 'true') return;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIFICATION_ID,
          title: 'GymRat 🐀',
          body: getSmartNotificationText(),
          schedule: {
            on: {
              hour: 18,
              minute: 0,
            },
            repeats: true,
          },
        },
      ],
    });

    localStorage.setItem(STORAGE_KEY, 'true');
  } catch (err) {
    console.error('Notification error:', err);
  }
}

// ---------- RESET (optional future use) ----------

export async function resetDailyReminder() {
  await LocalNotifications.cancel({
    notifications: [{ id: NOTIFICATION_ID }],
  });

  localStorage.removeItem(STORAGE_KEY);
}