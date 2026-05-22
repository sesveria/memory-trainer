import type { ModeId } from './types';
import { useTrainingStore } from './store/trainingStore';
import HomePage from './pages/HomePage';
import TrainingPage from './pages/TrainingPage';

export default function App() {
  const setMode = useTrainingStore((s) => s.setMode);
  const phase = useTrainingStore((s) => s.phase);

  const handleSelectMode = (id: ModeId) => {
    setMode(id);
  };

  if (phase === 'idle') {
    return <HomePage onSelectMode={handleSelectMode} />;
  }

  return <TrainingPage />;
}
