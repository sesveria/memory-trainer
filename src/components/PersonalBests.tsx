import { getPersonalBests } from '../engine/storage';

const LABELS: Record<string, string> = {
  forward: '正向广度',
  backward: '反向广度',
  ascending: '升序排序',
};

export default function PersonalBests() {
  const pbs = getPersonalBests();
  const entries = Object.entries(pbs) as [string, number][];

  return (
    <div className="personal-bests">
      {entries.map(([key, val]) => (
        <div key={key} className="pb-item">
          <div className="pb-label">{LABELS[key] || key}</div>
          <div className="pb-value">{val > 0 ? val : '—'}</div>
        </div>
      ))}
    </div>
  );
}
