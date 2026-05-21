import { useEffect, useRef } from 'react';
import { useTrainingStore } from '../store/trainingStore';
import { getModeLabel } from '../engine/digitSpan';

export default function Instructions() {
  const mode = useTrainingStore((s) => s.mode);
  const countdown = useTrainingStore((s) => s.instructionsCountdown);
  const tickCountdown = useTrainingStore((s) => s.tickCountdown);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      tickCountdown();
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mode) return null;

  return (
    <div className="instructions">
      <div className="instructions-mode">{getModeLabel(mode)}</div>
      <div className="instructions-hint">请准备好，数字即将出现</div>
      <div className="instructions-countdown" key={countdown}>
        {countdown}
      </div>
    </div>
  );
}
