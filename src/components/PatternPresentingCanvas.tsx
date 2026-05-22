import { useEffect, useRef } from 'react';
import PatternGrid from './PatternGrid';

const SHOW_MS = 2000;

interface Props {
  sequence: number[];
  onDone: () => void;
}

export default function PatternPresentingCanvas({ sequence, onDone }: Props) {
  const litIndices = new Set(sequence);
  const calledRef = useRef(false);

  useEffect(() => {
    calledRef.current = false;
    const timer = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true;
        onDone();
      }
    }, SHOW_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <PatternGrid
      litIndices={litIndices}
      selectedIndices={new Set()}
      mode="presenting"
    />
  );
}
