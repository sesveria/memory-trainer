import { create } from 'zustand';
import type { ModeId, TrainingPhase, TrialRecord } from '../types';
import { getEngine, getModeMeta } from '../engine/registry';
import { createAdaptive, recordTrial, type AdaptiveState } from '../engine/adaptive';
import { getNBackLevel, setNBackContext, getTotalRounds } from '../engine/nBack';

export interface TrainingState {
  modeId: ModeId | null;
  phase: TrainingPhase;
  currentSequence: number[];
  trialStartTime: number;
  currentSpanLength: number;
  gridSize: number;
  lastUserResponse: number[];
  adaptive: AdaptiveState | null;
  lastCorrect: boolean | null;
  sessionTrials: TrialRecord[];
  sessionStartTime: number;
  bestSpanThisSession: number;
  instructionsCountdown: number;

  // N-Back specific
  nbackRoundIndex: number;
  nbackPosCorrect: number;
  nbackLetterCorrect: number;
  nbackRounds: { posCorrect: boolean; letterCorrect: boolean }[];

  setMode: (id: ModeId) => void;
  startTrial: () => void;
  startPresenting: () => void;
  finishPresenting: () => void;
  submitResponse: (response: number[]) => void;
  nextTrial: () => void;
  endSession: () => void;
  tickCountdown: () => void;
  resetToHome: () => void;

  // N-Back actions
  recordNbackRound: (posCorrect: boolean, letterCorrect: boolean) => void;
  finishNbackSession: () => void;
}

export const useTrainingStore = create<TrainingState>((set, get) => ({
  modeId: null,
  phase: 'idle',
  currentSequence: [],
  trialStartTime: 0,
  currentSpanLength: 0,
  gridSize: 4,
  lastUserResponse: [],
  adaptive: null,
  lastCorrect: null,
  sessionTrials: [],
  sessionStartTime: 0,
  bestSpanThisSession: 0,
  instructionsCountdown: 3,

  nbackRoundIndex: 0,
  nbackPosCorrect: 0,
  nbackLetterCorrect: 0,
  nbackRounds: [],

  setMode: (id) => {
    const meta = getModeMeta(id);

    // N-Back special path
    if (meta.category === 'nback') {
      const nLevel = getNBackLevel(id);
      setNBackContext(nLevel);
      const engine = getEngine(id);
      const sequence = engine.generateSequence(0) as number[];
      set({
        modeId: id,
        gridSize: 4,
        phase: 'instructions',
        instructionsCountdown: 3,
        sessionTrials: [],
        sessionStartTime: Date.now(),
        bestSpanThisSession: nLevel,
        currentSpanLength: nLevel,
        currentSequence: sequence,
        lastUserResponse: [],
        lastCorrect: null,
        adaptive: null,
        nbackRoundIndex: 0,
        nbackPosCorrect: 0,
        nbackLetterCorrect: 0,
        nbackRounds: [],
      });
      return;
    }

    const adaptive = createAdaptive(id);
    const engine = getEngine(id);
    const span = adaptive.currentSpan;
    const sequence = engine.generateSequence(span) as number[];

    set({
      modeId: id,
      adaptive,
      gridSize: meta.gridSize ?? 4,
      phase: 'instructions',
      instructionsCountdown: 3,
      sessionTrials: [],
      sessionStartTime: Date.now(),
      bestSpanThisSession: 0,
      currentSpanLength: span,
      currentSequence: sequence,
      lastUserResponse: [],
      lastCorrect: null,
      nbackRoundIndex: 0,
      nbackPosCorrect: 0,
      nbackLetterCorrect: 0,
      nbackRounds: [],
    });
  },

  startTrial: () => {
    const { adaptive, modeId } = get();
    if (!adaptive || !modeId) return;
    const engine = getEngine(modeId);
    const span = adaptive.currentSpan;
    const sequence = engine.generateSequence(span) as number[];
    set({
      currentSpanLength: span,
      currentSequence: sequence,
      lastUserResponse: [],
      lastCorrect: null,
      phase: 'instructions',
      instructionsCountdown: 3,
    });
  },

  startPresenting: () => {
    set({
      phase: 'presenting',
      trialStartTime: Date.now(),
    });
  },

  finishPresenting: () => {
    set({ phase: 'recalling' });
  },

  submitResponse: (response) => {
    const { modeId, currentSequence, trialStartTime, adaptive, sessionTrials, bestSpanThisSession } = get();
    if (!modeId || !adaptive) return;
    if (get().phase !== 'recalling') return;

    const engine = getEngine(modeId);
    const correct = engine.validate(currentSequence, response);
    const responseTimeMs = Date.now() - trialStartTime;

    const trial: TrialRecord = {
      spanLength: currentSequence.length,
      sequence: currentSequence,
      userResponse: response,
      correct,
      responseTimeMs,
    };

    recordTrial(adaptive, correct);

    const newBest = Math.max(bestSpanThisSession, correct ? currentSequence.length : 0);

    set({
      phase: 'feedback',
      lastCorrect: correct,
      lastUserResponse: response,
      sessionTrials: [...sessionTrials, trial],
      bestSpanThisSession: newBest,
      adaptive: { ...adaptive },
    });
  },

  nextTrial: () => {
    get().startTrial();
  },

  endSession: () => {
    set({ phase: 'summary' });
  },

  tickCountdown: () => {
    const { instructionsCountdown } = get();
    if (instructionsCountdown <= 1) {
      get().startPresenting();
    } else {
      set({ instructionsCountdown: instructionsCountdown - 1 });
    }
  },

  resetToHome: () => {
    set({
      modeId: null,
      phase: 'idle',
      currentSequence: [],
      trialStartTime: 0,
      currentSpanLength: 0,
      gridSize: 4,
      lastUserResponse: [],
      adaptive: null,
      lastCorrect: null,
      sessionTrials: [],
      sessionStartTime: 0,
      bestSpanThisSession: 0,
      instructionsCountdown: 3,
      nbackRoundIndex: 0,
      nbackPosCorrect: 0,
      nbackLetterCorrect: 0,
      nbackRounds: [],
    });
  },

  recordNbackRound: (posCorrect, letterCorrect) => {
    set((s) => ({
      nbackRoundIndex: s.nbackRoundIndex + 1,
      nbackPosCorrect: s.nbackPosCorrect + (posCorrect ? 1 : 0),
      nbackLetterCorrect: s.nbackLetterCorrect + (letterCorrect ? 1 : 0),
      nbackRounds: [...s.nbackRounds, { posCorrect, letterCorrect }],
    }));
  },

  finishNbackSession: () => {
    const { modeId, sessionTrials, currentSequence, bestSpanThisSession, nbackRounds } = get();
    if (!modeId) return;

    // Build one TrialRecord per round
    const nLevel = getNBackLevel(modeId);
    const trials: TrialRecord[] = nbackRounds.map((r, i) => ({
      spanLength: nLevel,
      sequence: [currentSequence[i]],
      userResponse: [],
      correct: r.posCorrect && r.letterCorrect,
      responseTimeMs: 0,
      nbackMeta: {
        nLevel,
        posCorrect: r.posCorrect,
        letterCorrect: r.letterCorrect,
      },
    }));

    const totalCorrect = trials.filter(t => t.correct).length;
    const accuracy = trials.length > 0 ? Math.round((totalCorrect / trials.length) * 100) : 0;

    set({
      phase: 'summary',
      sessionTrials: [...sessionTrials, ...trials],
      bestSpanThisSession: Math.max(bestSpanThisSession, nLevel),
      currentSpanLength: nLevel,
    });
  },
}));
