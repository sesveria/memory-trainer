import { useEffect, useRef, useState } from 'react';
import CorsiGrid from './CorsiGrid';

const HIGHLIGHT_MS = 800;
const GAP_MS = 500;

interface Props {
  sequence: number[];
  onDone: () => void;
}

export default function CorsiPresentingCanvas({ sequence, onDone }: Props) {
  const [index, setIndex] = useState(0);
  const [showHighlight, setShowHighlight] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    sequence.forEach((_, i) => {
      const onTime = i * (HIGHLIGHT_MS + GAP_MS);
      const offTime = onTime + HIGHLIGHT_MS;

      timers.push(setTimeout(() => {
        if (!mountedRef.current) return;
        setIndex(i);
        setShowHighlight(true);
      }, onTime));

      if (i < sequence.length - 1) {
        timers.push(setTimeout(() => {
          if (!mountedRef.current) return;
          setShowHighlight(false);
        }, offTime));
      }
    });

    const total = (sequence.length - 1) * (HIGHLIGHT_MS + GAP_MS) + HIGHLIGHT_MS + 200;
    const doneTimer = setTimeout(() => {
      if (!mountedRef.current) return;
      onDone();
    }, total);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(doneTimer);
    };
  }, [sequence, onDone]);

  return (
    <CorsiGrid
      highlightIndex={showHighlight ? sequence[index] : null}
      selectedIndices={[]}
      disabled={true}
    />
  );
}
