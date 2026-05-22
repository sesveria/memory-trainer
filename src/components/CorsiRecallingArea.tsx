import { useState, useEffect, useCallback } from 'react';
import { useTrainingStore } from '../store/trainingStore';
import CorsiGrid from './CorsiGrid';

export default function CorsiRecallingArea() {
  const currentSpanLength = useTrainingStore((s) => s.currentSpanLength);
  const submitResponse = useTrainingStore((s) => s.submitResponse);
  const phase = useTrainingStore((s) => s.phase);

  const [selected, setSelected] = useState<number[]>([]);

  // Reset when leaving recalling
  useEffect(() => {
    if (phase === 'instructions' || phase === 'presenting') {
      setSelected([]);
    }
  }, [phase]);

  const handleCellClick = useCallback((index: number) => {
    setSelected((prev) => {
      if (prev.includes(index)) return prev;
      const next = [...prev, index];
      if (next.length === currentSpanLength) {
        // Submit on the next tick to let state settle
        setTimeout(() => submitResponse(next), 0);
      }
      return next;
    });
  }, [currentSpanLength, submitResponse]);

  return (
    <div className="response-area">
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
        点击方块，按闪烁顺序复现（已选 {selected.length}/{currentSpanLength}）
      </div>
      <CorsiGrid
        highlightIndex={null}
        selectedIndices={selected}
        disabled={phase !== 'recalling'}
        showSequenceOrder={true}
        onCellClick={handleCellClick}
      />
    </div>
  );
}
