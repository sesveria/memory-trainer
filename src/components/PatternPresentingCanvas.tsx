import { useEffect, useRef } from 'react';
import PatternGrid from './PatternGrid';

const SHOW_MS = 2000;

interface Props {
  gridSize: number;
  sequence: number[];
  onDone: () => void;
}

export default function PatternPresentingCanvas({ gridSize, sequence, onDone }: Props) {
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
      gridSize={gridSize}
      litIndices={litIndices}
      selectedIndices={new Set()}
      mode="presenting"
    />
  );
}
