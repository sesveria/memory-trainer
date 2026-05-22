import { useState, useEffect, useCallback } from 'react';
import { useTrainingStore } from '../store/trainingStore';
import ResponseDisplay from './ResponseDisplay';
import Numpad from './Numpad';

export default function DigitRecallingArea() {
  const currentSpanLength = useTrainingStore((s) => s.currentSpanLength);
  const submitResponse = useTrainingStore((s) => s.submitResponse);
  const phase = useTrainingStore((s) => s.phase);

  const [input, setInput] = useState<number[]>([]);

  // Reset when leaving recalling
  useEffect(() => {
    if (phase === 'instructions' || phase === 'presenting') {
      setInput([]);
    }
  }, [phase]);

  const push = useCallback((d: number) => {
    setInput((prev) => (prev.length < currentSpanLength ? [...prev, d] : prev));
  }, [currentSpanLength]);

  const pop = useCallback(() => {
    setInput((prev) => prev.slice(0, -1));
  }, []);

  const handleSubmit = useCallback(() => {
    if (input.length === currentSpanLength) {
      submitResponse(input);
    }
  }, [input, currentSpanLength, submitResponse]);

  return (
    <div className="response-area">
      <ResponseDisplay value={input} length={currentSpanLength} />
      <Numpad
        value={input}
        maxLength={currentSpanLength}
        disabled={phase !== 'recalling'}
        onPush={push}
        onPop={pop}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
