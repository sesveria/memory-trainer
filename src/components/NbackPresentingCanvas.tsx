import { useEffect, useRef, useState } from 'react';
import { useTrainingStore } from '../store/trainingStore';
import { decodeStimulus, getTotalRounds, getMatchTruth, getNBackLevel } from '../engine/nBack';

const ROUND_MS = 2500;
const HIGHLIGHT_MS = 500;

export default function NbackPresentingCanvas() {
  const modeId = useTrainingStore((s) => s.modeId);
  const currentSequence = useTrainingStore((s) => s.currentSequence);
  const recordNbackRound = useTrainingStore((s) => s.recordNbackRound);
  const finishNbackSession = useTrainingStore((s) => s.finishNbackSession);
  const phase = useTrainingStore((s) => s.phase);

  const nLevel = modeId ? getNBackLevel(modeId) : 1;

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

  posHitRef.current = posHit;
  letHitRef.current = letHit;

  const isWarmup = modeId ? roundIdx < nLevel : false;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (phase !== 'presenting') {
      setRoundIdx(0); setShowHighlight(true); setPosHit(false); setLetHit(false); setDone(false);
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
        // Submit previous round with ground-truth validation (skip warmup rounds)
        if (i > 0 && i > nLevel) {
          const truth = getMatchTruth(i - 1);
          if (truth) {
            const posCorrect = posHitRef.current === truth.posMatch;
            const letterCorrect = letHitRef.current === truth.letterMatch;
            recordNbackRound(posCorrect, letterCorrect);
          }
        }
        setRoundIdx(i);
        setShowHighlight(true);
        setPosHit(false); setLetHit(false);
        setPosFlash(false); setLetFlash(false);
      }, startMs));

      timers.push(setTimeout(() => {
        if (!mountedRef.current) return;
        setShowHighlight(false);
      }, highlightEnd));
    }

    const finishMs = totalRounds * ROUND_MS;
    timers.push(setTimeout(() => {
      if (!mountedRef.current) return;
      if (totalRounds > nLevel) {
        const truth = getMatchTruth(totalRounds - 1);
        if (truth) {
          const posCorrect = posHitRef.current === truth.posMatch;
          const letterCorrect = letHitRef.current === truth.letterMatch;
          recordNbackRound(posCorrect, letterCorrect);
        }
      }
      setDone(true);
    }, finishMs));

    return () => { timers.forEach(clearTimeout); };
  }, [phase, currentSequence, nLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (done && phase === 'presenting') {
      const t = setTimeout(() => finishNbackSession(), 500);
      return () => clearTimeout(t);
    }
  }, [done, phase, finishNbackSession]);

  useEffect(() => {
    if (phase !== 'presenting') return;
    const handler = (e: KeyboardEvent) => {
      if (isWarmup) return;
      if (e.key === 'a' || e.key === 'A') {
        setPosHit(true); setPosFlash(true);
        setTimeout(() => { if (mountedRef.current) setPosFlash(false); }, 200);
      } else if (e.key === 'l' || e.key === 'L') {
        setLetHit(true); setLetFlash(true);
        setTimeout(() => { if (mountedRef.current) setLetFlash(false); }, 200);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, isWarmup]);

  if (phase !== 'presenting') return null;

  const raw = currentSequence[roundIdx] ?? 0;
  const { position, letter } = decodeStimulus(raw);
  const cells = Array.from({ length: 9 }, (_, i) => i);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {isWarmup && (
        <div style={{
          background: 'var(--accent-gold)', color: 'var(--bg-primary)',
          padding: '6px 16px', borderRadius: 20, fontSize: '0.875rem', fontWeight: 700,
        }}>
          🟡 第 {roundIdx + 1}/{nLevel} 轮 — 仅观察，无需按键
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 200, width: '100%' }}>
        {cells.map((idx) => {
          const isLit = showHighlight && idx === position;
          return (
            <div key={idx} style={{
              aspectRatio: '1', background: isLit ? 'var(--accent-blue)' : 'var(--bg-secondary)',
              border: `2px solid ${isLit ? 'var(--accent-blue)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)', transition: 'background 0.2s, border-color 0.2s',
            }} />
          );
        })}
      </div>

      <div style={{ fontSize: '5.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'SF Mono','Fira Code',monospace", minHeight: 96, display: 'flex', alignItems: 'center' }}>
        {letter}
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <button style={{
          padding: '12px 24px', fontSize: '1rem', fontWeight: 700,
          borderRadius: 'var(--radius-sm)', border: '2px solid var(--accent-blue)',
          background: posHit ? 'var(--accent-blue)' : posFlash ? 'var(--accent-blue)' : 'transparent',
          color: posHit || posFlash ? '#fff' : 'var(--accent-blue)',
          cursor: isWarmup ? 'default' : 'pointer', minWidth: 140,
          opacity: isWarmup ? 0.35 : 1, transition: 'all 0.15s',
        }}
          disabled={isWarmup}
          onClick={() => { if (isWarmup) return; setPosHit(true); setPosFlash(true); setTimeout(() => setPosFlash(false), 200); }}
        >位置匹配 (A)</button>
        <button style={{
          padding: '12px 24px', fontSize: '1rem', fontWeight: 700,
          borderRadius: 'var(--radius-sm)', border: '2px solid var(--accent-green)',
          background: letHit ? 'var(--accent-green)' : letFlash ? 'var(--accent-green)' : 'transparent',
          color: letHit || letFlash ? '#fff' : 'var(--accent-green)',
          cursor: isWarmup ? 'default' : 'pointer', minWidth: 140,
          opacity: isWarmup ? 0.35 : 1, transition: 'all 0.15s',
        }}
          disabled={isWarmup}
          onClick={() => { if (isWarmup) return; setLetHit(true); setLetFlash(true); setTimeout(() => setLetFlash(false), 200); }}
        >字母匹配 (L)</button>
      </div>

      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        第 {roundIdx + 1} / {getTotalRounds()} 轮
      </div>
    </div>
  );
}
