// ── Training Modes ──
export type DigitSpanMode = 'forward' | 'backward' | 'ascending';

// ── Session Phase ──
export type TrainingPhase =
  | 'idle'
  | 'instructions'
  | 'presenting'
  | 'recalling'
  | 'feedback'
  | 'summary';

// ── Single trial record ──
export interface TrialRecord {
  spanLength: number;
  sequence: number[];
  userResponse: number[];
  correct: boolean;
  responseTimeMs: number;
}

// ── Session record (persisted) ──
export interface SessionRecord {
  id: string;
  timestamp: number;
  mode: DigitSpanMode;
  trials: TrialRecord[];
  finalSpan: number;
  bestSpan: number;
  accuracy: number;
}

// ── Personal bests ──
export interface PersonalBests {
  forward: number;
  backward: number;
  ascending: number;
}

// ── Persisted data shape ──
export interface PersistedData {
  profile: {
    personalBests: PersonalBests;
    totalSessions: number;
  };
  sessions: SessionRecord[];
}

// ── Engine interface for future multi-modal expansion ──
export interface TrainingEngine {
  generateSequence: (spanLength: number) => number[];
  validate: (sequence: number[], userResponse: number[]) => boolean;
  getInstructions: () => string;
}
