import type { ModeMeta, TrainingEngine } from '../types';
import { registerMode } from './registry';

function shuffledDigits(length: number): number[] {
  const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, length);
}

// ── Forward ──
const metaForward: ModeMeta = {
  id: 'digit-forward',
  label: '正向数字广度',
  description: '记住数字序列，按相同顺序复现。考验短期记忆的容量与序列保持能力。',
  icon: '→',
  category: 'digit',
  minSpan: 3,
  maxSpan: 9,
};

const engineForward: TrainingEngine = {
  generateSequence: (span) => shuffledDigits(span as number),
  validate: (seq, resp) => {
    if (seq.length !== resp.length) return false;
    return (seq as number[]).every((d, i) => d === (resp as number[])[i]);
  },
  getInstructions: () => '按出现的顺序输入数字',
};

registerMode(metaForward, engineForward);

// ── Backward ──
const metaBackward: ModeMeta = {
  id: 'digit-backward',
  label: '反向数字广度',
  description: '记住数字序列，然后倒序复现。在记忆基础上叠加心理操作，难度更高。',
  icon: '←',
  category: 'digit',
  minSpan: 3,
  maxSpan: 9,
};

const engineBackward: TrainingEngine = {
  generateSequence: (span) => shuffledDigits(span as number),
  validate: (seq, resp) => {
    if (seq.length !== resp.length) return false;
    const reversed = [...(seq as number[])].reverse();
    return reversed.every((d, i) => d === (resp as number[])[i]);
  },
  getInstructions: () => '按倒序输入数字',
};

registerMode(metaBackward, engineBackward);

// ── Ascending ──
const metaAscending: ModeMeta = {
  id: 'digit-ascending',
  label: '升序排序',
  description: '记住数字序列，按数值升序重新排列后输入。同时考验记忆与排序加工能力。',
  icon: '↑',
  category: 'digit',
  minSpan: 2,
  maxSpan: 8,
};

const engineAscending: TrainingEngine = {
  generateSequence: (span) => shuffledDigits(span as number),
  validate: (seq, resp) => {
    const s = seq as number[];
    const r = resp as number[];
    if (s.length !== r.length) return false;
    for (let i = 1; i < r.length; i++) {
      if (r[i] <= r[i - 1]) return false;
    }
    const seqSorted = [...s].sort((a, b) => a - b);
    const respSorted = [...r].sort((a, b) => a - b);
    return seqSorted.every((d, i) => d === respSorted[i]);
  },
  getInstructions: () => '按数字升序输入',
};

registerMode(metaAscending, engineAscending);

// ── Legacy helpers (for backwards compat) ──
import type { DigitSpanMode } from '../types';

export function getModeLabel(mode: DigitSpanMode): string {
  switch (mode) {
    case 'forward': return '正向数字广度';
    case 'backward': return '反向数字广度';
    case 'ascending': return '升序排序';
  }
}

export function getModeDescription(mode: DigitSpanMode): string {
  switch (mode) {
    case 'forward': return '记住数字序列，按相同顺序复现。考验短期记忆的容量与序列保持能力。';
    case 'backward': return '记住数字序列，然后倒序复现。在记忆基础上叠加心理操作，难度更高。';
    case 'ascending': return '记住数字序列，按数值升序重新排列后输入。同时考验记忆与排序加工能力。';
  }
}
