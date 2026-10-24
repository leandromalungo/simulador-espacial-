export function formatNumber(num: number): string {
  return new Intl.NumberFormat('pt-PT').format(Math.floor(num));
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.floor(meters)} m`;
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
