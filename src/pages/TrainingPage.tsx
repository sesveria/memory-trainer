import { useEffect, useRef } from 'react';
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
  const presentingIndex = useTrainingStore((s) => s._presentingIndex);
  const showFixation = useTrainingStore((s) => s._showFixation);
  const setPresentingIndex = useTrainingStore((s) => s.setPresentingIndex);
  const setShowFixation = useTrainingStore((s) => s.setShowFixation);
  const finishPresenting = useTrainingStore((s) => s.finishPresenting);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (phase !== 'presenting') return;

    const seq = currentSequence;
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];

    seq.forEach((_, index) => {
      const showTime = index * (DIGIT_SHOW_MS + INTERVAL_MS);
      const hideTime = showTime + DIGIT_SHOW_MS;

      timerRef.current.push(
        setTimeout(() => setPresentingIndex(index), showTime)
      );

      if (index < seq.length - 1) {
        timerRef.current.push(
          setTimeout(() => setShowFixation(true), hideTime)
        );
      }
    });

    const totalTime = (seq.length - 1) * (DIGIT_SHOW_MS + INTERVAL_MS) + DIGIT_SHOW_MS;
    timerRef.current.push(
      setTimeout(() => finishPresenting(), totalTime + 200)
    );

    return () => {
      timerRef.current.forEach(clearTimeout);
      timerRef.current = [];
    };
  }, [phase, currentSequence, setPresentingIndex, setShowFixation, finishPresenting]);

  if (showFixation) {
    return <FixationCross />;
  }
  return <DigitDisplay digit={currentSequence[presentingIndex] ?? 0} />;
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
