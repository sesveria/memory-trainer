import type { ModeMeta, TrainingEngine } from '../types';
import { registerMode } from './registry';

const GRID_SIZE = 4;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

function shuffledIndices(count: number): number[] {
  const pool = Array.from({ length: TOTAL_CELLS }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

const meta: ModeMeta = {
  id: 'pattern-matrix',
  label: '图案矩阵回忆',
  description: '短暂展示网格中的亮点图案，凭借记忆点击还原。考验视觉模式短时记忆。',
  icon: '▣',
  category: 'pattern',
  minSpan: 2,
  maxSpan: 8,
};

const engine: TrainingEngine = {
  generateSequence: (span) => shuffledIndices(span as number),
  validate: (seq, resp) => {
    const s = seq as number[];
    const r = resp as number[];
    if (s.length !== r.length) return false;
    const sortedS = [...s].sort((a, b) => a - b);
    const sortedR = [...r].sort((a, b) => a - b);
    return sortedS.every((d, i) => d === sortedR[i]);
  },
  getInstructions: () => '记住所有亮起方块的位置，然后在熄灭后点击还原',
};

registerMode(meta, engine);
