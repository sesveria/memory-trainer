import type { ModeId } from '../types';
import { getMinSpan, getMaxSpan } from './registry';

export interface AdaptiveState {
  currentSpan: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  mode: ModeId;
}

export function createAdaptive(mode: ModeId): AdaptiveState {
  return {
    currentSpan: getMinSpan(mode),
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    mode,
  };
}

export function recordTrial(
  state: AdaptiveState,
  correct: boolean
): void {
  const min = getMinSpan(state.mode);
  const max = getMaxSpan(state.mode);

  if (correct) {
    state.consecutiveCorrect++;
    state.consecutiveWrong = 0;
    if (state.consecutiveCorrect >= 2) {
      state.currentSpan = Math.min(state.currentSpan + 1, max);
      state.consecutiveCorrect = 0;
    }
  } else {
    state.consecutiveWrong++;
    state.consecutiveCorrect = 0;
    if (state.consecutiveWrong >= 2) {
      state.currentSpan = Math.max(state.currentSpan - 1, min);
      state.consecutiveWrong = 0;
    }
  }
}
