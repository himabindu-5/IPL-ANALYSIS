export function formatDecimal(val: number | null | undefined, decimals = 2, fallback = '—'): string {
  if (val == null || isNaN(val)) return fallback;
  return Number(val).toFixed(decimals);
}

export function formatInt(val: number | null | undefined, fallback = '0'): string {
  if (val == null || isNaN(val)) return fallback;
  return Math.round(Number(val)).toLocaleString();
}

export function formatPercent(val: number | null | undefined, decimals = 2, fallback = '0.00%'): string {
  if (val == null || isNaN(val)) return fallback;
  return `${Number(val).toFixed(decimals)}%`;
}
