import type { PersistedData, SessionRecord, PersonalBests } from '../types';

const STORAGE_KEY = 'memory-trainer-data';
const MAX_SESSIONS = 100;

const OLD_TO_NEW_MODE: Record<string, string> = {
  forward: 'digit-forward',
  backward: 'digit-backward',
  ascending: 'digit-ascending',
};

const DEFAULT_DATA: PersistedData = {
  profile: {
    personalBests: {},
    totalSessions: 0,
  },
  sessions: [],
};

/**
 * Migrate old-format persisted data to new ModeId-based keys.
 * Old: session.mode = 'forward' / 'backward' / 'ascending'
 * New: session.mode = 'digit-forward' / 'digit-backward' / 'digit-ascending'
 * Old: personalBests = { forward: N, backward: N, ascending: N }
 * New: personalBests = { 'digit-forward': N, 'digit-backward': N, 'digit-ascending': N }
 */
function migrate(data: PersistedData): PersistedData {
  let changed = false;

  // Migrate personalBests
  const pb = data.profile.personalBests;
  for (const [oldKey, newKey] of Object.entries(OLD_TO_NEW_MODE)) {
    if (oldKey in pb && pb[oldKey] !== undefined) {
      const val = pb[oldKey];
      if ((pb[newKey] ?? 0) < val) {
        pb[newKey] = val;
      }
      delete pb[oldKey];
      changed = true;
    }
  }

  // Migrate sessions
  for (const s of data.sessions) {
    const newMode = OLD_TO_NEW_MODE[s.mode];
    if (newMode) {
      s.mode = newMode as SessionRecord['mode'];
      changed = true;
    }
  }

  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  return data;
}

export function loadData(): PersistedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_DATA);
    const parsed = JSON.parse(raw) as PersistedData;
    if (!parsed.profile || !parsed.sessions) return structuredClone(DEFAULT_DATA);
    return migrate(parsed);
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

function saveData(data: PersistedData): void {
  if (data.sessions.length > MAX_SESSIONS) {
    data.sessions = data.sessions.slice(-MAX_SESSIONS);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function appendSession(session: SessionRecord): void {
  const data = loadData();

  const pb = data.profile.personalBests;
  pb[session.mode] = Math.max(pb[session.mode] ?? 0, session.bestSpan);

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
