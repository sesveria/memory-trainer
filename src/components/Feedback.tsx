import { useTrainingStore } from '../store/trainingStore';

export default function Feedback() {
  const lastCorrect = useTrainingStore((s) => s.lastCorrect);
  const currentSpanLength = useTrainingStore((s) => s.currentSpanLength);
  const nextTrial = useTrainingStore((s) => s.nextTrial);
  const endSession = useTrainingStore((s) => s.endSession);

  return (
    <div className="feedback-overlay">
      <div className="feedback-card">
        <div className={`feedback-icon ${lastCorrect ? 'correct' : 'wrong'}`}>
          {lastCorrect ? '✓' : '✗'}
        </div>
        <div className={`feedback-text ${lastCorrect ? 'correct' : 'wrong'}`}>
          {lastCorrect ? '正确！' : '错误'}
        </div>
        <div className="feedback-span">当前广度：{currentSpanLength}</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="feedback-next-btn" onClick={nextTrial}>
            继续下一轮
          </button>
          <button
            className="training-end-btn"
            onClick={endSession}
            style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
          >
            结束训练
          </button>
        </div>
      </div>
    </div>
  );
}
