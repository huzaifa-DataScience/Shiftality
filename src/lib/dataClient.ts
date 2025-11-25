// src/lib/dataClient.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CheckinSource = 'user' | 'demo';

export type Checkin = {
  id: string;
  date: string; // "2025-11-23"
  pos_yes: number;
  neg_yes: number;
  daily_score: number; // -10 .. +10
  source: CheckinSource;
  created_at: string;
};

export type DensePoint = {
  date: string; // "2025-11-23"
  dayNumber: number; // 1..365
  score: number; // daily_score or 0
  cumulative: number; // running total
  hasCheckin: boolean;
};

const CHECKINS_KEY = 'shift_checkins_v1';

function addDaysStr(dateStr: string, days: number): string {
  const baseStr = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00.000Z`;
  const d = new Date(baseStr);

  if (isNaN(d.getTime())) {
    console.warn('addDaysStr: invalid dateStr', dateStr);
    return dateStr;
  }

  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function getCheckins(): Promise<Checkin[]> {
  const raw = await AsyncStorage.getItem(CHECKINS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// upsert by date (one checkin per day)
export async function upsertCheckins(newOnes: Checkin[]): Promise<void> {
  const existing = await getCheckins();
  const byDate = new Map<string, Checkin>();

  existing.forEach(c => byDate.set(c.date, c));
  newOnes.forEach(c => byDate.set(c.date, c));

  const merged = Array.from(byDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  await AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(merged));
}

export function buildDenseSeries(
  startDate: string, // "2025-11-01"
  checkins: Checkin[],
): DensePoint[] {
  const map = new Map<string, Checkin>();
  checkins.forEach(c => map.set(c.date, c));

  const series: DensePoint[] = [];
  let cumulative = 0;

  for (let i = 0; i < 365; i++) {
    const date = addDaysStr(startDate, i);
    const checkin = map.get(date);
    const dailyScore = checkin?.daily_score ?? 0;

    cumulative += dailyScore;

    series.push({
      date,
      dayNumber: i + 1,
      score: dailyScore,
      cumulative,
      hasCheckin: !!checkin,
    });
  }

  return series;
}

// 🔹 wipe ALL checkins
export async function clearAllCheckins(): Promise<void> {
  await AsyncStorage.removeItem(CHECKINS_KEY);
}

// 🔹 wipe ONLY demo-generated checkins
export async function clearDemoCheckins(): Promise<void> {
  const existing = await getCheckins();
  const filtered = existing.filter(c => c.source !== 'demo');
  await AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(filtered));
}
