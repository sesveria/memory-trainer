import { useState, useEffect, useCallback } from 'react';
import { useTrainingStore } from '../store/trainingStore';
import PatternGrid from './PatternGrid';

export default function PatternRecallingArea() {
  const currentSpanLength = useTrainingStore((s) => s.currentSpanLength);
  const gridSize = useTrainingStore((s) => s.gridSize);
  const submitResponse = useTrainingStore((s) => s.submitResponse);
  const phase = useTrainingStore((s) => s.phase);

  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (phase === 'instructions' || phase === 'presenting') {
      setSelected(new Set());
    }
  }, [phase]);

  const handleToggle = useCallback((index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else if (next.size < currentSpanLength) {
        next.add(index);
      }
      return next;
    });
  }, [currentSpanLength]);

  const handleSubmit = useCallback(() => {
    submitResponse(Array.from(selected));
  }, [selected, submitResponse]);

  const handleClear = useCallback(() => {
    setSelected(new Set());
  }, []);

  const isRecalling = phase === 'recalling';
  const atMax = selected.size >= currentSpanLength;

  return (
    <div className="response-area">
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
        {atMax
          ? `已选满 ${selected.size} 个，请点击「确认提交」`
          : `点击格子还原亮过的位置（已选 ${selected.size}/${currentSpanLength} 个）`
        }
      </div>
      <PatternGrid
        gridSize={gridSize}
        litIndices={new Set()}
        selectedIndices={selected}
        mode="recalling"
        onToggle={handleToggle}
      />
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button
          className="numpad-btn submit"
          onClick={handleSubmit}
          disabled={!isRecalling || selected.size === 0}
          style={{ height: 44, paddingInline: 24, aspectRatio: 'auto' }}
        >
          确认提交
        </button>
        <button
          className="numpad-btn backspace"
          onClick={handleClear}
          disabled={!isRecalling || selected.size === 0}
          style={{ height: 44, paddingInline: 16, aspectRatio: 'auto' }}
        >
          清除重选
        </button>
      </div>
    </div>
  );
}
