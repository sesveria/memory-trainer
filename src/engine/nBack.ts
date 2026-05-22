import type { ModeMeta, TrainingEngine } from '../types';
import { registerMode } from './registry';

const GRID_POSITIONS = 9;
const LETTERS = ['C', 'F', 'H', 'K', 'L', 'N', 'P', 'Q', 'R', 'T'];
const TOTAL_ROUNDS = 20;

type Encoded = number;

let _prevPositions: number[] = [];
let _prevLetters: number[] = [];
let _matchTruths: { posMatch: boolean; letterMatch: boolean }[] = [];
let _nLevel = 1;

export function setNBackContext(n: number): void {
  _nLevel = n;
  _prevPositions = [];
  _prevLetters = [];
  _matchTruths = [];
}

export function generateStimulus(): Encoded {
  const posPool = [...Array(GRID_POSITIONS).keys()];
  const letterPool = [...Array(LETTERS.length).keys()];

  let pos: number;
  let posMatch = false;
  if (_prevPositions.length >= _nLevel && Math.random() < 0.25) {
    pos = _prevPositions[_prevPositions.length - _nLevel];
    posMatch = true;
  } else {
    pos = posPool[Math.floor(Math.random() * posPool.length)];
  }

  let letterIdx: number;
  let letterMatch = false;
  if (_prevLetters.length >= _nLevel && Math.random() < 0.25) {
    letterIdx = _prevLetters[_prevLetters.length - _nLevel];
    letterMatch = true;
  } else {
    letterIdx = letterPool[Math.floor(Math.random() * letterPool.length)];
  }

  _prevPositions.push(pos);
  _prevLetters.push(letterIdx);
  _matchTruths.push({ posMatch, letterMatch });
  return pos * 100 + letterIdx;
}

export function getMatchTruth(roundIndex: number): { posMatch: boolean; letterMatch: boolean } | null {
  return _matchTruths[roundIndex] ?? null;
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
    description: `判断当前位置和字母是否与 ${nLevel} 步前相同。前 ${nLevel} 轮仅观察，之后开始判断。双任务同时进行，持续训练工作记忆更新能力。`,
    icon: '⟳',
    category: 'nback',
    minSpan: nLevel,
    maxSpan: nLevel,
  };

  const engine: TrainingEngine = {
    generateSequence: (_span) => Array(TOTAL_ROUNDS).fill(0).map(() => generateStimulus()),
    validate: () => false,
    getInstructions: () =>
      `前 ${nLevel} 轮仅观察不按键。之后：位置相同按 A，字母相同按 L。共 ${TOTAL_ROUNDS} 轮。`,
  };

  return { meta, engine };
}

for (const n of [1, 2, 3]) {
  const { meta, engine } = makeNbackEngine(n);
  registerMode(meta, engine);
}
