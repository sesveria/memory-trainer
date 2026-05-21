import type { DigitSpanMode, TrainingEngine } from '../types';

// ── Constants ──
const MIN_SPAN: Record<DigitSpanMode, number> = {
  forward: 3,
  backward: 3,
  ascending: 2,
};

const MAX_SPAN: Record<DigitSpanMode, number> = {
  forward: 9,
  backward: 9,
  ascending: 8,
};

/**
 * Generate a shuffle of 0-9, guaranteed no repeats within a trial.
 */
function shuffledDigits(length: number): number[] {
  const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, length);
}

export function getMinSpan(mode: DigitSpanMode): number {
  return MIN_SPAN[mode];
}

export function getMaxSpan(mode: DigitSpanMode): number {
  return MAX_SPAN[mode];
}

// ── Forward Digit Span ──
const forwardEngine: TrainingEngine = {
  generateSequence: (span) => shuffledDigits(span),
  validate: (seq, resp) => {
    if (seq.length !== resp.length) return false;
    return seq.every((d, i) => d === resp[i]);
  },
  getInstructions: () => '按出现的顺序输入数字',
};

// ── Backward Digit Span ──
const backwardEngine: TrainingEngine = {
  generateSequence: (span) => shuffledDigits(span),
  validate: (seq, resp) => {
    if (seq.length !== resp.length) return false;
    const reversed = [...seq].reverse();
    return reversed.every((d, i) => d === resp[i]);
  },
  getInstructions: () => '按倒序输入数字',
};

// ── Ascending Digit Span ──
const ascendingEngine: TrainingEngine = {
  generateSequence: (span) => shuffledDigits(span),
  validate: (seq, resp) => {
    if (seq.length !== resp.length) return false;
    for (let i = 1; i < resp.length; i++) {
      if (resp[i] <= resp[i - 1]) return false;
    }
    const seqSorted = [...seq].sort((a, b) => a - b);
    const respSorted = [...resp].sort((a, b) => a - b);
    return seqSorted.every((d, i) => d === respSorted[i]);
  },
  getInstructions: () => '按数字升序输入',
};

const engines: Record<DigitSpanMode, TrainingEngine> = {
  forward: forwardEngine,
  backward: backwardEngine,
  ascending: ascendingEngine,
};

export function getEngine(mode: DigitSpanMode): TrainingEngine {
  return engines[mode];
}

export function getModeLabel(mode: DigitSpanMode): string {
  switch (mode) {
    case 'forward': return '正向数字广度';
    case 'backward': return '反向数字广度';
    case 'ascending': return '升序排序';
  }
}

export function getModeDescription(mode: DigitSpanMode): string {
  switch (mode) {
    case 'forward':
      return '记住数字序列，按相同顺序复现。考验短期记忆的容量与序列保持能力。';
    case 'backward':
      return '记住数字序列，然后倒序复现。在记忆基础上叠加心理操作，难度更高。';
    case 'ascending':
      return '记住数字序列，按数值升序重新排列后输入。同时考验记忆与排序加工能力。';
  }
}
