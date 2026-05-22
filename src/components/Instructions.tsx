import { useEffect, useRef } from 'react';
import { useTrainingStore } from '../store/trainingStore';
import { getModeMeta, getEngine } from '../engine/registry';

export default function Instructions() {
  const modeId = useTrainingStore((s) => s.modeId);
  const countdown = useTrainingStore((s) => s.instructionsCountdown);
  const tickCountdown = useTrainingStore((s) => s.tickCountdown);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => tickCountdown(), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!modeId) return null;
  const meta = getModeMeta(modeId);
  const engine = getEngine(modeId);

  return (
    <div className="instructions">
      <div className="instructions-mode">{meta.label}</div>
      <div className="instructions-hint">{engine.getInstructions()}</div>

      {/* Progress bar countdown */}
      <div style={{ width: 120, height: 6, background: 'var(--border)', borderRadius: 3, margin: '20px auto 12px', overflow: 'hidden' }}>
        <div style={{
          width: `${((3 - countdown + 1) / 3) * 100}%`,
          height: '100%',
          background: countdown <= 1 ? 'var(--accent-red)' : 'var(--accent-blue)',
          borderRadius: 3,
          transition: 'width 0.8s ease, background 0.3s',
        }} />
      </div>

      <div className="instructions-countdown" key={countdown}>
        {countdown}
      </div>
    </div>
  );
}
