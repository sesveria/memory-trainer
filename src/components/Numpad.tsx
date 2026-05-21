import { useEffect } from 'react';
import { useTrainingStore } from '../store/trainingStore';

export default function Numpad() {
  const userInput = useTrainingStore((s) => s.userInput);
  const currentSpanLength = useTrainingStore((s) => s.currentSpanLength);
  const pushDigit = useTrainingStore((s) => s.pushDigit);
  const popDigit = useTrainingStore((s) => s.popDigit);
  const submitResponse = useTrainingStore((s) => s.submitResponse);
  const phase = useTrainingStore((s) => s.phase);

  const canSubmit = userInput.length === currentSpanLength;
  const isRecalling = phase === 'recalling';

  useEffect(() => {
    if (!isRecalling) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        pushDigit(Number(e.key));
      } else if (e.key === 'Backspace') {
        popDigit();
      } else if (e.key === 'Enter') {
        if (userInput.length === currentSpanLength) {
          submitResponse();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isRecalling, pushDigit, popDigit, submitResponse, userInput.length, currentSpanLength]);

  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="numpad">
      {digits.map((d) => (
        <button
          key={d}
          className="numpad-btn"
          onClick={() => pushDigit(d)}
          disabled={!isRecalling || userInput.length >= currentSpanLength}
        >
          {d}
        </button>
      ))}
      <button
        className="numpad-btn backspace"
        onClick={popDigit}
        disabled={!isRecalling || userInput.length === 0}
      >
        ⌫
      </button>
      <button className="numpad-btn zero" onClick={() => pushDigit(0)} disabled={!isRecalling || userInput.length >= currentSpanLength}>
        0
      </button>
      <button
        className="numpad-btn submit"
        onClick={submitResponse}
        disabled={!canSubmit || !isRecalling}
      >
        确认 ✓
      </button>
    </div>
  );
}
