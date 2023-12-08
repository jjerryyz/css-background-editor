export const align2Grid = (value: number) => {
  if (value <= 0) return 0;
  const i = Math.floor(value / 10);
  const rest = value % 10;
  return rest > 5 ? (i + 1) * 10 : i * 10;
}

export const align2Zero = (value: number) => {
  if (value <= 0) return 0;
  return value;
}