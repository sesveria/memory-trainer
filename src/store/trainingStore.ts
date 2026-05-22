import { create } from 'zustand';
import type { ModeId, TrainingPhase, TrialRecord } from '../types';
import { getEngine } from '../engine/registry';
import { createAdaptive, recordTrial, type AdaptiveState } from '../engine/adaptive';

export interface TrainingState {
  modeId: ModeId | null;
  phase: TrainingPhase;
  currentSequence: number[];
  trialStartTime: number;
  currentSpanLength: number;
  lastUserResponse: number[];
  adaptive: AdaptiveState | null;
  lastCorrect: boolean | null;
  sessionTrials: TrialRecord[];
  sessionStartTime: number;
  bestSpanThisSession: number;
  instructionsCountdown: number;

  setMode: (id: ModeId) => void;
  startTrial: () => void;
  startPresenting: () => void;
  finishPresenting: () => void;
  submitResponse: (response: number[]) => void;
  nextTrial: () => void;
  endSession: () => void;
  tickCountdown: () => void;
  resetToHome: () => void;
}

export const useTrainingStore = create<TrainingState>((set, get) => ({
  modeId: null,
  phase: 'idle',
  currentSequence: [],
  trialStartTime: 0,
  currentSpanLength: 0,
  lastUserResponse: [],
  adaptive: null,
  lastCorrect: null,
  sessionTrials: [],
  sessionStartTime: 0,
  bestSpanThisSession: 0,
  instructionsCountdown: 3,

  setMode: (id) => {
    const adaptive = createAdaptive(id);
    const engine = getEngine(id);
    const span = adaptive.currentSpan;
    const sequence = engine.generateSequence(span) as number[];

    set({
      modeId: id,
      adaptive,
      phase: 'instructions',
      instructionsCountdown: 3,
      sessionTrials: [],
      sessionStartTime: Date.now(),
      bestSpanThisSession: 0,
      currentSpanLength: span,
      currentSequence: sequence,
      lastUserResponse: [],
      lastCorrect: null,
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
      lastUserResponse: [],
      adaptive: null,
      lastCorrect: null,
      sessionTrials: [],
      sessionStartTime: 0,
      bestSpanThisSession: 0,
      instructionsCountdown: 3,
    });
  },
}));
