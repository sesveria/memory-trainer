import { useTrainingStore } from '../store/trainingStore';
import { getModeMeta } from '../engine/registry';
import { appendSession } from '../engine/storage';
import { useEffect, useRef } from 'react';
import type { SessionRecord } from '../types';
import { getNBackLevel } from '../engine/nBack';

export default function NbackSummary() {
  const modeId = useTrainingStore((s) => s.modeId);
  const sessionTrials = useTrainingStore((s) => s.sessionTrials);
  const bestSpanThisSession = useTrainingStore((s) => s.bestSpanThisSession);
  const currentSpanLength = useTrainingStore((s) => s.currentSpanLength);
  const setMode = useTrainingStore((s) => s.setMode);
  const resetToHome = useTrainingStore((s) => s.resetToHome);
  const nbackPosCorrect = useTrainingStore((s) => s.nbackPosCorrect);
  const nbackLetterCorrect = useTrainingStore((s) => s.nbackLetterCorrect);
  const nbackRounds = useTrainingStore((s) => s.nbackRounds);
  const savedRef = useRef(false);

  useEffect(() => {
    if (savedRef.current || !modeId || sessionTrials.length === 0) return;
    savedRef.current = true;

    const total = nbackRounds.length;
    const nLevel = getNBackLevel(modeId);
    const correct = nbackRounds.filter(r => r.posCorrect && r.letterCorrect).length;
    const record: SessionRecord = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: Date.now(),
      mode: modeId,
      trials: sessionTrials,
      finalSpan: nLevel,
      bestSpan: bestSpanThisSession,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
    appendSession(record);
  }, [modeId, sessionTrials, bestSpanThisSession, nbackRounds]);

  if (!modeId) return null;

  const meta = getModeMeta(modeId);
  const total = nbackRounds.length;
  const bothCorrect = nbackRounds.filter(r => r.posCorrect && r.letterCorrect).length;
  const posPct = total > 0 ? Math.round((nbackPosCorrect / total) * 100) : 0;
  const letPct = total > 0 ? Math.round((nbackLetterCorrect / total) * 100) : 0;
  const bothPct = total > 0 ? Math.round((bothCorrect / total) * 100) : 0;

  return (
    <div className="summary">
      <h2>{meta.label} — 训练结束</h2>
      <div className="summary-stats">
        <div className="summary-stat">
          <div className="summary-stat-label">位置正确率</div>
          <div className="summary-stat-value">{posPct}%</div>
        </div>
        <div className="summary-stat">
          <div className="summary-stat-label">字母正确率</div>
          <div className="summary-stat-value">{letPct}%</div>
        </div>
        <div className="summary-stat">
          <div className="summary-stat-label">双任务正确率</div>
          <div className="summary-stat-value">{bothPct}%</div>
        </div>
        <div className="summary-stat">
          <div className="summary-stat-label">总轮次</div>
          <div className="summary-stat-value">{total}</div>
        </div>
      </div>
      <div className="summary-btns">
        <button className="summary-retry-btn" onClick={() => setMode(modeId)}>
          再练一轮
        </button>
        <button className="summary-home-btn" onClick={resetToHome}>
          返回首页
        </button>
      </div>
    </div>
  );
}
