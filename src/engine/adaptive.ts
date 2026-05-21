import type { DigitSpanMode } from '../types';
import { getMinSpan, getMaxSpan } from './digitSpan';

/**
 * Adaptive staircase: span adjusts based on consecutive correct / incorrect answers.
 *
 * - 2 consecutive correct → span + 1
 * - 2 consecutive incorrect → span - 1
 * - Mixed → span unchanged
 * - Clamped to [minSpan, maxSpan] for the given mode
 */
export interface AdaptiveState {
  currentSpan: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  mode: DigitSpanMode;
}

export function createAdaptive(mode: DigitSpanMode): AdaptiveState {
  const min = getMinSpan(mode);
  return {
    currentSpan: min,
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
      state.consecutiveCorrect = 0; // reset after adjustment
    }
  } else {
    state.consecutiveWrong++;
    state.consecutiveCorrect = 0;
    if (state.consecutiveWrong >= 2) {
      state.currentSpan = Math.max(state.currentSpan - 1, min);
      state.consecutiveWrong = 0; // reset after adjustment
    }
  }
}
