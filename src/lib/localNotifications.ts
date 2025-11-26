// src/lib/localNotifications.ts
import notifee, {
  AndroidImportance,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import { appendStoredReminders, StoredReminder } from './reminderStore';

let channelPromise: Promise<string> | null = null;

async function ensureChannel(): Promise<string> {
  if (!channelPromise) {
    channelPromise = notifee.createChannel({
      id: 'shift-reminders',
      name: 'Shift Reminders',
      importance: AndroidImportance.HIGH,
    });
  }
  return channelPromise;
}

export async function requestReminderPermission() {
  await notifee.requestPermission();
  await ensureChannel();
}

/**
 * Schedule a single local notification at a specific Date.
 * Also store it in AsyncStorage as a reminder record.
 */
export async function scheduleReminderNotification(options: {
  fireAt: Date;
  pillIndex: number;
  label: string;
  isDemo?: boolean;
}) {
  const { fireAt, pillIndex, label, isDemo = false } = options;
  const channelId = await ensureChannel();

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: fireAt.getTime(),
  };

  const notifId = await notifee.createTriggerNotification(
    {
      title: isDemo ? 'Shiftality Reminder (Demo)' : 'Shiftality Reminder',
      body: label,
      android: {
        channelId,
        pressAction: { id: 'default' },
      },
    },
    trigger,
  );

  const stored: StoredReminder = {
    id: notifId,
    label,
    fireAtISO: fireAt.toISOString(),
    pillIndex,
    isDemo,
  };

  await appendStoredReminders([stored]);
}

/**
 * For your "Test Full Sequence (5s intervals)" button:
 * schedules 5 notifications 5s apart and stores them.
 */
export async function scheduleDemoSequence(pillIndex: number | null) {
  const idx = pillIndex ?? 0;

  const base = Date.now();
  const label = `Demo reminder sequence #${idx + 1}`;

  const toSchedule: Promise<void>[] = [];

  for (let i = 0; i < 5; i++) {
    const fireAt = new Date(base + (i + 1) * 5000); // every 5s

    toSchedule.push(
      scheduleReminderNotification({
        fireAt,
        pillIndex: idx,
        label: `${label} — step ${i + 1}`,
        isDemo: true,
      }) as any,
    );
  }

  await Promise.all(toSchedule);
}

/**
 * Clears ALL scheduled notifications + stored reminders (useful for reset).
 */
export async function clearAllLocalReminders() {
  await notifee.cancelAllNotifications();
  await notifee.cancelAllDisplayedNotifications();
}
