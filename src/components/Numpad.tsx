import { useEffect } from 'react';

interface Props {
  value: number[];
  maxLength: number;
  disabled: boolean;
  onPush: (digit: number) => void;
  onPop: () => void;
  onSubmit: () => void;
}

export default function Numpad({ value, maxLength, disabled, onPush, onPop, onSubmit }: Props) {
  const canSubmit = value.length === maxLength;

  // Keyboard support
  useEffect(() => {
    if (disabled) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (value.length < maxLength) onPush(Number(e.key));
      } else if (e.key === 'Backspace') {
        onPop();
      } else if (e.key === 'Enter') {
        if (value.length === maxLength) onSubmit();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [disabled, value.length, maxLength, onPush, onPop, onSubmit]);

  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="numpad">
      {digits.map((d) => (
        <button
          key={d}
          className="numpad-btn"
          onClick={() => onPush(d)}
          disabled={disabled || value.length >= maxLength}
        >
          {d}
        </button>
      ))}
      <button
        className="numpad-btn backspace"
        onClick={onPop}
        disabled={disabled || value.length === 0}
      >
        ⌫
      </button>
      <button className="numpad-btn zero" onClick={() => onPush(0)} disabled={disabled || value.length >= maxLength}>
        0
      </button>
      <button
        className="numpad-btn submit"
        onClick={onSubmit}
        disabled={!canSubmit || disabled}
      >
        确认 ✓
      </button>
    </div>
  );
}
