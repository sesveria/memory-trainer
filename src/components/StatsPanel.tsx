import { useMemo, useState } from 'react';
import { getAllSessions, getTotalSessions } from '../engine/storage';
import { getModeMeta, getAllModes } from '../engine/registry';
import type { ModeId, ModeCategory, SessionRecord } from '../types';

const CAT_COLORS: Record<string, string> = {
  digit: '#4a9eff',
  spatial: '#4ecdc4',
  pattern: '#ffe66d',
  nback: '#ff6b6b',
};

const CAT_LABELS: Record<string, string> = {
  digit: '数字广度',
  spatial: '视觉空间',
  pattern: '图案记忆',
  nback: 'N-Back',
};

function SummaryCards({ sessions }: { sessions: SessionRecord[] }) {
  const total = getTotalSessions();
  const trials = sessions.reduce((s, x) => s + x.trials.length, 0);
  const avg = sessions.length > 0
    ? Math.round(sessions.reduce((s, x) => s + x.accuracy, 0) / sessions.length)
    : 0;
  const now = Date.now();
  const days = new Set(
    sessions.filter((x) => now - x.timestamp < 7 * 864e5).map((x) => new Date(x.timestamp).toDateString())
  ).size;

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
      {[['累计训练', total], ['总试次', trials], ['平均正确率', `${avg}%`], ['近7天活跃', `${days} 天`]].map(([l, v]) => (
        <div key={l as string} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px', textAlign: 'center', minWidth: 90 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{l}</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent-blue)', fontFamily: "'SF Mono','Fira Code',monospace", marginTop: 2 }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

function MiniTrend({ sessions, color }: { sessions: SessionRecord[]; color: string }) {
  const data = sessions.slice(-25);
  if (data.length < 2) return null;

  const W = 360; const H = 120;
  const P = { t: 12, r: 12, b: 24, l: 28 };
  const pw = W - P.l - P.r; const ph = H - P.t - P.b;
  const max = Math.max(...data.map((x) => x.bestSpan), 3);
  const min = Math.min(...data.map((x) => x.bestSpan), 1);
  const rng = max - min || 1;
  const toX = (i: number) => P.l + (i / Math.max(data.length - 1, 1)) * pw;
  const toY = (v: number) => P.t + ph - ((v - min) / rng) * ph;
  const poly = data.map((x, i) => `${toX(i)},${toY(x.bestSpan)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 380, display: 'block', margin: '0 auto' }}>
      {[min, Math.round((min + max) / 2), max].map((v) => (
        <line key={v} x1={P.l} y1={toY(v)} x2={W - P.r} y2={toY(v)} stroke="var(--border)" strokeWidth={0.5} />
      ))}
      {[min, Math.round((min + max) / 2), max].map((v) => (
        <text key={v} x={P.l - 4} y={toY(v) + 3} fill="var(--text-muted)" fontSize={8} textAnchor="end">{v}</text>
      ))}
      <polyline points={poly} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {data.map((x, i) => (
        <circle key={i} cx={toX(i)} cy={toY(x.bestSpan)} r={2.5} fill={color} />
      ))}
    </svg>
  );
}

function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={() => setOpen(!open)} style={{
        background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem',
        fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        marginBottom: open ? 10 : 0, padding: 0, textTransform: 'uppercase', letterSpacing: '.05em',
      }}>
        <span style={{ transition: 'transform .2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' }}>▸</span>
        {title}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function CatAccuracyBars({ sessions }: { sessions: SessionRecord[] }) {
  const cats = ['digit', 'spatial', 'pattern', 'nback'] as const;
  const data = cats.map((c) => {
    const rel = sessions.filter((x) => { try { return getModeMeta(x.mode).category === c; } catch { return false; } });
    return { cat: c, count: rel.length, acc: rel.length > 0 ? Math.round(rel.reduce((s, x) => s + x.accuracy, 0) / rel.length) : 0 };
  });

  const W = 380; const H = 140;
  const P = { t: 10, r: 14, b: 24, l: 18 };
  const pw = W - P.l - P.r; const ph = H - P.t - P.b;
  const bw = pw / data.length - 10;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 380, display: 'block', margin: '0 auto' }}>
      <line x1={P.l} y1={P.t + ph} x2={W - P.r} y2={P.t + ph} stroke="var(--border)" strokeWidth={0.5} />
      <line x1={P.l} y1={P.t + ph / 2} x2={W - P.r} y2={P.t + ph / 2} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="3 2" />
      <text x={P.l - 4} y={P.t + ph / 2 + 3} fill="var(--text-muted)" fontSize={8} textAnchor="end">50</text>
      <text x={P.l - 4} y={P.t + 4} fill="var(--text-muted)" fontSize={8} textAnchor="end">100</text>
      {data.map((d, i) => {
        const x = P.l + (i / data.length) * pw + (pw / data.length - bw) / 2;
        const h = (d.acc / 100) * ph;
        const y = P.t + ph - h;
        const col = CAT_COLORS[d.cat] ?? 'var(--accent-blue)';
        return (
          <g key={d.cat}>
            <rect x={x} y={y} width={bw} height={Math.max(h, 1)} fill={col} rx={3} opacity={0.85} />
            <text x={x + bw / 2} y={H - 8} fill="var(--text-muted)" fontSize={8} textAnchor="middle">{CAT_LABELS[d.cat]}</text>
            {d.count > 0 && <text x={x + bw / 2} y={y - 3} fill={col} fontSize={9} fontWeight={700} textAnchor="middle">{d.acc}%</text>}
          </g>
        );
      })}
    </svg>
  );
}

type FilterKey = 'all' | ModeCategory;

export default function StatsPanel() {
  const sessions = useMemo(() => getAllSessions(), []);
  const modes = useMemo(() => getAllModes(), []);
  const [filter, setFilter] = useState<FilterKey>('all');

  const filteredSessions = useMemo(
    () => filter === 'all' ? sessions : sessions.filter((s) => { try { return getModeMeta(s.mode).category === filter; } catch { return false; } }),
    [sessions, filter]
  );

  if (sessions.length < 2) return null;

  const filterKeys: FilterKey[] = ['all', 'digit', 'spatial', 'pattern', 'nback'];

  return (
    <div style={{ maxWidth: 700, width: '100%', margin: '0 auto 20px' }}>
      <SummaryCards sessions={sessions} />

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        {filterKeys.map((k) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            padding: '5px 14px', fontSize: '0.75rem', fontWeight: filter === k ? 700 : 500,
            borderRadius: 20,
            border: `1.5px solid ${filter === k ? (CAT_COLORS[k] ?? 'var(--accent-blue)') : 'var(--border)'}`,
            background: filter === k ? `${CAT_COLORS[k] ?? 'var(--accent-blue)'}22` : 'transparent',
            color: filter === k ? (CAT_COLORS[k] ?? 'var(--accent-blue)') : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'all .15s',
          }}>
            {k === 'all' ? '全部' : CAT_LABELS[k]}
          </button>
        ))}
      </div>

      {filter === 'all' ? (
        <Section title="各模式平均正确率" defaultOpen>
          <CatAccuracyBars sessions={sessions} />
        </Section>
      ) : (
        <>
          <Section title="概览" defaultOpen>
            <CatAccuracyBars sessions={filteredSessions} />
          </Section>
          {modes.filter((m) => m.category === filter).map((m) => {
            const ms = sessions.filter((s) => s.mode === m.id);
            if (ms.length < 2) return null;
            return (
              <Section key={m.id} title={`${m.label} — 广度趋势`} defaultOpen={ms.length <= 3}>
                <MiniTrend sessions={ms} color={CAT_COLORS[filter] ?? 'var(--accent-blue)'} />
              </Section>
            );
          })}
        </>
      )}
    </div>
  );
}
