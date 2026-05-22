import { getPersonalBests } from '../engine/storage';
import { getModeMeta } from '../engine/registry';
import type { ModeId } from '../types';

export default function PersonalBests() {
  const pbs = getPersonalBests();
  const entries = Object.entries(pbs).filter(([, v]) => v > 0);
  if (entries.length === 0) return null;

  return (
    <div className="personal-bests">
      {entries.map(([id, val]) => {
        let label = id;
        try {
          label = getModeMeta(id as ModeId).label;
        } catch {}
        return (
          <div key={id} className="pb-item">
            <div className="pb-label">{label}</div>
            <div className="pb-value">{val}</div>
          </div>
        );
      })}
    </div>
  );
}
