import { useMemo } from 'react';
import { getAllSessions, getTotalSessions } from '../engine/storage';
import { getModeMeta } from '../engine/registry';
import type { ModeId, SessionRecord } from '../types';

// ── Colour palette per category ──
const CAT_COLORS: Record<string, string> = {
  digit: '#4a9eff',
  spatial: '#4ecdc4',
  pattern: '#ffe66d',
  nback: '#ff6b6b',
};

/* ── Summary cards ── */
function SummaryCards({ sessions }: { sessions: SessionRecord[] }) {
  const totalSessions = getTotalSessions();
  const totalTrials = sessions.reduce((sum, s) => sum + s.trials.length, 0);
  const avgAcc =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length
        )
      : 0;

  // Active days in last 7
  const now = Date.now();
  const daySet = new Set<string>();
  for (const s of sessions) {
    if (now - s.timestamp < 7 * 86400000) {
      daySet.add(new Date(s.timestamp).toDateString());
    }
  }

  const cards = [
    { label: '累计训练', value: totalSessions },
    { label: '总试次', value: totalTrials },
    { label: '平均正确率', value: `${avgAcc}%` },
    { label: '近7天活跃', value: `${daySet.size} 天` },
  ];

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 28 }}>
      {cards.map((c) => (
        <div
          key={c.label}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 20px',
            textAlign: 'center',
            minWidth: 110,
          }}
        >
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {c.label}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-blue)', fontFamily: "'SF Mono','Fira Code',monospace", marginTop: 4 }}>
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── SVG Trend chart (last 20 sessions) ── */
function TrendChart({ sessions }: { sessions: SessionRecord[] }) {
  const W = 500;
  const H = 180;
  const PAD = { top: 16, right: 20, bottom: 28, left: 36 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const data = sessions.slice(-20);
  if (data.length < 2) return null;

  const maxSpan = Math.max(...data.map((s) => s.bestSpan), 3);
  const minSpan = Math.min(...data.map((s) => s.bestSpan), 1);
  const spanRange = maxSpan - minSpan || 1;

  const toX = (i: number) => PAD.left + (i / (data.length - 1)) * plotW;
  const toY = (v: number) => PAD.top + plotH - ((v - minSpan) / spanRange) * plotH;

  const points = data
    .map((s, i) => `${toX(i)},${toY(s.bestSpan)}`)
    .join(' ');
  const polyline = data
    .map((s, i) => `${toX(i)},${toY(s.bestSpan)}`)
    .join(' ');

  // Y axis ticks
  const yTicks = [minSpan, Math.round((minSpan + maxSpan) / 2), maxSpan];

  // Mode labels (abbreviated)
  const modeLabels = data.map((s) => {
    try {
      return getModeMeta(s.mode).label.slice(0, 4);
    } catch {
      return s.mode.slice(0, 4);
    }
  });

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        广度趋势（最近 {data.length} 次）
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        {/* Grid lines */}
        {yTicks.map((v) => (
          <line key={v} x1={PAD.left} y1={toY(v)} x2={W - PAD.right} y2={toY(v)} stroke="var(--border)" strokeWidth={0.5} />
        ))}
        {/* Y labels */}
        {yTicks.map((v) => (
          <text key={v} x={PAD.left - 6} y={toY(v) + 4} fill="var(--text-muted)" fontSize={10} textAnchor="end">
            {v}
          </text>
        ))}
        {/* X labels */}
        {modeLabels.map((l, i) => (
          <text key={i} x={toX(i)} y={H - 6} fill="var(--text-muted)" fontSize={9} textAnchor="middle">
            {l}
          </text>
        ))}
        {/* Line */}
        <polyline points={polyline} fill="none" stroke="var(--accent-blue)" strokeWidth={2} strokeLinejoin="round" />
        {/* Dots */}
        {data.map((s, i) => (
          <circle key={i} cx={toX(i)} cy={toY(s.bestSpan)} r={3.5} fill="var(--accent-blue)" />
        ))}
      </svg>
    </div>
  );
}

/* ── Bar chart: accuracy by category ── */
function CategoryBarChart({ sessions }: { sessions: SessionRecord[] }) {
  if (sessions.length === 0) return null;

  const cats = ['digit', 'spatial', 'pattern', 'nback'] as const;
  const catData = cats.map((cat) => {
    const relevant = sessions.filter((s) => {
      try { return getModeMeta(s.mode).category === cat; } catch { return false; }
    });
    return {
      cat,
      count: relevant.length,
      avgAcc: relevant.length > 0
        ? Math.round(relevant.reduce((sum, s) => sum + s.accuracy, 0) / relevant.length)
        : 0,
    };
  });

  const labels: Record<string, string> = {
    digit: '数字广度',
    spatial: '视觉空间',
    pattern: '图案记忆',
    nback: 'N-Back',
  };

  const W = 380;
  const H = 160;
  const PAD = { top: 16, right: 16, bottom: 28, left: 20 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const barW = plotW / catData.length - 12;
  const maxAcc = 100;

  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        各模式平均正确率
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 380, display: 'block', margin: '0 auto' }}>
        {/* Baseline */}
        <line x1={PAD.left} y1={PAD.top + plotH} x2={W - PAD.right} y2={PAD.top + plotH} stroke="var(--border)" strokeWidth={0.5} />
        {/* 50% guide */}
        <line x1={PAD.left} y1={PAD.top + plotH / 2} x2={W - PAD.right} y2={PAD.top + plotH / 2} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="4 2" />
        <text x={PAD.left - 4} y={PAD.top + plotH / 2 + 4} fill="var(--text-muted)" fontSize={9} textAnchor="end">50%</text>
        <text x={PAD.left - 4} y={PAD.top + 5} fill="var(--text-muted)" fontSize={9} textAnchor="end">100%</text>

        {catData.map((d, i) => {
          const x = PAD.left + (i / catData.length) * plotW + (plotW / catData.length - barW) / 2;
          const barH = (d.avgAcc / maxAcc) * plotH;
          const y = PAD.top + plotH - barH;
          const color = CAT_COLORS[d.cat] ?? 'var(--accent-blue)';
          return (
            <g key={d.cat}>
              <rect x={x} y={y} width={barW} height={barH} fill={color} rx={3} opacity={0.85} />
              <text x={x + barW / 2} y={H - 10} fill="var(--text-muted)" fontSize={9} textAnchor="middle">
                {labels[d.cat]}
              </text>
              <text x={x + barW / 2} y={y - 4} fill={color} fontSize={10} fontWeight={700} textAnchor="middle">
                {d.avgAcc}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function StatsPanel() {
  const sessions = useMemo(() => getAllSessions(), []);

  if (sessions.length < 2) return null;

  return (
    <div style={{ maxWidth: 700, width: '100%', margin: '0 auto 32px' }}>
      <SummaryCards sessions={sessions} />
      <TrendChart sessions={sessions} />
      <CategoryBarChart sessions={sessions} />
    </div>
  );
}
