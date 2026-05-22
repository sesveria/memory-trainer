import type { ModeMeta, TrainingEngine } from '../types';
import { registerMode } from './registry';

const GRID_POSITIONS = 9; // 3×3
const LETTERS = ['C', 'F', 'H', 'K', 'L', 'N', 'P', 'Q', 'R', 'T'];
const TOTAL_ROUNDS = 20;

/** Encoded stimulus: position * 100 + letterIndex */
type Encoded = number;

let _prevPositions: number[] = [];
let _prevLetters: number[] = [];
let _nLevel = 1;

export function setNBackContext(n: number): void {
  _nLevel = n;
  _prevPositions = [];
  _prevLetters = [];
}

export function generateStimulus(): Encoded {
  const posPool = [...Array(GRID_POSITIONS).keys()];
  const letterPool = [...Array(LETTERS.length).keys()];

  // Decide whether position matches N steps back (25% chance, only if enough history)
  let pos: number;
  if (_prevPositions.length >= _nLevel && Math.random() < 0.25) {
    pos = _prevPositions[_prevPositions.length - _nLevel];
  } else {
    pos = posPool[Math.floor(Math.random() * posPool.length)];
  }

  // Decide whether letter matches N steps back (25% chance)
  let letterIdx: number;
  if (_prevLetters.length >= _nLevel && Math.random() < 0.25) {
    letterIdx = _prevLetters[_prevLetters.length - _nLevel];
  } else {
    letterIdx = letterPool[Math.floor(Math.random() * letterPool.length)];
  }

  _prevPositions.push(pos);
  _prevLetters.push(letterIdx);
  return pos * 100 + letterIdx;
}

export function decodeStimulus(s: Encoded): { position: number; letter: string } {
  return {
    position: Math.floor(s / 100),
    letter: LETTERS[s % 100] ?? '?',
  };
}

export function getNBackLevel(modeId: string): number {
  return modeId === 'nback-1' ? 1 : modeId === 'nback-2' ? 2 : 3;
}

export function getTotalRounds(): number {
  return TOTAL_ROUNDS;
}

function makeNbackEngine(nLevel: number): { meta: ModeMeta; engine: TrainingEngine } {
  const meta: ModeMeta = {
    id: `nback-${nLevel}` as ModeMeta['id'],
    label: `${nLevel}-Back 双任务`,
    description: `判断当前位置和字母是否与 ${nLevel} 步前相同。双任务同时进行，持续训练工作记忆更新能力。`,
    icon: '⟳',
    category: 'nback',
    minSpan: nLevel,
    maxSpan: nLevel,
  };

  const engine: TrainingEngine = {
    generateSequence: (_span) => Array(TOTAL_ROUNDS).fill(0).map(() => generateStimulus()),
    validate: () => false,
    getInstructions: () =>
      `位置匹配按 A，字母匹配按 L。判断当前是否与 ${nLevel} 步前相同。共 ${TOTAL_ROUNDS} 轮。`,
  };

  return { meta, engine };
}

for (const n of [1, 2, 3]) {
  const { meta, engine } = makeNbackEngine(n);
  registerMode(meta, engine);
}
