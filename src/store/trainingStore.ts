import { create } from 'zustand';
import type { DigitSpanMode, TrainingPhase, TrialRecord } from '../types';
import { getEngine } from '../engine/digitSpan';
import { createAdaptive, recordTrial, type AdaptiveState } from '../engine/adaptive';

export interface TrainingState {
  mode: DigitSpanMode | null;
  phase: TrainingPhase;
  currentSequence: number[];
  trialStartTime: number;
  currentSpanLength: number;
  _presentingIndex: number;
  _showFixation: boolean;
  userInput: number[];
  adaptive: AdaptiveState | null;
  lastCorrect: boolean | null;
  sessionTrials: TrialRecord[];
  sessionStartTime: number;
  bestSpanThisSession: number;
  instructionsCountdown: number;

  setMode: (mode: DigitSpanMode) => void;
  startTrial: () => void;
  startPresenting: () => void;
  setPresentingIndex: (idx: number) => void;
  setShowFixation: (show: boolean) => void;
  finishPresenting: () => void;
  pushDigit: (digit: number) => void;
  popDigit: () => void;
  submitResponse: () => void;
  nextTrial: () => void;
  endSession: () => void;
  tickCountdown: () => void;
  resetToHome: () => void;
}

export const useTrainingStore = create<TrainingState>((set, get) => ({
  mode: null,
  phase: 'idle',
  currentSequence: [],
  trialStartTime: 0,
  currentSpanLength: 0,
  _presentingIndex: 0,
  _showFixation: false,
  userInput: [],
  adaptive: null,
  lastCorrect: null,
  sessionTrials: [],
  sessionStartTime: 0,
  bestSpanThisSession: 0,
  instructionsCountdown: 3,

  setMode: (mode) => {
    const adaptive = createAdaptive(mode);
    set({
      mode,
      adaptive,
      phase: 'instructions',
      instructionsCountdown: 3,
      sessionTrials: [],
      sessionStartTime: Date.now(),
      bestSpanThisSession: 0,
      currentSpanLength: adaptive.currentSpan,
      lastCorrect: null,
    });
  },

  startTrial: () => {
    const { adaptive, mode } = get();
    if (!adaptive || !mode) return;
    const engine = getEngine(mode);
    const span = adaptive.currentSpan;
    const sequence = engine.generateSequence(span);
    set({
      currentSpanLength: span,
      currentSequence: sequence,
      userInput: [],
      lastCorrect: null,
      phase: 'instructions',
      instructionsCountdown: 3,
      _presentingIndex: 0,
      _showFixation: false,
    });
  },

  startPresenting: () => {
    set({
      phase: 'presenting',
      trialStartTime: Date.now(),
      _presentingIndex: 0,
      _showFixation: false,
    });
  },

  setPresentingIndex: (idx) => set({ _presentingIndex: idx, _showFixation: false }),
  setShowFixation: (show) => set({ _showFixation: show }),

  finishPresenting: () => {
    set({ phase: 'recalling' });
  },

  pushDigit: (digit) => {
    const { userInput, currentSpanLength } = get();
    if (userInput.length >= currentSpanLength) return;
    set({ userInput: [...userInput, digit] });
  },

  popDigit: () => {
    const { userInput } = get();
    if (userInput.length === 0) return;
    set({ userInput: userInput.slice(0, -1) });
  },

  submitResponse: () => {
    const { mode, currentSequence, userInput, trialStartTime, adaptive, sessionTrials, bestSpanThisSession } = get();
    if (!mode || !adaptive) return;
    if (userInput.length !== currentSequence.length) return; // guard
    if (get().phase !== 'recalling') return;

    const engine = getEngine(mode);
    const correct = engine.validate(currentSequence, userInput);
    const responseTimeMs = Date.now() - trialStartTime;

    const trial: TrialRecord = {
      spanLength: currentSequence.length,
      sequence: currentSequence,
      userResponse: userInput,
      correct,
      responseTimeMs,
    };

    recordTrial(adaptive, correct);

    const newBest = Math.max(bestSpanThisSession, correct ? currentSequence.length : 0);

    set({
      phase: 'feedback',
      lastCorrect: correct,
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
      mode: null,
      phase: 'idle',
      currentSequence: [],
      trialStartTime: 0,
      currentSpanLength: 0,
      _presentingIndex: 0,
      _showFixation: false,
      userInput: [],
      adaptive: null,
      lastCorrect: null,
      sessionTrials: [],
      sessionStartTime: 0,
      bestSpanThisSession: 0,
      instructionsCountdown: 3,
    });
  },
}));
