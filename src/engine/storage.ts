import type { PersistedData, SessionRecord, PersonalBests, DigitSpanMode } from '../types';

const STORAGE_KEY = 'memory-trainer-data';
const MAX_SESSIONS = 100;

const DEFAULT_DATA: PersistedData = {
  profile: {
    personalBests: { forward: 0, backward: 0, ascending: 0 },
    totalSessions: 0,
  },
  sessions: [],
};

export function loadData(): PersistedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_DATA);
    const parsed = JSON.parse(raw) as PersistedData;
    // Validate shape
    if (!parsed.profile || !parsed.sessions) return structuredClone(DEFAULT_DATA);
    return parsed;
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

function saveData(data: PersistedData): void {
  // Trim old sessions
  if (data.sessions.length > MAX_SESSIONS) {
    data.sessions = data.sessions.slice(-MAX_SESSIONS);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function appendSession(session: SessionRecord): void {
  const data = loadData();

  // Update personal bests
  const pb = data.profile.personalBests;
  const mode = session.mode;
  if (session.bestSpan > pb[mode]) {
    pb[mode] = session.bestSpan;
  }

  data.profile.totalSessions++;
  data.sessions.push(session);

  saveData(data);
}

export function getPersonalBests(): PersonalBests {
  const data = loadData();
  return { ...data.profile.personalBests };
}

export function getRecentSessions(limit = 10): SessionRecord[] {
  const data = loadData();
  return data.sessions.slice(-limit).reverse();
}

export function getTotalSessions(): number {
  return loadData().profile.totalSessions;
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
