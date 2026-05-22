import { type MouseEvent } from 'react';

const GRID_SIZE = 4;

interface Props {
  litIndices: Set<number>;
  selectedIndices: Set<number>;
  mode: 'presenting' | 'recalling';
  onToggle?: (index: number) => void;
}

export default function PatternGrid({ litIndices, selectedIndices, mode, onToggle }: Props) {
  const cells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);

  const handleClick = (index: number) => (e: MouseEvent) => {
    e.preventDefault();
    if (mode !== 'recalling') return;
    onToggle?.(index);
  };

  return (
    <div
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
              fontSize: '1.5rem',
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
