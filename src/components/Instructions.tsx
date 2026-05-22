import { useEffect, useRef } from 'react';
import { useTrainingStore } from '../store/trainingStore';
import { getModeMeta, getEngine } from '../engine/registry';

export default function Instructions() {
  const modeId = useTrainingStore((s) => s.modeId);
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

  if (!modeId) return null;
  const meta = getModeMeta(modeId);
  const engine = getEngine(modeId);

  return (
    <div className="instructions">
      <div className="instructions-mode">{meta.label}</div>
      <div className="instructions-hint">{engine.getInstructions()}</div>
      <div className="instructions-countdown" key={countdown}>
        {countdown}
      </div>
    </div>
  );
}
