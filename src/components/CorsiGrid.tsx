import { type MouseEvent } from 'react';

const GRID_SIZE = 4;

export type CellState = 'default' | 'highlighted' | 'selected';

interface Props {
  highlightIndex: number | null; // -1 or index of currently highlighted cell
  selectedIndices: number[];     // cells already chosen by user
  disabled: boolean;
  showSequenceOrder?: boolean;   // show order numbers on selected cells
  onCellClick?: (index: number) => void;
}

export default function CorsiGrid({ highlightIndex, selectedIndices, disabled, showSequenceOrder, onCellClick }: Props) {
  const cells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);

  const handleClick = (index: number) => (e: MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (selectedIndices.includes(index)) return;
    onCellClick?.(index);
  };

  const getCellState = (index: number): CellState => {
    if (highlightIndex === index) return 'highlighted';
    if (selectedIndices.includes(index)) return 'selected';
    return 'default';
  };

  const getOrderLabel = (index: number): string => {
    if (!showSequenceOrder) return '';
    const pos = selectedIndices.indexOf(index);
    return pos >= 0 ? String(pos + 1) : '';
  };

  return (
    <div
      className="corsi-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        gap: 10,
        maxWidth: 320,
        width: '100%',
        margin: '0 auto',
      }}
    >
      {cells.map((index) => {
        const state = getCellState(index);
        let className = 'corsi-cell';
        if (state === 'highlighted') className += ' highlighted';
        if (state === 'selected') className += ' selected';

        return (
          <button
            key={index}
            className={className}
            onClick={handleClick(index)}
            disabled={disabled || state === 'selected'}
            style={{
              aspectRatio: '1',
              background: state === 'highlighted'
                ? 'var(--accent-blue)'
                : state === 'selected'
                ? 'var(--accent-green)'
                : 'var(--bg-secondary)',
              border: state === 'selected'
                ? '2px solid var(--accent-green)'
                : state === 'highlighted'
                ? '2px solid var(--accent-blue)'
                : '2px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              cursor: disabled || state === 'selected' ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 700,
              color: state === 'default' ? 'var(--text-muted)' : '#fff',
              transition: 'background 0.15s, border-color 0.15s, transform 0.1s',
              fontFamily: "'SF Mono', 'Fira Code', monospace",
            }}
          >
            {getOrderLabel(index)}
          </button>
        );
      })}
    </div>
  );
}
