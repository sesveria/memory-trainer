import type { ModeId } from '../types';
import { getAllModes } from '../engine/registry';
import { getPersonalBests } from '../engine/storage';

interface Props {
  onSelect: (id: ModeId) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  digit: '数字广度',
  spatial: '视觉空间',
  pattern: '图案记忆',
  nback: 'N-Back 双任务',
};

export default function ModeSelector({ onSelect }: Props) {
  const modes = getAllModes();
  const pbs = getPersonalBests();

  const categories = new Map<string, typeof modes>();
  for (const m of modes) {
    const cat = m.category;
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(m);
  }

  return (
    <div>
      {Array.from(categories.entries()).map(([cat, catModes]) => (
        <div key={cat} style={{ marginBottom: 32 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center', letterSpacing: '0.1em' }}>
            {CATEGORY_LABELS[cat] ?? cat}
          </div>
          <div className="mode-selector">
            {catModes.map((m) => (
              <button key={m.id} className="mode-card" onClick={() => onSelect(m.id)}>
                <div className="mode-card-icon">{m.icon}</div>
                <div className="mode-card-title">{m.label}</div>
                <div className="mode-card-desc">{m.description}</div>
                <div className="mode-card-best">
                  {m.category === 'nback'
                    ? `固定 ${m.minSpan}-Back`
                    : `个人最佳：${pbs[m.id] > 0 ? pbs[m.id] : '—'}`
                  }
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
