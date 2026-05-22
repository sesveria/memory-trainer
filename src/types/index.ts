// ── Mode IDs ──
export type ModeId =
  | 'digit-forward'
  | 'digit-backward'
  | 'digit-ascending'
  | 'corsi-forward'
  | 'corsi-backward'
  | 'pattern-3x3'
  | 'pattern-4x4'
  | 'pattern-5x5'
  | 'nback-1'
  | 'nback-2'
  | 'nback-3';

// ── Mode category ──
export type ModeCategory = 'digit' | 'spatial' | 'pattern' | 'nback';

// ── Mode metadata ──
export interface ModeMeta {
  id: ModeId;
  label: string;
  description: string;
  icon: string;
  category: ModeCategory;
  minSpan: number;
  maxSpan: number;
  gridSize?: number;
}

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
  nbackMeta?: {
    nLevel: number;
    posCorrect: boolean;
    letterCorrect: boolean;
  };
}

// ── Session record (persisted) ──
export interface SessionRecord {
  id: string;
  timestamp: number;
  mode: ModeId;
  trials: TrialRecord[];
  finalSpan: number;
  bestSpan: number;
  accuracy: number;
}

// ── Personal bests (keyed by ModeId) ──
export type PersonalBests = Record<string, number>;

// ── Persisted data shape ──
export interface PersistedData {
  profile: {
    personalBests: PersonalBests;
    totalSessions: number;
  };
  sessions: SessionRecord[];
}

// ── Abstract engine interface ──
export interface TrainingEngine<Seq = number[], Resp = number[]> {
  generateSequence: (spanLength: number) => Seq;
  validate: (sequence: Seq, userResponse: Resp) => boolean;
  getInstructions: () => string;
}

/** @deprecated use ModeId instead */
export type DigitSpanMode = 'forward' | 'backward' | 'ascending';
