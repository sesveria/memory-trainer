interface Props {
  digit: number;
}

export default function DigitDisplay({ digit }: Props) {
  return (
    <div className="digit-display" key={digit}>
      {digit}
    </div>
  );
}
