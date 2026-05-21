import type { DigitSpanMode } from '../types';
import { getModeLabel, getModeDescription } from '../engine/digitSpan';
import { getPersonalBests } from '../engine/storage';

interface Props {
  onSelect: (mode: DigitSpanMode) => void;
}

const MODES: { mode: DigitSpanMode; icon: string }[] = [
  { mode: 'forward', icon: '→' },
  { mode: 'backward', icon: '←' },
  { mode: 'ascending', icon: '↑' },
];

export default function ModeSelector({ onSelect }: Props) {
  const pbs = getPersonalBests();
  return (
    <div className="mode-selector">
      {MODES.map(({ mode, icon }) => (
        <button key={mode} className="mode-card" onClick={() => onSelect(mode)}>
          <div className="mode-card-icon">{icon}</div>
          <div className="mode-card-title">{getModeLabel(mode)}</div>
          <div className="mode-card-desc">{getModeDescription(mode)}</div>
          <div className="mode-card-best">
            个人最佳：{pbs[mode] > 0 ? pbs[mode] : '—'}
          </div>
        </button>
      ))}
    </div>
  );
}
