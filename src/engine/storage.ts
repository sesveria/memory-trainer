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

function migrate(data: PersistedData): PersistedData {
  let changed = false;

  const pb = data.profile.personalBests as Record<string, number>;

  // ── Migrate personalBests: old digit-span keys ──
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

  // ── Migrate sessions: old digit-span mode keys ──
  for (const s of data.sessions) {
    const newMode = OLD_TO_NEW_MODE[s.mode];
    if (newMode) {
      (s as { mode: string }).mode = newMode;
      changed = true;
    }
  }

  // ── Migrate old single pattern-matrix → three grid-size variants ──
  if ('pattern-matrix' in pb && pb['pattern-matrix'] !== undefined) {
    const best = pb['pattern-matrix'];
    for (const newKey of ['pattern-3x3', 'pattern-4x4', 'pattern-5x5']) {
      pb[newKey] = Math.max(pb[newKey] ?? 0, best);
    }
    delete pb['pattern-matrix'];
    changed = true;
  }
  for (const s of data.sessions) {
    if ((s as { mode: string }).mode === 'pattern-matrix') {
      (s as { mode: string }).mode = 'pattern-4x4';
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

/** Return all sessions sorted oldest-first. */
export function getAllSessions(): SessionRecord[] {
  const data = loadData();
  return [...data.sessions];
}
