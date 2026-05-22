import { type MouseEvent } from 'react';

interface Props {
  gridSize: number;
  litIndices: Set<number>;
  selectedIndices: Set<number>;
  mode: 'presenting' | 'recalling';
  onToggle?: (index: number) => void;
}

export default function PatternGrid({ gridSize, litIndices, selectedIndices, mode, onToggle }: Props) {
  const total = gridSize * gridSize;
  const cells = Array.from({ length: total }, (_, i) => i);

  const handleClick = (index: number) => (e: MouseEvent) => {
    e.preventDefault();
    if (mode !== 'recalling') return;
    onToggle?.(index);
  };

  // dynamic maxWidth based on grid size
  const maxW = gridSize <= 3 ? 260 : gridSize <= 4 ? 320 : 380;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gap: gridSize <= 3 ? 10 : 8,
        maxWidth: maxW,
        width: '100%',
        margin: '0 auto',
      }}
    >
      {cells.map((index) => {
        const isLit = litIndices.has(index);
        const isSelected = selectedIndices.has(index);

        let bg = 'var(--bg-secondary)';
        let borderColor = 'var(--border)';
        let textColor = 'var(--text-muted)';
        let content = '';

        if (mode === 'presenting' && isLit) {
          bg = 'var(--accent-blue)';
          borderColor = 'var(--accent-blue)';
          textColor = '#fff';
        } else if (mode === 'recalling') {
          if (isSelected) {
            bg = 'var(--accent-green)';
            borderColor = 'var(--accent-green)';
            textColor = '#fff';
            content = '✓';
          }
        }

        return (
          <button
            key={index}
            onClick={handleClick(index)}
            disabled={mode !== 'recalling'}
            style={{
              aspectRatio: '1',
              background: bg,
              border: `2px solid ${borderColor}`,
              borderRadius: 'var(--radius-sm)',
              cursor: mode === 'recalling' ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: gridSize <= 3 ? '1.6rem' : gridSize <= 4 ? '1.5rem' : '1.2rem',
              fontWeight: 700,
              color: textColor,
              transition: 'background 0.15s, border-color 0.15s, transform 0.1s',
              fontFamily: "'SF Mono', 'Fira Code', monospace",
            }}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
