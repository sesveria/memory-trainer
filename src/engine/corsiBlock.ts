import type { ModeMeta, TrainingEngine } from '../types';
import { registerMode } from './registry';

const GRID_SIZE = 4;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

function shuffledPositions(length: number): number[] {
  const pool = Array.from({ length: TOTAL_CELLS }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, length);
}

// ── Forward ──
const metaForward: ModeMeta = {
  id: 'corsi-forward',
  label: '空间广度（正序）',
  description: '记住方块闪烁的位置顺序，按相同顺序点击复现。考验视觉空间短时记忆。',
  icon: '⊞',
  category: 'spatial',
  minSpan: 3,
  maxSpan: 9,
};

const engineForward: TrainingEngine = {
  generateSequence: (span) => shuffledPositions(span as number),
  validate: (seq, resp) => {
    const s = seq as number[];
    const r = resp as number[];
    if (s.length !== r.length) return false;
    return s.every((d, i) => d === r[i]);
  },
  getInstructions: () => '按闪烁的顺序点击方块',
};

registerMode(metaForward, engineForward);

// ── Backward ──
const metaBackward: ModeMeta = {
  id: 'corsi-backward',
  label: '空间广度（倒序）',
  description: '记住方块闪烁的位置顺序，然后倒序点击复现。在空间记忆基础上叠加心理操作。',
  icon: '⊟',
  category: 'spatial',
  minSpan: 3,
  maxSpan: 9,
};

const engineBackward: TrainingEngine = {
  generateSequence: (span) => shuffledPositions(span as number),
  validate: (seq, resp) => {
    const s = seq as number[];
    const r = resp as number[];
    if (s.length !== r.length) return false;
    const reversed = [...s].reverse();
    return reversed.every((d, i) => d === r[i]);
  },
  getInstructions: () => '按倒序点击方块',
};

registerMode(metaBackward, engineBackward);
