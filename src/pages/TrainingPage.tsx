import { useEffect, useRef, useState, useCallback } from 'react';
import { useTrainingStore } from '../store/trainingStore';
import { getModeLabel } from '../engine/digitSpan';
import Instructions from '../components/Instructions';
import DigitDisplay from '../components/DigitDisplay';
import FixationCross from '../components/FixationCross';
import ResponseDisplay from '../components/ResponseDisplay';
import Numpad from '../components/Numpad';
import Feedback from '../components/Feedback';
import SessionSummary from '../components/SessionSummary';

const DIGIT_SHOW_MS = 800;
const INTERVAL_MS = 500;

function PresentingRunner() {
  const phase = useTrainingStore((s) => s.phase);
  const currentSequence = useTrainingStore((s) => s.currentSequence);
  const finishPresenting = useTrainingStore((s) => s.finishPresenting);

  const [index, setIndex] = useState(0);
  const [showFixation, setShowFixation] = useState(false);
  const [done, setDone] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (phase !== 'presenting') {
      setIndex(0);
      setShowFixation(false);
      setDone(false);
      return;
    }

    const seq = currentSequence;
    if (seq.length === 0) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    seq.forEach((_, i) => {
      const showAt = i * (DIGIT_SHOW_MS + INTERVAL_MS);
      const hideAt = showAt + DIGIT_SHOW_MS;

      timers.push(setTimeout(() => {
        if (!mountedRef.current) return;
        setIndex(i);
        setShowFixation(false);
      }, showAt));

      if (i < seq.length - 1) {
        timers.push(setTimeout(() => {
          if (!mountedRef.current) return;
          setShowFixation(true);
        }, hideAt));
      }
    });

    // Total presenting duration
    const totalMs = (seq.length - 1) * (DIGIT_SHOW_MS + INTERVAL_MS) + DIGIT_SHOW_MS + 200;

    const doneTimer = setTimeout(() => {
      if (!mountedRef.current) return;
      setDone(true);
    }, totalMs);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(doneTimer);
    };
  }, [phase, currentSequence]);

  // When the presenting sequence has finished, call finishPresenting
  useEffect(() => {
    if (done && phase === 'presenting') {
      finishPresenting();
    }
  }, [done, phase, finishPresenting]);

  if (phase !== 'presenting') return null;

  if (showFixation) {
    return <FixationCross />;
  }
  return <DigitDisplay digit={currentSequence[index] ?? 0} />;
}

function TrainingHeader() {
  const mode = useTrainingStore((s) => s.mode);
  const adaptive = useTrainingStore((s) => s.adaptive);
  const endSession = useTrainingStore((s) => s.endSession);

  return (
    <div className="training-header">
      <span className="training-mode-label">{mode ? getModeLabel(mode) : ''}</span>
      <span className="training-span-badge">
        广度 {adaptive?.currentSpan ?? '—'}
      </span>
      <button className="training-end-btn" onClick={endSession}>
        结束
      </button>
    </div>
  );
}

export default function TrainingPage() {
  const mode = useTrainingStore((s) => s.mode);
  const phase = useTrainingStore((s) => s.phase);

  if (!mode) return null;

  return (
    <div className="training-page">
      <TrainingHeader />
      <div className="display-area">
        {phase === 'instructions' && <Instructions />}
        {phase === 'presenting' && <PresentingRunner />}
        {phase === 'recalling' && (
          <div className="response-area">
            <ResponseDisplay />
            <Numpad />
          </div>
        )}
        {phase === 'feedback' && <Feedback />}
        {phase === 'summary' && <SessionSummary />}
      </div>
    </div>
  );
}
