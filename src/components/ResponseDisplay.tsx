interface Props {
  value: number[];
  length: number;
}

export default function ResponseDisplay({ value, length }: Props) {
  const slots: (number | null)[] = [];
  for (let i = 0; i < length; i++) {
    slots.push(i < value.length ? value[i] : null);
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
