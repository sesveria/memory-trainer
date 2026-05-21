import { useTrainingStore } from '../store/trainingStore';

export default function ResponseDisplay() {
  const userInput = useTrainingStore((s) => s.userInput);
  const currentSpanLength = useTrainingStore((s) => s.currentSpanLength);

  const slots: (number | null)[] = [];
  for (let i = 0; i < currentSpanLength; i++) {
    slots.push(i < userInput.length ? userInput[i] : null);
  }

  return (
    <div className="response-display">
      {slots.map((digit, i) =>
        digit !== null ? (
          <div key={i} className="response-digit">
            {digit}
          </div>
        ) : (
          <div key={i} className="response-slot" />
        )
      )}
    </div>
  );
}
