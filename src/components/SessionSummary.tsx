import { useTrainingStore } from '../store/trainingStore';
import { getModeLabel } from '../engine/digitSpan';
import { appendSession } from '../engine/storage';
import { useEffect, useRef } from 'react';
import type { SessionRecord } from '../types';

export default function SessionSummary() {
  const mode = useTrainingStore((s) => s.mode);
  const sessionTrials = useTrainingStore((s) => s.sessionTrials);
  const bestSpanThisSession = useTrainingStore((s) => s.bestSpanThisSession);
  const currentSpanLength = useTrainingStore((s) => s.currentSpanLength);
  const setMode = useTrainingStore((s) => s.setMode);
  const resetToHome = useTrainingStore((s) => s.resetToHome);
  const savedRef = useRef(false);

  useEffect(() => {
    if (savedRef.current || !mode || sessionTrials.length === 0) return;
    savedRef.current = true;

    const total = sessionTrials.length;
    const correct = sessionTrials.filter((t) => t.correct).length;
    const record: SessionRecord = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: Date.now(),
      mode,
      trials: sessionTrials,
      finalSpan: currentSpanLength,
      bestSpan: bestSpanThisSession,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
    appendSession(record);
  }, [mode, sessionTrials, bestSpanThisSession, currentSpanLength]);

  if (!mode) return null;

  const total = sessionTrials.length;
  const correct = sessionTrials.filter((t) => t.correct).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="summary">
      <h2>{getModeLabel(mode)} — 训练结束</h2>
      <div className="summary-stats">
        <div className="summary-stat">
          <div className="summary-stat-label">最终广度</div>
          <div className="summary-stat-value">{currentSpanLength}</div>
        </div>
        <div className="summary-stat">
          <div className="summary-stat-label">最高广度</div>
          <div className="summary-stat-value">{bestSpanThisSession}</div>
        </div>
        <div className="summary-stat">
          <div className="summary-stat-label">总试次</div>
          <div className="summary-stat-value">{total}</div>
        </div>
        <div className="summary-stat">
          <div className="summary-stat-label">正确率</div>
          <div className="summary-stat-value">{accuracy}%</div>
        </div>
      </div>
      <div className="summary-btns">
        <button className="summary-retry-btn" onClick={() => setMode(mode)}>
          再练一轮
        </button>
        <button className="summary-home-btn" onClick={resetToHome}>
          返回首页
        </button>
      </div>
    </div>
  );
}
