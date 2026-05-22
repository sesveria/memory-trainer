import type { ModeMeta, TrainingEngine } from '../types';
import { registerMode } from './registry';

const GRID_SIZE = 4; // 4×4 = 16 positions
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

function shuffledPositions(length: number): number[] {
  const pool = Array.from({ length: TOTAL_CELLS }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, length);
}

const metaCorsi: ModeMeta = {
  id: 'corsi-block',
  label: '空间广度',
  description: '记住方块闪烁的位置顺序，按相同顺序点击复现。考验视觉空间短时记忆。',
  icon: '⊞',
  category: 'spatial',
  minSpan: 3,
  maxSpan: 9,
};

const engineCorsi: TrainingEngine = {
  generateSequence: (span) => shuffledPositions(span as number),
  validate: (seq, resp) => {
    if ((seq as number[]).length !== (resp as number[]).length) return false;
    return (seq as number[]).every((d, i) => d === (resp as number[])[i]);
  },
  getInstructions: () => '按闪烁的顺序点击方块',
};

registerMode(metaCorsi, engineCorsi);
