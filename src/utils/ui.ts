export function align2Grid(value: number) {
  if (value <= 0)
    return 0
  const i = Math.floor(value / 10)
  const rest = value % 10
  return rest > 5 ? (i + 1) * 10 : i * 10
}

export function align2Range(value: number, range: number[]) {
  const min = range[0] || 0
  const max = range[1]
  return Math.min(max, Math.max(min, value))
}
