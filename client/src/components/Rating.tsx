interface RatingProps {
  value: number;
  size?: "sm" | "lg";
}

export function Rating({ value, size = "sm" }: RatingProps) {
  return (
    <span className={`rating rating-${size}`} aria-label={`Note : ${value} sur 10`}>
      <span className="rating-value">{value}</span>
      <span className="rating-max">/10</span>
    </span>
  );
}
