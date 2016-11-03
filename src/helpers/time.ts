export function epoch(dt: Date): number {
  return Math.round(dt.getTime() / 1000);
}
