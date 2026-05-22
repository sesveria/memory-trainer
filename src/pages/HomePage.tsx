import ModeSelector from '../components/ModeSelector';
import PersonalBests from '../components/PersonalBests';
import { getRecentSessions, getTotalSessions } from '../engine/storage';
import { getModeMeta } from '../engine/registry';
import type { ModeId } from '../types';
import { useMemo } from 'react';

interface Props {
  onSelectMode: (id: ModeId) => void;
}

function modeLabel(id: string): string {
  try { return getModeMeta(id as ModeId).label; } catch { return id; }
}

export default function HomePage({ onSelectMode }: Props) {
  const sessions = useMemo(() => getRecentSessions(10), []);
  const totalSessions = useMemo(() => getTotalSessions(), []);

  return (
    <div className="home-page">
      <h1 className="home-title">🧠 短期记忆训练</h1>
      <p className="home-subtitle">
        基于数字广度范式，科学训练你的短期记忆能力
        {totalSessions > 0 && ` · 已完成 ${totalSessions} 次训练`}
      </p>

      <PersonalBests />

      <ModeSelector onSelect={onSelectMode} />

      {sessions.length > 0 && (
        <div className="recent-sessions">
          <h3>最近训练</h3>
          {sessions.map((s) => (
            <div key={s.id} className="session-row">
              <span className="session-row-mode">{modeLabel(s.mode)}</span>
              <span className="session-row-meta">
                {new Date(s.timestamp).toLocaleDateString('zh-CN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="session-row-score">
                {s.bestSpan} · {s.accuracy}%
              </span>
            </div>
          ))}
        </div>
      )}

      {totalSessions === 0 && (
        <div className="no-sessions">选择一个模式开始你的第一次训练</div>
      )}
    </div>
  );
}
