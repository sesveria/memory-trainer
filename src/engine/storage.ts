import type { PersistedData, SessionRecord, PersonalBests } from '../types';
import { getModeMeta } from './registry';

const STORAGE_KEY = 'memory-trainer-data';
const MAX_SESSIONS = 100;

const OLD_TO_NEW_MODE: Record<string, string> = {
  forward: 'digit-forward',
  backward: 'digit-backward',
  ascending: 'digit-ascending',
  'corsi-block': 'corsi-forward',
};

const DEFAULT_DATA: PersistedData = {
  profile: { personalBests: {}, totalSessions: 0 },
  sessions: [],
};

function isValidModeKey(key: string): boolean {
  if (key in OLD_TO_NEW_MODE) return true;
  try { getModeMeta(key as any); return true; } catch { return false; }
}

function migrate(data: PersistedData): PersistedData {
  let changed = false;
  const pb = data.profile.personalBests as Record<string, number>;

  // ── Migrate old → new mode keys ──
  for (const [oldKey, newKey] of Object.entries(OLD_TO_NEW_MODE)) {
    if (oldKey in pb && pb[oldKey] !== undefined) {
      pb[newKey] = Math.max(pb[newKey] ?? 0, pb[oldKey]);
      delete pb[oldKey];
      changed = true;
    }
  }

  // ── Clean up any stale personalBest keys that match no known mode ──
  for (const key of Object.keys(pb)) {
    if (!isValidModeKey(key)) {
      delete pb[key];
      changed = true;
    }
  }

  // ── Migrate + clean up sessions ──
  data.sessions = data.sessions.filter((s) => {
    const newMode = OLD_TO_NEW_MODE[s.mode];
    if (newMode) {
      (s as { mode: string }).mode = newMode;
      changed = true;
      return true;
    }
    if (!isValidModeKey(s.mode)) {
      changed = true;
      return false; // drop unrecognisable session
    }
    return true;
  });

  // ── Migrate old single pattern-matrix best → three grid-size variants ──
  if ('pattern-matrix' in pb && pb['pattern-matrix'] !== undefined) {
    const best = pb['pattern-matrix'];
    for (const k of ['pattern-3x3', 'pattern-4x4', 'pattern-5x5']) {
      pb[k] = Math.max(pb[k] ?? 0, best);
    }
    delete pb['pattern-matrix'];
    changed = true;
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
  return { ...loadData().profile.personalBests };
}

export function getRecentSessions(limit = 10): SessionRecord[] {
  return loadData().sessions.slice(-limit).reverse();
}

export function getTotalSessions(): number {
  return loadData().profile.totalSessions;
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAllSessions(): SessionRecord[] {
  return [...loadData().sessions];
}
