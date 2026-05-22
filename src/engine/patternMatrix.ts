import type { ModeMeta, TrainingEngine } from '../types';
import { registerMode } from './registry';

function makeEngine(gridSize: number): {
  meta: ModeMeta;
  engine: TrainingEngine;
} {
  const total = gridSize * gridSize;
  // Upper limit: strictly less than half of total cells so strategy stays "remember lit cells"
  const maxSpan = Math.floor((total - 1) / 2);
  const sizeLabel = `${gridSize}×${gridSize}`;

  function shuffledIndices(count: number): number[] {
    const pool = Array.from({ length: total }, (_, i) => i);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
  }

  const meta: ModeMeta = {
    id: `pattern-${gridSize}x${gridSize}` as ModeMeta['id'],
    label: `图案矩阵 ${sizeLabel}`,
    description: `${sizeLabel} 网格中短暂亮起若干方块（最多${maxSpan}个，少于一半），凭借记忆点击还原。`,
    icon: '▣',
    category: 'pattern',
    minSpan: 2,
    maxSpan,
    gridSize,
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
    getInstructions: () => `记住所有亮起方块的位置（共${sizeLabel}格），然后在熄灭后点击还原`,
  };

  return { meta, engine };
}

for (const size of [3, 4, 5]) {
  const { meta, engine } = makeEngine(size);
  registerMode(meta, engine);
}
