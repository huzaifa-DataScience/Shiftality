// src/lib/reminderStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const REMINDER_STORAGE_KEY = 'shift_reminders_v1';

export type StoredReminder = {
  id: string;
  label: string;
  fireAtISO: string; // when it will first fire
  pillIndex: number; // which ReminderPill was chosen
  isDemo: boolean;
};

export async function getStoredReminders(): Promise<StoredReminder[]> {
  const raw = await AsyncStorage.getItem(REMINDER_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}

export async function saveStoredReminders(
  reminders: StoredReminder[],
): Promise<void> {
  await AsyncStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(reminders));
}

export async function appendStoredReminders(
  newOnes: StoredReminder[],
): Promise<void> {
  const existing = await getStoredReminders();
  await saveStoredReminders([...existing, ...newOnes]);
}

export async function clearStoredReminders(): Promise<void> {
  await AsyncStorage.removeItem(REMINDER_STORAGE_KEY);
}
