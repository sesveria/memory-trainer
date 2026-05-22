import { useEffect, useRef, useState } from 'react';
import { useTrainingStore } from '../store/trainingStore';
import { decodeStimulus, getTotalRounds } from '../engine/nBack';

const ROUND_MS = 2500;
const HIGHLIGHT_MS = 500;

export default function NbackPresentingCanvas() {
  const currentSequence = useTrainingStore((s) => s.currentSequence);
  const recordNbackRound = useTrainingStore((s) => s.recordNbackRound);
  const finishNbackSession = useTrainingStore((s) => s.finishNbackSession);
  const phase = useTrainingStore((s) => s.phase);

  const [roundIdx, setRoundIdx] = useState(0);
  const [showHighlight, setShowHighlight] = useState(true);
  const [posHit, setPosHit] = useState(false);
  const [letHit, setLetHit] = useState(false);
  const [posFlash, setPosFlash] = useState(false);
  const [letFlash, setLetFlash] = useState(false);
  const [done, setDone] = useState(false);
  const mountedRef = useRef(true);
  const posHitRef = useRef(false);
  const letHitRef = useRef(false);

  // Keep refs in sync
  posHitRef.current = posHit;
  letHitRef.current = letHit;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (phase !== 'presenting') {
      setRoundIdx(0);
      setShowHighlight(true);
      setPosHit(false);
      setLetHit(false);
      setDone(false);
      return;
    }
    if (currentSequence.length === 0) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const totalRounds = getTotalRounds();

    for (let i = 0; i < totalRounds; i++) {
      const startMs = i * ROUND_MS;
      const highlightEnd = startMs + HIGHLIGHT_MS;

      timers.push(setTimeout(() => {
        if (!mountedRef.current) return;
        // Submit previous round using refs
        if (i > 0) {
          recordNbackRound(posHitRef.current, letHitRef.current);
        }
        setRoundIdx(i);
        setShowHighlight(true);
        setPosHit(false);
        setLetHit(false);
        setPosFlash(false);
        setLetFlash(false);
      }, startMs));

      timers.push(setTimeout(() => {
        if (!mountedRef.current) return;
        setShowHighlight(false);
      }, highlightEnd));
    }

    const finishMs = totalRounds * ROUND_MS;
    timers.push(setTimeout(() => {
      if (!mountedRef.current) return;
      recordNbackRound(posHitRef.current, letHitRef.current);
      setDone(true);
    }, finishMs));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [phase, currentSequence]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (done && phase === 'presenting') {
      const t = setTimeout(() => finishNbackSession(), 500);
      return () => clearTimeout(t);
    }
  }, [done, phase, finishNbackSession]);

  // Keyboard handling
  useEffect(() => {
    if (phase !== 'presenting') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') {
        setPosHit(true);
        setPosFlash(true);
        setTimeout(() => { if (mountedRef.current) setPosFlash(false); }, 200);
      } else if (e.key === 'l' || e.key === 'L') {
        setLetHit(true);
        setLetFlash(true);
        setTimeout(() => { if (mountedRef.current) setLetFlash(false); }, 200);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase]);

  if (phase !== 'presenting') return null;

  const raw = currentSequence[roundIdx] ?? 0;
  const { position, letter } = decodeStimulus(raw);
  const gridSize = 3;
  const cells = Array.from({ length: gridSize * gridSize }, (_, i) => i);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gap: 8,
          maxWidth: 200,
          width: '100%',
        }}
      >
        {cells.map((idx) => {
          const isHighlighted = showHighlight && idx === position;
          return (
            <div
              key={idx}
              style={{
                aspectRatio: '1',
                background: isHighlighted ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                border: `2px solid ${isHighlighted ? 'var(--accent-blue)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                transition: 'background 0.2s, border-color 0.2s',
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          fontSize: '5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          minHeight: 90,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {letter}
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <button
          style={{
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: 700,
            borderRadius: 'var(--radius-sm)',
            border: '2px solid var(--accent-blue)',
            background: posHit ? 'var(--accent-blue)' : posFlash ? 'var(--accent-blue)' : 'transparent',
            color: posHit || posFlash ? '#fff' : 'var(--accent-blue)',
            cursor: 'pointer',
            transition: 'all 0.15s',
            minWidth: 140,
          }}
          onClick={() => { setPosHit(true); setPosFlash(true); setTimeout(() => setPosFlash(false), 200); }}
        >
          位置匹配 (A)
        </button>
        <button
          style={{
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: 700,
            borderRadius: 'var(--radius-sm)',
            border: '2px solid var(--accent-green)',
            background: letHit ? 'var(--accent-green)' : letFlash ? 'var(--accent-green)' : 'transparent',
            color: letHit || letFlash ? '#fff' : 'var(--accent-green)',
            cursor: 'pointer',
            transition: 'all 0.15s',
            minWidth: 140,
          }}
          onClick={() => { setLetHit(true); setLetFlash(true); setTimeout(() => setLetFlash(false), 200); }}
        >
          字母匹配 (L)
        </button>
      </div>

      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        第 {roundIdx + 1} / {getTotalRounds()} 轮
      </div>
    </div>
  );
}
